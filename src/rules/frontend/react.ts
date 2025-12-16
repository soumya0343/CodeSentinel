import { ReviewRule } from "../../types/reviewRule";

export const reactRules: ReviewRule[] = [
  {
    id: "REACT-SRP-01",
    area: "Component Design",
    principle: "SRP",
    severity: "BLOCKER",
    appliesTo: { framework: ["react"], scope: ["frontend"] },
    check: (code) => code.split("\n").length > 150,
    message:
      "Component exceeds 150 lines. Split logic using custom hooks and/or refactor into container/presenter pattern.",
    rationale:
      "Prevents 'God Components,' significantly improves reusability, testability, and reduces maintenance complexity.",
  },

  {
    id: "REACT-HOOKS-01",
    area: "Hooks Usage",
    principle: "Rules of Hooks",
    severity: "BLOCKER",
    appliesTo: { framework: ["react"] },
    // Simplified regex to clearly target conditional or nested hook calls
    check: (code) =>
      /(if|for|while|switch).*?\{[\s\S]*?(use[A-Z]\w+)\s*\(/s.test(code),
    message:
      "Hooks must not be called inside loops, conditions, or nested functions.",
    rationale:
      "React relies on a consistent, static hook call order between renders to correctly manage state and effects.",
  },

  {
    id: "REACT-KEYS-01",
    area: "List Rendering",
    principle: "Reconciliation",
    severity: "CRITICAL",
    appliesTo: { framework: ["react"] },
    check: (code) => {
      // Flags either map using index as parameter OR map using index/i as the key value
      return (
        /\.map\s*\(\s*\([^,)]+,\s*(index|i)\s*\)/.test(code) ||
        /key\s*=\s*\{?\s*(index|i)\s*\}?/.test(code)
      );
    },
    message:
      "Using array index (`index` or `i`) as the `key` prop in dynamic lists. Use a stable, unique identifier from the data instead.",
    rationale:
      "Incorrect keys break React's reconciliation algorithm, causing rendering bugs and state corruption when list items are added, removed, or reordered.",
  },

  {
    id: "REACT-SECURITY-01",
    area: "Security",
    principle: "Secrets Management",
    severity: "CRITICAL",
    appliesTo: { framework: ["react"], scope: ["frontend"] },
    check: (code) => {
      // Enhanced check for common keywords with quoted values
      if (
        /(?:token|password|secret|api[_-]?key|apikey|bearer)\s*[:=]\s*["'][A-Za-z0-9_-]{10,}["']/i.test(
          code
        )
      )
        return true;
      return false;
    },
    message:
      "Hardcoded credentials, tokens, or secrets detected. **Move to environment variables (`process.env.*`) immediately.**",
    rationale:
      "Hardcoded secrets are visible in the client-side bundle and expose sensitive data to the public. ",
  },

  {
    id: "REACT-ERROR-01",
    area: "Error Handling",
    principle: "Defensive Programming",
    severity: "HIGH",
    appliesTo: { framework: ["react"], scope: ["frontend"] },
    check: (code) => {
      // Find all promises (fetch, axios, async/await blocks)
      const promiseMatches = code.match(/fetch|axios|\basync\s+function/g);
      if (!promiseMatches || promiseMatches.length === 0) return false;

      // Simple check: are there async operation keywords without catch/try?
      if (
        (code.includes("fetch") || code.includes("axios")) &&
        !code.includes(".catch") &&
        !code.includes("try")
      )
        return true;

      if (code.includes("await") && !code.includes("try")) return true;

      return false;
    },
    message:
      "Asynchronous calls (fetch, axios, await) are missing error handling. Add `.catch()` or `try-catch` blocks.",
    rationale:
      "Unhandled promise rejections result in ungraceful crashes and poor user experience. All side effects must handle failure states.",
  },

  {
    id: "REACT-HOOKS-03",
    area: "Hooks Dependencies",
    principle: "Predictability",
    severity: "CRITICAL",
    appliesTo: { framework: ["react"] },
    check: (code) => {
      // Checks for any useEffect, useMemo, or useCallback using an empty dependency array `[]`
      return /(useEffect|useMemo|useCallback)\s*\([^)]*\)\s*,\s*\[\s*\]\s*\)/s.test(
        code
      );
    },
    message:
      "The dependency array is empty (`[]`). **CRITICAL REVIEW REQUIRED.** Ensure this is intentional and does not lead to stale closures.",
    rationale:
      "An empty dependency array often indicates a missing dependency, leading to the hook's callback using 'stale' (old) values of state or props, causing subtle bugs.",
  },

  // --- New Rules Start Here ---

  {
    id: "REACT-PERF-02",
    area: "Performance",
    principle: "Memoization",
    severity: "HIGH",
    appliesTo: { framework: ["react"] },
    // Flags inline object or function creation being passed to a child component
    check: (code) =>
      /<\s*[A-Z]\w+\s+[\s\S]*?(onClick|data|style|options)\s*=\s*\{\s*(\{|=>)\s*[\s\S]*?\}/s.test(
        code
      ) && !/(useMemo|useCallback)/.test(code),
    message:
      "Passing inline objects (`{...}`) or functions (`() => {...}`) as props to custom components without using `useMemo` or `useCallback`.",
    rationale:
      "Inline creation generates a new reference on every parent render, defeating memoization (`React.memo`) on the child component and causing unnecessary re-renders.",
  },

  {
    id: "REACT-A11Y-01",
    area: "Accessibility (A11y)",
    principle: "Usability",
    severity: "HIGH",
    appliesTo: { framework: ["react"] },
    // Checks for generic elements being used for interaction (like a div) without explicit ARIA/role/tabIndex
    check: (code) =>
      /(<div|<\s*span)[\s\S]*?onClick/.test(code) &&
      !/(role="button"|tabIndex)/i.test(code),
    message:
      "Non-semantic interactive elements (`<div>` or `<span>` with `onClick`) must include `role='button'` and handle keyboard events (`onKeyDown`, `tabIndex`).",
    rationale:
      "Semantic HTML (like `<button>`) is natively accessible. Using generic elements without ARIA breaks screen reader compatibility and keyboard navigation.",
  },

  {
    id: "TS-EXPLICIT-01",
    area: "TypeScript Typing",
    principle: "Type Safety",
    severity: "HIGH",
    appliesTo: { language: ["typescript"], framework: ["react"] },
    // Flags functions (especially components) that use implicit typing for props or state initialization
    check: (code) =>
      /const\s+[A-Z]\w+\s*=\s*\((props|\{\s*[^}]*\s*\})\s*\)\s*=>/.test(code) &&
      !/(interface|type)\s+[A-Z]\w+Props/.test(code),
    message:
      "Public component props and Custom Hook return types must be explicitly defined using interfaces or types.",
    rationale:
      "Explicit contracts improve readability, aid external consumption, and prevent subtle type inference errors when the type definition is ambiguous.",
  },
];
