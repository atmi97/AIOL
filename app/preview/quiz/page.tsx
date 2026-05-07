"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/* ───────────────────────────── data ───────────────────────────── */

type Q = {
  id: string;
  m: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  rationale: string;
};

const QUIZ: { title: string; description: string; passThreshold: number; timeMinutes: number; questions: Q[] } = {
  title: "Tier 1 Final Assessment — Demo",
  description:
    "Sample of 10 randomized questions from the 60-question Tier 1 bank. 80% pass. 5-minute time limit for this demo (the real exam is 30 minutes for 20 questions).",
  passThreshold: 0.8,
  timeMinutes: 5,
  questions: [
    {
      id: "T1-1.1-Q01",
      m: "1.1",
      prompt: "Which of the following is the best plain-language definition of artificial intelligence as used in this program?",
      options: [
        { id: "a", text: "Software that has been programmed with a complete set of rules covering every scenario it will encounter." },
        { id: "b", text: "Software that learns patterns from data and uses those patterns to make predictions or generate content." },
        { id: "c", text: "Software that has achieved a form of consciousness and can reason about the world." },
        { id: "d", text: "Software that can only process numerical data and cannot work with text or images." },
      ],
      correct: "b",
      rationale: "AI learns patterns from data rather than following hand-coded rules for every scenario. It is not conscious or sentient, and modern AI works with many data types including text and images.",
    },
    {
      id: "T1-1.1-Q06",
      m: "1.1",
      prompt: "Which of the following is most accurately described as machine learning rather than generative AI or rule-based automation?",
      options: [
        { id: "a", text: "An Excel SUM formula totalling a column of values." },
        { id: "b", text: "A Copilot request to draft a plain-language summary of a 40-page policy." },
        { id: "c", text: "Oracle Fusion Recruiting ranking candidates based on learned patterns in resume text and historical hiring data." },
        { id: "d", text: "A scheduled Power BI dashboard refresh every morning at 6:00 a.m." },
      ],
      correct: "c",
      rationale: "Ranking candidates by learned patterns in historical data is machine learning. SUM and scheduled refresh are not AI. Copilot summarization is generative AI.",
    },
    {
      id: "T1-1.2-Q01",
      m: "1.2",
      prompt: "Where is the authoritative list of AI tools approved for use at AMS maintained?",
      options: [
        { id: "a", text: "On individual team SharePoint sites, updated by each team lead." },
        { id: "b", text: "In the AMS Approved AI Tool Register, maintained by the AI Steering Committee." },
        { id: "c", text: "In vendor product documentation." },
        { id: "d", text: "In the AUP itself, as a fixed appendix." },
      ],
      correct: "b",
      rationale: "The Approved AI Tool Register is the single source of truth, maintained by the AI Steering Committee. Team sites, vendor docs, and the AUP itself are not authoritative.",
    },
    {
      id: "T1-1.3-Q01",
      m: "1.3",
      prompt: "What is an AI \"hallucination\"?",
      options: [
        { id: "a", text: "A rare technical fault that only occurs when the server is overloaded." },
        { id: "b", text: "AI-generated content that is presented confidently, sounds plausible, and is factually wrong." },
        { id: "c", text: "A deliberately malicious output by an AI designed to mislead." },
        { id: "d", text: "Any AI output that contains spelling errors." },
      ],
      correct: "b",
      rationale: "Hallucinations are plausible-sounding, confident outputs that are factually wrong. They are not malicious or tied to spelling or server load — they are a property of how generative models produce fluent text.",
    },
    {
      id: "T1-1.3-Q09",
      m: "1.3",
      prompt: "A Copilot response includes a citation to a Board Resolution that your team cannot locate in the minutes. What is the most appropriate next step?",
      options: [
        { id: "a", text: "Trust the citation and include it in the document; Copilot is reliable." },
        { id: "b", text: "Treat the citation as a likely hallucination and verify against the authoritative minute record before using it." },
        { id: "c", text: "Rephrase the citation to something more generic and include it without verification." },
        { id: "d", text: "Ask Copilot if it is sure, and trust its answer." },
      ],
      correct: "b",
      rationale: "Unverifiable citations are a classic hallucination pattern. Verify against the authoritative source. Asking the same model is not verification — it will often confirm itself confidently either way.",
    },
    {
      id: "T1-1.4-Q02",
      m: "1.4",
      prompt: "Which of the following is the correct pairing of legislation with its primary subject?",
      options: [
        { id: "a", text: "FOIP — personal health information in hospitals." },
        { id: "b", text: "LA FOIP — federal data residency across Canadian provinces." },
        { id: "c", text: "HIPA — personal health information held by trustees in Saskatchewan." },
        { id: "d", text: "PIPEDA — Saskatchewan local authorities only." },
      ],
      correct: "c",
      rationale: "HIPA is specifically for personal health information held by trustees in Saskatchewan. FOIP and LA FOIP are broader privacy laws for provincial and local authorities respectively; PIPEDA is federal commercial activity.",
    },
    {
      id: "T1-1.4-Q07",
      m: "1.4",
      prompt: "Microsoft 365 Copilot is approved for 3sHealth staff use within the 3sHealth M365 tenant. You sign in to Copilot from a personal Microsoft account on the same laptop to summarize an internal document. Is this acceptable?",
      options: [
        { id: "a", text: "Yes — Copilot is approved, so any sign-in context is fine." },
        { id: "b", text: "No — the tenant boundary is what makes tenanted Copilot approved. A personal-account Copilot is a different context and is unapproved." },
        { id: "c", text: "Yes, if the document is short." },
        { id: "d", text: "Yes, if you delete the personal-account history afterwards." },
      ],
      correct: "b",
      rationale: "The approval attaches to the tenanted Copilot experience, signed in with a 3sHealth account. Personal-account Copilot is outside the tenant and is unapproved. Neither document length nor retroactive cleanup changes this.",
    },
    {
      id: "T1-1.5-Q01",
      m: "1.5",
      prompt: "The human-bookend model says that every AI-assisted task follows what structure?",
      options: [
        { id: "a", text: "AI start, human middle, AI end." },
        { id: "b", text: "Human start, AI middle, human end." },
        { id: "c", text: "AI start, AI middle, AI end." },
        { id: "d", text: "Human at every step; AI is only consulted." },
      ],
      correct: "b",
      rationale: "A person defines the task and prompts (start), the AI executes (middle), and a person verifies and takes accountability for the output (end). This applies to every AI-assisted task regardless of length or complexity.",
    },
    {
      id: "T1-1.5-Q05",
      m: "1.5",
      prompt: "When filing an AI incident in ServiceNow, what should you NOT include in the ticket?",
      options: [
        { id: "a", text: "A description of what happened in plain language." },
        { id: "b", text: "The classification of the data involved." },
        { id: "c", text: "The actual PHI or credentials that were part of the incident." },
        { id: "d", text: "The name of the AI tool used." },
      ],
      correct: "c",
      rationale: "Never paste PHI or credentials into the ticket itself; ticket systems are not a safe place for sensitive data. Reference the data by classification and location instead. The other elements are appropriate.",
    },
    {
      id: "T1-1.5-Q11",
      m: "1.5",
      prompt: "Which of the following is the best resource for clarifying whether a specific AI use is permitted for a given data type?",
      options: [
        { id: "a", text: "A web search for recent AI news." },
        { id: "b", text: "An online forum of other AMS staff." },
        { id: "c", text: "Your manager or the Privacy Officer, supported by the AMS AI FAQ and the approved tool register." },
        { id: "d", text: "The vendor's customer support." },
      ],
      correct: "c",
      rationale: "The program's designated help channels are your manager, the Privacy Officer, the FAQ, and the register. Web search, external forums, and vendor support are not authoritative sources for 3sHealth policy interpretation.",
    },
  ],
};

/* ──────────────────────────── helpers ────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Stage = "intro" | "attempt" | "result";

/* ───────────────────────────── page ──────────────────────────────── */

export default function QuizPreviewPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<Q[]>(QUIZ.questions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  function startAttempt() {
    setQuestions(
      shuffle(QUIZ.questions).map((q) => ({ ...q, options: shuffle(q.options) }))
    );
    setAnswers({});
    setSubmittedAt(null);
    setStartedAt(Date.now());
    setStage("attempt");
  }

  function submitAttempt() {
    setSubmittedAt(Date.now());
    setStage("result");
  }

  function reset() {
    setStage("intro");
    setQuestions(QUIZ.questions);
    setAnswers({});
    setSubmittedAt(null);
    setStartedAt(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 text-xs font-medium text-brand-700 uppercase tracking-wider">
          <Link href="/preview" className="hover:underline">
            Preview Gallery
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Final Assessment</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {stage === "intro" && <IntroView onStart={startAttempt} />}
        {stage === "attempt" && startedAt && (
          <AttemptView
            startedAt={startedAt}
            timeMinutes={QUIZ.timeMinutes}
            questions={questions}
            answers={answers}
            onAnswer={(qid, oid) => setAnswers((s) => ({ ...s, [qid]: oid }))}
            onSubmit={submitAttempt}
          />
        )}
        {stage === "result" && submittedAt && startedAt && (
          <ResultView
            questions={questions}
            answers={answers}
            startedAt={startedAt}
            submittedAt={submittedAt}
            onReset={reset}
            onRetry={startAttempt}
          />
        )}
      </main>
    </div>
  );
}

/* ───────────────────────────── intro ─────────────────────────────── */

function IntroView({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">{QUIZ.title}</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">{QUIZ.description}</p>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Questions" value={`${QUIZ.questions.length}`} sub="this demo" />
        <Stat label="Pass threshold" value={`${Math.round(QUIZ.passThreshold * 100)}%`} sub={`${Math.ceil(QUIZ.questions.length * QUIZ.passThreshold)} of ${QUIZ.questions.length}`} />
        <Stat label="Time limit" value={`${QUIZ.timeMinutes} min`} sub="auto-submit on expiry" />
      </section>

      <section className="mt-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 p-5 text-sm text-amber-900 leading-relaxed">
        <div className="flex items-start gap-3">
          <div className="text-lg opacity-60">⚠</div>
          <div>
            <div className="font-semibold mb-1">Before you begin</div>
            Questions are randomized from the bank, options shuffled per attempt. The timer
            runs continuously once you start — finish in one sitting. The form auto-submits
            when the timer hits zero.
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          What this covers
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { n: "1.1", t: "What Is AI?", count: 2 },
            { n: "1.2", t: "AI at AMS", count: 1 },
            { n: "1.3", t: "Risks", count: 2 },
            { n: "1.4", t: "Privacy", count: 2 },
            { n: "1.5", t: "Reporting", count: 3 },
          ].map((m) => (
            <div key={m.n} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[11px] font-semibold text-brand-600">Module {m.n}</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">{m.t}</div>
              <div className="text-[11px] text-slate-500 mt-1">{m.count} {m.count === 1 ? "question" : "questions"}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <button
          onClick={onStart}
          className="px-7 py-3.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 transition"
        >
          Start attempt →
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-brand-700 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

/* ──────────────────────────── attempt ────────────────────────────── */

function AttemptView({
  startedAt,
  timeMinutes,
  questions,
  answers,
  onAnswer,
  onSubmit,
}: {
  startedAt: number;
  timeMinutes: number;
  questions: Q[];
  answers: Record<string, string>;
  onAnswer: (qid: string, oid: string) => void;
  onSubmit: () => void;
}) {
  const expiresAt = useMemo(() => startedAt + timeMinutes * 60 * 1000, [startedAt, timeMinutes]);
  const [now, setNow] = useState(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) {
      submittedRef.current = true;
      onSubmit();
    }
  }, [remaining, onSubmit]);

  const timerColor =
    remaining < 60
      ? "from-rose-500 to-rose-700 text-white animate-pulse"
      : remaining < 5 * 60
      ? "from-amber-500 to-amber-600 text-white"
      : "from-brand-500 to-brand-700 text-white";

  const answered = Object.keys(answers).length;

  return (
    <div>
      <div className={`sticky top-2 z-30 rounded-xl bg-gradient-to-br ${timerColor} px-5 py-3 shadow-lg flex items-center justify-between gap-4 mb-6`}>
        <div className="flex items-center gap-3">
          <Clock />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Time remaining
            </div>
            <div className="text-2xl font-bold tabular-nums">{mm}:{ss}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
            Answered
          </div>
          <div className="text-xl font-bold tabular-nums">
            {answered} / {questions.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const chosen = answers[q.id];
          return (
            <fieldset key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <legend className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider px-2">
                Question {idx + 1} of {questions.length}
                <span className="ml-2 text-slate-500 font-normal">· Module {q.m}</span>
              </legend>
              <p className="mt-2 text-slate-900 leading-relaxed">{q.prompt}</p>
              <div className="mt-4 space-y-2">
                {q.options.map((o) => {
                  const picked = chosen === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        picked
                          ? "border-brand-400 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o.id}
                        checked={picked}
                        onChange={() => onAnswer(q.id, o.id)}
                        className="mt-1 accent-brand-600"
                      />
                      <span className="text-sm text-slate-800 leading-relaxed">{o.text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="sticky bottom-3 z-30 mt-6 rounded-xl bg-white border border-slate-200 shadow-lg px-5 py-3 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {answered < questions.length && (
            <span>
              <b className="text-slate-700">{questions.length - answered}</b> question{questions.length - answered === 1 ? "" : "s"} unanswered
            </span>
          )}
          {answered === questions.length && (
            <span className="text-emerald-700 font-semibold">All questions answered.</span>
          )}
        </div>
        <button
          onClick={onSubmit}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-md hover:shadow-lg transition"
        >
          Submit attempt
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────── result ──────────────────────────────── */

function ResultView({
  questions,
  answers,
  startedAt,
  submittedAt,
  onReset,
  onRetry,
}: {
  questions: Q[];
  answers: Record<string, string>;
  startedAt: number;
  submittedAt: number;
  onReset: () => void;
  onRetry: () => void;
}) {
  const correctCount = questions.reduce((n, q) => n + (answers[q.id] === q.correct ? 1 : 0), 0);
  const score = correctCount / questions.length;
  const passed = score >= QUIZ.passThreshold;
  const elapsedSec = Math.round((submittedAt - startedAt) / 1000);
  const elapsedMm = Math.floor(elapsedSec / 60);
  const elapsedSs = String(elapsedSec % 60).padStart(2, "0");

  return (
    <div>
      <div
        className={`rounded-2xl border p-6 ${
          passed
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/40 border-emerald-200"
            : "bg-gradient-to-br from-rose-50 to-rose-100/40 border-rose-200"
        }`}
      >
        <div
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            passed ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          Attempt complete
        </div>
        <div className="mt-2 flex items-end gap-4 flex-wrap">
          <div>
            <div
              className={`text-5xl font-bold tabular-nums ${
                passed ? "text-emerald-800" : "text-rose-800"
              }`}
            >
              {Math.round(score * 100)}%
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {correctCount} of {questions.length} correct
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              passed
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {passed ? "Passed" : "Did not pass"}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <ResultStat label="Pass threshold" value={`${Math.round(QUIZ.passThreshold * 100)}%`} />
          <ResultStat label="Required correct" value={`${Math.ceil(questions.length * QUIZ.passThreshold)}`} />
          <ResultStat label="Time taken" value={`${elapsedMm}:${elapsedSs}`} />
          <ResultStat label="Unanswered" value={`${questions.length - Object.keys(answers).length}`} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Question review</h2>
        <p className="mt-1 text-sm text-slate-600">
          Click any question to expand the rationale.
        </p>

        <div className="mt-4 space-y-3">
          {questions.map((q, idx) => {
            const chosenId = answers[q.id];
            const right = chosenId === q.correct;
            const correctOpt = q.options.find((o) => o.id === q.correct);
            const chosenOpt = q.options.find((o) => o.id === chosenId);
            return (
              <details
                key={q.id}
                className="group rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <summary className="px-5 py-4 cursor-pointer list-none flex items-start gap-3 hover:bg-slate-50 transition">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                      !chosenId
                        ? "bg-slate-100 text-slate-500"
                        : right
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {!chosenId ? "—" : right ? "✓" : "✗"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                      Question {idx + 1} · Module {q.m}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-800">{q.prompt}</div>
                  </div>
                  <span className="text-brand-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 pt-0 space-y-3 text-sm">
                  {chosenOpt && (
                    <div
                      className={`rounded-lg p-3 border ${
                        right
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                        Your answer
                      </div>
                      {chosenOpt.text}
                    </div>
                  )}
                  {!chosenId && (
                    <div className="rounded-lg p-3 border bg-slate-50 border-slate-200 text-slate-700">
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                        You did not answer this question
                      </div>
                    </div>
                  )}
                  {!right && correctOpt && (
                    <div className="rounded-lg p-3 border bg-emerald-50 border-emerald-200 text-emerald-900">
                      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                        Correct answer
                      </div>
                      {correctOpt.text}
                    </div>
                  )}
                  <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 text-slate-700">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Rationale
                    </div>
                    {q.rationale}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <Link href="/preview" className="text-sm text-slate-500 hover:text-brand-700">
          ← Preview gallery
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 transition"
          >
            Back to intro
          </button>
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            Retake quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 border border-white px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-base font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

function Clock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
