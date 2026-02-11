import * as vscode from "vscode";
import { warn as warnMsg, error as errMsg } from "../logger";
import { runFallbackReview } from "./fallbackService";
import {
  getGeminiKeySource,
  runGeminiReview,
} from "./geminiService";
import { runOpenAIReview } from "./openAiService";
import { buildPrompt } from "./promptBuilder";
import { ReviewContext } from "../types/reviewContext";
import { ReviewedFile } from "../types/reviewedFile";

const GEMINI_GET_KEY_URL = "https://aistudio.google.com/apikey";

/** Ensure AI response is raw Markdown (strip optional markdown code fence so it renders). */
function asMarkdown(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    const firstLineEnd = t.indexOf("\n");
    if (firstLineEnd !== -1) t = t.slice(firstLineEnd + 1);
    else t = t.replace(/^```(?:markdown|md)?\s*/, "");
  }
  if (t.endsWith("```")) t = t.slice(0, t.length - 3).trimEnd();
  return t;
}

function hasOpenAIKey(): boolean {
  const config = vscode.workspace.getConfiguration("codeSentinel");
  const apiKey = config.get<string>("openaiApiKey");
  return !!apiKey?.trim();
}

/** One-time nudge when user runs review without a Gemini key: offer to get key or open Settings. */
function showNoKeyHint(): void {
  vscode.window
    .showWarningMessage(
      "CodeSentinel: Add a Gemini API key to enable AI-powered review.",
      "Get API Key",
      "Open Settings",
    )
    .then((choice) => {
      if (choice === "Get API Key") {
        vscode.env.openExternal(vscode.Uri.parse(GEMINI_GET_KEY_URL));
      } else if (choice === "Open Settings") {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "codeSentinel.geminiApiKey",
        );
      }
    });
}

export async function runAIReview(
  files: ReviewedFile[],
  context: ReviewContext,
): Promise<string> {
  const offlineReview = runFallbackReview(files, context);
  const prompt = buildPrompt(files, context);

  const timeoutMs = 90000;
  const timeoutPromise = new Promise<string>((resolve) =>
    setTimeout(() => resolve(""), timeoutMs),
  );

  const runGeminiSafe = () =>
    runGeminiReview(prompt).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      warnMsg("Gemini failed: " + msg);
      return "";
    });

  try {
    const geminiKeyPresent = getGeminiKeySource() !== "none";

    if (geminiKeyPresent) {
      vscode.window.setStatusBarMessage(
        "CodeSentinel: Reviewing with Gemini...",
        5000,
      );

      const aiReview = await Promise.race([runGeminiSafe(), timeoutPromise]);

      if (aiReview?.trim()) {
        return `## 🤖 AI Insights (Gemini)\n\n${asMarkdown(aiReview)}\n\n---\n\n## 📋 Rule-based Review\n\n${offlineReview}`;
      }

      vscode.window.showWarningMessage(
        "CodeSentinel: Gemini request failed. Showing offline review only.",
      );
    } else {
      showNoKeyHint();
    }

    if (hasOpenAIKey()) {
      vscode.window.setStatusBarMessage(
        "CodeSentinel: Trying OpenAI fallback...",
        5000,
      );
      const aiReview = await Promise.race([
        runOpenAIReview(prompt).catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e);
          warnMsg("OpenAI failed: " + msg);
          return "";
        }),
        timeoutPromise,
      ]);
      if (aiReview?.trim()) {
        return `## 🤖 AI Insights (OpenAI)\n\n${asMarkdown(aiReview)}\n\n---\n\n## 📋 Rule-based Review\n\n${offlineReview}`;
      }
    }

    let aiNote = "";
    if (geminiKeyPresent) {
      aiNote = "\n\n---\n**NOTE:** AI review failed or timed out. Showing offline review only.";
    } else {
      aiNote = "\n\n---\n**NOTE:** No AI keys configured. Add a Gemini API key in Settings to enable AI review.";
    }

    return offlineReview + aiNote;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    errMsg("CodeSentinel: " + err);
    return offlineReview + "\n\n---\n**NOTE:** An error occurred during review.";
  }
}
