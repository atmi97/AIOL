import { prisma } from "./prisma";
import { AttemptResponse } from "./schemas";

// Deterministic Fisher-Yates shuffle.
export function shuffle<T>(input: T[], seed?: number): T[] {
  const arr = [...input];
  let rand: () => number;
  if (seed !== undefined) {
    let s = seed;
    rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
  } else {
    rand = Math.random;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Select N questions using per-module distribution.
// `dist` is { "1.1": 4, "1.2": 3, ... }. Picks N = sum(dist) questions
// by randomly sampling the configured count from each module's pool.
export function selectQuestionsForAttempt(params: {
  allQuestions: { id: string; moduleRef: string | null }[];
  distribution: Record<string, number>;
  total: number;
}): string[] {
  const { allQuestions, distribution, total } = params;
  const picked: string[] = [];
  for (const [moduleNumber, count] of Object.entries(distribution)) {
    const pool = allQuestions.filter((q) => q.moduleRef === `module-${moduleNumber}`);
    const shuffled = shuffle(pool);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      picked.push(shuffled[i].id);
    }
  }
  // If distribution under-delivers (e.g. module not found), top up randomly.
  if (picked.length < total) {
    const remaining = allQuestions.filter((q) => !picked.includes(q.id));
    const topup = shuffle(remaining).slice(0, total - picked.length);
    picked.push(...topup.map((q) => q.id));
  }
  return shuffle(picked).slice(0, total);
}

export async function startAttempt(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) throw new Error("Quiz not found");

  const existing = await prisma.quizAttempt.count({
    where: { userId, quizId },
  });
  if (existing >= quiz.maxAttempts) {
    throw new Error(`Maximum ${quiz.maxAttempts} attempts reached`);
  }

  const dist = JSON.parse(quiz.moduleDistribution) as Record<string, number>;
  const questionIds = quiz.shuffle
    ? selectQuestionsForAttempt({
        allQuestions: quiz.questions,
        distribution: dist,
        total: quiz.questionsPerAttempt,
      })
    : quiz.questions.slice(0, quiz.questionsPerAttempt).map((q) => q.id);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + quiz.timeLimitMinutes * 60 * 1000);

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      startedAt: now,
      expiresAt,
      questionIds: JSON.stringify(questionIds),
    },
  });
  return { attempt, questionIds };
}

export function isCorrect(type: string, correct: string[], answer: string[]): boolean {
  if (type === "single" || type === "trueFalse") {
    return answer.length === 1 && answer[0] === correct[0];
  }
  if (answer.length !== correct.length) return false;
  const a = [...answer].sort();
  const c = [...correct].sort();
  return a.every((x, i) => x === c[i]);
}

export async function submitAttempt(params: {
  userId: string;
  attemptId: string;
  answers: Record<string, string[]>; // questionId -> chosen option ids
}) {
  const { userId, attemptId, answers } = params;
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });
  if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found");
  if (attempt.completedAt) throw new Error("Attempt already submitted");

  const questionIds = JSON.parse(attempt.questionIds) as string[];
  const questions = attempt.quiz.questions.filter((q) => questionIds.includes(q.id));

  const responses: AttemptResponse[] = questions.map((q) => {
    const correct = JSON.parse(q.correctJson) as string[];
    const chosen = answers[q.id] ?? [];
    return {
      questionId: q.id,
      answer: chosen,
      correct: isCorrect(q.type, correct, chosen),
    };
  });

  const correctCount = responses.filter((r) => r.correct).length;
  const score = correctCount / questions.length;
  const passed = score >= attempt.quiz.passThreshold;

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      completedAt: new Date(),
      responsesJson: JSON.stringify(responses),
      score,
      passed,
    },
  });

  await prisma.xApiStatement.create({
    data: {
      userId,
      verb: passed ? "passed" : "failed",
      objectType: "quiz",
      objectId: attempt.quizId,
      resultJson: JSON.stringify({ score, correctCount, total: questions.length }),
    },
  });

  return { attempt: updated, responses, score, passed, correctCount, total: questions.length };
}

export async function attemptsRemaining(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return 0;
  const used = await prisma.quizAttempt.count({ where: { userId, quizId } });
  return Math.max(0, quiz.maxAttempts - used);
}

export async function bestScore(userId: string, quizId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, quizId, completedAt: { not: null } },
    orderBy: { score: "desc" },
    take: 1,
  });
  return attempts[0]?.score ?? null;
}
