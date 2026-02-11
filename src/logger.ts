import * as vscode from "vscode";

let channel: vscode.OutputChannel | undefined;

function getChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel("CodeSentinel");
  }
  return channel;
}

export function log(msg: string): void {
  const c = getChannel();
  c.appendLine(`[${new Date().toISOString().slice(11, 23)}] ${msg}`);
  console.log("[CodeSentinel]", msg);
}

export function warn(msg: string): void {
  const c = getChannel();
  c.appendLine(`[${new Date().toISOString().slice(11, 23)}] WARN ${msg}`);
  console.warn("[CodeSentinel]", msg);
}

export function error(msg: string): void {
  const c = getChannel();
  c.appendLine(`[${new Date().toISOString().slice(11, 23)}] ERROR ${msg}`);
  console.error("[CodeSentinel]", msg);
}

/** Call once when a review starts so the user sees the channel and we have a clear log block. */
export function startReview(): void {
  const c = getChannel();
  c.appendLine("");
  c.appendLine("--- CodeSentinel review ---");
  c.show(true);
}

export function showLog(): void {
  getChannel().show(true);
}
