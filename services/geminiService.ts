import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences } from '../types';

// The API key is injected from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This function replicates the logic from the `generateRoadmap` cloud function.
export const generateRoadmapFromGemini = async (preferences: UserPreferences) => {
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
        "totalHours": ${preferences.weeklyHours * 12},
        "estimatedCompletion": "12 Weeks",
        "milestones": [
          {
            "id": "unique_id_1",
            "title": "Milestone 1 Title",
            "week": 1,
            "description": "Milestone 1 description.",
            "durationHours": ${preferences.weeklyHours * 3},
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
      IMPORTANT: Your entire response must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown fences (\`\`\`).
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
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
      console.error("No JSON object could be extracted from Gemini response.", {rawText});
      throw new Error("The AI failed to generate a valid roadmap structure.");
    }

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON string from Gemini response.", {jsonString, parseError});
      throw new Error("The AI returned a malformed JSON object.");
    }
  } catch (error) {
    console.error("Gemini API error in generateRoadmapFromGemini:", error);
    throw new Error("Failed to generate roadmap. The AI model may have returned an unexpected format or an error occurred. Please try again.");
  }
};


// This function replicates the logic from the `gradeShortAnswer` cloud function.
export const gradeAnswerFromGemini = async (userAnswer: string, expectedAnswer: string) => {
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
        console.error("Gemini grading error:", error);
        throw new Error("Failed to grade answer.");
    }
};