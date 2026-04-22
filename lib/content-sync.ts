import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { prisma } from "./prisma";
import { readQuizBank, readTierMeta, readTierModules } from "./content";

const CONTENT_DIR = path.join(process.cwd(), "content");

// ---------------------------------------------------------------------------
// Import /content/** -> DB. Idempotent: upserts rows. Safe to run on boot.
// ---------------------------------------------------------------------------
export async function importTierFromRepo(tierId: string) {
  const meta = await readTierMeta(tierId);
  const modules = await readTierModules(tierId);
  const quizBank = await readQuizBank(tierId);

  await prisma.tier.upsert({
    where: { id: meta.id },
    create: {
      id: meta.id,
      title: meta.title,
      tagline: meta.tagline ?? null,
      audience: meta.audience ?? null,
      estMinutes: meta.estMinutes,
      passThreshold: meta.passThreshold,
      renewal: meta.renewal ?? null,
      philosophy: meta.philosophy ?? null,
      appendix: meta.appendix ?? "",
      order: 0,
    },
    update: {
      title: meta.title,
      tagline: meta.tagline ?? null,
      audience: meta.audience ?? null,
      estMinutes: meta.estMinutes,
      passThreshold: meta.passThreshold,
      renewal: meta.renewal ?? null,
      philosophy: meta.philosophy ?? null,
      appendix: meta.appendix ?? "",
    },
  });

  for (const m of modules) {
    await prisma.module.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        moduleNumber: m.moduleNumber,
        tierId: m.tierId,
        order: m.order,
        title: m.title,
        estMinutes: m.estMinutes,
        objectivesJson: JSON.stringify(m.objectives),
        requiresJson: JSON.stringify(m.requires ?? []),
        bodyMdx: m.body,
      },
      update: {
        moduleNumber: m.moduleNumber,
        order: m.order,
        title: m.title,
        estMinutes: m.estMinutes,
        objectivesJson: JSON.stringify(m.objectives),
        requiresJson: JSON.stringify(m.requires ?? []),
        bodyMdx: m.body,
      },
    });
  }

  for (const quiz of quizBank.quizzes) {
    await prisma.quiz.upsert({
      where: { id: quiz.id },
      create: {
        id: quiz.id,
        tierId: quiz.tierId,
        title: quiz.title,
        description: quiz.description ?? "",
        passThreshold: quiz.passThreshold,
        maxAttempts: quiz.maxAttempts,
        timeLimitMinutes: quiz.timeLimitMinutes,
        questionsPerAttempt: quiz.questionsPerAttempt,
        shuffle: quiz.shuffle,
        shuffleOptions: quiz.shuffleOptions,
        moduleDistribution: JSON.stringify(quiz.moduleDistribution),
      },
      update: {
        title: quiz.title,
        description: quiz.description ?? "",
        passThreshold: quiz.passThreshold,
        maxAttempts: quiz.maxAttempts,
        timeLimitMinutes: quiz.timeLimitMinutes,
        questionsPerAttempt: quiz.questionsPerAttempt,
        shuffle: quiz.shuffle,
        shuffleOptions: quiz.shuffleOptions,
        moduleDistribution: JSON.stringify(quiz.moduleDistribution),
      },
    });

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      await prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          quizId: quiz.id,
          moduleRef: q.moduleRef,
          lo: q.lo ?? null,
          difficulty: q.difficulty,
          tagsJson: JSON.stringify(q.tags),
          type: q.type,
          prompt: q.prompt,
          optionsJson: JSON.stringify(q.options),
          correctJson: JSON.stringify(q.correct),
          rationale: q.rationale ?? "",
          order: i,
        },
        update: {
          quizId: quiz.id,
          moduleRef: q.moduleRef,
          lo: q.lo ?? null,
          difficulty: q.difficulty,
          tagsJson: JSON.stringify(q.tags),
          type: q.type,
          prompt: q.prompt,
          optionsJson: JSON.stringify(q.options),
          correctJson: JSON.stringify(q.correct),
          rationale: q.rationale ?? "",
          order: i,
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Boot-time: if DB has no tiers, seed from /content/**.
// ---------------------------------------------------------------------------
export async function seedIfEmpty() {
  const count = await prisma.tier.count();
  if (count > 0) return { seeded: false };
  // Only tier1 exists today. Future tiers: iterate content subdirectories.
  await importTierFromRepo("tier1");
  return { seeded: true };
}

// ---------------------------------------------------------------------------
// Export DB -> /content/** (for admins who edited via UI and want to
// produce a reviewable git diff).
// ---------------------------------------------------------------------------
export async function exportTierToRepo(tierId: string): Promise<string[]> {
  const tier = await prisma.tier.findUnique({ where: { id: tierId } });
  if (!tier) throw new Error(`Tier ${tierId} not found`);
  const modules = await prisma.module.findMany({
    where: { tierId },
    orderBy: { order: "asc" },
  });
  const quizzes = await prisma.quiz.findMany({
    where: { tierId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  const written: string[] = [];
  const tierDir = path.join(CONTENT_DIR, tierId);
  await fs.mkdir(tierDir, { recursive: true });

  // meta.json
  const meta = {
    id: tier.id,
    title: tier.title,
    tagline: tier.tagline ?? "",
    audience: tier.audience ?? "",
    estMinutes: tier.estMinutes,
    passThreshold: tier.passThreshold,
    renewal: tier.renewal ?? "",
    philosophy: tier.philosophy ?? "",
    modules: modules.map((m) => ({
      id: m.id,
      slug: m.id,
      title: m.title,
      estMinutes: m.estMinutes,
      order: m.order,
    })),
    appendix: tier.appendix ?? "",
  };
  const metaPath = path.join(tierDir, "meta.json");
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
  written.push(metaPath);

  // modules
  for (const m of modules) {
    const dir = path.join(tierDir, m.id);
    await fs.mkdir(dir, { recursive: true });
    const front = {
      id: m.id,
      moduleNumber: m.moduleNumber,
      title: m.title,
      tierId: m.tierId,
      order: m.order,
      estMinutes: m.estMinutes,
      objectives: JSON.parse(m.objectivesJson),
      requires: JSON.parse(m.requiresJson),
    };
    const mdx = matter.stringify(m.bodyMdx, front);
    const file = path.join(dir, "index.mdx");
    await fs.writeFile(file, mdx, "utf8");
    written.push(file);
  }

  // quiz-bank.json
  const bank = {
    quizzes: quizzes.map((q) => ({
      id: q.id,
      tierId: q.tierId,
      title: q.title,
      description: q.description ?? "",
      passThreshold: q.passThreshold,
      maxAttempts: q.maxAttempts,
      timeLimitMinutes: q.timeLimitMinutes,
      questionsPerAttempt: q.questionsPerAttempt,
      shuffle: q.shuffle,
      shuffleOptions: q.shuffleOptions,
      moduleDistribution: JSON.parse(q.moduleDistribution),
      questions: q.questions.map((qq) => ({
        id: qq.id,
        module: qq.moduleRef?.replace("module-", "") ?? "",
        moduleRef: qq.moduleRef,
        lo: qq.lo ?? "",
        difficulty: qq.difficulty ?? "Medium",
        tags: JSON.parse(qq.tagsJson),
        type: qq.type,
        prompt: qq.prompt,
        options: JSON.parse(qq.optionsJson),
        correct: JSON.parse(qq.correctJson),
        rationale: qq.rationale ?? "",
      })),
    })),
  };
  const bankPath = path.join(tierDir, "quiz-bank.json");
  await fs.writeFile(bankPath, JSON.stringify(bank, null, 2), "utf8");
  written.push(bankPath);

  return written;
}
