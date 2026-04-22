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
  expiresAtIso,
  questions,
  action,
}: {
  attemptId: string;
  expiresAtIso: string;
  questions: QuestionView[];
  action: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000)),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const rem = Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
      setRemaining(rem);
      if (rem === 0 && !submitting && formRef.current) {
        setSubmitting(true);
        formRef.current.requestSubmit();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAtIso, submitting]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const timerColor =
    remaining < 60
      ? "bg-red-600 text-white"
      : remaining < 300
        ? "bg-amber-500 text-white"
        : "bg-brand-600 text-white";

  return (
    <form ref={formRef} action={action} className="mt-6 space-y-6">
      <div className={`sticky top-0 z-10 rounded px-4 py-2 font-semibold ${timerColor}`}>
        Time remaining: {mm}:{ss}
      </div>

      {questions.map((q, idx) => (
        <fieldset key={q.id} className="bg-white border rounded p-5">
          <legend className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
            Question {idx + 1} of {questions.length}
          </legend>
          <p className="mt-1 text-slate-900 leading-relaxed whitespace-pre-wrap">{q.prompt}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((o) => (
              <label
                key={o.id}
                className="flex gap-3 p-3 border rounded hover:bg-brand-50 cursor-pointer"
              >
                <input
                  type={q.type === "multi" ? "checkbox" : "radio"}
                  name={`q:${q.id}`}
                  value={o.id}
                  className="mt-1"
                />
                <span className="text-sm text-slate-800">{o.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 bg-slate-50 py-3 border-t flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Attempt ID: <code>{attemptId}</code>
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-accent-gold text-white rounded font-semibold hover:opacity-90 disabled:opacity-50"
          onClick={() => setSubmitting(true)}
        >
          {submitting ? "Submitting…" : "Submit attempt"}
        </button>
      </div>
    </form>
  );
}
