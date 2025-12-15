import { runGemini } from "./geminiService";
import { runFallbackReview } from "./fallbackService";

export async function runAIReview(
  prompt: string,
  code: string,
  language: string
): Promise<string> {
  try {
    return await runGemini(prompt);
  } catch {
    return runFallbackReview(code, language);
  }
}
