"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cppRules = void 0;
exports.cppRules = [
    {
        id: "CPP-MEM-01",
        area: "Memory Management",
        principle: "RAII",
        severity: "CRITICAL",
        appliesTo: { language: ["cpp"] },
        // CRITICAL: Block all raw new/delete outside of factory functions
        check: (code) => /\s+new\s+[A-Z][a-zA-Z0-9]+\s*\([^;]*\);|\s+delete\s+[a-zA-Z0-9_]+;/.test(code),
        message: "Manual memory management (`new` and `delete`) is prohibited. Use smart pointers (`std::unique_ptr`, `std::shared_ptr`).",
        rationale: "Manual management violates the **Resource Acquisition Is Initialization (RAII)** principle and is the primary cause of memory leaks and double-delete errors in C++.",
    },
    {
        id: "CPP-PTR-01",
        area: "Smart Pointers",
        principle: "Ownership",
        severity: "CRITICAL",
        appliesTo: { language: ["cpp"] },
        // Flags shared_ptr use when unique_ptr would suffice (no shared ownership needed)
        check: (code) => /std::shared_ptr</.test(code) &&
            !/std::weak_ptr</.test(code) &&
            !/global|factory/.test(code),
        message: "Default to `std::unique_ptr` for exclusive ownership. Use `std::shared_ptr` only when ownership MUST be shared.",
        rationale: "`std::shared_ptr` carries performance overhead (atomic reference counting). `std::unique_ptr` is lighter and enforces clear, single ownership semantics.",
    },
    {
        id: "CPP-CONST-01",
        area: "Const-Correctness",
        principle: "Safety",
        severity: "HIGH",
        appliesTo: { language: ["cpp"] },
        // Flags member functions that do not modify state but are not const
        check: (code) => /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s+\w+\s*\([\s\S]*?\)\s*\{[\s\S]*?\}/.test(code) && !/const\s*\{[\s\S]*?\}/.test(code),
        message: "Member functions that do not modify the object's state must be declared `const`.",
        rationale: "Ensures type safety and allows the function to be called on `const` objects. It defines a clear contract about state mutation.",
    },
    {
        id: "CPP-PERF-01",
        area: "Performance",
        principle: "Efficiency",
        severity: "HIGH",
        appliesTo: { language: ["cpp"] },
        // Flags objects being returned by value that are not trivially copyable
        check: (code) => /return\s+[a-zA-Z0-9_]+;/.test(code) &&
            !/std::move\s*\([\s\S]*?\)/.test(code),
        message: "Ensure return types (especially large containers or objects with resource ownership) support move semantics (C++11+) or use `std::move` where appropriate.",
        rationale: "Prevents unnecessary deep copies of large objects, which severely degrades performance. Move semantics transfer resource ownership instead of copying data.",
    },
    {
        id: "CPP-HEADER-01",
        area: "Compilation",
        principle: "Dependency Mgmt",
        severity: "HIGH",
        appliesTo: { language: ["cpp"] },
        // Flags excessive includes in header files (.h/.hpp)
        check: (code) => /\.hpp|\.h/.test(code) &&
            /#include\s*<[a-zA-Z0-9]*>/g.test(code) &&
            !/class\s+[A-Z][a-zA-Z0-9]*;/.test(code),
        message: "In header files, prefer **forward declarations** over `#include` directives whenever possible (e.g., for types used as pointers/references).",
        rationale: "Minimizes compilation time and prevents unnecessary dependencies from cascading across the entire project.",
    },
    {
        id: "CPP-MODERN-01",
        area: "Modern C++",
        principle: "Readability",
        severity: "MEDIUM",
        appliesTo: { language: ["cpp"] },
        // Flags C-style casting
        check: (code) => /\([a-zA-Z0-9_]*\)[a-zA-Z0-9_]/.test(code),
        message: "Avoid C-style casts (`(Type)variable`). Use explicit C++ casts: `static_cast`, `dynamic_cast`, `const_cast`, or `reinterpret_cast`.",
        rationale: "C-style casts are unsafe and vague. C++ casts clarify the intent and risk of the conversion.",
    },
];
//# sourceMappingURL=cpp.js.map