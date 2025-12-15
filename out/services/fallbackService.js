"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFallbackReview = runFallbackReview;
function runFallbackReview(code, language) {
    const issues = [];
    if (code.split("\n").length > 300) {
        issues.push("- [Severity: MEDIUM] Large file detected; consider modularization.");
    }
    if (!code.includes("try") && language !== "python") {
        issues.push("- [Severity: MEDIUM] No error handling detected.");
    }
    if (/console\.log|print\(/.test(code)) {
        issues.push("- [Severity: LOW] Debug logs present.");
    }
    if (/password|token|secret/i.test(code)) {
        issues.push("- [Severity: HIGH] Possible hardcoded secret.");
    }
    if (issues.length === 0) {
        issues.push("- No major issues detected by fallback rules.");
    }
    return `
  ## ⚠️ Offline Code Review (Fallback)
  
  Gemini could not be used. This review is based on static analysis.
  
  ## Findings
  ${issues.join("\n")}
  
  ## Recommendations
  - Improve error handling
  - Improve modularity
  - Add tests
  `;
}
//# sourceMappingURL=fallbackService.js.map