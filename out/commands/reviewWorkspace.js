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
exports.reviewWorkspace = reviewWorkspace;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../logger");
async function reviewWorkspace() {
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
        "NodeJS",
        "Java",
        "Cpp",
    ], { canPickMany: true, placeHolder: "Select tech stack" });
    if (!techStack?.length)
        return;
    const context = {
        scope: scope,
        techStack,
        language: "mixed", // Mixed languages for workspace review
    };
    // Find all relevant source files, excluding unnecessary files
    const uris = await vscode.workspace.findFiles("**/*.{ts,tsx,js,jsx,dart,go,java,cpp,h,hpp}", "**/{node_modules,dist,build,out,.git,.vscode,__pycache__,*.log,*.tmp}/**");
    if (uris.length === 0) {
        vscode.window.showWarningMessage("No relevant source files found in workspace");
        return;
    }
    const files = [];
    for (const uri of uris) {
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            // Skip files that are too large (over 100KB) to avoid performance issues
            if (doc.getText().length > 100000) {
                continue;
            }
            files.push({
                path: vscode.workspace.asRelativePath(uri),
                language: doc.languageId,
                content: doc.getText(),
            });
        }
        catch (error) {
            // Skip files that can't be opened
            continue;
        }
    }
    if (files.length === 0) {
        vscode.window.showWarningMessage("No valid source files found to review");
        return;
    }
    // Show progress notification for long operations
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Reviewing ${files.length} files...`,
        cancellable: false,
    }, async () => {
        (0, logger_1.startReview)();
        const { runAIReview } = await Promise.resolve().then(() => __importStar(require("../services/aiService")));
        const review = await runAIReview(files, context);
        const doc = await vscode.workspace.openTextDocument({
            content: review,
            language: "markdown",
        });
        await vscode.window.showTextDocument(doc, { preview: false });
        await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
    });
}
//# sourceMappingURL=reviewWorkspace.js.map