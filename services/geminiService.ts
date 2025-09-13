
import { GoogleGenAI, Type } from "@google/genai";
import type { Chat } from "@google/genai";
import type { GeminiResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        return ai.chats.create({
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
}
