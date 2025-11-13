// FIX: Add a triple-slash directive to include Node.js type definitions, resolving errors for globals like `require`, `process`, and `__dirname`.
/// <reference types="node" />

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as admin from 'firebase-admin';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

// --- FIREBASE ADMIN SETUP ---
// The GOOGLE_APPLICATION_CREDENTIALS environment variable in Cloud Run will point to this file.
// For local dev, this file should be in the `server/` directory.
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// --- GEMINI API SETUP ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });


// --- EXPRESS APP SETUP ---
const app = express();
const port = process.env.PORT || 8080;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());


// --- AUTH MIDDLEWARE ---
// Extend Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

const firebaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ error: { message: 'Unauthorized: No token provided.' }});
  }

  const token = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).send({ error: { message: 'Unauthorized: Invalid token.' }});
  }
};

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


// --- API ROUTES ---

app.post('/api/generateRoadmap', firebaseAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user!.uid;
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userData) {
            return res.status(404).send({ error: { message: "User profile not found." } });
        }

        if (userData.subscriptionRole === "free" && userData.lastRoadmapGeneratedAt) {
            const lastGenDate = userData.lastRoadmapGeneratedAt.toDate();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (lastGenDate > oneMonthAgo) {
                return res.status(429).send({ error: { message: "Free tier is limited to one roadmap per month. Please upgrade to Pro for more." } });
            }
        }

        const { preferences } = req.body;
        if (!preferences) {
            return res.status(400).send({ error: { message: "Missing user preferences in request body." } });
        }

        const prompt = `
            You are an expert career transition advisor. Generate a personalized 12-week learning roadmap for a user with the following profile:
            - Career Goal: ${preferences.careerTrack}
            - Experience Level: ${preferences.experienceLevel}
            - Weekly Hours: ${preferences.weeklyHours}
            - Learning Styles: ${preferences.learningStyles.join(", ")}
            - Budget: ${preferences.resourcePreference}

            Your response MUST be a single, valid JSON object. Do not include markdown fences. The structure must be:
            {
              "title": "Roadmap Title", "description": "...", "totalHours": ${preferences.weeklyHours * 12}, "estimatedCompletion": "12 Weeks",
              "milestones": [
                {
                  "id": "...", "title": "...", "week": 1, "description": "...", "durationHours": ${preferences.weeklyHours * 3},
                  "tasks": [{"id": "...", "title": "..."}], "successCriteria": ["..."],
                  "courses": [{"id": "...", "title": "...", "platform": "...", "url": "https://...", "duration": "...", "cost": "...", "reasoning": "..."}],
                  "quizzes": [{"id": "...", "title": "...", "difficulty": 1, "questions": [{"id": "...", "text": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]}]
                }
              ]
            }
            CRITICAL: The roadmap must cover 12 weeks, split into 4 milestones (starting weeks 1, 4, 7, 10). Use web search to find REAL, valid URLs for courses. IDs must be unique strings. The entire response must ONLY be the raw JSON object.
          `;
          
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const rawJson = response.text.trim();
        const roadmapData = JSON.parse(rawJson);
        const { milestones, ...roadmapDetails } = roadmapData;

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
            batch.set(milestoneRef, {
                ...milestone,
                tasks: milestone.tasks.map((task: any) => ({ ...task, completed: false })),
                courses: milestone.courses.map((course: any) => ({ ...course, completed: false })),
            });
        });

        batch.update(userRef, { lastRoadmapGeneratedAt: admin.firestore.FieldValue.serverTimestamp() });
        await batch.commit();

        res.status(200).send({ roadmapId: roadmapRef.id });

    } catch (error: any) {
        console.error("Error in /api/generateRoadmap:", error);
        res.status(500).send({ error: { message: error.message || "An internal server error occurred." } });
    }
});

app.post('/api/gradeAnswer', firebaseAuthMiddleware, async (req, res) => {
    try {
        const { question, userAnswer } = req.body;
        if (!question || typeof userAnswer !== 'string') {
            return res.status(400).send({ error: { message: "Missing or invalid arguments: 'question' and 'userAnswer' are required." } });
        }

        const gradingSchema = {
            type: Type.OBJECT,
            properties: {
                correct: { type: Type.BOOLEAN },
                similarity: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
            },
            required: ["correct", "similarity", "explanation"],
        };
        
        const prompt = question.type === "multiple-choice"
            ? `Evaluate the user's answer for this multiple-choice question. Question: "${question.text}". Options: ${JSON.stringify(question.options)}. Correct Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true/false. "similarity" is 1 or 0. "explanation" is "${question.explanation}", re-iterating the correct answer if the user was wrong.`
            : `Evaluate the user's short-answer based on semantic similarity. Official Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true if similarity is >= 0.75. "similarity" is a float from 0.0 to 1.0. "explanation" should elaborate on "${question.explanation}".`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: gradingSchema },
        });

        const resultData = JSON.parse(response.text);
        res.status(200).send(resultData);

    } catch (error: any) {
        console.error("Error in /api/gradeAnswer:", error);
        res.status(500).send({ error: { message: "Failed to grade answer." } });
    }
});

app.post('/api/user/activate-trial', firebaseAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user!.uid;
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (userData?.subscriptionRole === "pro" && userData?.trialEndsAt && userData.trialEndsAt.toDate() > new Date()) {
            return res.status(409).send({ error: { message: "You already have an active trial." } });
        }

        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 1);

        await userRef.update({
            subscriptionRole: "pro",
            trialEndsAt: admin.firestore.Timestamp.fromDate(trialEndDate),
        });

        res.status(200).send({ success: true, message: "Pro trial activated for one month!" });
    } catch (error: any) {
        console.error("Error in /api/user/activate-trial:", error);
        res.status(500).send({ error: { message: "Failed to activate trial." } });
    }
});

app.patch('/api/roadmap/:roadmapId', firebaseAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user!.uid;
        const { roadmapId } = req.params;
        const dataToUpdate = req.body;

        // Basic validation
        if (!roadmapId || Object.keys(dataToUpdate).length === 0) {
            return res.status(400).send({ error: { message: "Roadmap ID and update data are required." } });
        }
        
        const roadmapRef = db.collection(`tracks/${userId}/roadmaps`).doc(roadmapId);
        await roadmapRef.update({
            ...dataToUpdate,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).send({ success: true, message: `Roadmap updated successfully.` });
    } catch (error: any) {
        console.error("Error in PATCH /api/roadmap/:roadmapId:", error);
        res.status(500).send({ error: { message: "Failed to update roadmap." } });
    }
});

app.delete('/api/roadmap/:roadmapId', firebaseAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user!.uid;
        const { roadmapId } = req.params;

        if (!roadmapId) {
            return res.status(400).send({ error: { message: "A valid roadmap ID is required." } });
        }

        const roadmapRef = db.collection(`tracks/${userId}/roadmaps`).doc(roadmapId);
        const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);

        // Delete subcollections first
        await deleteCollection(roadmapRef.collection("milestones"), 50);
        await deleteCollection(roadmapRef.collection("quizResults"), 50);

        // Also delete the public version if it exists
        const publicDoc = await publicRoadmapRef.get();
        if (publicDoc.exists) {
            await deleteCollection(publicRoadmapRef.collection("milestones"), 50);
            await publicRoadmapRef.delete();
        }

        // Finally, delete the roadmap document itself
        await roadmapRef.delete();
        
        res.status(200).send({ success: true, message: "Roadmap deleted successfully." });
    } catch (error: any) {
        console.error("Error in DELETE /api/roadmap/:roadmapId:", error);
        res.status(500).send({ error: { message: "Failed to delete roadmap." } });
    }
});

app.delete('/api/user', firebaseAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user!.uid;
        
        // Delete all roadmaps and their subcollections
        const roadmapsSnapshot = await db.collection(`tracks/${userId}/roadmaps`).get();
        for (const roadmapDoc of roadmapsSnapshot.docs) {
            const roadmapId = roadmapDoc.id;
            const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);
            
            await deleteCollection(roadmapDoc.ref.collection("milestones"), 50);
            await deleteCollection(roadmapDoc.ref.collection("quizResults"), 50);
            await roadmapDoc.ref.delete();

            // Also delete public version
            const publicDoc = await publicRoadmapRef.get();
            if (publicDoc.exists) {
                await deleteCollection(publicRoadmapRef.collection("milestones"), 50);
                await publicRoadmapRef.delete();
            }
        }

        // Delete the user's main track document
        const trackDoc = await db.collection("tracks").doc(userId).get();
        if (trackDoc.exists) {
            await trackDoc.ref.delete();
        }
        
        // Delete the user profile document
        await db.collection("users").doc(userId).delete();
        
        // Delete the user from Firebase Authentication
        await admin.auth().deleteUser(userId);
        
        res.status(200).send({ success: true, message: "User data deleted successfully." });

    } catch (error: any) {
        console.error("Error in DELETE /api/user:", error);
        res.status(500).send({ error: { message: "Failed to delete user data." } });
    }
});


// --- SERVE STATIC FILES (for Production on Cloud Run) ---
if (process.env.NODE_ENV === 'production') {
    // Serve the static files from the React app
    app.use(express.static(path.join(__dirname, '../../../dist')));

    // Handles any requests that don't match the ones above
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../../dist', 'index.html'));
    });
}


// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});