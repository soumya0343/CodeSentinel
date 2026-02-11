import * as vscode from "vscode";
import { startReview } from "../logger";
import { ReviewScope, ReviewContext } from "../types/reviewContext";
import { ReviewedFile } from "../types/reviewedFile";

export async function reviewCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("CodeSentinel: No active editor. Open a file first.");
    return;
  }

  const scope = await vscode.window.showQuickPick(
    ["frontend", "backend", "both"],
    { placeHolder: "Select code scope" }
  );
  if (!scope) return;

  const techStack = await vscode.window.showQuickPick(
    [
      "React",
      "Next.js",
      "Angular",
      "Node.js",
      "Express",
      "NestJS",
      "Spring Boot",
      "REST API",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "Dart",
      "Flutter",
      "Go",
      "Java",
      "Cpp",
    ],
    { canPickMany: true, placeHolder: "Select tech stack" }
  );
  if (!techStack?.length) return;

  const context: ReviewContext = {
    scope: scope as ReviewScope,
    techStack,
    language: editor.document.languageId,
  };

  const code = editor.document.getText();
  const currentFile: ReviewedFile = {
    path: vscode.workspace.asRelativePath(editor.document.uri),
    language: editor.document.languageId,
    content: code,
  };

  try {
    startReview();
    const { runAIReview } = await import("../services/aiService");
    const review = await runAIReview([currentFile], context);

    const doc = await vscode.workspace.openTextDocument({
      content: review,
      language: "markdown",
    });

    await vscode.window.showTextDocument(doc, { preview: false });
    await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    vscode.window.showErrorMessage("CodeSentinel error: " + msg);
    const { error: logError } = await import("../logger");
    logError("reviewCurrentFile: " + msg);
  }
}
