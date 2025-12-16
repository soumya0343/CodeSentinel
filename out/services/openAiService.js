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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOpenAIReview = runOpenAIReview;
const openai_1 = __importDefault(require("openai"));
const vscode = __importStar(require("vscode"));
async function runOpenAIReview(prompt) {
    const config = vscode.workspace.getConfiguration("codeSentinel");
    const apiKey = config.get("openaiApiKey");
    const model = config.get("openaiModel") || "gpt-4o-mini";
    if (!apiKey) {
        throw new Error("OpenAI API key not configured");
    }
    const client = new openai_1.default({ apiKey });
    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: "You are a senior software engineer performing a professional code review.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
        max_tokens: 900,
    });
    return response.choices[0]?.message?.content ?? "No response from OpenAI";
}
//# sourceMappingURL=openAiService.js.map