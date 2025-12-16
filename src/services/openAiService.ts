import OpenAI from "openai";
import * as vscode from "vscode";

export async function runOpenAIReview(prompt: string): Promise<string> {
  const config = vscode.workspace.getConfiguration("codeSentinel");
  const apiKey = config.get<string>("openaiApiKey");
  const model = config.get<string>("openaiModel") || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a senior software engineer performing a professional code review.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 900,
  });

  return response.choices[0]?.message?.content ?? "No response from OpenAI";
}
