import * as vscode from "vscode";
import { runFallbackReview } from "./fallbackService";
import { runOpenAIReview } from "./openAiService";
import { buildPrompt } from "./promptBuilder";
import { ReviewContext } from "../types/reviewContext";
import { ReviewedFile } from "../types/reviewedFile";

export async function runAIReview(
  files: ReviewedFile[],
  context: ReviewContext
): Promise<string> {
  // PRIMARY: Always perform offline rule-based analysis first (fast, reliable)
  // This is the core functionality and should always run
  const offlineReview = runFallbackReview(files, context);

  // SECONDARY: Attempt AI enhancement if available (optional, non-blocking)
  // Only try AI if API key is configured, and don't let it block the offline review
  try {
    const config = vscode.workspace.getConfiguration("codeSentinel");
    const apiKey = config.get<string>("openaiApiKey");

    if (!apiKey || apiKey.trim() === "") {
      // No API key, return offline review immediately
      return offlineReview;
    }

    // Attempt AI with timeout - don't wait more than 3 seconds
    const aiReviewPromise = runOpenAIReview(buildPrompt(files, context));
    const timeoutPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve(""), 3000)
    );

    const aiReview = await Promise.race([aiReviewPromise, timeoutPromise]);

    // Return offline review enhanced with AI insights if AI succeeds quickly
    if (aiReview && aiReview.trim() !== "") {
      return `${offlineReview}\n\n---\n\n## 🤖 AI-Enhanced Insights\n\n${aiReview}`;
    }

    return offlineReview;
  } catch (error: any) {
    // AI not available or failed, return reliable offline review
    return offlineReview;
  }
}
