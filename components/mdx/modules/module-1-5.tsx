"use client";

import { Section, KeyMessage, Tag, Accordion, SummaryCards } from "../index";
import { useState } from "react";

export { META_15 } from "./meta";

function BookendFlow() {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
      <div className="rounded-xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">Step 1 · Human at the start</div>
        <div className="mt-2 text-lg font-bold text-slate-900">You define the task</div>
        <div className="mt-2 text-xs text-slate-600 leading-relaxed">Choose the tool, supply the prompt, decide what data is appropriate.</div>
      </div>
      <div className="flex items-center justify-center"><span className="text-brand-400 text-2xl">→</span></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Step 2 · AI in the middle</div>
        <div className="mt-2 text-lg font-bold text-slate-900">The tool executes</div>
        <div className="mt-2 text-xs text-slate-600 leading-relaxed">Drafts, summarizes, analyzes, proposes, routes.</div>
      </div>
      <div className="flex items-center justify-center"><span className="text-brand-400 text-2xl">→</span></div>
      <div className="rounded-xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">Step 3 · Human at the end</div>
        <div className="mt-2 text-lg font-bold text-slate-900">You review & own it</div>
        <div className="mt-2 text-xs text-slate-600 leading-relaxed">Correct what needs correcting. Take accountability for the final version.</div>
      </div>
    </div>
  );
}

function Escalation() {
  const steps = [
    { n: "01", who: "You → Your manager", when: "Immediately for anything material. Your manager has context on the task and the stakeholder relationship." },
    { n: "02", who: "Manager → IT Security / ESS", when: "For data concerns, potential breach, credentials exposure, or tool misbehaviour." },
    { n: "03", who: "ESS → AIGC", when: "For anything that rises to policy, pattern, or cross-organizational concern." },
  ];
  return (
    <div className="mt-6 relative">
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 hidden md:block" />
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md relative z-10">{s.n}</div>
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition">
              <div className="font-semibold text-slate-900 text-sm">{s.who}</div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">{s.when}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
        <b>Urgent data-exposure events</b> — PHI in an unapproved tool, credentials in a public prompt — escalate immediately <i>and in parallel</i>. Do not wait for ServiceNow routing.
      </div>
    </div>
  );
}

function HelpCards() {
  const items = [
    { t: "AMS AI FAQ", d: "Intranet · updated as new platforms & tools roll out.", badge: "Intranet" },
    { t: "Your AI Champion", d: "Once Tier 3 cohorts certify, each AMS team has a designated Champion.", badge: "Tier 3" },
    { t: "Your manager", d: "For uncertainty about whether a specific use is permitted.", badge: "Always" },
    { t: "Privacy Officer", d: "For questions about HIPA, LA FOIP, FOIP, or PIPEDA applicability.", badge: "Privacy" },
    { t: "ServiceNow", d: "Incident reporting, AI help desk (once stood up), general IT support.", badge: "System" },
  ];
  return (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((h) => (
        <div key={h.t} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-slate-900 text-sm">{h.t}</div>
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-medium border border-brand-100">{h.badge}</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 leading-relaxed">{h.d}</div>
        </div>
      ))}
    </div>
  );
}

function ScenarioWalkthrough() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Next 15 minutes", color: "rose", actions: ["Correct the figure in the draft from the Fusion source. The source is authoritative; Copilot was wrong.", "Check the rest of the summary for similar pattern-level errors — if one number is 4% off, others might be too.", "Document what you caught: which tool, which section, what the error was, what the correct value was."] },
    { label: "Next 2 hours", color: "amber", actions: ["File a ServiceNow AI incident under the AI Incident Category. Near-miss classification.", "Include: tool (tenanted M365 Copilot in Word), classification (Internal, no PHI), nature of error (fabricated figure, plausible magnitude), and that it was caught pre-send.", "Notify your manager. They may want to review the final draft before it goes out."] },
    { label: "By tomorrow morning", color: "brand", actions: ["Final review with a second pair of eyes for the client-facing version. Not required by policy — good practice given the catch.", "Keep a note in your working file. The ServiceNow ticket is the official record; your working note is for your own quality."] },
  ];
  const toneBorder: Record<string, string> = { rose: "border-rose-300 bg-gradient-to-br from-rose-50 to-white", amber: "border-amber-300 bg-gradient-to-br from-amber-50 to-white", brand: "border-brand-300 bg-gradient-to-br from-brand-50 to-white" };
  const toneLabel: Record<string, string> = { rose: "text-rose-700", amber: "text-amber-700", brand: "text-brand-700" };
  const active = steps[step];
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 leading-relaxed">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Scenario</div>
        It is 3:45 p.m. on a Thursday. You are finalizing the quarterly service line performance report for one of 3sHealth's client organizations. You used tenanted M365 Copilot to draft the financial summary. You just noticed the revenue figure Copilot drafted — which matches the magnitude of the real figure — is about <b>4% off</b> the source Fusion report. The draft has not been sent. The client has a Friday 10:00 a.m. review call.
      </div>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`rounded-xl p-3 border text-left transition ${step === i ? toneBorder[s.color] + " shadow-md" : "border-slate-200 bg-white hover:border-brand-300"}`}>
            <div className={`text-[10px] font-semibold uppercase tracking-wider ${step === i ? toneLabel[s.color] : "text-slate-500"}`}>Step {i + 1}</div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>
      <div className={`rounded-xl border-2 p-5 ${toneBorder[active.color]}`}>
        <div className={`text-xs font-semibold uppercase tracking-wider ${toneLabel[active.color]}`}>{active.label}</div>
        <ul className="mt-3 space-y-2">
          {active.actions.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-800">
              <span className="shrink-0 w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-600 text-[11px] font-semibold flex items-center justify-center mt-0.5">{i + 1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Content15() {
  return (
    <>
      <Section id="accountability" n="1.5.1" title="The human accountability model">
        <p>
          The AI Operator Licence Program is built around a single sentence: <b>Human verify. Human decide. Human accountable.</b> Every other rule in this program is a specific application of that principle.
        </p>
        <p>
          In practice: you — the 3sHealth staff member — are accountable for what AI produces on your behalf. Accountability is not transferable to the tool, the vendor, the team that approved the tool, or the colleague who suggested you use it. <b>If you send it, you own it.</b>
        </p>
        <BookendFlow />
        <KeyMessage>This applies equally to a five-second Copilot prompt and a multi-hour agentic workflow. The bookends are not optional.</KeyMessage>
      </Section>

      <Section id="incidents" n="1.5.2" title="What counts as an AI incident">
        <p>
          Not every AI error is an incident worth reporting — but more than you might think are. The general test: if the output reached, or <i>could have</i> reached, a person or system outside your desk, or if there is a data concern, it should be reported.
        </p>
        <Accordion
          defaultOpen={0}
          items={[
            { title: "Output error that reached a stakeholder", subtitle: "Material error sent to employee, vendor, client, or regulator", body: '"Material" is a judgment call — the bar is much lower for PHI, financial, and legal content than for a typo.' },
            { title: "Data concern or possible breach", subtitle: "PHI pasted into an unapproved tool · credentials in a prompt · retention concerns", body: "Report even if you're not sure. The incident team can help determine whether it rises to a breach." },
            { title: "Bias detected in output", subtitle: "Systematic skew in hiring, scoring, routing, review language", body: "Worth reporting even if no decision was made on the biased output. The pattern matters." },
            { title: "Observed Shadow AI", subtitle: "A colleague using an unapproved tool for 3sHealth work", body: "Report it. The report goes to the process, not the person — the system is designed to catch exposure before it becomes a breach." },
            { title: "Tool behaviour suggesting a security incident", subtitle: "Unusual access · unexpected data surfacing · apparent guardrail bypass", body: "Goes through the standard IT Security path with an AI tag." },
            { title: "Near-misses", subtitle: "You caught the error before it went out", body: "Still report it. Near-miss reporting is how the organization improves training, updates the prompt library, and spots patterns. Good-faith reporting is encouraged." },
          ]}
        />
      </Section>

      <Section id="how" n="1.5.3" title="How to report">
        <p>Reports go through <b>ServiceNow</b>, under the <Tag>AI Incident Category</Tag>. Tier 2 Module 2.7 walks through the exact screens; for Tier 1 the key information is <i>what to include</i>.</p>
        <div className="mt-4 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Include in the report</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
            <li className="flex gap-2"><span className="text-brand-600">✓</span>What happened, plain language — 2 to 4 sentences.</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span>Which AI tool, whether it was approved, at what tier/classification.</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span>What data was involved, described by classification — not the data itself.</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span>Whether the output reached anyone outside your immediate work.</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span>Immediate containment steps you've already taken.</li>
          </ul>
        </div>
        <KeyMessage tone="rose" title="What not to do">
          <div>Do not paste the problematic data into the incident ticket. The ticket system is not a safe place for PHI or credentials. Reference data by classification and location.</div>
          <div className="mt-1">Do not delay reporting while you investigate. <b>Report first, investigate second.</b> The incident team can help.</div>
        </KeyMessage>
      </Section>

      <Section id="escalation" n="1.5.4" title="Escalation path">
        <p>Per AUP Section 7.6, the escalation structure is:</p>
        <Escalation />
      </Section>

      <Section id="help" n="1.5.5" title="Where to get help">
        <HelpCards />
      </Section>

      <Section id="culture" n="1.5.6" title="A note on culture">
        <p>This program does not treat AI incidents as failures to be punished. It treats them as <b>signals</b> that help the organization learn.</p>
        <KeyMessage>
          A workforce afraid to report will under-report. The patterns will be invisible. The incidents that surface will only be the severe ones that could not be hidden. That is the opposite of what a functioning safety culture looks like. <b>Good-faith reporting is encouraged and protected.</b>
        </KeyMessage>
        <p className="text-sm text-slate-600">
          The human accountability framework for AI-assisted work — including how AI-assisted outputs are attributed in the employment record, and the corrective action framework for repeat non-compliance — is being developed in partnership with HR and will be communicated when the partnership work concludes. In the meantime, the AUP applies as written, reporting is encouraged, and the focus is on surfacing risk quickly.
        </p>
      </Section>

      <Section id="scenario" n="1.5.7" title="Scenario walkthrough">
        <ScenarioWalkthrough />
      </Section>

      <Section id="summary" n="1.5.8" title="Module summary">
        <SummaryCards
          items={[
            { n: "01", t: "Verify · decide · accountable", d: "You own what AI produces on your behalf." },
            { n: "02", t: "Human-bookend model", d: "Human start, AI middle, human end. For every AI-assisted task." },
            { n: "03", t: "Report through ServiceNow", d: "AI Incident Category. Covers errors, data concerns, bias, Shadow AI, tool misbehaviour, near-misses." },
            { n: "04", t: "Escalation path", d: "Manager → IT Security/ESS → AIGC. Urgent data exposure escalates in parallel." },
            { n: "05", t: "Report first, investigate second", d: "Don't delay. Don't paste the data. Reference by classification." },
            { n: "06", t: "Learning culture", d: "Good-faith reporting is encouraged and protected." },
          ]}
        />
      </Section>
    </>
  );
}
