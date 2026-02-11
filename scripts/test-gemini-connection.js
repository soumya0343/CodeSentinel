const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mock VSCode API for testing outside of extension host
const vscode = {
  workspace: {
    workspaceFolders: [{ uri: { fsPath: path.resolve(__dirname, "..") } }],
    getConfiguration: () => ({ get: () => "" }),
  },
  window: {
    showInformationMessage: console.log,
    showErrorMessage: console.error,
  },
};

async function test() {
  console.log("Starting Gemini SDK Connection Test...");

  // 1. Test .env reading
  const root = path.resolve(__dirname, "..");
  const envPath = path.join(root, ".env");
  console.log(`Checking for .env at: ${envPath}`);

  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey && fs.existsSync(envPath)) {
    const config = dotenv.parse(fs.readFileSync(envPath));
    apiKey = config.GEMINI_API_KEY;
    console.log(".env file found and parsed.");
  }

  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in process.env or .env file.");
    return;
  }

  console.log(`✅ API Key found (starts with: ${apiKey.substring(0, 4)}...)`);

  // 2. Test SDK Connection
  const modelName = "gemini-2.5-flash";
  console.log(`Testing connection to model: ${modelName} via SDK...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();

    console.log(`✅ Connection Successful! Response: "${text.trim()}"`);
  } catch (e) {
    console.error(`❌ Connection Error: ${e.message}`);
    if (e.message.includes("429")) {
      console.log(
        "⚠️ This is a rate limit error, which confirms the key and model are valid.",
      );
    }
  }
}

test();
