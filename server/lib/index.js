"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDelete = exports.deleteRoadmap = exports.onRoadmapShare = exports.gradeAnswer = exports.generateRoadmap = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
admin.initializeApp();
const db = admin.firestore();
const API_KEY = functions.config().gcp?.apikey;
if (!API_KEY) {
    console.error("FATAL ERROR: Gemini API key not configured. " +
        "Please set gcp.apikey in your Firebase Functions environment configuration.");
}
exports.generateRoadmap = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a roadmap.");
    }
    const userId = context.auth.uid;
    const preferences = data.preferences;
    if (!preferences) {
        throw new functions.https.HttpsError("invalid-argument", "Missing preferences data.");
    }
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userProfile = userDoc.data();
    if (userProfile?.subscriptionRole === "free" && userProfile?.lastRoadmapGeneratedAt) {
        const lastGenDate = userProfile.lastRoadmapGeneratedAt.toDate();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (lastGenDate > oneMonthAgo) {
            throw new functions.https.HttpsError("permission-denied", "Free tier is limited to one roadmap per month. Please upgrade for more.");
        }
    }
    if (!API_KEY) {
        throw new functions.https.HttpsError("internal", "The server is missing its API key.");
    }
    const ai = new genai_1.GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `
        You are an expert career transition advisor. Generate a personalized 12-week learning roadmap for a user with the following profile:
        - Career Goal: ${preferences.careerTrack}
        - Experience Level: ${preferences.experienceLevel}
        - Weekly Hours: ${preferences.weeklyHours}
        - Learning Styles: ${preferences.learningStyles.join(", ")}
        - Budget: ${preferences.resourcePreference}

        Your response MUST be a single, valid JSON object. Do not include markdown fences or any text outside the JSON. The structure must be:
        {
          "title": "Roadmap Title for ${preferences.careerTrack}", "description": "A concise, engaging, one-paragraph description of the roadmap.",
          "totalHours": ${preferences.weeklyHours * 12}, "estimatedCompletion": "12 Weeks",
          "milestones": [
            { "id": "milestone_1", "title": "Week 1-3: Foundational Knowledge", "week": 1, "description": "...", "durationHours": ${preferences.weeklyHours * 3}, "tasks": [{"id": "task_1_1", "title": "..."}, {"id": "task_1_2", "title": "..."}], "successCriteria": ["...", "..."], "courses": [{"id": "course_1_1", "title": "...", "platform": "Coursera", "url": "https://...", "duration": "Approx. 10 hours", "cost": "Free", "reasoning": "..."}], "quizzes": [{"id": "quiz_1_1", "title": "Foundations Check", "difficulty": 1, "questions": [{"id": "q_1_1_1", "text": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]}] },
            { "id": "milestone_2", "title": "Week 4-6: Core Skills & Practice", "week": 4, "description": "...", "durationHours": ${preferences.weeklyHours * 3}, "tasks": [], "successCriteria": [], "courses": [], "quizzes": [] },
            { "id": "milestone_3", "title": "Week 7-9: Intermediate Application", "week": 7, "description": "...", "durationHours": ${preferences.weeklyHours * 3}, "tasks": [], "successCriteria": [], "courses": [], "quizzes": [] },
            { "id": "milestone_4", "title": "Week 10-12: Advanced Topics & Portfolio Project", "week": 10, "description": "...", "durationHours": ${preferences.weeklyHours * 3}, "tasks": [], "successCriteria": [], "courses": [], "quizzes": [] }
          ]
        }
        CRITICAL: The roadmap must cover 12 weeks, split into 4 milestones. Use web search to find REAL, valid URLs for high-quality courses/resources. IDs must be unique strings. The entire response must ONLY be the raw JSON object. Ensure all fields are fully populated with high-quality, relevant content.
      `;
        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        if (!geminiResponse.text) {
            throw new Error("Gemini API returned empty response");
        }
        let rawJson = geminiResponse.text.trim();
        const jsonStartIndex = rawJson.indexOf("{");
        const jsonEndIndex = rawJson.lastIndexOf("}");
        if (jsonStartIndex === -1 || jsonEndIndex === -1)
            throw new Error("Received invalid JSON format from AI.");
        rawJson = rawJson.substring(jsonStartIndex, jsonEndIndex + 1);
        const roadmapData = JSON.parse(rawJson);
        const { milestones, ...roadmapDetails } = roadmapData;
        const batch = db.batch();
        const roadmapColRef = db.collection("tracks").doc(userId).collection("roadmaps");
        const roadmapRef = roadmapColRef.doc();
        batch.set(roadmapRef, {
            ...roadmapDetails, track: preferences.careerTrack, level: preferences.experienceLevel,
            status: "in-progress", isPublic: false, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        milestones.forEach((milestone) => {
            const milestoneRef = roadmapRef.collection("milestones").doc(milestone.id);
            batch.set(milestoneRef, {
                ...milestone,
                tasks: milestone.tasks.map((t) => ({ ...t, completed: false })),
                courses: milestone.courses.map((c) => ({ ...c, completed: false })),
            });
        });
        batch.update(userRef, { lastRoadmapGeneratedAt: admin.firestore.FieldValue.serverTimestamp() });
        await batch.commit();
        return { roadmapId: roadmapRef.id };
    }
    catch (error) {
        functions.logger.error("Error generating roadmap:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate roadmap. The AI may be experiencing high traffic. Please try again later.");
    }
});
exports.gradeAnswer = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    if (!API_KEY)
        throw new functions.https.HttpsError("internal", "Server API key not configured.");
    const { question, userAnswer } = data;
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey: API_KEY });
        const prompt = question.type === "multiple-choice"
            ? `Evaluate the user's answer for this multiple-choice question. Question: "${question.text}". Options: ${JSON.stringify(question.options)}. Correct Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true/false. "similarity" is 1 or 0. "explanation" is "${question.explanation}", re-iterating the correct answer if the user was wrong.`
            : `Evaluate the user's short-answer based on semantic similarity. Official Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true if similarity is >= 0.75. "similarity" is a float from 0.0 to 1.0. "explanation" should elaborate on "${question.explanation}".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: { correct: { type: genai_1.Type.BOOLEAN }, similarity: { type: genai_1.Type.NUMBER }, explanation: { type: genai_1.Type.STRING } },
                    required: ["correct", "similarity", "explanation"],
                },
            },
        });
        if (!response.text) {
            throw new Error("Gemini API returned empty response");
        }
        return JSON.parse(response.text);
    }
    catch (error) {
        functions.logger.error("Error grading answer:", error);
        throw new functions.https.HttpsError("internal", "Failed to grade answer.");
    }
});
exports.onRoadmapShare = functions.firestore.document("tracks/{userId}/roadmaps/{roadmapId}")
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const { roadmapId } = context.params;
    if (newData.isPublic && !oldData.isPublic) {
        const publicRef = db.collection("publicRoadmaps").doc(roadmapId);
        await publicRef.set(newData);
        const milestones = await db.collection("tracks").doc(context.params.userId).collection("roadmaps").doc(roadmapId).collection("milestones").get();
        const batch = db.batch();
        milestones.docs.forEach(doc => {
            batch.set(publicRef.collection("milestones").doc(doc.id), doc.data());
        });
        await batch.commit();
    }
});
exports.deleteRoadmap = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    const { roadmapId } = data;
    const roadmapRef = db.collection("tracks").doc(context.auth.uid).collection("roadmaps").doc(roadmapId);
    await deleteCollection(db, roadmapRef.path, 100);
});
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    const userTrackRef = db.collection("tracks").doc(user.uid);
    await deleteCollection(db, userTrackRef.path, 100);
    await db.collection("users").doc(user.uid).delete();
});
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy("__name__").limit(batchSize);
    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}
async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
    if (snapshot.size === 0) {
        resolve(0);
        return;
    }
    const batch = db.batch();
    snapshot.docs.forEach(async (doc) => {
        const subcollections = await doc.ref.listCollections();
        for (const subcollection of subcollections) {
            await deleteCollection(db, subcollection.path, 100);
        }
        batch.delete(doc.ref);
    });
    await batch.commit();
    // FIX: Use a type assertion `(process as any)` to call `nextTick` and avoid a TypeScript
    // type error, as the standard `NodeJS.Process` type might be incomplete in this environment.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}
//# sourceMappingURL=index.js.map