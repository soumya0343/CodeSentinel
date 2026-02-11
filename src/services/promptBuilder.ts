import { ReviewContext } from "../types/reviewContext";
import { ReviewedFile } from "../types/reviewedFile";

export function buildPrompt(files: ReviewedFile[], context: ReviewContext): string {
  return `You are a senior software engineer performing a code review. Your entire response must be valid Markdown that renders correctly in a Markdown viewer.

STRICT FORMATTING RULES (follow exactly so the output renders as Markdown):
- Use ## for section headings at the start of a line (no leading spaces).
- Use "- " (dash space) at the start of a line for list items; do not indent list items with spaces (indentation can break rendering).
- Use **text** for bold and \`code\` for inline code.
- For code blocks use fenced blocks only: \`\`\`language on its own line, then code, then \`\`\` on its own line. Do not use indented code blocks.
- Do not wrap your response in a \`\`\`markdown block; output raw Markdown only.

CONTEXT:
- Scope: ${context.scope}
- Tech Stack: ${context.techStack.join(", ")}
- Language: ${context.language}

Evaluate the code using best practices for the selected stack. Check: clean code, architecture, security, performance, error handling, maintainability, testability.

Respond in this structure (use these exact section headers; omit a section if empty):

## Summary

## Critical Issues
- List each with "- " at line start. Use \`[Severity: HIGH]\` or \`[Severity: MEDIUM]\` where relevant.

## Improvements

## Best Practice Recommendations

## Suggested Refactor (if any)

${files.map(file => `FILE: ${file.path}
\`\`\`${file.language}
${file.content}
\`\`\`
`).join('\n\n')}
`;
}
