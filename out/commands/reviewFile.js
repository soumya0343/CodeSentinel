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
exports.reviewCurrentFile = reviewCurrentFile;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../logger");
async function reviewCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("CodeSentinel: No active editor. Open a file first.");
        return;
    }
    const scope = await vscode.window.showQuickPick(["frontend", "backend", "both"], { placeHolder: "Select code scope" });
    if (!scope)
        return;
    const techStack = await vscode.window.showQuickPick([
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
    ], { canPickMany: true, placeHolder: "Select tech stack" });
    if (!techStack?.length)
        return;
    const context = {
        scope: scope,
        techStack,
        language: editor.document.languageId,
    };
    const code = editor.document.getText();
    const currentFile = {
        path: vscode.workspace.asRelativePath(editor.document.uri),
        language: editor.document.languageId,
        content: code,
    };
    try {
        (0, logger_1.startReview)();
        const { runAIReview } = await Promise.resolve().then(() => __importStar(require("../services/aiService")));
        const review = await runAIReview([currentFile], context);
        const doc = await vscode.workspace.openTextDocument({
            content: review,
            language: "markdown",
        });
        await vscode.window.showTextDocument(doc, { preview: false });
        await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        vscode.window.showErrorMessage("CodeSentinel error: " + msg);
        const { error: logError } = await Promise.resolve().then(() => __importStar(require("../logger")));
        logError("reviewCurrentFile: " + msg);
    }
}
//# sourceMappingURL=reviewFile.js.map