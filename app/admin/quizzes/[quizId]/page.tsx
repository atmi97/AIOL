import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

async function saveQuizSettings(quizId: string, formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const before = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!before) throw new Error("Quiz not found");
  const passThreshold = Math.max(0, Math.min(1, Number(formData.get("passThreshold") ?? 0.8) / 100));
  const maxAttempts = Math.max(1, Number(formData.get("maxAttempts") ?? 3));
  const timeLimitMinutes = Math.max(1, Number(formData.get("timeLimitMinutes") ?? 30));
  const questionsPerAttempt = Math.max(1, Number(formData.get("questionsPerAttempt") ?? 20));
  const shuffle = formData.get("shuffle") === "on";
  const distRaw = String(formData.get("moduleDistribution") ?? "{}");
  let distribution: Record<string, number>;
  try {
    distribution = JSON.parse(distRaw);
  } catch {
    distribution = {};
  }

  const updated = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      passThreshold,
      maxAttempts,
      timeLimitMinutes,
      questionsPerAttempt,
      shuffle,
      moduleDistribution: JSON.stringify(distribution),
      version: { increment: 1 },
    },
  });
  await prisma.contentEdit.create({
    data: {
      entityType: "quiz",
      entityId: quizId,
      editedById: admin.id,
      diffJson: JSON.stringify({ before, after: updated }),
    },
  });
  redirect(`/admin/quizzes/${encodeURIComponent(quizId)}?saved=1`);
}

async function saveQuestion(questionId: string, formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const before = await prisma.question.findUnique({ where: { id: questionId } });
  if (!before) throw new Error("Question not found");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const type = String(formData.get("type") ?? "single");
  const rationale = String(formData.get("rationale") ?? "").trim();
  const optionsRaw = String(formData.get("options") ?? "").trim();
  const correctLetters = String(formData.get("correct") ?? "").trim().toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

  const options: { id: string; text: string }[] = [];
  for (const raw of optionsRaw.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const match = raw.match(/^([a-d])[).:\-\s]+(.+)$/i);
    if (match) {
      options.push({ id: match[1].toLowerCase(), text: match[2].trim() });
    } else {
      options.push({ id: String.fromCharCode(97 + options.length), text: raw });
    }
  }

  await prisma.question.update({
    where: { id: questionId },
    data: {
      prompt,
      type,
      optionsJson: JSON.stringify(options),
      correctJson: JSON.stringify(correctLetters),
      rationale,
    },
  });
  await prisma.contentEdit.create({
    data: {
      entityType: "question",
      entityId: questionId,
      editedById: admin.id,
      diffJson: JSON.stringify({ before, after: { prompt, type, options, correct: correctLetters, rationale } }),
    },
  });
}

async function deleteQuestion(questionId: string) {
  "use server";
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
}

export default async function EditQuiz({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { quizId } = await params;
  const sp = await searchParams;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } }, tier: true },
  });
  if (!quiz) return <div>Quiz not found.</div>;
  const distribution = JSON.parse(quiz.moduleDistribution);

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">
        {quiz.tier.title} — {quiz.title}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        v{quiz.version} · {quiz.questions.length} questions
      </p>
      {sp.saved && (
        <p className="mt-3 bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-2 rounded text-sm">
          Saved.
        </p>
      )}

      <section className="mt-6 bg-white border rounded p-5">
        <h2 className="text-lg font-semibold text-brand-700">Settings</h2>
        <form
          action={async (fd: FormData) => {
            "use server";
            await saveQuizSettings(quizId, fd);
          }}
          className="mt-3 grid sm:grid-cols-2 gap-3 text-sm"
        >
          <label className="block">
            Pass threshold (%)
            <input
              name="passThreshold"
              type="number"
              min={1}
              max={100}
              defaultValue={Math.round(quiz.passThreshold * 100)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            Max attempts
            <input
              name="maxAttempts"
              type="number"
              min={1}
              defaultValue={quiz.maxAttempts}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            Time limit (minutes)
            <input
              name="timeLimitMinutes"
              type="number"
              min={1}
              defaultValue={quiz.timeLimitMinutes}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            Questions per attempt
            <input
              name="questionsPerAttempt"
              type="number"
              min={1}
              defaultValue={quiz.questionsPerAttempt}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" name="shuffle" defaultChecked={quiz.shuffle} />
            Shuffle questions per attempt
          </label>
          <label className="block sm:col-span-2">
            Module distribution (JSON — e.g. {'{"1.1":4,"1.2":3,...}'}; sums to questions per attempt)
            <textarea
              name="moduleDistribution"
              rows={3}
              defaultValue={JSON.stringify(distribution, null, 0)}
              className="mt-1 w-full border rounded px-3 py-2 font-mono"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
            >
              Save settings
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-700">
          Questions ({quiz.questions.length})
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Options format: one per line as <code>a) text</code> / <code>b) text</code>. Correct uses
          option letters, comma-separated (e.g. <code>b</code> or <code>a,c</code>).
        </p>
        <div className="mt-4 space-y-3">
          {quiz.questions.map((q) => {
            const options = JSON.parse(q.optionsJson) as { id: string; text: string }[];
            const correct = JSON.parse(q.correctJson) as string[];
            return (
              <details key={q.id} className="bg-white border rounded p-4">
                <summary className="cursor-pointer text-sm">
                  <span className="font-mono text-xs text-slate-500 mr-2">{q.id}</span>
                  <span className="text-xs text-slate-500 mr-2">[{q.moduleRef}]</span>
                  {q.prompt.slice(0, 120)}
                  {q.prompt.length > 120 && "…"}
                </summary>
                <form
                  action={async (fd: FormData) => {
                    "use server";
                    await saveQuestion(q.id, fd);
                  }}
                  className="mt-3 space-y-3 text-sm"
                >
                  <label className="block">
                    Prompt
                    <textarea
                      name="prompt"
                      rows={3}
                      defaultValue={q.prompt}
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </label>
                  <label className="block">
                    Type
                    <select
                      name="type"
                      defaultValue={q.type}
                      className="mt-1 w-full border rounded px-3 py-2"
                    >
                      <option value="single">Single choice</option>
                      <option value="multi">Multiple select</option>
                      <option value="trueFalse">True / False</option>
                    </select>
                  </label>
                  <label className="block">
                    Options
                    <textarea
                      name="options"
                      rows={4}
                      defaultValue={options.map((o) => `${o.id}) ${o.text}`).join("\n")}
                      className="mt-1 w-full border rounded px-3 py-2 font-mono"
                    />
                  </label>
                  <label className="block">
                    Correct option letter(s)
                    <input
                      name="correct"
                      defaultValue={correct.join(",")}
                      className="mt-1 w-full border rounded px-3 py-2 font-mono"
                    />
                  </label>
                  <label className="block">
                    Rationale
                    <textarea
                      name="rationale"
                      rows={2}
                      defaultValue={q.rationale ?? ""}
                      className="mt-1 w-full border rounded px-3 py-2"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                    >
                      Save question
                    </button>
                  </div>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deleteQuestion(q.id);
                  }}
                  className="mt-2"
                >
                  <button
                    type="submit"
                    className="text-xs text-red-700 hover:underline"
                  >
                    Delete question
                  </button>
                </form>
              </details>
            );
          })}
        </div>
      </section>

      <div className="mt-10">
        <Link href="/admin/quizzes" className="text-sm text-brand-700 hover:underline">
          ← Back to quizzes
        </Link>
      </div>
    </>
  );
}
