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
exports.generateRoadmap = functions
    .runWith({
    timeoutSeconds: 540, // Maximum timeout (9 minutes) for complex AI generation
    memory: "512MB",
})
    .https.onCall(async (data, context) => {
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

        CRITICAL REQUIREMENTS - THESE ARE MANDATORY:
        1. The roadmap must cover exactly 12 weeks, split into 4 milestones (3 weeks each)
        2. Each milestone MUST have at least 4-6 actionable tasks (tasks array cannot be empty)
        3. Each milestone MUST have at least 1 quiz with 3-5 questions (quizzes array cannot be empty)
        4. Each quiz MUST have questions with proper structure:
           - Multiple-choice questions: include "options" array with at least 2 options
           - Short-answer questions: "options" can be empty array but "correctAnswer" must be a clear answer
           - All questions must have: id, text, type, correctAnswer, explanation
        5. Each task must have: id and title (both required)
        6. Use REAL, valid URLs for high-quality courses/resources from well-known platforms
        7. All IDs must be unique strings (format: milestone_1, task_1_1, course_1_1, quiz_1_1, q_1_1_1)
        8. Ensure all fields are fully populated with high-quality, relevant content
        9. URLs must be valid HTTPS links to actual courses/resources (Coursera, Udemy, edX, YouTube, freeCodeCamp, Khan Academy, etc.)
        10. Task titles should be specific and actionable (e.g., "Build a todo app using React", not "Learn React")
        11. Course platforms should be well-known and reputable
        12. Quiz questions must test knowledge relevant to the milestone content

        IMPORTANT: Every milestone MUST include:
        - tasks array: Minimum 4 tasks, each with id and title
        - quizzes array: Minimum 1 quiz, each with at least 3 questions
        - courses array: At least 2-3 courses per milestone
        - successCriteria array: At least 2-3 success criteria

        EXAMPLE TASK STRUCTURE (each milestone must have at least 4-6 tasks):
        {
          "id": "task_1_1",
          "title": "Set up development environment with Node.js and VS Code"
        },
        {
          "id": "task_1_2",
          "title": "Build a simple HTML/CSS landing page"
        },
        {
          "id": "task_1_3",
          "title": "Learn JavaScript fundamentals through interactive exercises"
        },
        {
          "id": "task_1_4",
          "title": "Create a basic todo app using vanilla JavaScript"
        }

        EXAMPLE QUIZ STRUCTURE (each milestone must have at least 1 quiz with 3-5 questions):
        {
          "id": "quiz_1_1",
          "title": "Week 1 Fundamentals Quiz",
          "difficulty": 1,
          "questions": [
            {
              "id": "q_1_1_1",
              "text": "What is the purpose of a development environment?",
              "type": "multiple-choice",
              "options": ["To write code", "To test applications", "To deploy websites", "All of the above"],
              "correctAnswer": "All of the above",
              "explanation": "A development environment includes tools for writing, testing, and deploying code."
            },
            {
              "id": "q_1_1_2",
              "text": "Explain the difference between HTML and CSS.",
              "type": "short-answer",
              "options": [],
              "correctAnswer": "HTML provides structure and content, while CSS provides styling and visual presentation.",
              "explanation": "HTML defines what content appears on a page, while CSS controls how it looks."
            }
          ]
        }

        CRITICAL: Do NOT generate empty arrays. Every milestone MUST have:
        - At least 4 tasks (tasks.length >= 4)
        - At least 1 quiz with at least 3 questions (quizzes.length >= 1, quizzes[0].questions.length >= 3)
        - At least 2 courses (courses.length >= 2)
        - At least 2 success criteria (successCriteria.length >= 2)

        Generate a comprehensive, practical learning path that guides the user from their current experience level to their career goal.
      `;
        // Define the response schema for structured output
        const roadmapSchema = {
            type: genai_1.Type.OBJECT,
            properties: {
                title: { type: genai_1.Type.STRING },
                description: { type: genai_1.Type.STRING },
                totalHours: { type: genai_1.Type.NUMBER },
                estimatedCompletion: { type: genai_1.Type.STRING },
                milestones: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            id: { type: genai_1.Type.STRING },
                            title: { type: genai_1.Type.STRING },
                            week: { type: genai_1.Type.NUMBER },
                            description: { type: genai_1.Type.STRING },
                            durationHours: { type: genai_1.Type.NUMBER },
                            tasks: {
                                type: genai_1.Type.ARRAY,
                                items: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        id: { type: genai_1.Type.STRING },
                                        title: { type: genai_1.Type.STRING }
                                    },
                                    required: ["id", "title"]
                                }
                            },
                            successCriteria: {
                                type: genai_1.Type.ARRAY,
                                items: { type: genai_1.Type.STRING }
                            },
                            courses: {
                                type: genai_1.Type.ARRAY,
                                items: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        id: { type: genai_1.Type.STRING },
                                        title: { type: genai_1.Type.STRING },
                                        platform: { type: genai_1.Type.STRING },
                                        url: { type: genai_1.Type.STRING },
                                        duration: { type: genai_1.Type.STRING },
                                        cost: { type: genai_1.Type.STRING },
                                        reasoning: { type: genai_1.Type.STRING }
                                    },
                                    required: ["id", "title", "platform", "url", "duration", "cost", "reasoning"]
                                }
                            },
                            quizzes: {
                                type: genai_1.Type.ARRAY,
                                items: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        id: { type: genai_1.Type.STRING },
                                        title: { type: genai_1.Type.STRING },
                                        difficulty: { type: genai_1.Type.NUMBER },
                                        questions: {
                                            type: genai_1.Type.ARRAY,
                                            items: {
                                                type: genai_1.Type.OBJECT,
                                                properties: {
                                                    id: { type: genai_1.Type.STRING },
                                                    text: { type: genai_1.Type.STRING },
                                                    type: { type: genai_1.Type.STRING },
                                                    options: {
                                                        type: genai_1.Type.ARRAY,
                                                        items: { type: genai_1.Type.STRING }
                                                    },
                                                    correctAnswer: { type: genai_1.Type.STRING },
                                                    explanation: { type: genai_1.Type.STRING }
                                                },
                                                required: ["id", "text", "type", "correctAnswer", "explanation"]
                                            }
                                        }
                                    },
                                    required: ["id", "title", "difficulty", "questions"]
                                }
                            }
                        },
                        required: ["id", "title", "week", "description", "durationHours", "tasks", "successCriteria", "courses", "quizzes"]
                    }
                }
            },
            required: ["title", "description", "totalHours", "estimatedCompletion", "milestones"]
        };
        const geminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema
            },
        });
        if (!geminiResponse.text) {
            throw new Error("Gemini API returned empty response");
        }
        // With structured output, the response is already valid JSON
        const roadmapData = JSON.parse(geminiResponse.text);
        const { milestones, ...roadmapDetails } = roadmapData;
        // Validate that milestones have tasks and quizzes
        if (!milestones || milestones.length === 0) {
            throw new Error("No milestones generated in roadmap");
        }
        milestones.forEach((milestone, index) => {
            // Validate tasks
            if (!milestone.tasks || milestone.tasks.length === 0) {
                throw new Error(`Milestone ${index + 1} (${milestone.id}) has no tasks. Each milestone must have at least 4-6 tasks.`);
            }
            // Validate quizzes
            if (!milestone.quizzes || milestone.quizzes.length === 0) {
                throw new Error(`Milestone ${index + 1} (${milestone.id}) has no quizzes. Each milestone must have at least 1 quiz.`);
            }
            // Validate quiz questions
            milestone.quizzes.forEach((quiz, quizIndex) => {
                if (!quiz.questions || quiz.questions.length === 0) {
                    throw new Error(`Milestone ${index + 1}, Quiz ${quizIndex + 1} (${quiz.id}) has no questions. Each quiz must have at least 3-5 questions.`);
                }
                quiz.questions.forEach((question, qIndex) => {
                    if (!question.text || !question.correctAnswer || !question.explanation) {
                        throw new Error(`Milestone ${index + 1}, Quiz ${quizIndex + 1}, Question ${qIndex + 1} is missing required fields (text, correctAnswer, or explanation).`);
                    }
                    if (question.type === "multiple-choice" && (!question.options || question.options.length < 2)) {
                        throw new Error(`Milestone ${index + 1}, Quiz ${quizIndex + 1}, Question ${qIndex + 1} is marked as multiple-choice but has less than 2 options.`);
                    }
                });
            });
            // Log milestone info for debugging
            functions.logger.info(`Milestone ${index + 1}: ${milestone.id}`, {
                tasksCount: milestone.tasks?.length || 0,
                quizzesCount: milestone.quizzes?.length || 0,
                coursesCount: milestone.courses?.length || 0
            });
        });
        const batch = db.batch();
        const roadmapColRef = db.collection("tracks").doc(userId).collection("roadmaps");
        const roadmapRef = roadmapColRef.doc();
        batch.set(roadmapRef, {
            ...roadmapDetails, track: preferences.careerTrack, level: preferences.experienceLevel,
            status: "in-progress", isPublic: false, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        milestones.forEach((milestone) => {
            const milestoneRef = roadmapRef.collection("milestones").doc(milestone.id);
            // Ensure tasks have completed property
            const tasksWithCompletion = (milestone.tasks || []).map((t) => ({
                ...t,
                completed: t.completed !== undefined ? t.completed : false
            }));
            // Ensure courses have completed property
            const coursesWithCompletion = (milestone.courses || []).map((c) => ({
                ...c,
                completed: c.completed !== undefined ? c.completed : false
            }));
            // Save milestone with all fields including quizzes
            batch.set(milestoneRef, {
                ...milestone,
                tasks: tasksWithCompletion,
                courses: coursesWithCompletion,
                // Ensure quizzes are saved (they should already be in milestone object)
                quizzes: milestone.quizzes || [],
                successCriteria: milestone.successCriteria || []
            });
        });
        batch.update(userRef, { lastRoadmapGeneratedAt: admin.firestore.FieldValue.serverTimestamp() });
        await batch.commit();
        return { roadmapId: roadmapRef.id };
    }
    catch (error) {
        // Detailed error logging for diagnosis
        functions.logger.error("Error generating roadmap:", {
            message: error?.message || "Unknown error",
            stack: error?.stack || "No stack trace",
            name: error?.name || "Unknown error type",
            code: error?.code || "No error code",
            details: error?.details || "No additional details",
            response: error?.response?.data || error?.response || "No response data",
            status: error?.response?.status || error?.status || "No status code",
            userId: userId,
            preferences: preferences ? { careerTrack: preferences.careerTrack, experienceLevel: preferences.experienceLevel } : "No preferences"
        });
        // Check if it's a specific error type
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // If it's a Gemini API error, provide more context
        if (error?.message?.includes("API") || error?.code?.includes("API")) {
            functions.logger.error("Gemini API Error Details:", {
                apiError: error,
                fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            throw new functions.https.HttpsError("internal", `AI API Error: ${error?.message || "Unknown API error"}`);
        }
        // Generic error for other cases
        throw new functions.https.HttpsError("internal", `Failed to generate roadmap: ${error?.message || "Unknown error occurred. Please try again later."}`);
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
    const publicRef = db.collection("publicRoadmaps").doc(roadmapId);
    // If roadmap became public, create public copy
    if (newData.isPublic && !oldData.isPublic) {
        await publicRef.set(newData);
        const milestones = await db.collection("tracks").doc(context.params.userId).collection("roadmaps").doc(roadmapId).collection("milestones").get();
        const batch = db.batch();
        milestones.docs.forEach(doc => {
            batch.set(publicRef.collection("milestones").doc(doc.id), doc.data());
        });
        await batch.commit();
    }
    // If roadmap became private, delete public copy
    if (!newData.isPublic && oldData.isPublic) {
        // Delete all subcollections first
        const publicMilestones = await publicRef.collection("milestones").get();
        const batch = db.batch();
        publicMilestones.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Delete the public roadmap document
        await publicRef.delete();
    }
    // If roadmap was already public and data changed, update public copy
    if (newData.isPublic && oldData.isPublic) {
        await publicRef.update({
            title: newData.title,
            description: newData.description,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
});
exports.deleteRoadmap = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    const { roadmapId } = data;
    const roadmapRef = db.collection("tracks").doc(context.auth.uid).collection("roadmaps").doc(roadmapId);
    // Check if roadmap exists and is public, so we can clean up public copy
    const roadmapDoc = await roadmapRef.get();
    const isPublic = roadmapDoc.exists && roadmapDoc.data()?.isPublic === true;
    // Delete all subcollections first (milestones, quizResults, etc.)
    const subcollections = await roadmapRef.listCollections();
    for (const subcollection of subcollections) {
        await deleteCollection(db, subcollection.path, 100);
    }
    // Delete the roadmap document itself
    await roadmapRef.delete();
    // If roadmap was public, also delete from publicRoadmaps
    if (isPublic) {
        const publicRef = db.collection("publicRoadmaps").doc(roadmapId);
        // Delete public milestones subcollection
        const publicMilestones = await publicRef.collection("milestones").get();
        const batch = db.batch();
        publicMilestones.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Delete public roadmap document
        await publicRef.delete();
    }
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
    // Fix: Use for...of loop instead of forEach to properly await async operations
    for (const doc of snapshot.docs) {
        const subcollections = await doc.ref.listCollections();
        // Delete all subcollections before deleting the document
        for (const subcollection of subcollections) {
            await deleteCollection(db, subcollection.path, 100);
        }
        batch.delete(doc.ref);
    }
    await batch.commit();
    // Continue with next batch if there are more documents
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}
//# sourceMappingURL=index.js.map