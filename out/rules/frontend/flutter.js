"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterRules = void 0;
exports.flutterRules = [
    {
        id: "FLUTTER-IMM-01",
        area: "Immutability",
        principle: "Predictability",
        severity: "CRITICAL",
        appliesTo: { language: ["dart"], framework: ["flutter"] },
        check: (code) => /extends\s+(StatelessWidget|StatefulWidget)[\s\S]*?[^final]\s+\w+;/.test(code),
        message: "Widget fields must be final.",
        rationale: "Ensures widget immutability and rendering correctness.",
    },
    {
        id: "FLUTTER-BUILD-01",
        area: "Widget Structure",
        principle: "SRP",
        severity: "BLOCKER",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Basic check for functions named 'build' with significant size (800+ characters)
        /Widget\s+build\([\s\S]{800,}\)/.test(code),
        message: "build() method too large. Refactor into smaller, composable widgets.",
        rationale: "Large build methods hurt readability, testability, and can cause excessive, unnecessary rebuilds of the widget tree.",
    },
    {
        id: "FLUTTER-ASYNC-01",
        area: "Async UI",
        principle: "Reliability",
        severity: "HIGH",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Checks for FutureBuilder usage without explicit handling for 'hasError' state
        /FutureBuilder/.test(code) && !/hasError|snapshot\.error/.test(code),
        message: "FutureBuilder or StreamBuilder is missing explicit error handling for the `snapshot.hasError` state.",
        rationale: "Async failures (network errors, data processing errors) must be gracefully surfaced to the UI to avoid silent application failure or unexpected state.",
    },
    // --- Additional Rules Start Here ---
    {
        id: "FLUTTER-PERF-01",
        area: "Performance",
        principle: "Efficiency",
        severity: "HIGH",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Simple check to flag widgets that could potentially be const but are not
        /(new\s+Container|new\s+Padding|new\s+Text|new\s+SizedBox)\s*\(/.test(code) && !/const\s+(Container|Padding|Text|SizedBox)/.test(code),
        message: "Widgets that are immutable and do not depend on external state should use a `const` constructor.",
        rationale: "Using `const` prevents the Flutter engine from rebuilding that widget instance and its subtree on every parent rebuild, significantly boosting rendering performance.",
    },
    {
        id: "FLUTTER-PERF-02",
        area: "Performance",
        principle: "Efficiency",
        severity: "HIGH",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Flags the common anti-pattern of using index as the key in dynamic lists
        /\.map\([\s\S]*?index[\s\S]*?key:\s+(ValueKey|Key)\(index\)/.test(code),
        message: "Using array index as a widget `key` in dynamic lists (that can be reordered, inserted, or removed) is unstable.",
        rationale: "Keys must be based on a stable, unique ID from the data model. Using the index breaks the reconciliation algorithm and can lead to incorrect state/data being associated with the wrong widget.",
    },
    {
        id: "FLUTTER-PERF-03",
        area: "Performance",
        principle: "Efficiency",
        severity: "HIGH",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Flags use of ListView without a builder for lists potentially over 10 items
        /ListView\(([\s\S]{0,100})children:\s*\[\s*([\s\S]{1,100}\.\.\.|\s*|\])/.test(code) && !/ListView\.builder/.test(code),
        message: "For large or dynamic lists, use `ListView.builder` or `ListView.separated` for lazy loading.",
        rationale: "Instantiating all list children at once (non-builder constructor) is memory-intensive and degrades performance. Builders create widgets on demand.",
    },
    {
        id: "FLUTTER-STATE-01",
        area: "State Management",
        principle: "Encapsulation",
        severity: "BLOCKER",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Check for common external dependencies that might try to call setState
        /final\s+State\s+/.test(code),
        message: "`setState` should only be called within the associated `State` class. Avoid passing `State` references outside the widget.",
        rationale: "Calling `setState` externally breaks the state encapsulation and makes the flow unpredictable. Use global state managers (Provider, Riverpod, BLoC) for external communication.",
    },
    {
        id: "FLUTTER-STATE-02",
        area: "State Management",
        principle: "Resource Cleanup",
        severity: "CRITICAL",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Flags common resources being initialized without a dispose method present
        /(TextEditingController|AnimationController|StreamSubscription)/.test(code) && !/override\s+void\s+dispose\s*\(\s*\)\s*\{[\s\S]*?\}/.test(code),
        message: "Controllers (`TextEditingController`, `AnimationController`, etc.) or `StreamSubscription` objects must be disposed of in the `dispose()` method.",
        rationale: "Failure to dispose leads to memory leaks, as these resources remain active even after the widget is unmounted from the widget tree.",
    },
    {
        id: "FLUTTER-NULL-01",
        area: "Null Safety",
        principle: "Reliability",
        severity: "CRITICAL",
        appliesTo: { language: ["dart"] },
        check: (code) => 
        // Flags the non-null assertion operator used on local variables/fields
        /[a-zA-Z0-9_]+\s*!/.test(code),
        message: "Avoid using the non-null assertion operator `!` unless it is absolutely certain (e.g., immediately after a check) or unavoidable. Prefer null-aware operators (`?` or `??`).",
        rationale: "The `!` operator explicitly bypasses Dart's null safety and will result in a runtime exception (`Null check operator used on a null value`) if the value is null.",
    },
    {
        id: "FLUTTER-LAYOUT-01",
        area: "Layout",
        principle: "Constraints",
        severity: "HIGH",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Flags a common scenario where Expanded/Flexible is missing in a Row/Column
        /(Row|Column)\s*\(.*(children|widgets):\s*\[[\s\S]*?(Container|Text|Image|SizedBox)[\s\S]*?\]\s*\)/.test(code) && !/(Expanded|Flexible)/.test(code),
        message: "Inside a `Row` or `Column`, children that take up available space must be wrapped in an `Expanded` or `Flexible` widget.",
        rationale: "Failing to constrain children in the main axis of a Row/Column often results in 'Unbounded Width/Height' exceptions (the yellow/black striped screen).",
    },
    {
        id: "FLUTTER-A11Y-01",
        area: "Accessibility",
        principle: "Usability",
        severity: "MEDIUM",
        appliesTo: { framework: ["flutter"] },
        check: (code) => 
        // Checks for IconButton or GestureDetector usage without an explicit tooltip or Semantics wrapper
        /(IconButton|GestureDetector)/.test(code) &&
            !/(tooltip|Semantics)/.test(code),
        message: "Icon-only interactive widgets (`IconButton`, `GestureDetector` on an `Icon`) should include a `tooltip` or be wrapped in a `Semantics` widget.",
        rationale: "Screen readers need descriptive text (via tooltip or Semantics) to inform visually impaired users what the icon-only action button does.",
    },
];
//# sourceMappingURL=flutter.js.map