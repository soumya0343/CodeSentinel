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
exports.runAIReview = runAIReview;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../logger");
const fallbackService_1 = require("./fallbackService");
const geminiService_1 = require("./geminiService");
const openAiService_1 = require("./openAiService");
const promptBuilder_1 = require("./promptBuilder");
const GEMINI_GET_KEY_URL = "https://aistudio.google.com/apikey";
/** Ensure AI response is raw Markdown (strip optional markdown code fence so it renders). */
function asMarkdown(raw) {
    let t = raw.trim();
    if (t.startsWith("```")) {
        const firstLineEnd = t.indexOf("\n");
        if (firstLineEnd !== -1)
            t = t.slice(firstLineEnd + 1);
        else
            t = t.replace(/^```(?:markdown|md)?\s*/, "");
    }
    if (t.endsWith("```"))
        t = t.slice(0, t.length - 3).trimEnd();
    return t;
}
function hasOpenAIKey() {
    const config = vscode.workspace.getConfiguration("codeSentinel");
    const apiKey = config.get("openaiApiKey");
    return !!apiKey?.trim();
}
/** One-time nudge when user runs review without a Gemini key: offer to get key or open Settings. */
function showNoKeyHint() {
    vscode.window
        .showWarningMessage("CodeSentinel: Add a Gemini API key to enable AI-powered review.", "Get API Key", "Open Settings")
        .then((choice) => {
        if (choice === "Get API Key") {
            vscode.env.openExternal(vscode.Uri.parse(GEMINI_GET_KEY_URL));
        }
        else if (choice === "Open Settings") {
            vscode.commands.executeCommand("workbench.action.openSettings", "codeSentinel.geminiApiKey");
        }
    });
}
async function runAIReview(files, context) {
    const offlineReview = (0, fallbackService_1.runFallbackReview)(files, context);
    const prompt = (0, promptBuilder_1.buildPrompt)(files, context);
    const timeoutMs = 90000;
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(""), timeoutMs));
    const runGeminiSafe = () => (0, geminiService_1.runGeminiReview)(prompt).catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        (0, logger_1.warn)("Gemini failed: " + msg);
        return "";
    });
    try {
        const geminiKeyPresent = (0, geminiService_1.getGeminiKeySource)() !== "none";
        if (geminiKeyPresent) {
            vscode.window.setStatusBarMessage("CodeSentinel: Reviewing with Gemini...", 5000);
            const aiReview = await Promise.race([runGeminiSafe(), timeoutPromise]);
            if (aiReview?.trim()) {
                return `## 🤖 AI Insights (Gemini)\n\n${asMarkdown(aiReview)}\n\n---\n\n## 📋 Rule-based Review\n\n${offlineReview}`;
            }
            vscode.window.showWarningMessage("CodeSentinel: Gemini request failed. Showing offline review only.");
        }
        else {
            showNoKeyHint();
        }
        if (hasOpenAIKey()) {
            vscode.window.setStatusBarMessage("CodeSentinel: Trying OpenAI fallback...", 5000);
            const aiReview = await Promise.race([
                (0, openAiService_1.runOpenAIReview)(prompt).catch((e) => {
                    const msg = e instanceof Error ? e.message : String(e);
                    (0, logger_1.warn)("OpenAI failed: " + msg);
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
        }
        else {
            aiNote = "\n\n---\n**NOTE:** No AI keys configured. Add a Gemini API key in Settings to enable AI review.";
        }
        return offlineReview + aiNote;
    }
    catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        (0, logger_1.error)("CodeSentinel: " + err);
        return offlineReview + "\n\n---\n**NOTE:** An error occurred during review.";
    }
}
//# sourceMappingURL=aiService.js.map