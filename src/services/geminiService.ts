import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { warn as warnMsg, error as errorMsg } from "../logger";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Read GEMINI_API_KEY from workspace .env if present (extension host often doesn't inherit env from dev script). */
function readGeminiKeyFromEnvFile(): string | undefined {
  // Use spread to create a mutable copy of workspace folders
  // If workspaceFolders is undefined, default to empty array
  const uniqueFolders = new Set<string>();
  const folders: string[] = [];

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
        if (config["GEMINI_API_KEY"]) return config["GEMINI_API_KEY"];
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      warnMsg(`Error reading .env in file dir: ${err}`);
    }
  }

  for (const root of folders) {
    const envPath = path.join(root, ".env");
    if (!fs.existsSync(envPath)) continue;
    try {
      const config = dotenv.parse(fs.readFileSync(envPath));
      const key = config["GEMINI_API_KEY"] || config["GEMini_API_KEY"];
      if (key) return key;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      warnMsg(`Failed to parse .env at ${root}: ${err}`);
    }
  }

  return undefined;
}

function getGeminiApiKey(): string | undefined {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  const config = vscode.workspace.getConfiguration("codeSentinel");
  const fromConfig = config.get<string>("geminiApiKey")?.trim();
  if (fromConfig) return fromConfig;

  return readGeminiKeyFromEnvFile();
}

export function hasGeminiKey(): boolean {
  return !!getGeminiApiKey();
}

export function getGeminiKeySource(): "env" | "config" | "envFile" | "none" {
  if (process.env.GEMINI_API_KEY?.trim()) return "env";
  const config = vscode.workspace.getConfiguration("codeSentinel");
  if (config.get<string>("geminiApiKey")?.trim()) return "config";
  if (readGeminiKeyFromEnvFile()) return "envFile";
  return "none";
}

/** One-line diagnostic for debug log when key is not found (does not expose the key). */
export function getGeminiKeyDiagnostics(): string {
  const envSet = !!process.env.GEMINI_API_KEY?.trim();
  const config = vscode.workspace.getConfiguration("codeSentinel");
  const configVal = config.get<string>("geminiApiKey") ?? "";
  const configSet = !!configVal.trim();
  const workspaceRoots = vscode.workspace.workspaceFolders?.length ?? 0;
  if (workspaceRoots === 0) {
    return "No workspace folder open. Add key in Cursor Settings (CodeSentinel: Gemini Api Key) or open a folder with a .env containing GEMINI_API_KEY.";
  }
  const roots = vscode.workspace.workspaceFolders!.map((f) => f.uri.fsPath);
  const parts: string[] = [];
  if (!envSet) parts.push("env=no");
  if (!configSet) parts.push("Settings(CodeSentinel: Gemini Api Key)=empty or not set");
  parts.push(`.env in workspace root(s)=checked`);
  return parts.join(", ") + ". Put GEMINI_API_KEY in .env at " + roots[0] + " or in Settings.";
}

function getConfiguredModel(): string {
  const config = vscode.workspace.getConfiguration("codeSentinel");
  return config.get<string>("geminiModel") || "gemini-2.5-flash";
}

async function tryGenerateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "No response text";
    } catch (e: any) {
      const isRateLimit = e.message?.includes("429") || e.status === 429;

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        warnMsg(
          `Gemini ${modelName} rate limited. Retrying in ${delay}ms (attempt ${attempt})`,
        );
        await sleep(delay);
        continue;
      }
      throw e; // Re-throw to be caught by the fallback loop
    }
  }
  throw new Error(`Gemini ${modelName} failed after retries`);
}

export async function runGeminiReview(prompt: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key not configured. Set GEMINI_API_KEY in .env or codeSentinel.geminiApiKey in settings.",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
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
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : String(e);
      warnMsg(`Gemini model ${modelName} failed: ${msg}`);
      // If it's the last model, throw the error
      if (modelName === uniqueModels[uniqueModels.length - 1]) {
        throw new Error(`All Gemini models failed. Last error: ${msg}`);
      }
    }
  }

  throw new Error("Gemini review failed completely.");
}

export async function testGeminiConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No API key found in .env or settings.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = getConfiguredModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Hello");
    const response = await result.response;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const text = response.text();

    return { success: true, message: `Connection successful! (${modelName})` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}
