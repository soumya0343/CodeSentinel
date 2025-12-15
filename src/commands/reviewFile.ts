import * as vscode from "vscode";
import { buildPrompt } from "../services/promptBuilder";
import { runAIReview } from "../services/aiService";
import { CodeScope, ReviewContext } from "../models/reviewContext";

export async function reviewCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

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
    ],
    { canPickMany: true, placeHolder: "Select tech stack" }
  );
  if (!techStack?.length) return;

  const context: ReviewContext = {
    scope: scope as CodeScope,
    techStack,
    language: editor.document.languageId,
  };

  const code = editor.document.getText();
  const prompt = buildPrompt(code, context);

  const review = await runAIReview(prompt, code, editor.document.languageId);

  const doc = await vscode.workspace.openTextDocument({
    content: review,
    language: "markdown",
  });

  vscode.window.showTextDocument(doc, { preview: false });
}
