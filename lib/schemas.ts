import { z } from "zod";

// ---------- Module frontmatter (per module-XX/index.mdx) ----------
export const ModuleFrontmatter = z.object({
  id: z.string().min(1),
  moduleNumber: z.string().min(1),
  title: z.string().min(1),
  tierId: z.string().min(1),
  order: z.number().int().positive(),
  estMinutes: z.number().int().nonnegative(),
  objectives: z.array(z.string()).default([]),
  requires: z.array(z.string()).default([]),
});
export type ModuleFrontmatter = z.infer<typeof ModuleFrontmatter>;

// ---------- Tier meta (tier1/meta.json) ----------
export const TierMeta = z.object({
  id: z.string(),
  title: z.string(),
  tagline: z.string().optional(),
  audience: z.string().optional(),
  estMinutes: z.number().int().nonnegative().default(0),
  passThreshold: z.number().min(0).max(1).default(0.8),
  renewal: z.string().optional(),
  philosophy: z.string().optional(),
  modules: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      estMinutes: z.number().int().nonnegative(),
      order: z.number().int().positive(),
    }),
  ),
  appendix: z.string().optional().default(""),
});
export type TierMeta = z.infer<typeof TierMeta>;

// ---------- Quiz bank (tier1/quiz-bank.json) ----------
export const QuestionOption = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});
export const Question = z.object({
  id: z.string().min(1),
  module: z.string().min(1),
  moduleRef: z.string().min(1),
  lo: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  tags: z.array(z.string()).default([]),
  type: z.enum(["single", "multi", "trueFalse"]).default("single"),
  prompt: z.string().min(1),
  options: z.array(QuestionOption).min(2),
  correct: z.array(z.string()).min(1),
  rationale: z.string().optional().default(""),
});
export type Question = z.infer<typeof Question>;

export const Quiz = z.object({
  id: z.string().min(1),
  tierId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  passThreshold: z.number().min(0).max(1).default(0.8),
  maxAttempts: z.number().int().positive().default(3),
  timeLimitMinutes: z.number().int().positive().default(30),
  questionsPerAttempt: z.number().int().positive().default(20),
  shuffle: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  moduleDistribution: z.record(z.string(), z.number().int().nonnegative()).default({}),
  questions: z.array(Question).min(1),
});
export type Quiz = z.infer<typeof Quiz>;

export const QuizBank = z.object({
  quizzes: z.array(Quiz).min(1),
});
export type QuizBank = z.infer<typeof QuizBank>;

// ---------- Attempt response ----------
export const AttemptResponse = z.object({
  questionId: z.string(),
  answer: z.array(z.string()),
  correct: z.boolean(),
});
export type AttemptResponse = z.infer<typeof AttemptResponse>;
