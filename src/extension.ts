import * as vscode from "vscode";
import { reviewWorkspace } from "./commands/reviewWorkspace";
import { reviewCurrentFile } from "./commands/reviewFile";

export function activate(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand(
      "codeSentinel.reviewWorkspace",
      reviewWorkspace
    ),
    vscode.commands.registerCommand(
      "codeSentinel.reviewFile",
      reviewCurrentFile
    )
  );
}
