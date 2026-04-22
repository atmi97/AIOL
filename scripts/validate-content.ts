import { readdir } from "node:fs/promises";
import path from "node:path";
import { readQuizBank, readTierMeta, readTierModules } from "../lib/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

type Issue = { code: string; where: string; message: string };

async function listTiers(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith("tier"))
    .map((e) => e.name)
    .sort();
}

async function validateTier(tierId: string, issues: Issue[]) {
  const where = (sub: string) => `${tierId}/${sub}`;

  let meta;
  try {
    meta = await readTierMeta(tierId);
  } catch (e) {
    issues.push({ code: "TIER_META_INVALID", where: where("meta.json"), message: String(e) });
    return;
  }

  let modules;
  try {
    modules = await readTierModules(tierId);
  } catch (e) {
    issues.push({ code: "MODULES_INVALID", where: where("module-*/index.mdx"), message: String(e) });
    return;
  }

  let bank;
  try {
    bank = await readQuizBank(tierId);
  } catch (e) {
    issues.push({ code: "QUIZ_BANK_INVALID", where: where("quiz-bank.json"), message: String(e) });
    return;
  }

  const moduleIds = new Set(modules.map((m) => m.id));
  for (const mmeta of meta.modules) {
    if (!moduleIds.has(mmeta.slug)) {
      issues.push({
        code: "META_REFERENCES_MISSING_MODULE",
        where: where(`meta.json#modules/${mmeta.id}`),
        message: `meta.json lists slug=${mmeta.slug} but no matching module MDX exists`,
      });
    }
  }

  for (const m of modules) {
    if (m.tierId !== tierId) {
      issues.push({
        code: "MODULE_TIER_MISMATCH",
        where: where(`${m.id}/index.mdx`),
        message: `module.tierId=${m.tierId} does not match ${tierId}`,
      });
    }
    if (!m.body.trim()) {
      issues.push({
        code: "MODULE_EMPTY_BODY",
        where: where(`${m.id}/index.mdx`),
        message: "MDX body is empty",
      });
    }
  }

  const moduleNumbers = new Set(modules.map((m) => m.moduleNumber));
  for (const quiz of bank.quizzes) {
    if (quiz.tierId !== tierId) {
      issues.push({
        code: "QUIZ_TIER_MISMATCH",
        where: where(`quiz-bank.json#${quiz.id}`),
        message: `quiz.tierId=${quiz.tierId} does not match ${tierId}`,
      });
    }

    const distSum = Object.values(quiz.moduleDistribution).reduce((a, b) => a + b, 0);
    if (distSum > 0 && distSum !== quiz.questionsPerAttempt) {
      issues.push({
        code: "QUIZ_DISTRIBUTION_MISMATCH",
        where: where(`quiz-bank.json#${quiz.id}.moduleDistribution`),
        message: `moduleDistribution sum ${distSum} != questionsPerAttempt ${quiz.questionsPerAttempt}`,
      });
    }

    for (const modNum of Object.keys(quiz.moduleDistribution)) {
      if (!moduleNumbers.has(modNum)) {
        issues.push({
          code: "QUIZ_DISTRIBUTION_UNKNOWN_MODULE",
          where: where(`quiz-bank.json#${quiz.id}.moduleDistribution.${modNum}`),
          message: `distribution references module ${modNum} which has no MDX`,
        });
      }
    }

    const seenQuestionIds = new Set<string>();
    const byModule = new Map<string, number>();
    for (const q of quiz.questions) {
      if (seenQuestionIds.has(q.id)) {
        issues.push({
          code: "QUESTION_DUPLICATE_ID",
          where: where(`quiz-bank.json#${quiz.id}.questions.${q.id}`),
          message: `duplicate question id ${q.id}`,
        });
      }
      seenQuestionIds.add(q.id);

      byModule.set(q.module, (byModule.get(q.module) ?? 0) + 1);

      const optionIds = new Set(q.options.map((o) => o.id));
      for (const c of q.correct) {
        if (!optionIds.has(c)) {
          issues.push({
            code: "QUESTION_CORRECT_UNKNOWN_OPTION",
            where: where(`quiz-bank.json#${quiz.id}.questions.${q.id}`),
            message: `correct=${c} not present in options ${[...optionIds].join(",")}`,
          });
        }
      }
      if (q.type === "single" && q.correct.length !== 1) {
        issues.push({
          code: "QUESTION_SINGLE_MULTI_CORRECT",
          where: where(`quiz-bank.json#${quiz.id}.questions.${q.id}`),
          message: `single-choice question must have exactly one correct, got ${q.correct.length}`,
        });
      }
    }

    for (const [modNum, want] of Object.entries(quiz.moduleDistribution)) {
      const have = byModule.get(modNum) ?? 0;
      if (have < want) {
        issues.push({
          code: "QUIZ_INSUFFICIENT_POOL",
          where: where(`quiz-bank.json#${quiz.id}.moduleDistribution.${modNum}`),
          message: `distribution wants ${want} from module ${modNum} but only ${have} questions exist`,
        });
      }
    }
  }
}

async function main() {
  const issues: Issue[] = [];
  const tiers = await listTiers();
  if (tiers.length === 0) {
    console.error("No tier directories found under content/");
    process.exit(1);
  }
  for (const t of tiers) await validateTier(t, issues);

  if (issues.length === 0) {
    console.log(`content OK (${tiers.length} tier${tiers.length > 1 ? "s" : ""} checked)`);
    return;
  }

  console.error(`\n${issues.length} issue(s):`);
  for (const i of issues) {
    console.error(`  [${i.code}] ${i.where}`);
    console.error(`    ${i.message}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
