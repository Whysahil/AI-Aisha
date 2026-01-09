import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, TEXT_MODEL } from "../constants";

export class ChatService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing. Chat features will not work.");
    }
    
    try {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      this.startNewChat();
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI", e);
      // Initialize with empty to satisfy TS, usage will throw specific errors
      this.ai = new GoogleGenAI({ apiKey: "" });
    }
  }

  startNewChat() {
    try {
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
    } catch (e) {
      console.error("Failed to start chat session", e);
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chatSession) {
      this.startNewChat();
      if (!this.chatSession) return "Sorry, I'm having trouble connecting right now. (Missing API Key?)";
    }
    
    try {
      const result = await this.chatSession.sendMessage({
        message: text,
      });
      return result.text || "";
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();