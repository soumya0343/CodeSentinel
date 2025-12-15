"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAIReview = runAIReview;
const geminiService_1 = require("./geminiService");
const fallbackService_1 = require("./fallbackService");
async function runAIReview(prompt, code, language) {
    try {
        return await (0, geminiService_1.runGemini)(prompt);
    }
    catch {
        return (0, fallbackService_1.runFallbackReview)(code, language);
    }
}
//# sourceMappingURL=aiService.js.map