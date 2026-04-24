"use client";

import {
  ModuleShell,
  Section,
  KeyMessage,
  Tag,
  Tabs,
  SummaryCards,
} from "../_shared";
import { useState } from "react";

const SECTIONS = [
  { id: "landscape", n: "1.2.1", label: "Current AI landscape" },
  { id: "whats-coming", n: "1.2.2", label: "What is coming" },
  { id: "why-licence", n: "1.2.3", label: "Why an operator licence?" },
  { id: "tiers", n: "1.2.4", label: "The four tiers" },
  { id: "governance", n: "1.2.5", label: "Governance & AIGC" },
  { id: "your-role", n: "1.2.6", label: "Your role" },
  { id: "activity", n: "1.2.7", label: "Activity: AI footprint" },
  { id: "summary", n: "1.2.8", label: "Summary" },
];

const OBJECTIVES = [
  "Identify AI tools currently approved or planned within AMS-managed platforms",
  "Describe the purpose and structure of the AI Operator Licence Program",
  "Describe your personal role in responsible AI adoption at 3sHealth",
];

const TIERS = [
  {
    k: "1",
    name: "Awareness",
    audience: "All AMS staff",
    unlocks: "No tool access. Awareness-only.",
    renewal: "Annual",
    tone: "brand",
  },
  {
    k: "2",
    name: "Practitioner",
    audience: "Daily AI users — analysts, service desk, devs",
    unlocks: "Role-specific approved tools",
    renewal: "Annual",
    tone: "slate",
  },
  {
    k: "3",
    name: "Champion",
    audience: "Team leads and managers",
    unlocks: "All approved + admin surfaces",
    renewal: "Biannual",
    tone: "slate",
  },
  {
    k: "4",
    name: "Governance",
    audience: "AMS leadership, Steering Committee reps",
    unlocks: "Full + governance + configuration",
    renewal: "Biannual",
    tone: "slate",
  },
];

function TierCards() {
  const [active, setActive] = useState("1");
  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {TIERS.map((t) => {
          const isActive = active === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setActive(t.k)}
              className={`rounded-xl p-4 text-left border transition ${
                isActive
                  ? "border-brand-400 bg-gradient-to-br from-brand-50 to-white shadow-md"
                  : "border-slate-200 bg-white hover:border-brand-300"
              }`}
            >
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${isActive ? "text-brand-600" : "text-slate-500"}`}>
                Tier {t.k}
              </div>
              <div className="mt-1 font-semibold text-slate-900">{t.name}</div>
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {TIERS.filter((t) => t.k === active).map((t) => (
          <div key={t.k} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">
                Tier {t.k}
              </div>
              <div className="text-lg font-bold text-slate-900">{t.name}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Audience</div>
                <div className="mt-1 text-sm text-slate-700">{t.audience}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unlocks</div>
                <div className="mt-1 text-sm text-slate-700">{t.unlocks}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Renewal</div>
                <div className="mt-1 text-sm text-slate-700">{t.renewal}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LicenceMetaphor() {
  const points = [
    { icon: "🚗", t: "Don't need to be a mechanic to drive", d: "The training is practical and responsible use — not model internals." },
    { icon: "🎫", t: "Different vehicles, different licences", d: "A Copilot user needs different training than a dev using Claude Code." },
    { icon: "🚫", t: "You can lose your licence", d: "AUP non-compliance results in access revocation (Section 12)." },
    { icon: "🔁", t: "Regular renewal required", d: "AI evolves; training evolves. Tier 1 renews annually." },
  ];
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
      {points.map((p) => (
        <div key={p.t} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 hover:border-brand-300 hover:shadow-md transition">
          <div className="text-2xl">{p.icon}</div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{p.t}</div>
            <div className="text-xs text-slate-600 mt-1 leading-relaxed">{p.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GovernanceDiagram() {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl border-2 border-brand-300 bg-white px-6 py-3 text-center shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Top-level</div>
          <div className="font-bold text-slate-900">AIGC · AI Governance Committee</div>
          <div className="text-xs text-slate-500 mt-0.5">Saskatchewan health system</div>
        </div>
        <div className="w-0.5 h-6 bg-brand-300" />
        <div className="rounded-xl border-2 border-brand-300 bg-white px-6 py-3 text-center shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Operational</div>
          <div className="font-bold text-slate-900">AI Steering Committee</div>
          <div className="text-xs text-slate-500 mt-0.5">Reviews tools · manages register</div>
        </div>
        <div className="w-0.5 h-6 bg-brand-300" />
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Child policy</div>
          <div className="font-bold text-slate-900">AI Acceptable Use Policy (AUP)</div>
          <div className="text-xs text-slate-500 mt-0.5">What applies to you · this training</div>
        </div>
      </div>
    </div>
  );
}

function ResponsibilityChecklist() {
  const items = [
    "Use only tools on the approved register — at the classifications they are approved for",
    "Never enter prohibited data into any AI tool",
    "Review every AI output before you act on it or send it",
    "Report incidents — bad outputs, bias, data concerns, observed Shadow AI — through ServiceNow",
    "Keep your Tier 1 certification current. Renewal is annual.",
  ];
  return (
    <div className="mt-4 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="text-slate-800">{it}</span>
        </div>
      ))}
    </div>
  );
}

function FootprintActivity() {
  const [entries, setEntries] = useState([
    { feature: "", type: "" },
    { feature: "", type: "" },
    { feature: "", type: "" },
  ]);
  const types = ["Rule-based", "Machine learning", "Generative AI", "Not sure"];
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-600 mb-4">
        Take three minutes. List three AI-powered features you interact with in a typical workday. At least one should be inside an AMS-managed platform. There is no single right answer.
      </div>
      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-2">
            <input
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder={`Feature #${i + 1} (e.g., Outlook suggested replies)`}
              value={e.feature}
              onChange={(ev) => {
                const v = ev.target.value;
                setEntries((s) => s.map((x, j) => (j === i ? { ...x, feature: v } : x)));
              }}
            />
            <div className="flex gap-1 flex-wrap">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setEntries((s) => s.map((x, j) => (j === i ? { ...x, type: t } : x)))
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                    e.type === t
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-500">
        Point of the exercise: make your own AI exposure visible. No answer is submitted.
      </div>
    </div>
  );
}

export default function Module12Preview() {
  return (
    <ModuleShell
      moduleNumber="1.2"
      title="AI at AMS"
      minutes={20}
      sectionsCount={8}
      interactiveCount={4}
      objectives={OBJECTIVES}
      sections={SECTIONS}
      prev={{ href: "/preview/module-1-1", label: "Module 1.1 · What Is AI?" }}
      next={{ href: "/preview/module-1-3", label: "Module 1.3 · AI Risks" }}
    >
      <Section id="landscape" n="1.2.1" title="The current AI landscape at AMS">
        <p>
          AMS — Application Management Services — keeps 3sHealth's administrative platforms running. AI is arriving on every one of those platforms at the same time, on different timelines, with different risk profiles. The AI Operator Licence Program exists to make sure that wherever AI arrives next, the people using it have already been trained.
        </p>
        <KeyMessage title="Where to find the live tool register">
          The <b>AMS Approved AI Tool Register</b> is published on the 3sHealth intranet under IT Governance. It lists which AI tools are approved, for which data classifications, and which Tier is required to use them.
          <div className="mt-2">
            If a tool is not on the register, it is not approved. Using an unapproved AI tool — even for what feels like a low-risk task — is <b>Shadow AI</b> and violates AUP Section 12.
          </div>
        </KeyMessage>
      </Section>

      <Section id="whats-coming" n="1.2.2" title="What is coming">
        <p>Three platform trajectories frame why this program exists.</p>
        <Tabs
          items={[
            {
              key: "oracle",
              label: "Oracle Fusion 26A/26B",
              subtitle: "ERP · HCM · SCM · EPM",
              body: (
                <>
                  <p>
                    Oracle has embedded AI agents across Finance, Procurement, and HCM. They draft narratives, propose purchase requisition corrections, flag anomalies, and assist HR with case summaries.
                  </p>
                  <p>Some agents act on data; some only generate content.</p>
                  <Tag tone="amber">Agents that act on Fusion data are higher-risk than agents that produce drafts for human review.</Tag>
                </>
              ),
            },
            {
              key: "m365",
              label: "Microsoft 365 Copilot",
              subtitle: "Office + Teams",
              body: (
                <>
                  <p>
                    Copilot operates inside the 3sHealth Microsoft tenant — with your permissions — across Word, Excel, PowerPoint, Outlook, and Teams. It does not expose tenant content to the public internet.
                  </p>
                  <p>
                    But it will happily summarize PHI that sits in an Outlook thread. The summary inherits the sensitivity of the source.
                  </p>
                  <Tag>Tenant security does not remove the need for human judgment.</Tag>
                </>
              ),
            },
            {
              key: "snow",
              label: "ServiceNow AI",
              subtitle: "Virtual Agent + Now Assist",
              body: (
                <>
                  <p>
                    Virtual Agent for self-service, AI-powered routing, Now Assist for agent-facing summaries, Predictive Intelligence for incident grouping.
                  </p>
                  <p>AMS service desk staff will interact with these most.</p>
                  <Tag tone="rose">An incorrectly routed high-severity ticket is a much bigger problem than a small summary error.</Tag>
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section id="why-licence" n="1.2.3" title='Why an "operator licence"?'>
        <p>
          You do not need to be a mechanic to drive a car, but you do need a licence — because driving is useful, common, and has real consequences when done badly. The same is true of AI at work.
        </p>
        <LicenceMetaphor />
      </Section>

      <Section id="tiers" n="1.2.4" title="The four tiers at a glance">
        <p>Click a tier to see audience, what it unlocks, and renewal cadence.</p>
        <TierCards />
        <KeyMessage>
          Tier 1 is a prerequisite for every other tier. Staff with external AI certifications still complete Tier 1 for 3sHealth-specific content (AUP, Saskatchewan privacy law, AMS examples, incident reporting). Equivalency applies only at Tier 2.
        </KeyMessage>
      </Section>

      <Section id="governance" n="1.2.5" title="Governance — AIGC and the Steering Committee">
        <p>
          The AUP does not stand alone. It sits under the broader AI Policy maintained by the AIGC — the AI Governance Committee, the overarching body for AI use across Saskatchewan's health system. The AI Steering Committee is the operational body that reviews proposed AI tools, evaluates risk, and decides what gets added to the approved register.
        </p>
        <GovernanceDiagram />
        <p className="text-sm text-slate-600">
          For Tier 1: you don't need the full org chart. You do need to know there is a legitimate process for requesting approval, that the process takes time, and that <i>"I couldn't wait, so I just used it"</i> is not an acceptable shortcut. When you need an AI capability not on the register, raise it through your manager.
        </p>
      </Section>

      <Section id="your-role" n="1.2.6" title="Your role">
        <p>
          The AUP is explicit: every AMS team member who uses AI is personally responsible for safe, lawful, ethical, and policy-compliant use.
        </p>
        <ResponsibilityChecklist />
      </Section>

      <Section id="activity" n="1.2.7" title='Activity: "Your AI footprint"'>
        <FootprintActivity />
      </Section>

      <Section id="summary" n="1.2.8" title="Module summary">
        <SummaryCards
          items={[
            { n: "01", t: "AI is arriving everywhere", d: "Oracle Fusion 26A/26B, M365 Copilot, ServiceNow AI — all on the AMS surface." },
            { n: "02", t: "The register is authoritative", d: "AMS Approved AI Tool Register — if it's not there, it's not approved." },
            { n: "03", t: "Licence, not mechanic", d: "Trains you to use AI responsibly — not to become a data scientist." },
            { n: "04", t: "Four tiers", d: "Tier 1 is prerequisite and awareness-only. No tool access yet." },
            { n: "05", t: "Governance stack", d: "AIGC → AI Steering Committee → AUP. You work at the AUP layer." },
            { n: "06", t: "Personally responsible", d: "Annual renewal. You own what AI produces on your behalf." },
          ]}
        />
      </Section>
    </ModuleShell>
  );
}
