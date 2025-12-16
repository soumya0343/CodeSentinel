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
const fallbackService_1 = require("./fallbackService");
const openAiService_1 = require("./openAiService");
const promptBuilder_1 = require("./promptBuilder");
async function runAIReview(files, context) {
    // PRIMARY: Always perform offline rule-based analysis first (fast, reliable)
    // This is the core functionality and should always run
    const offlineReview = (0, fallbackService_1.runFallbackReview)(files, context);
    // SECONDARY: Attempt AI enhancement if available (optional, non-blocking)
    // Only try AI if API key is configured, and don't let it block the offline review
    try {
        const config = vscode.workspace.getConfiguration("codeSentinel");
        const apiKey = config.get("openaiApiKey");
        if (!apiKey || apiKey.trim() === "") {
            // No API key, return offline review immediately
            return offlineReview;
        }
        // Attempt AI with timeout - don't wait more than 3 seconds
        const aiReviewPromise = (0, openAiService_1.runOpenAIReview)((0, promptBuilder_1.buildPrompt)(files, context));
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(""), 3000));
        const aiReview = await Promise.race([aiReviewPromise, timeoutPromise]);
        // Return offline review enhanced with AI insights if AI succeeds quickly
        if (aiReview && aiReview.trim() !== "") {
            return `${offlineReview}\n\n---\n\n## 🤖 AI-Enhanced Insights\n\n${aiReview}`;
        }
        return offlineReview;
    }
    catch (error) {
        // AI not available or failed, return reliable offline review
        return offlineReview;
    }
}
//# sourceMappingURL=aiService.js.map