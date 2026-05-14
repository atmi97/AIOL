"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function MarkCompleteButton({
  moduleId,
  isComplete,
}: {
  moduleId: string;
  isComplete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const working = busy || pending;

  async function onClick() {
    setBusy(true);
    try {
      await fetch(`/api/module/${moduleId}/complete`, { method: "POST" });
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="text-sm text-slate-600">
        {isComplete ? (
          <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed — next module unlocked
          </span>
        ) : (
          "Finished this module? Mark it complete to unlock the next one."
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={working}
        className={`px-5 py-2.5 rounded-lg font-semibold transition disabled:opacity-60 ${
          isComplete
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md hover:shadow-lg"
        }`}
      >
        {working ? "Saving…" : isComplete ? "✓ Completed" : "Mark complete ✓"}
      </button>
    </div>
  );
}
