import * as vscode from "vscode";
import { reviewCurrentFile } from "./commands/reviewFile";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "aiCodeReviewer.reviewFile",
      reviewCurrentFile
    )
  );
  console.log("AI Code Reviewer extension activated");
}

export function deactivate(context: vscode.ExtensionContext) {
  console.log("AI Code Reviewer extension deactivated");
}
