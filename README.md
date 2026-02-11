# CodeSentinel

A VS Code / Cursor extension for intelligent code review: **AI-powered analysis (recommended)** for the best results, with **offline rule-based review** as a fast fallback. Configure a Gemini API key to get detailed, context-aware suggestions in Markdown; without a key you still get instant offline rule checks.

CodeSentinel is available on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SoumyaGupta.codesentinel).

> **For best results:** Use **AI-powered review** (Gemini). It provides deeper analysis, context-aware suggestions, and refactoring ideas. Add your API key in Settings or a project `.env` to enable it.

---

## Features

### AI-powered review (recommended for best results)

- **Best quality**: AI (Gemini) gives the most thorough, context-aware feedback—summary, critical issues, improvements, best practices, and suggested refactors—tailored to your code and tech stack.
- **Gemini (Google)**: Primary AI. [Get a free key](https://aistudio.google.com/apikey) and add it in Settings or `.env` to enable.
- **OpenAI fallback**: Optional. If Gemini is not set or fails, you can use an OpenAI key for GPT-based review.
- Output is **Markdown** (headings, lists, code blocks) so it renders clearly in the review document.

### Offline rule-based review

- Runs **without internet** when you don’t use AI or as a supplement. No API calls required.
- **Fast**: Rule matching and reporting happen locally.
- Covers **clean code**, **architecture**, **security**, **performance**, **error handling**, and **maintainability** for the selected tech stack.

### Two-tier behavior

1. **Preferred**: When a Gemini (or OpenAI) key is set, **AI review runs first** and is shown at the top—this gives the **best results**.
2. **Always**: Offline rule-based analysis runs as well and is shown below AI Insights (or alone if no key).
3. **When no key or AI fails**: You still get the full offline review with a short note.

### Multi-language and framework support

- **Frontend**: React, Flutter, Next.js, Angular  
- **Backend**: Node.js, Express, NestJS, Spring Boot, Go, Java, C++  
- **APIs & data**: REST API, GraphQL, MongoDB, PostgreSQL  

### Analysis areas

- **Code quality**: Readability, naming, structure  
- **Architecture**: Separation of concerns, design patterns, scalability  
- **Security**: Input validation, sensitive data handling, injection prevention  
- **Performance**: Optimization opportunities, resource usage  
- **Error handling**: Edge cases, logging, recovery  
- **Maintainability**: DRY, SRP, testability, production readiness  

---

## Installation

### From VS Code Marketplace (recommended)

1. Open VS Code or Cursor.
2. Go to **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for **CodeSentinel** or run: `ext install SoumyaGupta.codesentinel`.
4. Click **Install**.

### From `.vsix` (offline or manual)

1. Download the `.vsix` file from the [Releases](https://github.com/SoumyaGupta/ai-code-reviewer-extension/releases) page (or build locally with `npm run package`).
2. In VS Code / Cursor: **Extensions** → **⋯** (three dots) → **Install from VSIX...**.
3. Select the downloaded `.vsix` file.
4. Reload the window if prompted.

---

## Configuration

### Gemini API key (recommended — best results)

For the **best review quality**, add a Gemini API key. AI-powered review gives deeper analysis and more actionable suggestions than offline-only mode.

- **Via Settings**  
  - Open **Settings** (`Ctrl+,` / `Cmd+,`).  
  - Search for **CodeSentinel** or **Gemini**.  
  - Set **CodeSentinel: Gemini Api Key** to your key (no quotes).  
  - Get a key: [Google AI Studio](https://aistudio.google.com/apikey).

- **Via `.env`**  
  - In the **root of the workspace you have open** (the project you are reviewing), create or edit a file named `.env`.  
  - Add a line: `GEMINI_API_KEY=your_key_here` (no quotes, no spaces around `=`).  
  - The extension reads this when no key is set in Settings.

- **Model**  
  - **CodeSentinel: Gemini Model** (default: `gemini-2.5-flash`). You can use e.g. `gemini-2.0-flash` or `gemini-1.5-flash` if needed.

### OpenAI (optional fallback)

- Set **CodeSentinel: Openai Api Key** in Settings if you want fallback when Gemini is missing or fails.
- **CodeSentinel: Openai Model** (default: `gpt-4o-mini`). Other options: `gpt-4`, `gpt-3.5-turbo`, etc.

---

## Usage

### Review current file

1. Open the file you want to review in the editor.
2. Open the **Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
3. Run **CodeSentinel: Review Current File**.
4. Select **scope**: frontend / backend / both.
5. Select **tech stack** (one or more): e.g. React, Node.js, Flutter, Go, Java, etc.
6. The review opens in a new tab as Markdown.

### Review workspace

1. Have the project folder open (e.g. open folder in VS Code/Cursor).
2. **Command Palette** → **CodeSentinel: Review Workspace**.
3. Choose scope and tech stack as above.
4. The extension discovers relevant source files (by extension), skips large and ignored paths, and runs the same two-tier review (offline + optional AI).

### Other commands

- **CodeSentinel: Show Logs** – Opens the CodeSentinel output channel (useful for debugging or connection issues).
- **CodeSentinel: Test Gemini Connection** – Verifies that your Gemini API key is found and that a simple API call succeeds.

---

## Review output format

The review document is **Markdown** and typically has up to three parts.

### 1. AI Insights (when a key is set — recommended for best results)

- **Gemini** or **OpenAI** section at the top. This is the most valuable part of the review when enabled.
- Structured in Markdown, for example:
  - **Summary**
  - **Critical Issues** (with severity)
  - **Improvements**
  - **Best Practice Recommendations**
  - **Suggested Refactor** (if any)

### 2. Rule-based review (always present)

Example:

```markdown
## 🔍 Offline Multi-File Code Review

**Files Reviewed:** 3
**Language:** typescript
**Scope:** frontend
**Tech Stack:** React, Node.js

- **BLOCKER** [REACT-SRP-01] (src/App.tsx)
  - Component exceeds 150 lines. Split logic using custom hooks...
  - Principle: SRP
  - Rationale: Prevents 'God Components,' improves testability...
```

### 3. Debug logs (at bottom)

- Short block with **Key Source** (env / config / envFile / none) and **Key Present**.
- Only on failure or when no key: a one-line diagnostic (e.g. where the extension looked for the key).
- Errors (timeout, API error, critical) are appended here when they occur.

---

## Supported languages and frameworks

### Frontend

- **React**: Component design, hooks usage, state management, JSX patterns.  
- **Flutter**: Widget structure, state management, performance.  
- **Next.js**: SSR/SSG, API routes, optimization.  
- **Angular**: Components, dependency injection, structure.

### Backend

- **Node.js / Express**: Middleware, error handling, security, async patterns.  
- **NestJS**: Modules, DI, decorators.  
- **Spring Boot**: Layered architecture, beans, REST.  
- **Go**: Concurrency, error handling, interfaces.  
- **Java**: OOP, exceptions, logging, design patterns.  
- **C++**: Memory, RAII, performance.

### APIs and data

- **REST API**: HTTP methods, status codes, error responses.  
- **GraphQL**: Schema, resolvers, N+1.  
- **MongoDB**: Schema, indexing, aggregation.  
- **PostgreSQL**: Normalization, indexing, queries.

---

## Rule severity levels

Findings are tagged with a severity:

| Severity  | Meaning |
|-----------|--------|
| **BLOCKER** | Critical; should be fixed before merge. |
| **CRITICAL** | High impact on reliability or security. |
| **MAJOR**    | Important for quality and maintainability. |
| **MINOR**    | Style and convention. |
| **INFO**     | Suggestions and best practices. |

Principles referenced in rules include **SRP**, **DRY**, **SOLID**, **KISS**, **YAGNI**, and framework-specific guidelines.

---

## Development

### Prerequisites

- **Node.js** 18 or newer  
- **VS Code** or **Cursor**  
- **TypeScript** (installed via `npm install`)

### Setup

```bash
git clone <repo-url>
cd ai-code-reviewer-extension
npm install
npm run compile
```

### Run from source (F5)

1. Open the extension folder in VS Code/Cursor.
2. Press **F5** or use **Run → Start Debugging**.
3. Select **Launch Extension** (or **Debug Extension**).
4. A **second window** (Extension Development Host) opens with the extension loaded. Use that window to run **CodeSentinel: Review Current File** or **Review Workspace** (the project folder is opened there by default).
5. After code changes: run `npm run compile` (or use `npm run watch`), then in the Extension Development Host run **Developer: Reload Window**.

### Scripts

| Command                | Description |
|------------------------|-------------|
| `npm run compile`      | Compile TypeScript into `out/`. |
| `npm run watch`       | Watch and recompile on save. |
| `npm run package`     | Compile and create a `.vsix` (e.g. `codesentinel-0.0.2.vsix`). |
| `npm run dev`         | Compile and launch Extension Development Host with env from `.env` (if you use the script). |

### Project structure

```
src/
├── commands/          # VS Code commands
│   ├── reviewFile.ts  # Review current file
│   └── reviewWorkspace.ts
├── engine/            # Rule matching and execution
│   ├── ruleMatcher.ts
│   └── ruleRunner.ts
├── rules/             # Language/framework rules
│   ├── frontend/      # React, Flutter, etc.
│   └── backend/       # Node, Go, Java, C++, etc.
├── services/          # AI and fallback
│   ├── aiService.ts   # Orchestration, prompt, response handling
│   ├── geminiService.ts
│   ├── openAiService.ts
│   ├── fallbackService.ts
│   └── promptBuilder.ts
├── types/             # TypeScript definitions
└── extension.ts       # Entry point, command registration
```

### Adding or changing rules

- Rule files live under `src/rules/frontend/` and `src/rules/backend/`.
- Each rule implements the shared **ReviewRule** shape: `id`, `area`, `principle`, `severity`, `appliesTo` (framework/scope), `check` (function), `message`, `rationale`.
- Register new rule modules in the rules index so they are included in the offline review.

Example rule shape:

```typescript
{
  id: "REACT-SRP-01",
  area: "Component Design",
  principle: "SRP",
  severity: "BLOCKER",
  appliesTo: { framework: ["react"], scope: ["frontend"] },
  check: (code) => /* validation */,
  message: "Component exceeds 150 lines. Split logic using custom hooks...",
  rationale: "Prevents 'God Components,' improves testability..."
}
```

### Building a `.vsix`

```bash
npm run package
```

Then install the generated `.vsix` via **Extensions → Install from VSIX...**. The extension’s `.vscodeignore` excludes source, scripts, and `.env` so the package stays small and safe.

---

## Privacy and security

- **Offline-first**: Rule-based analysis runs entirely on your machine. No code is sent when you use only the offline review.
- **API keys**: Stored only in your Settings (machine/workspace) or in your project’s `.env`. They are never sent to the extension author.
- **AI providers**: When you use Gemini or OpenAI, code and prompts are sent only to the respective provider according to their policies.
- **No telemetry**: The extension does not collect usage data or upload your code to any third party other than the chosen AI provider when you have configured a key.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Note:** For the best results, prefer AI-powered review (Gemini) when you can. AI suggestions are advisory. Always apply judgment and consider your project’s context. The offline rule set ensures you have consistent, instant review even without an internet connection or API key.
