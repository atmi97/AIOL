import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ModuleFrontmatter, QuizBank, TierMeta } from "./schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Read + validate the tier meta.json for a given tier.
export async function readTierMeta(tierId: string): Promise<TierMeta> {
  const file = path.join(CONTENT_DIR, tierId, "meta.json");
  const raw = JSON.parse(await fs.readFile(file, "utf8"));
  return TierMeta.parse(raw);
}

// Read + validate all module MDX files for a tier.
export async function readTierModules(tierId: string) {
  const dir = path.join(CONTENT_DIR, tierId);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const modules = [];
  for (const e of entries) {
    if (!e.isDirectory() || !e.name.startsWith("module-")) continue;
    const mdx = path.join(dir, e.name, "index.mdx");
    const raw = await fs.readFile(mdx, "utf8");
    const parsed = matter(raw);
    const front = ModuleFrontmatter.parse(parsed.data);
    modules.push({ ...front, body: parsed.content });
  }
  modules.sort((a, b) => a.order - b.order);
  return modules;
}

// Read + validate the quiz bank for a tier.
export async function readQuizBank(tierId: string): Promise<QuizBank> {
  const file = path.join(CONTENT_DIR, tierId, "quiz-bank.json");
  const raw = JSON.parse(await fs.readFile(file, "utf8"));
  return QuizBank.parse(raw);
}

// Read the program plan MDX for the marketing landing page.
export async function readProgramOverview(): Promise<string> {
  const file = path.join(CONTENT_DIR, "program.mdx");
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}
