export type CodeScope = "frontend" | "backend" | "both";

export interface ReviewContext {
  scope: CodeScope;
  techStack: string[];
  language: string;
}
