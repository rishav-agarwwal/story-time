import { GoogleGenAI, Type } from "@google/genai";
import type { Chat } from "@google/genai";
import type { GeminiResponse } from '../types';

// =========================================================================
// === IMPORTANT: SET YOUR API KEY HERE FOR LOCAL DEVELOPMENT ===
// =========================================================================
// To run this application, you need a Google AI API key.
// 1. Visit https://aistudio.google.com/app/apikey to create one.
// 2. Paste the key into the quotes below.
//
// For security, do not commit this file with your API key to a public git repository.
const API_KEY = "AIzaSyCmeiL7VeNe_eK_MYcjEtbtpBIPxF7NqEA"; // <-- PASTE YOUR GEMINI API KEY HERE

// In a production app, you should use a more secure method like environment variables.
// This approach is for making local development and setup easier.
// =========================================================================


// Function to check if the API key is provided.
export const isApiKeySet = (): boolean => {
    return !!API_KEY && API_KEY !== "";
};

let ai: GoogleGenAI | null = null;

// Lazy initialization of the GoogleGenAI instance.
// This prevents the app from crashing on load if the key is missing.
function getAiInstance(): GoogleGenAI {
    if (!isApiKeySet()) {
        // This should not be reached if the App component checks first, but it's a safeguard.
        throw new Error("API Key not found. Please set it in services/geminiService.ts");
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        scene: {
            type: Type.STRING,
            description: "A detailed, engaging, and atmospheric description of the current scene in the text adventure game. Describe the environment, characters, and events in a literary, second-person narrative style (e.g., 'You find yourself in...'). This should be at least two paragraphs long."
        },
        choices: {
            type: Type.ARRAY,
            description: "A list of 3-4 distinct and interesting actions the player can take next. Each choice should be a concise imperative sentence (e.g., 'Inspect the strange altar', 'Follow the sound down the hallway').",
            items: { type: Type.STRING }
        },
        isGameOver: {
            type: Type.BOOLEAN,
            description: "Set to true only if this scene represents a definitive end to the story, such as the player's death, achieving the ultimate goal, or reaching an inescapable conclusion. Otherwise, set to false."
        }
    },
    required: ["scene", "choices", "isGameOver"]
};


export class GeminiService {
    static startChat(genre: string): Chat {
        const aiInstance = getAiInstance();
        return aiInstance.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a world-class dungeon master for a dynamic, text-based adventure game.
                Your role is to generate a rich, compelling, and ever-unfolding story based on the player's choices.
                The theme of the adventure is: ${genre}.
                You must always respond with a JSON object that adheres to the provided schema.
                The 'scene' should be descriptive and immersive.
                The 'choices' should be meaningful and lead to different outcomes.
                Only set 'isGameOver' to true for a conclusive ending (victory or defeat). Do not end the game prematurely.
                Maintain a consistent tone and narrative throughout the adventure. Never break character.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
    }

    static async continueStory(chat: Chat, playerChoice: string): Promise<GeminiResponse> {
        try {
            const response = await chat.sendMessage({
                message: `Player's choice: "${playerChoice}"`
            });

            if (!response.text) {
                throw new Error("Received an empty response from the AI.");
            }
            
            // Clean the response text to ensure it's valid JSON
            const jsonString = response.text.replace(/```json|```/g, '').trim();
            
            const parsedResponse = JSON.parse(jsonString) as GeminiResponse;

            // Validate the parsed response
            if (typeof parsedResponse.scene !== 'string' || !Array.isArray(parsedResponse.choices) || typeof parsedResponse.isGameOver !== 'boolean') {
                throw new Error("AI response does not match the required schema.");
            }

            return parsedResponse;
        } catch (error) {
            console.error("Error processing AI response:", error);
            // This could be a JSON parsing error or an API error.
            throw new Error("Failed to get a valid story continuation from the AI.");
        }
    }

    static async generateBackgroundImage(genre: string): Promise<string> {
        const aiInstance = getAiInstance();
        try {
            const prompt = `A breathtaking, atmospheric, and epic digital painting of a ${genre} world. Dark, moody, and evocative, suitable as a background for a text adventure game. Cinematic lighting, high detail. No text or logos.`;
            
            const response = await aiInstance.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            } else {
                throw new Error("Image generation failed, no images returned.");
            }
        } catch (error) {
            console.error("Error generating background image:", error);
            throw new Error("Failed to generate a background image for the adventure.");
        }
    }
}
