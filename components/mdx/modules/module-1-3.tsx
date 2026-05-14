"use client";

import { Section, KeyMessage, Tag, Accordion, FlipCards, SummaryCards } from "../index";
import { useState } from "react";

export { META_13 } from "./meta";

type Span = { text: string; wrong?: boolean; why?: string };

const SCENARIO_A: Span[] = [
  { text: "Q2 2026 delivered a revenue lift of " },
  { text: "240 basis points over budget", wrong: true, why: "The original figure is percent, not basis points — the AI mislabeled the unit." },
  { text: ", driven by stronger performance in the " },
  { text: "Linen & Diagnostic Imaging budget line", wrong: true, why: "There is no such budget line in the Fusion chart of accounts — fabricated structure." },
  { text: ". Per " },
  { text: "Board Resolution 2025-14", wrong: true, why: "No such resolution exists. Citations that cannot be verified are the classic hallucination pattern." },
  { text: ", the service line continues to track ahead of the " },
  { text: "5-year benchmark established in 2019", wrong: true, why: "Plausible but fabricated — there is no recorded 2019 benchmark for this service line." },
  { text: "." },
];

function SpotTheError() {
  const [found, setFound] = useState<Record<number, boolean>>({});
  const total = SCENARIO_A.filter((s) => s.wrong).length;
  const count = Object.keys(found).length;

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm">
          <span className="font-semibold">Scenario A</span> — AI-drafted financial summary. Click the parts that look suspicious.
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: `${(count / total) * 100}%` }} />
          </div>
          <div className="text-sm font-semibold tabular-nums">{count}/{total} found</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 leading-relaxed text-slate-800">
        {SCENARIO_A.map((s, i) => {
          if (!s.wrong) return <span key={i}>{s.text}</span>;
          const isFound = found[i];
          return (
            <button
              key={i}
              onClick={() => setFound((f) => ({ ...f, [i]: true }))}
              className={`inline px-1 rounded transition ${
                isFound
                  ? "bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500"
                  : "bg-rose-50 text-rose-900 hover:bg-rose-100 cursor-pointer border-b-2 border-dashed border-rose-400"
              }`}
            >
              {s.text}
            </button>
          );
        })}
      </div>

      {count > 0 && (
        <div className="space-y-2">
          {SCENARIO_A.map((s, i) =>
            found[i] && s.why ? (
              <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900">
                <b>"{s.text.trim()}"</b> — {s.why}
              </div>
            ) : null,
          )}
        </div>
      )}

      {count === total && (
        <div className="rounded-xl border border-brand-300 bg-gradient-to-br from-brand-50 to-brand-100/40 p-4 text-center text-sm font-semibold text-brand-900">
          ✓ You found all {total} fabrications. In real work, imagine the polish of this paragraph hiding these errors from a client-facing report.
        </div>
      )}
    </div>
  );
}

export function Content13() {
  return (
    <>
      <Section id="hallucinations" n="1.3.1" title="Hallucinations">
        <p>
          A hallucination is AI-generated content that is presented confidently, sounds plausible, and is factually wrong. It is the single most important failure mode to understand — it is the one most likely to land a stakeholder-facing error in a document that looks professional.
        </p>
        <div className="mt-4 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Why they happen</div>
          <div className="mt-2 text-sm text-slate-700 leading-relaxed">
            Generative AI is trained to produce <b>fluent, plausible</b> text. When the model is uncertain, it does not stop — it fills the gap with content that fits the pattern of a correct answer <i>without being</i> a correct answer. From the outside, you cannot tell the difference.
          </div>
          <div className="mt-3 inline-flex px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs font-medium">
            AI has no separate mechanism for "I don't know."
          </div>
        </div>
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">What hallucinations look like in AMS</div>
          <Accordion
            defaultOpen={null}
            items={[
              { title: "Copilot-generated financial summary", subtitle: "Invented quarter or fabricated figure", body: "References a quarter that does not exist, or cites a figure that's plausible in magnitude but fabricated." },
              { title: "Drafted vendor correspondence", subtitle: "Contract clause that isn't there", body: "Refers to a contract clause that is not in the actual contract. Reads professionally; materially wrong." },
              { title: "ServiceNow knowledge response", subtitle: "Deprecated procedure", body: "Confidently describes a reset procedure that was deprecated two years ago." },
              { title: "Procurement recommendation", subtitle: "Fabricated scoring framework", body: "Cites a supplier scoring framework the organization has never used." },
              { title: "Policy citation", subtitle: "Non-existent section", body: '"Per Section 7.4 of the 3sHealth Payroll Handbook" — when Section 7.4 does not exist.' },
              { title: "Oracle Fusion report narrative", subtitle: "Phantom employee or decommissioned unit", body: "Invents an employee ID, or references an organizational unit that was decommissioned." },
            ]}
          />
        </div>
        <KeyMessage title="Three questions to ask about any factual claim in an AI output">
          <ol className="list-decimal pl-4 space-y-1 mt-1">
            <li>Where did this come from? Does the AI cite a source I can actually check?</li>
            <li>Does it match what I can verify in the authoritative system — Oracle, ServiceNow, the policy library?</li>
            <li>If I disagree with one small detail, does the whole output still hold up, or was the AI just pattern-matching?</li>
          </ol>
          <div className="mt-2">If you cannot answer these, do not use the output.</div>
        </KeyMessage>
      </Section>

      <Section id="bias" n="1.3.2" title="Bias">
        <p>
          Bias is a different failure mode. Where hallucination is about made-up specifics, bias is about <b>systematic skew</b> in outputs that reflects skew in the training data. Bias is often subtle — the output looks correct, but it consistently favours or disfavours certain groups, options, or framings.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">How bias gets in</div>
          <div className="mt-2 text-sm text-slate-700 leading-relaxed">
            AI learns from historical data. If the data reflects historical inequity, the model reflects it too. A résumé screening tool trained on 10 years of past hiring reproduces patterns in those decisions — including ones the organization is <i>actively trying to move away from</i>.
          </div>
        </div>
        <div className="mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Where bias shows up in admin AI</div>
          <Accordion
            defaultOpen={null}
            items={[
              { title: "Recruitment & screening", body: "Gender, age, or name-based patterns in how candidates are ranked or summarized. Language models trained on English web text also carry implicit cultural biases." },
              { title: "Performance review drafting", body: "AI-drafted review text can use systematically different language for different demographics — stronger achievement language for some groups, more hedging for others." },
              { title: "Pay equity analysis", body: 'An "executive overview" summary can obscure structural disparities by omitting demographic break-outs unless specifically prompted.' },
              { title: "Procurement / vendor selection", body: "Vendor scoring models trained on historical contracts reinforce incumbency — can disadvantage Indigenous-owned suppliers that 3sHealth has commitments to engage." },
              { title: "Service desk routing", body: "If past routing reflects systematic mishandling — e.g., tickets from French-speaking users getting de-prioritized — an AI router trained on that data automates the bias." },
              { title: "Documentation language", body: "Generative AI defaults to American English, corporate tone. 3sHealth content frequently needs Canadian English and an accessibility-forward tone." },
            ]}
          />
        </div>
      </Section>

      <Section id="errors" n="1.3.3" title="Errors in admin context">
        <p>
          Beyond hallucination and bias, there are ordinary failure modes. They matter in administrative platforms because the outputs are almost always someone's money, employment, or vendor relationship. Tap each card to see how it shows up.
        </p>
        <FlipCards
          items={[
            { title: "Calculation errors", front: "Generative AI is notoriously inconsistent at arithmetic.", back: "It can correctly restate a policy but incorrectly add a column. 'The AI did the math' is never sufficient audit explanation on payroll or invoices. If numbers matter, verify them." },
            { title: "Formatting errors", front: "Invents authoritative-looking structure that doesn't match the source.", back: "A tidy three-bullet recap of a 40-page policy can hide material nuance. Accurate in what it includes — misleading in what it leaves out." },
            { title: "Staleness", front: "Models have a training cutoff. Past that date they know nothing.", back: "Ask about a 2026 HIPA amendment when the model stops in 2024: it either admits uncertainty (good) or produces plausible content anyway (not good). Tenant-connected Copilot has the same issue during synthesis." },
            { title: "Context window limits", front: "AI has finite input it can consider at once.", back: "Feed a 200-page doc into a 40-page tool and the model may quietly drop content from the middle. The output will still look complete." },
            { title: "Prompt sensitivity", front: "Same question, different phrasing → different answer.", back: "'Summarize this invoice' and 'List the key points of this invoice' may emphasize different fields. Not a bug — a property. Reason to be cautious about treating any single output as definitive." },
          ]}
        />
      </Section>

      <Section id="confidence" n="1.3.4" title="The confidence problem">
        <p>
          Every failure mode in this module shares a common feature: the AI does not flag its own uncertainty. It uses the same fluent, confident tone for a correct statement and a fabricated one. The model has no model of truth — it just produces likely-sounding output.
        </p>
        <p>
          The practical implication: the standard workplace habit of trusting a well-written document does not work for AI output. A confident tone is evidence of nothing. Only verification is evidence.
        </p>
        <KeyMessage tone="amber" title="The single habit this module asks you to build">
          Treat every AI output as a draft from a colleague who is enthusiastic, well-spoken, and occasionally makes things up with great confidence. <b>Your name is on the final version.</b> Verify before you send.
          <div className="mt-2 text-xs">
            Tier 2 introduces a formal framework — <Tag tone="brand">FACTS · Factual · Attribution · Completeness · Tone · Safety</Tag>. For Tier 1, the habit is enough.
          </div>
        </KeyMessage>
      </Section>

      <Section id="spot" n="1.3.5" title="Activity: Spot the hallucination">
        <p>Below is an AI-drafted executive summary of Q2 2026 financial performance. It contains four deliberately planted errors. Click any part of the text that looks suspicious.</p>
        <SpotTheError />
      </Section>

      <Section id="summary" n="1.3.6" title="Module summary">
        <SummaryCards
          items={[
            { n: "01", t: "Hallucinations are the top failure mode", d: "Confident, fluent, factually wrong. The most important to internalize." },
            { n: "02", t: "Bias is a different failure", d: "Systematic skew from skewed training data. Watch recruitment, performance language, pay equity, procurement, service desk routing." },
            { n: "03", t: "Other ordinary failures", d: "Arithmetic, invented structure, staleness, context-window drops, prompt sensitivity." },
            { n: "04", t: "AI doesn't signal uncertainty", d: "Confident tone is evidence of nothing." },
            { n: "05", t: "Verify before you send", d: "The single Tier 1 habit. Tier 2 formalizes it with FACTS." },
          ]}
        />
      </Section>
    </>
  );
}
