import * as vscode from "vscode";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runGemini(prompt: string): Promise<string> {
  const config = vscode.workspace.getConfiguration("aiCodeReviewer");
  const apiKey = config.get<string>("geminiApiKey");
  const model = config.get<string>("geminiModel") || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("Gemini API key missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const aiModel = genAI.getGenerativeModel({ model });

  const result = await aiModel.generateContent(prompt);
  return result.response.text();
}
