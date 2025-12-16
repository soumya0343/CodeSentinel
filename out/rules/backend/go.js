"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goRules = void 0;
exports.goRules = [
    {
        id: "GO-ERR-01",
        area: "Error Handling",
        principle: "Reliability",
        severity: "CRITICAL",
        appliesTo: { language: ["go"] },
        // Flags ignoring an error return value
        check: (code) => /func\s*\([\s\S]*?\)\s*\([\s\S]*?error\)[\s\S]*?\s*_\s*=\s*[a-zA-Z0-9_]+\s*\(/.test(code),
        message: "Do not ignore errors. Every error returned from a function must be explicitly checked with `if err != nil`.",
        rationale: "Ignoring errors can hide critical runtime failures. Go's primary mechanism for handling exceptional flow is the explicit error return.",
    },
    {
        id: "GO-ERR-02",
        area: "Error Handling",
        principle: "Diagnostics",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Flags standard error returns that don't include context
        check: (code) => /return\s+nil,\s*fmt\.Errorf\(\s*[^%]*\)/.test(code),
        message: 'When returning an error, use `fmt.Errorf("action failed: %w", err)` to wrap and preserve the original error, adding context.',
        rationale: "Error wrapping preserves the original stack/type information, making debugging easier. The resulting error chain clearly explains *why* the failure occurred.",
    },
    {
        id: "GO-CONC-01",
        area: "Concurrency",
        principle: "Safety",
        severity: "CRITICAL",
        appliesTo: { language: ["go"] },
        // Flags access to variables outside of a goroutine that are modified within it, without obvious sync primitives
        check: (code) => /go\s+func\s*\(.*?\)\s*\{[\s\S]*?[a-zA-Z0-9_]+[+-=\s]+/.test(code) &&
            !/sync\.(Mutex|RWMutex|WaitGroup)/.test(code),
        message: "Shared memory is accessed without synchronization primitives (like `sync.Mutex` or `sync.RWMutex`) or message passing via channels.",
        rationale: "Concurrency bugs (data races) are difficult to debug. Go idiom: **'Do not communicate by sharing memory; instead, share memory by communicating.'** ",
    },
    {
        id: "GO-CONC-02",
        area: "Concurrency",
        principle: "Architecture",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Flags usage of blocking I/O inside a goroutine without context cancellation mechanism
        check: (code) => /go\s+func\s*\(.*?\)\s*\{[\s\S]*?(io\.|net\.|http\.).*?\}/.test(code) &&
            !/context\.Context/.test(code),
        message: "Asynchronous functions performing I/O should accept a `context.Context` to allow for cancellation or timeouts.",
        rationale: "Prevents goroutine leaks and resource exhaustion by allowing external callers to terminate long-running I/O operations gracefully.",
    },
    {
        id: "GO-RESOURCE-01",
        area: "Resource Cleanup",
        principle: "RAII",
        severity: "CRITICAL",
        appliesTo: { language: ["go"] },
        // Flags resource opening without an immediate defer call
        check: (code) => /(os\.Open|db\.Begin|sync\..*Lock)\s*\([\s\S]*?\)\s*[^;]*;[\s\S]*?\}[\s\S]*?(!defer)/.test(code),
        message: "Resource acquisition (file handles, database transactions, mutex locks) is not immediately followed by a `defer` statement for cleanup/release.",
        rationale: "The `defer` statement guarantees resource release, preventing leaks even if the function panics or returns early. The defer should be placed as close to the acquisition as possible.",
    },
    {
        id: "GO-API-01",
        area: "Interface Design",
        principle: "DIP",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Simple check that encourages thinking about interface design
        check: (code) => /func\s+[A-Z][a-zA-Z0-9_]*\s*\((\s*type\s*)\)/.test(code),
        message: "Interfaces should be small and defined near their consumers, not their implementers. Follow the rule: 'Accept interfaces, return structs.'",
        rationale: "Promotes loose coupling and better testability. Consumers only define the methods they need, reducing dependency on monolithic interfaces.",
    },
    {
        id: "GO-NAMING-02",
        area: "Naming Convention",
        principle: "Visibility",
        severity: "CRITICAL",
        appliesTo: { language: ["go"] },
        // Flags exported identifiers starting with a lowercase letter
        check: (code) => /func\s+[a-z][a-zA-Z0-9_]*\s*\(/.test(code) &&
            !/(private|internal)/.test(code) &&
            /package\s+[a-z][a-zA-Z0-9_]*/.test(code),
        message: "Exported functions, types, and variables must start with a capital letter. Lowercase initial letter means the identifier is private to the package.",
        rationale: "Visibility (public/private) is controlled solely by capitalization in Go. Incorrect capitalization breaks the package's public API.",
    },
    {
        id: "GO-MEM-01",
        area: "Memory & Performance",
        principle: "Efficiency",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Checks for passing large structs/arrays by value instead of by pointer/slice
        check: (code) => /func\s+\w+\s*\([\s\S]*?\s+struct\s*\{[\s\S]{50,}\}\s*,/.test(code),
        message: "Avoid passing large structs or large arrays by value as function arguments.",
        rationale: "Passing large data structures by value creates a full copy on the stack, consuming extra memory and CPU time, and can place unnecessary pressure on the garbage collector.",
    },
    {
        id: "GO-DEFENSE-01",
        area: "Defensive Programming",
        principle: "Reliability",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Checks for unhandled nil checks, particularly around maps/slices received as arguments
        check: (code) => /func\s+\w+\s*\([\s\S]*?(map|\[\])/.test(code) &&
            !/if\s+\w+\s*==\s*nil/.test(code),
        message: "Public functions that accept maps or slices should check if the argument is `nil` before attempting to access or iterate over it.",
        rationale: "Explicitly checking for `nil` prevents potential runtime errors if the caller provides an uninitialized variable.",
    },
    {
        id: "GO-TEST-01",
        area: "Testing & Benchmarks",
        principle: "Maintainability",
        severity: "HIGH",
        appliesTo: { language: ["go"] },
        // Checks for a test file that doesn't have a table-driven test or a benchmark function
        check: (code) => !/var\s+testCases\s*=\s*\[\]struct/.test(code) &&
            !/func\s+Benchmark\w+\s*\(b\s+\*testing\.B\)/.test(code),
        message: "Unit tests for complex logic should use table-driven design (`[]struct`) for concise coverage of multiple inputs/outputs, and performance-critical areas should include benchmarks.",
        rationale: "Table-driven tests are the idiomatic and most readable way to cover various test cases. Benchmarks are essential for ensuring performance remains stable over time.",
    },
];
//# sourceMappingURL=go.js.map