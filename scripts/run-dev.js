#!/usr/bin/env node
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");

function which(name) {
  const pathEnv = process.env.PATH || "";
  const exe = process.platform === "win32" ? name + ".cmd" : name;
  for (const dir of pathEnv.split(path.delimiter)) {
    const p = path.join(dir.trim(), exe);
    try {
      if (fs.existsSync(p)) return exe;
    } catch (_) {}
  }
  return null;
}

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

console.log("[CodeSentinel] Compiling...\n");
execSync("npm run compile", { cwd: root, stdio: "inherit" });

console.log("\n[CodeSentinel] Launching Extension Development Host...\n");
console.log("  📋 To see ALL console.log output from the extension:");
console.log("     In the NEW window: Help > Toggle Developer Tools > Console\n");
console.log("  🔄 After code changes: Cmd+Shift+P → \"Developer: Reload Window\"\n");

// Load .env from the extension workspace and pass it to the extension host
const envFromFile = loadEnvFile(path.join(root, ".env"));
if (envFromFile.GEMINI_API_KEY) {
  console.log("  ✅ GEMINI_API_KEY loaded from .env for dev session\n");
}
const childEnv = { ...process.env, ...envFromFile };

// Use Cursor if available (so extension loads in Cursor), else VS Code
const cursor = which("cursor");
const code = which("code");
const host = cursor || code;
if (!host) {
  console.error(
    "  ❌ Neither 'cursor' nor 'code' found in PATH. Install Cursor or VS Code and ensure the CLI is in PATH.\n"
  );
  process.exit(1);
}
console.log("  Using:", host === "cursor" ? "Cursor" : "VS Code", "\n");

// Open the project folder in the new window so the extension has a workspace and loads correctly
spawn(
  host,
  ["--extensionDevelopmentPath=" + root, root],
  {
    stdio: "inherit",
    cwd: root,
    env: childEnv,
    detached: true,
  }
).unref();
