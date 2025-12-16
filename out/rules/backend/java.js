"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.javaRules = void 0;
exports.javaRules = [
    {
        id: "JAVA-OOP-01",
        area: "OOP Design",
        principle: "SRP & OCP",
        severity: "BLOCKER",
        appliesTo: { language: ["java"] },
        // Flags classes with a high number of methods and dependencies (suggesting multiple responsibilities)
        check: (code) => /class\s+[A-Z][a-zA-Z0-9]*\s*\{[\s\S]{1000,}\}/.test(code),
        message: "Class appears to violate the Single Responsibility Principle (SRP). Refactor into smaller, focused service classes or components.",
        rationale: "Classes should have one reason to change. Monolithic classes are hard to test, maintain, and prevent the Open/Closed Principle (OCP) from being applied.",
    },
    {
        id: "JAVA-THREAD-01",
        area: "Concurrency",
        principle: "Thread Safety",
        severity: "CRITICAL",
        appliesTo: { language: ["java"] },
        // Checks for mutable fields in shared/singleton beans that are not protected
        check: (code) => /public\s+[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*;/g.test(code) &&
            !/(final|synchronized|volatile|ThreadLocal)/.test(code),
        message: "Mutable shared state (fields in singletons or shared beans) must be protected by `final`, synchronization (`synchronized`), or a concurrent collection.",
        rationale: "Unprotected mutable state is the root cause of data races and unpredictable behavior in concurrent applications. Favor immutability where possible.",
    },
    {
        id: "JAVA-IMMUT-01",
        area: "Immutability",
        principle: "Predictability",
        severity: "HIGH",
        appliesTo: { language: ["java"] },
        // Checks DTO/Value Objects for non-final fields
        check: (code) => /class\s+[A-Z][a-zA-Z0-9]*(Dto|Value|Data)[\s\S]*?[^final]\s+\w+\s+\w+;/.test(code),
        message: "Value Objects (DTOs, records) should be made immutable by declaring all fields as `final` and omitting setters.",
        rationale: "Immutability simplifies reasoning about program state and is crucial for thread safety, especially when passing objects between threads.",
    },
    {
        id: "JAVA-EXC-01",
        area: "Exception Handling",
        principle: "Strategy",
        severity: "HIGH",
        appliesTo: { language: ["java"] },
        // Flags excessive use of checked exceptions being thrown/caught in business logic
        check: (code) => /(throw|catch)\s+new\s+[A-Z][a-zA-Z0-9]*Exception/.test(code) &&
            !/(RuntimeException|IOException)/.test(code),
        message: "Use unchecked exceptions (`RuntimeException`) for business logic errors and validation failures. Reserve checked exceptions for unrecoverable external system failures (e.g., IO/SQL).",
        rationale: "Following this strategy avoids 'Exception Catching Hell' and respects the intent: unhandled runtime errors are programmer errors; checked exceptions are known, recoverable external errors.",
    },
    {
        id: "JAVA-RESOURCE-01",
        area: "Resource Cleanup",
        principle: "Reliability",
        severity: "CRITICAL",
        appliesTo: { language: ["java"] },
        // Flags try/catch blocks that handle resources without try-with-resources
        check: (code) => /new\s+(FileInputStream|Connection|Statement)\s*\([\s\S]*?\}\s*finally/.test(code) && !/try\s*\([A-Z][a-zA-Z0-9]*\s*\w+\s*=/.test(code),
        message: "All closeable resources (streams, connections) must be managed using the `try-with-resources` statement.",
        rationale: "Guarantees that resources are closed automatically and correctly, even if exceptions are thrown, preventing resource leaks.",
    },
    {
        id: "JAVA-LOG-01",
        area: "Logging",
        principle: "Security",
        severity: "HIGH",
        appliesTo: { language: ["java"] },
        // Flags string concatenation in logging statements
        check: (code) => /\.(info|warn|error)\s*\(\s*".*?"\s*\+\s*[a-zA-Z0-9_]/.test(code),
        message: "Use parameterized logging (placeholders like `{}`) instead of string concatenation.",
        rationale: "Parameterized logging prevents performance overhead if the log level is disabled, and helps avoid security risks like Log Injection if user input is logged incorrectly.",
    },
    {
        id: "JAVA-COLL-01",
        area: "Collections",
        principle: "Efficiency",
        severity: "MEDIUM",
        appliesTo: { language: ["java"] },
        // Checks for generic Collection/List being returned when a more specific one (Set) is needed
        check: (code) => /return\s+new\s+ArrayList/.test(code) && !/new\s+HashSet/.test(code),
        message: "Ensure the correct Collection type is used (e.g., `Set` for unique elements, `Map` for lookups, `List` for ordered elements).",
        rationale: "Using the most appropriate data structure (especially `Set` when uniqueness is required) optimizes algorithmic complexity.",
    },
];
//# sourceMappingURL=java.js.map