

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {GoogleGenAI, Type} from "@google/genai";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

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
 */
export const generateRoadmap = functions.https.onCall(async (data, context) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new functions.https.HttpsError("failed-precondition", "The GEMINI_API_KEY environment variable is not set. Please set it in the Firebase console or using `firebase functions:secrets:set`.");
  }

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const userId = context.auth.uid;
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  // Rate Limiting Logic
  if (userData?.subscriptionRole === "pro" && userData.trialEndsAt && userData.trialEndsAt.toDate() < new Date()) {
    // Trial has expired, but scheduled function may not have run. Downgrade them.
    await userRef.update({subscriptionRole: "free"});
    throw new functions.https.HttpsError("permission-denied", "Your Pro trial has expired. Please upgrade to a paid plan to continue.");
  }

  if (userData?.subscriptionRole === "free" && userData.lastRoadmapGeneratedAt) {
    const lastGenDate = userData.lastRoadmapGeneratedAt.toDate();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    if (lastGenDate > oneMonthAgo) {
      throw new functions.https.HttpsError("resource-exhausted", "Free tier is limited to one roadmap per month. Please upgrade to Pro for more.");
    }
  }

  const {preferences} = data;
  if (!preferences) {
    throw new functions.https.HttpsError("invalid-argument", "Missing user preferences.");
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
        "title": "Roadmap Title",
        "description": "Roadmap description.",
        "totalHours": 120,
        "estimatedCompletion": "12 Weeks",
        "milestones": [
          {
            "id": "unique_id_1",
            "title": "Milestone 1 Title",
            "week": 1,
            "description": "Milestone 1 description.",
            "durationHours": 30,
            "tasks": [{"id": "t1", "title": "Task 1"}],
            "successCriteria": ["Criterion 1"],
            "courses": [{"id": "c1", "title": "Course 1", "platform": "YouTube", "url": "https://...", "duration": "5 hours", "cost": "Free", "reasoning": "Why it's good."}],
            "quizzes": [
              {
                "id": "q1", "title": "Quiz 1", "difficulty": 1, 
                "questions": [
                  {"id": "qq1", "text": "Question?", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Explanation."}
                ]
              }
            ]
          }
        ]
      }

      CRITICAL INSTRUCTIONS:
      1. The roadmap should cover 12 weeks, broken into 4 distinct milestones. Each milestone should represent a block of learning (e.g., Weeks 1-3, Weeks 4-6, etc.). The 'week' property for the milestones should be 1, 4, 7, and 10 respectively.
      2. For each milestone, provide:
          - A clear title and a 2-3 sentence description.
          - Duration in hours (must fit within the user's weekly budget for 3 weeks).
          - A list of specific, actionable tasks.
          - A list of measurable success criteria.
          - A list of REAL courses from platforms like YouTube, Coursera, Udemy, LinkedIn Learning, edX. Use web search to verify courses exist and URLs are valid. DO NOT hallucinate URLs or course titles.
          - A list of quizzes to test the milestone's concepts. Each quiz should contain a few questions that are a mix of 'multiple-choice' and 'short-answer'. For 'multiple-choice', provide 4 options. Every question needs a correct answer and a brief explanation.
      3. Ensure all generated IDs (for milestones, tasks, courses, quizzes, questions) are unique strings.
      4. Pay close attention to JSON syntax. Ensure all strings are properly escaped, especially URLs and text content which might contain quotes or special characters. Do not include trailing commas.
      5. The final output MUST be only the JSON object, with no extra text or markdown formatting like \`\`\`json.
    `;


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    // More robust JSON extraction from a potentially markdown-formatted response
    const rawText = response.text;
    let jsonString = "";

    // Try to find JSON within a markdown code block
    const markdownMatch = rawText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[2]) {
      jsonString = markdownMatch[2];
    } else {
      // Fallback: find the first '{' and last '}'
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = rawText.substring(jsonStart, jsonEnd + 1);
      }
    }

    if (!jsonString) {
      functions.logger.error("No JSON object could be extracted from Gemini response.", {rawText});
      throw new Error("The AI failed to generate a valid roadmap structure.");
    }

    let roadmapData;
    try {
      roadmapData = JSON.parse(jsonString);
    } catch (parseError) {
      functions.logger.error("Failed to parse JSON string from Gemini response.", {jsonString, parseError});
      throw new Error("The AI returned a malformed JSON object.");
    }


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

    batch.update(userRef, {
      lastRoadmapGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return {roadmapId: roadmapRef.id, roadmapData};
  } catch (error) {
    functions.logger.error("Gemini API or Firestore error:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate roadmap. The AI model may have returned an unexpected format. Please try again.");
  }
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

export const gradeShortAnswer = functions.https.onCall(async (data, context) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new functions.https.HttpsError("failed-precondition", "The GEMINI_API_KEY environment variable is not set. Please set it in the Firebase console or using `firebase functions:secrets:set`.");
  }
  
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const {userAnswer, expectedAnswer} = data;
  if (!userAnswer || !expectedAnswer) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing user answer or expected answer.",
    );
  }

  const ai = new GoogleGenAI({apiKey: geminiApiKey});
  
  // Since this function doesn't use googleSearch, we can use responseSchema for reliable JSON.
  const gradingSchema = {
    type: Type.OBJECT,
    properties: {
      correct: {type: Type.BOOLEAN},
      similarity: {type: Type.NUMBER},
      explanation: {type: Type.STRING},
    },
    required: ["correct", "similarity", "explanation"],
  };

  const prompt = `
    Please evaluate the user's answer for a quiz question based on semantic similarity.
    Expected Answer: "${expectedAnswer}"
    User's Answer: "${userAnswer}"
    A similarity score of 0.75 or higher should be considered correct.
    Return a JSON object with your evaluation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    functions.logger.error("Gemini grading error:", error);
    throw new functions.https.HttpsError("internal", "Failed to grade answer.");
  }
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
      // The `recursiveDelete` function is part of firebase-tools, not the Admin SDK.
      // We must delete subcollections manually.
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
    // Use recursiveDelete to remove the roadmap and all its subcollections
    functions.logger.log(`User ${userId} is deleting roadmap ${roadmapId}`);
    await admin.firestore().recursiveDelete(roadmapRef);

    // Also delete the public version if it exists
    const publicDoc = await publicRoadmapRef.get();
    if (publicDoc.exists) {
      functions.logger.log(`Deleting public roadmap ${roadmapId}`);
      await admin.firestore().recursiveDelete(publicRoadmapRef);
    }

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
    // This will recursively delete all subcollections (roadmaps, milestones, etc.)
    await admin.firestore().recursiveDelete(db.collection("tracks").doc(userId));
    // Delete the user profile document
    await db.collection("users").doc(userId).delete();
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);
    return {success: true};
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete user data.",
    );
  }
});