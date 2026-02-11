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
exports.hasGeminiKey = hasGeminiKey;
exports.getGeminiKeySource = getGeminiKeySource;
exports.getGeminiKeyDiagnostics = getGeminiKeyDiagnostics;
exports.runGeminiReview = runGeminiReview;
exports.testGeminiConnection = testGeminiConnection;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("../logger");
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Read GEMINI_API_KEY from workspace .env if present (extension host often doesn't inherit env from dev script). */
function readGeminiKeyFromEnvFile() {
    // Use spread to create a mutable copy of workspace folders
    // If workspaceFolders is undefined, default to empty array
    const uniqueFolders = new Set();
    const folders = [];
    if (vscode.workspace.workspaceFolders) {
        vscode.workspace.workspaceFolders.forEach((f) => {
            uniqueFolders.add(f.uri.fsPath);
            folders.push(f.uri.fsPath);
        });
    }
    // Fallback: try to find a folder based on active editor if no workspace folder (unlikely in VS Code but good for robustness)
    if (vscode.window.activeTextEditor) {
        const docUri = vscode.window.activeTextEditor.document.uri;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(docUri);
        if (workspaceFolder && !uniqueFolders.has(workspaceFolder.uri.fsPath)) {
            folders.push(workspaceFolder.uri.fsPath);
            uniqueFolders.add(workspaceFolder.uri.fsPath);
        }
        const fileDir = path.dirname(docUri.fsPath);
        try {
            const envPath = path.join(fileDir, ".env");
            if (fs.existsSync(envPath)) {
                const config = dotenv.parse(fs.readFileSync(envPath));
                if (config["GEMINI_API_KEY"])
                    return config["GEMINI_API_KEY"];
            }
        }
        catch (e) {
            const err = e instanceof Error ? e.message : String(e);
            (0, logger_1.warn)(`Error reading .env in file dir: ${err}`);
        }
    }
    for (const root of folders) {
        const envPath = path.join(root, ".env");
        if (!fs.existsSync(envPath))
            continue;
        try {
            const config = dotenv.parse(fs.readFileSync(envPath));
            const key = config["GEMINI_API_KEY"] || config["GEMini_API_KEY"];
            if (key)
                return key;
        }
        catch (e) {
            const err = e instanceof Error ? e.message : String(e);
            (0, logger_1.warn)(`Failed to parse .env at ${root}: ${err}`);
        }
    }
    return undefined;
}
function getGeminiApiKey() {
    const fromEnv = process.env.GEMINI_API_KEY?.trim();
    if (fromEnv)
        return fromEnv;
    const config = vscode.workspace.getConfiguration("codeSentinel");
    const fromConfig = config.get("geminiApiKey")?.trim();
    if (fromConfig)
        return fromConfig;
    return readGeminiKeyFromEnvFile();
}
function hasGeminiKey() {
    return !!getGeminiApiKey();
}
function getGeminiKeySource() {
    if (process.env.GEMINI_API_KEY?.trim())
        return "env";
    const config = vscode.workspace.getConfiguration("codeSentinel");
    if (config.get("geminiApiKey")?.trim())
        return "config";
    if (readGeminiKeyFromEnvFile())
        return "envFile";
    return "none";
}
/** One-line diagnostic for debug log when key is not found (does not expose the key). */
function getGeminiKeyDiagnostics() {
    const envSet = !!process.env.GEMINI_API_KEY?.trim();
    const config = vscode.workspace.getConfiguration("codeSentinel");
    const configVal = config.get("geminiApiKey") ?? "";
    const configSet = !!configVal.trim();
    const workspaceRoots = vscode.workspace.workspaceFolders?.length ?? 0;
    if (workspaceRoots === 0) {
        return "No workspace folder open. Add key in Cursor Settings (CodeSentinel: Gemini Api Key) or open a folder with a .env containing GEMINI_API_KEY.";
    }
    const roots = vscode.workspace.workspaceFolders.map((f) => f.uri.fsPath);
    const parts = [];
    if (!envSet)
        parts.push("env=no");
    if (!configSet)
        parts.push("Settings(CodeSentinel: Gemini Api Key)=empty or not set");
    parts.push(`.env in workspace root(s)=checked`);
    return parts.join(", ") + ". Put GEMINI_API_KEY in .env at " + roots[0] + " or in Settings.";
}
function getConfiguredModel() {
    const config = vscode.workspace.getConfiguration("codeSentinel");
    return config.get("geminiModel") || "gemini-2.5-flash";
}
async function tryGenerateWithModel(genAI, modelName, prompt) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text() || "No response text";
        }
        catch (e) {
            const isRateLimit = e.message?.includes("429") || e.status === 429;
            if (isRateLimit && attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                (0, logger_1.warn)(`Gemini ${modelName} rate limited. Retrying in ${delay}ms (attempt ${attempt})`);
                await sleep(delay);
                continue;
            }
            throw e; // Re-throw to be caught by the fallback loop
        }
    }
    throw new Error(`Gemini ${modelName} failed after retries`);
}
async function runGeminiReview(prompt) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key not configured. Set GEMINI_API_KEY in .env or codeSentinel.geminiApiKey in settings.");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const primaryModel = getConfiguredModel();
    // Fallback chain: Primary -> 2.5 Flash -> 2.0 Flash -> 1.5 Flash
    const modelsToTry = [
        primaryModel,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ];
    // Deduplicate preserving order
    const uniqueModels = [...new Set(modelsToTry)];
    for (const modelName of uniqueModels) {
        try {
            return await tryGenerateWithModel(genAI, modelName, prompt);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            (0, logger_1.warn)(`Gemini model ${modelName} failed: ${msg}`);
            // If it's the last model, throw the error
            if (modelName === uniqueModels[uniqueModels.length - 1]) {
                throw new Error(`All Gemini models failed. Last error: ${msg}`);
            }
        }
    }
    throw new Error("Gemini review failed completely.");
}
async function testGeminiConnection() {
    try {
        const apiKey = getGeminiApiKey();
        if (!apiKey) {
            return {
                success: false,
                message: "No API key found in .env or settings.",
            };
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const modelName = getConfiguredModel();
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const text = response.text();
        return { success: true, message: `Connection successful! (${modelName})` };
    }
    catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : String(e),
        };
    }
}
//# sourceMappingURL=geminiService.js.map