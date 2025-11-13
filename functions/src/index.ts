
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {GoogleGenAI, Type} from "@google/genai";
import * as cors from "cors";

// Initialize CORS middleware to allow requests from any origin.
// The `onCall` convention requires this permissive setup.
const corsHandler = cors({origin: true});

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Helper function to delete all documents in a collection in batches.
 * @param {admin.firestore.CollectionReference} collectionRef The collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 */
const deleteCollection = async (
  collectionRef: admin.firestore.CollectionReference,
  batchSize: number,
) => {
  const query = collectionRef.limit(batchSize);
  let snapshot = await query.get();

  while (snapshot.size > 0) {
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    snapshot = await query.get();
  }
};


/**
 * Triggered on new user creation to initialize their profile in Firestore.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  return userRef.set({
    uid: user.uid,
    email: user.email,
    name: user.displayName || "New User",
    profileComplete: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    preferences: {},
    subscriptionRole: "free",
    trialEndsAt: null,
  });
});

/**
 * Activates a 1-month pro trial for a user.
 */
export const activateProTrial = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  }
  const userId = context.auth.uid;
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (userData?.subscriptionRole === "pro" && userData?.trialEndsAt && userData.trialEndsAt.toDate() > new Date()) {
    throw new functions.https.HttpsError("already-exists", "You already have an active trial.");
  }

  const trialEndDate = new Date();
  trialEndDate.setMonth(trialEndDate.getMonth() + 1);

  await userRef.update({
    subscriptionRole: "pro",
    trialEndsAt: admin.firestore.Timestamp.fromDate(trialEndDate),
  });

  return {success: true, message: "Pro trial activated for one month!"};
});

/**
 * Scheduled function to check for expired trials and downgrade users.
 */
export const checkTrialExpirations = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const query = db.collection("users")
      .where("trialEndsAt", "<=", now)
      .where("subscriptionRole", "==", "pro");

    const expiredTrialsSnapshot = await query.get();
    if (expiredTrialsSnapshot.empty) {
      functions.logger.log("No expired trials found.");
      return null;
    }

    const batch = db.batch();
    expiredTrialsSnapshot.forEach((doc) => {
      functions.logger.log(`Deactivating trial for user ${doc.id}`);
      batch.update(doc.ref, {subscriptionRole: "free"});
    });

    await batch.commit();
    return null;
  });

/**
 * HTTP-callable function to generate a learning roadmap using Gemini.
 * Refactored to onRequest to handle CORS explicitly.
 */
export const generateRoadmap = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Manual Authentication to match onCall behavior
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        functions.logger.error("No authorization token found.");
        res.status(403).send({ error: { message: "Unauthorized" } });
        return;
      }
      const idToken = req.headers.authorization.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // Check for Gemini API key
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
          functions.logger.error("GEMINI_API_KEY is not set.");
          res.status(500).send({ error: { message: "Server configuration error: API key missing." } });
          return;
      }
      
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      // Rate Limiting Logic
      if (!userData) {
          res.status(404).send({ error: { message: "User profile not found." } });
          return;
      }
       if (userData?.subscriptionRole === "free" && userData.lastRoadmapGeneratedAt) {
        const lastGenDate = userData.lastRoadmapGeneratedAt.toDate();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (lastGenDate > oneMonthAgo) {
            res.status(429).send({ error: { message: "Free tier is limited to one roadmap per month. Please upgrade to Pro for more." } });
            return;
        }
      }

      // Parse data from the callable function format
      const { preferences } = req.body.data;
      if (!preferences) {
          res.status(400).send({ error: { message: "Missing user preferences in request body." } });
          return;
      }

      const ai = new GoogleGenAI({apiKey: geminiApiKey});

      const prompt = `
        You are an expert career transition advisor. Generate a personalized 12-week learning roadmap for a user with the following profile:
        - Career Goal: ${preferences.careerTrack}
        - Experience Level: ${preferences.experienceLevel}
        - Weekly Hours: ${preferences.weeklyHours}
        - Learning Styles: ${preferences.learningStyles.join(", ")}
        - Budget: ${preferences.resourcePreference}

        Your response MUST be a single, valid JSON object that adheres to the following structure:
        {
          "title": "Roadmap Title", "description": "Roadmap description.", "totalHours": 120, "estimatedCompletion": "12 Weeks",
          "milestones": [
            {
              "id": "unique_id_1", "title": "Milestone 1 Title", "week": 1, "description": "Milestone 1 description.", "durationHours": 30,
              "tasks": [{"id": "t1", "title": "Task 1"}], "successCriteria": ["Criterion 1"],
              "courses": [{"id": "c1", "title": "Course 1", "platform": "YouTube", "url": "https://...", "duration": "5 hours", "cost": "Free", "reasoning": "Why it's good."}],
              "quizzes": [{"id": "q1", "title": "Quiz 1", "difficulty": 1, "questions": [{"id": "qq1", "text": "Question?", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Explanation."}]}]
            }
          ]
        }
        CRITICAL INSTRUCTIONS:
        1. The roadmap should cover 12 weeks, broken into 4 distinct milestones. Each milestone should represent a block of learning (e.g., Weeks 1-3, Weeks 4-6, etc.). The 'week' property for the milestones should be 1, 4, 7, and 10 respectively.
        2. For each milestone, provide: A clear title and description, duration in hours, actionable tasks, success criteria, REAL courses from platforms like YouTube, Coursera, Udemy (use web search to verify URLs), and quizzes with a mix of question types.
        3. Ensure all generated IDs are unique strings.
        4. Pay close attention to JSON syntax. Ensure all strings are properly escaped. Do not include trailing commas.
        5. The final output MUST be only the JSON object, with no extra text or markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { tools: [{googleSearch: {}}] },
      });

      const rawText = response.text;
      let jsonString = "";
      const markdownMatch = rawText.match(/```(json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch && markdownMatch[2]) {
        jsonString = markdownMatch[2];
      } else {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd = rawText.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonString = rawText.substring(jsonStart, jsonEnd + 1);
        }
      }

      if (!jsonString) {
        throw new Error("The AI failed to generate a valid roadmap structure.");
      }

      const roadmapData = JSON.parse(jsonString);
      const {milestones, ...roadmapDetails} = roadmapData;
      const roadmapRef = db.collection(`tracks/${userId}/roadmaps`).doc();
      const batch = db.batch();

      batch.set(roadmapRef, {
        ...roadmapDetails,
        track: preferences.careerTrack,
        level: preferences.experienceLevel,
        status: "in-progress",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      milestones.forEach((milestone: any) => {
        const milestoneRef = roadmapRef.collection("milestones").doc(milestone.id);
        const milestoneWithStatus = {
          ...milestone,
          tasks: milestone.tasks.map((task: any) => ({...task, completed: false})),
          courses: milestone.courses.map((course: any) => ({...course, completed: false})),
        };
        batch.set(milestoneRef, milestoneWithStatus);
      });

      batch.update(userRef, { lastRoadmapGeneratedAt: admin.firestore.FieldValue.serverTimestamp() });
      await batch.commit();

      // Send success response in the format expected by the callable SDK
      res.status(200).send({ data: { roadmapId: roadmapRef.id } });
    } catch (error: any) {
        functions.logger.error("Error in generateRoadmap function:", error);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            res.status(403).send({ error: { message: "Unauthorized: Invalid token." } });
        } else {
            res.status(500).send({ error: { message: "Failed to generate roadmap. The AI model may have returned an unexpected format or an internal error occurred. Please try again." } });
        }
    }
  });
});

/**
 * HTTP-callable function to update a roadmap's status (e.g., to 'archived').
 */
export const updateRoadmapStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const { roadmapId, status } = data;

  if (!roadmapId || !['in-progress', 'completed', 'pending', 'archived'].includes(status)) {
    throw new functions.https.HttpsError("invalid-argument", "A valid roadmap ID and status are required.");
  }

  try {
    const roadmapRef = db.collection(`tracks/${userId}/roadmaps`).doc(roadmapId);
    await roadmapRef.update({
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, message: `Roadmap status updated to ${status}` };
  } catch (error) {
    console.error("Error updating roadmap status:", error);
    throw new functions.https.HttpsError("internal", "Failed to update roadmap status.");
  }
});

export const gradeAnswer = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            // Manual Authentication
            if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
                res.status(403).send({ error: { message: "Unauthorized" } });
                return;
            }
            const idToken = req.headers.authorization.split('Bearer ')[1];
            await admin.auth().verifyIdToken(idToken);

            const geminiApiKey = process.env.GEMINI_API_KEY;
            if (!geminiApiKey) {
                functions.logger.error("GEMINI_API_KEY is not set.");
                res.status(500).send({ error: { message: "Server configuration error: API key missing." } });
                return;
            }

            const { question, userAnswer } = req.body.data;
            if (!question || typeof userAnswer !== 'string') {
                res.status(400).send({ error: { message: "Missing or invalid arguments: 'question' and 'userAnswer' are required." } });
                return;
            }
            
            const ai = new GoogleGenAI({apiKey: geminiApiKey});
            const gradingSchema = {
                type: Type.OBJECT,
                properties: {
                    correct: {type: Type.BOOLEAN},
                    similarity: {type: Type.NUMBER},
                    explanation: {type: Type.STRING},
                },
                required: ["correct", "similarity", "explanation"],
            };

            let prompt: string;
            if (question.type === "multiple-choice") {
                prompt = `
                    You are a quiz grading AI. Evaluate the user's answer for the following multiple-choice question.
                    Question: "${question.text}"
                    Options: ${JSON.stringify(question.options)}
                    Correct Answer is: "${question.correctAnswer}"
                    User's Answer: "${userAnswer}"
                    Respond with a JSON object. 
                    - "correct" should be true if the user's answer is correct, false otherwise.
                    - "similarity" should be 1 if correct, 0 if incorrect.
                    - "explanation" should be the pre-defined explanation: "${question.explanation}". If the user is wrong, briefly reiterate why the correct answer is right.
                `;
            } else { // short-answer
                prompt = `
                    You are a quiz grading AI. Evaluate the user's answer for the following short-answer question based on semantic similarity.
                    The official correct answer is: "${question.correctAnswer}"
                    The user's answer is: "${userAnswer}"
                    Respond with a JSON object.
                    - "correct" should be true if the user's answer is semantically similar to the correct answer (a similarity score of 0.75 or higher).
                    - "similarity" should be a float between 0.0 and 1.0 representing the semantic similarity.
                    - "explanation" should be based on the provided explanation: "${question.explanation}". Confirm if the user was correct and elaborate.
                `;
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: gradingSchema },
            });
            const resultData = JSON.parse(response.text);

            res.status(200).send({ data: resultData });
        } catch (error: any) {
            functions.logger.error("Error in gradeAnswer function:", error);
            if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
                res.status(403).send({ error: { message: "Unauthorized: Invalid token." } });
            } else {
                res.status(500).send({ error: { message: "Failed to grade answer." } });
            }
        }
    });
});


/**
 * Firestore trigger to copy a roadmap to a public collection when it's shared.
 */
export const onRoadmapShare = functions.firestore
  .document("tracks/{userId}/roadmaps/{roadmapId}")
  .onWrite(async (change, context) => {
    const {roadmapId} = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);

    // If roadmap is made public, copy it and its milestones
    if (afterData?.isPublic && !beforeData?.isPublic) {
      functions.logger.log(`Making roadmap ${roadmapId} public.`);

      const milestonesSnapshot = await change.after.ref.collection("milestones").get();
      const batch = db.batch();

      // Copy roadmap data, excluding sensitive or user-specific fields
      const {createdAt, updatedAt, status, ...publicData} = afterData;
      batch.set(publicRoadmapRef, publicData);

      milestonesSnapshot.forEach((doc) => {
        const publicMilestoneRef = publicRoadmapRef.collection("milestones").doc(doc.id);
        batch.set(publicMilestoneRef, doc.data());
      });

      return batch.commit();
    }

    // If roadmap is made private, delete it from public collection
    if (!afterData?.isPublic && beforeData?.isPublic) {
      functions.logger.log(`Making roadmap ${roadmapId} private.`);
      const publicMilestones = await publicRoadmapRef.collection("milestones").get();
      const batch = db.batch();
      publicMilestones.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return publicRoadmapRef.delete();
    }

    // If a public roadmap is updated, re-sync the public copy
    if (afterData?.isPublic && beforeData?.isPublic) {
      functions.logger.log(`Updating public roadmap ${roadmapId}.`);
      const {createdAt, updatedAt, status, ...publicData} = afterData;
      return publicRoadmapRef.update(publicData);
    }

    return null;
  });

export const deleteRoadmap = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const userId = context.auth.uid;
  const { roadmapId } = data;

  if (!roadmapId || typeof roadmapId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid roadmap ID is required.",
    );
  }

  const roadmapRef = db.collection(`tracks/${userId}/roadmaps`).doc(roadmapId);
  const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);

  try {
    functions.logger.log(`User ${userId} is deleting roadmap ${roadmapId}`);

    // Delete subcollections first
    const milestonesRef = roadmapRef.collection("milestones");
    const quizResultsRef = roadmapRef.collection("quizResults");

    await deleteCollection(milestonesRef, 50);
    await deleteCollection(quizResultsRef, 50);

    // Also delete the public version if it exists
    const publicDoc = await publicRoadmapRef.get();
    if (publicDoc.exists) {
        const publicMilestonesRef = publicRoadmapRef.collection("milestones");
        await deleteCollection(publicMilestonesRef, 50);
        await publicRoadmapRef.delete();
        functions.logger.log(`Deleted public roadmap ${roadmapId}`);
    }

    // Finally, delete the roadmap document itself
    await roadmapRef.delete();

    return { success: true, message: "Roadmap deleted successfully." };
  } catch (error) {
    functions.logger.error(`Error deleting roadmap ${roadmapId} for user ${userId}:`, error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete roadmap.",
    );
  }
});

export const sendProgressEmail = functions.pubsub
  .schedule("every monday 09:00")
  .onRun(async (context) => {
    console.log("This is a placeholder for sending weekly progress emails.");
    return null;
  });

export const deleteUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication is required to delete data.",
    );
  }

  const userId = context.auth.uid;
  try {
    const userTracksRef = db.collection("tracks").doc(userId);
    const roadmapsRef = userTracksRef.collection("roadmaps");
    const roadmapsSnapshot = await roadmapsRef.get();

    // Delete all roadmaps and their subcollections
    for (const roadmapDoc of roadmapsSnapshot.docs) {
        const roadmapId = roadmapDoc.id;
        functions.logger.log(`Deleting roadmap ${roadmapId} for user ${userId}`);
        const milestonesRef = roadmapDoc.ref.collection("milestones");
        const quizResultsRef = roadmapDoc.ref.collection("quizResults");

        await deleteCollection(milestonesRef, 50);
        await deleteCollection(quizResultsRef, 50);
        await roadmapDoc.ref.delete();

        // Also delete public version
        const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);
        const publicDoc = await publicRoadmapRef.get();
        if (publicDoc.exists) {
            const publicMilestonesRef = publicRoadmapRef.collection("milestones");
            await deleteCollection(publicMilestonesRef, 50);
            await publicRoadmapRef.delete();
        }
    }

    // Delete the user's main track document (if it exists)
    const trackDoc = await userTracksRef.get();
    if (trackDoc.exists) {
      await userTracksRef.delete();
    }
    // Delete the user profile document
    await db.collection("users").doc(userId).delete();
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    return {success: true, message: "User data deleted successfully."};
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete user data.",
    );
  }
});
