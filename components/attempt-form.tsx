"use client";

import { useEffect, useRef, useState } from "react";

type QuestionView = {
  id: string;
  moduleRef: string | null;
  type: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export function AttemptForm({
  attemptId,
  submitUrl,
  expiresAtIso,
  questions,
}: {
  attemptId: string;
  submitUrl: string;
  expiresAtIso: string;
  questions: QuestionView[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const expiresMs = new Date(expiresAtIso).getTime();
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.floor((expiresMs - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  useEffect(() => {
    if (remaining === 0 && !submittedRef.current && formRef.current) {
      submittedRef.current = true;
      setSubmitting(true);
      formRef.current.requestSubmit();
    }
  }, [remaining]);

  const timerColor =
    remaining < 60
      ? "from-rose-500 to-rose-700 text-white animate-pulse"
      : remaining < 5 * 60
      ? "from-amber-500 to-amber-600 text-white"
      : "from-brand-500 to-brand-700 text-white";

  const answeredCount = Object.keys(answered).length;

  return (
    <form ref={formRef} action={submitUrl} method="POST" className="mt-6">
      <div
        className={`sticky top-2 z-30 rounded-xl bg-gradient-to-br ${timerColor} px-5 py-3 shadow-lg flex items-center justify-between gap-4 mb-6`}
      >
        <div className="flex items-center gap-3">
          <Clock />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Time remaining
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {mm}:{ss}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
            Answered
          </div>
          <div className="text-xl font-bold tabular-nums">
            {answeredCount} / {questions.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <fieldset key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <legend className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider px-2">
              Question {idx + 1} of {questions.length}
              {q.moduleRef && (
                <span className="ml-2 text-slate-500 font-normal">· {q.moduleRef}</span>
              )}
            </legend>
            <p className="mt-2 text-slate-900 leading-relaxed">{q.prompt}</p>
            <div className="mt-4 space-y-2">
              {q.options.map((o) => (
                <label
                  key={o.id}
                  className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer transition has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
                >
                  <input
                    type={q.type === "multi" ? "checkbox" : "radio"}
                    name={`q:${q.id}`}
                    value={o.id}
                    className="mt-1 accent-brand-600"
                    onChange={() => setAnswered((s) => ({ ...s, [q.id]: true }))}
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">{o.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="sticky bottom-3 z-30 mt-6 rounded-xl bg-white border border-slate-200 shadow-lg px-5 py-3 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {answeredCount < questions.length ? (
            <span>
              <b className="text-slate-700">{questions.length - answeredCount}</b> question
              {questions.length - answeredCount === 1 ? "" : "s"} unanswered
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold">All questions answered.</span>
          )}
          <span className="ml-3 text-slate-400">Attempt: {attemptId.slice(0, 8)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition"
          onClick={() => setSubmitting(true)}
        >
          {submitting ? "Submitting…" : "Submit attempt"}
        </button>
      </div>
    </form>
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
