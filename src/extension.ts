import * as vscode from "vscode";
import { reviewWorkspace } from "./commands/reviewWorkspace";
import { reviewCurrentFile } from "./commands/reviewFile";

export function activate(ctx: vscode.ExtensionContext): void {
  // Ensure commands are visible: activate on startup (activationEvents: ["*"])
  ctx.subscriptions.push(
    vscode.commands.registerCommand(
      "codeSentinel.reviewWorkspace",
      reviewWorkspace,
    ),
    vscode.commands.registerCommand(
      "codeSentinel.reviewFile",
      reviewCurrentFile,
    ),
    vscode.commands.registerCommand("codeSentinel.showLogs", async () => {
      const { showLog } = await import("./logger");
      showLog();
    }),
    vscode.commands.registerCommand("codeSentinel.testGemini", async () => {
      const { testGeminiConnection } = await import("./services/geminiService");
      const result = await testGeminiConnection();
      if (result.success) {
        vscode.window.showInformationMessage(
          "Gemini Connection: " + result.message,
        );
      } else {
        vscode.window.showErrorMessage(
          "Gemini Connection Failed: " + result.message,
        );
      }
    }),
  );
}
