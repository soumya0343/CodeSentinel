import { ReviewRule } from "../../types/reviewRule";

export const nodeRules: ReviewRule[] = [
  {
    id: "NODE-ERR-01",
    area: "Error Handling",
    principle: "Reliability",
    severity: "BLOCKER",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      // Check for async operations (network/db) without explicit catch/try
      /(await\s+)?(fetch|axios|db\.\w+|client\.\w+)\(/.test(code) &&
      !/(try\s*{[\s\S]*?catch\s*\(|\.catch\()/.test(code),
    message:
      "Async network/database call detected without explicit error handling (try/catch or .catch).",
    rationale:
      "Unhandled promise rejections can crash the Node.js process (due to unhandledRejection) or cause silent failures in the control flow.",
  },

  {
    id: "NODE-ERR-02",
    area: "Error Handling",
    principle: "Fail Fast",
    severity: "CRITICAL",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    // Flags catch blocks that are empty or only contain a console.log
    check: (code) =>
      /catch\s*\(\s*\w*\s*\)\s*{\s*(?:\/\/\s*todo\s*)?}/i.test(code) ||
      /catch\s*\(\s*\w*\s*\)\s*\{\s*console\.log/.test(code),
    message:
      "Empty or minimal catch block detected. Errors must be logged and handled (e.g., re-thrown or converted to a standard error response).",
    rationale:
      "Swallowing errors makes debugging impossible and hides critical production failures, violating the 'Fail Fast' principle.",
  },

  {
    id: "NODE-ERR-03",
    area: "Error Handling",
    principle: "Consistency",
    severity: "HIGH",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /throw\s+(new\s+Error|new\s+[A-Z]\w+Error)\s*\([^)]*\)/.test(code) &&
      !/new\s+[A-Z]\w+Error\s*\([^,]*,\s*\d{3}\)/.test(code),
    message:
      "Custom errors should include an explicit HTTP status code (4xx or 5xx) property for use by the global error handler middleware.",
    rationale:
      "Standardizes the error format and allows the central Express error handler to return the correct HTTP response status instead of defaulting to 500.",
  },

  {
    id: "NODE-ASYNC-01",
    area: "Async Flow",
    principle: "Correctness",
    severity: "HIGH",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /async\s+function|\=\s*async\s*\(/.test(code) &&
      /return\s+\w+\(/.test(code) &&
      !/await\s+\w+\(/.test(code),
    message:
      "Async function returning a promise without `await`ing or explicitly `return`ing the promise itself.",
    rationale:
      "A missing `await` or `return` means the outer function completes before the inner promise resolves, leading to premature responses or unhandled rejections if the inner promise fails.",
  },

  {
    id: "NODE-EXP-01",
    area: "API Design",
    principle: "Single Responsibility Principle",
    severity: "HIGH",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /app\.(get|post|put|delete)\(/.test(code) &&
      code.split("\n").length > 100, // Reduced line count for controller size
    message:
      "Route handler exceeds 100 lines. Logic is too complex for a controller.",
    rationale:
      "Controllers should be thin, focusing only on request parsing, validation, and responding. Delegate all business logic to dedicated service layers to preserve SRP.",
  },

  {
    id: "NODE-EXP-02",
    area: "API Reliability",
    principle: "Explicit Responses",
    severity: "CRITICAL",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /res\.send|res\.json/.test(code) && !/res\.status\(\d{3}\)/.test(code),
    message:
      "Express response (`res.send/json`) is missing an explicit HTTP status code.",
    rationale:
      "Relying on the implicit `200 OK` can hide the true intent of the response (e.g., creation should be 201, not found should be 404), breaking API contracts.",
  },

  {
    id: "NODE-DIP-01",
    area: "Architecture",
    principle: "Dependency Inversion Principle",
    severity: "HIGH",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) => /new\s+\w+(Service|Repository)\(/.test(code),
    message:
      "Direct instantiation of services or repositories detected outside of an IoC container or factory.",
    rationale:
      "Depending on concrete implementations instead of abstractions (interfaces/types) reduces testability and flexibility, violating the Dependency Inversion Principle (DIP).",
  },

  {
    id: "NODE-SEC-01",
    area: "Security",
    principle: "Input Validation",
    severity: "BLOCKER",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /req\.(body|query|params)/.test(code) &&
      !/(joi|zod|yup|express-validator|schema\.parse)/i.test(code),
    message:
      "Request data used without visible validation/schema parsing (Joi, Zod, etc.).",
    rationale:
      "Unvalidated input is the primary source of injection, DDoS, and logic vulnerabilities. **Validate every input.** ",
  },

  {
    id: "NODE-SEC-03",
    area: "Security",
    principle: "Data Protection",
    severity: "CRITICAL",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /password\s*=\s*\w+/i.test(code) && !/(bcrypt|argon2|scrypt)/i.test(code),
    message:
      "Passwords are being stored or processed without strong cryptographic hashing (bcrypt, argon2, or scrypt).",
    rationale:
      "Storing passwords in plaintext or with weak hashing (e.g., MD5/SHA1) is a critical security violation. Always use a slow, modern hashing algorithm.",
  },

  {
    id: "NODE-SEC-02",
    area: "Security",
    principle: "Secrets Management",
    severity: "BLOCKER",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /(password|secret|token|apiKey|AWS_ACCESS_KEY)\s*=\s*["']/i.test(code),
    message: "Hardcoded secret or credential detected in backend code.",
    rationale:
      "Secrets must never be committed to source code. Use environment variables (via `dotenv` or similar) or a secure secrets manager.",
  },

  {
    id: "NODE-SEC-04",
    area: "Security",
    principle: "Information Disclosure",
    severity: "HIGH",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /console\.(log|error|warn)\s*\([^)]*(password|secret|token|SSN|PII)/i.test(
        code
      ),
    message:
      "Sensitive user data (password, token, PII) is being logged to the console or file system.",
    rationale:
      "Logging sensitive data creates unnecessary compliance risks (GDPR, HIPAA) and disclosure risks if logs are compromised.",
  },

  {
    id: "NODE-PERF-01",
    area: "Performance",
    principle: "Non-blocking IO",
    severity: "CRITICAL",
    appliesTo: {
      language: ["javascript", "typescript"],
      scope: ["backend"],
    },
    check: (code) =>
      /(fs\.readFileSync|fs\.writeFileSync|child_process\.execSync|crypto\.pbkdf2Sync)/.test(
        code
      ),
    message: "Blocking synchronous operation detected in Node.js backend.",
    rationale:
      "Blocking synchronous I/O blocks the single-threaded Event Loop, preventing the server from handling any other incoming requests, thus destroying scalability. ",
  },
];
