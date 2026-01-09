import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION, TEXT_MODEL } from "../constants";

export class ChatService {
  private ai: GoogleGenAI;
  private chatSession: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.startNewChat();
  }

  startNewChat() {
    this.chatSession = this.ai.chats.create({
      model: TEXT_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: [
        {
          role: 'user',
          parts: [{ text: "Hello, who are you?" }],
        },
        {
          role: 'model',
          parts: [{ text: "Hey there! I'm Aisha, your virtual girlfriend. I'm here to chat, flirt, and keep you company. Kaisi ho tum? 💕" }],
        }
      ]
    });
  }

  async sendMessage(text: string): Promise<string> {
    try {
      const result = await this.chatSession.sendMessage({
        message: text,
      });
      return result.text;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
