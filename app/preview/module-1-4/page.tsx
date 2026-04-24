"use client";

import {
  ModuleShell,
  Section,
  KeyMessage,
  Tag,
  Tabs,
  TwoColCompare,
  SummaryCards,
  ClassifyQuiz,
} from "../_shared";
import { useState } from "react";

const SECTIONS = [
  { id: "laws", n: "1.4.1", label: "Sask privacy landscape" },
  { id: "position", n: "1.4.2", label: "3sHealth's position" },
  { id: "classification", n: "1.4.3", label: "AUP data classification" },
  { id: "prohibited", n: "1.4.4", label: "Prohibited data" },
  { id: "approved", n: "1.4.5", label: "Approved vs unapproved" },
  { id: "shadow", n: "1.4.6", label: "Shadow AI" },
  { id: "tenant", n: "1.4.7", label: "Tenant & residency" },
  { id: "activity", n: "1.4.8", label: "Activity: Can you enter this?" },
  { id: "summary", n: "1.4.9", label: "Summary" },
];

const OBJECTIVES = [
  "Describe FOIP, LA FOIP, HIPA, and PIPEDA in plain language",
  "Apply the AUP classification to realistic AMS data",
  "Distinguish approved from unapproved AI tools — and the cost of Shadow AI",
  "Decide whether a given piece of data can be entered into a given AI tool",
];

const CLASSES = [
  {
    k: "public",
    name: "Public",
    example: "Published press releases · 3shealth.ca content · job postings · open-access policies",
    rule: "Permitted in any approved AI tool.",
    caveat: "Don't mix Public with other classifications in the same prompt — output inherits the highest sensitivity.",
    color: "emerald",
  },
  {
    k: "internal",
    name: "Internal",
    example: "Internal process docs · non-PII meeting notes · drafts · aggregate analytics",
    rule: "Only approved AI tools on the register.",
    caveat: "Prohibited in public ChatGPT, consumer Claude, Gemini consumer, or personal-account Copilot.",
    color: "brand",
  },
  {
    k: "confidential",
    name: "Confidential · PHI · PII",
    example: "Employee records · payroll · benefit claims · EFAP notes · HR investigations · SINs",
    rule: "Must not go in external tools. PHI requires de-identification unless explicit, documented consent.",
    caveat: "Even in approved tools: data minimization — don't include more PII than the task actually requires.",
    color: "amber",
  },
  {
    k: "restricted",
    name: "Restricted",
    example: "Credentials · security tokens · legal hold · privileged comms · critical source code",
    rule: "Must not be processed in any AI tool.",
    caveat: "Under active review by the AI Steering Committee for agentic/local-model scenarios. For Tier 1: do not enter anywhere.",
    color: "rose",
  },
];

function ClassificationExplorer() {
  const [active, setActive] = useState("public");
  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {CLASSES.map((c) => {
          const isActive = active === c.k;
          const tone: Record<string, string> = {
            emerald: isActive ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-md" : "border-slate-200 hover:border-emerald-300",
            brand: isActive ? "border-brand-400 bg-gradient-to-br from-brand-50 to-white shadow-md" : "border-slate-200 hover:border-brand-300",
            amber: isActive ? "border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-md" : "border-slate-200 hover:border-amber-300",
            rose: isActive ? "border-rose-400 bg-gradient-to-br from-rose-50 to-white shadow-md" : "border-slate-200 hover:border-rose-300",
          };
          const label: Record<string, string> = {
            emerald: isActive ? "text-emerald-700" : "text-slate-500",
            brand: isActive ? "text-brand-700" : "text-slate-500",
            amber: isActive ? "text-amber-700" : "text-slate-500",
            rose: isActive ? "text-rose-700" : "text-slate-500",
          };
          const dot: Record<string, string> = {
            emerald: "bg-emerald-400",
            brand: "bg-brand-500",
            amber: "bg-amber-400",
            rose: "bg-rose-500",
          };
          return (
            <button
              key={c.k}
              onClick={() => setActive(c.k)}
              className={`rounded-xl p-4 text-left border transition bg-white ${tone[c.color]}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot[c.color]}`} />
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${label[c.color]}`}>Level</div>
              </div>
              <div className="mt-1 font-semibold text-slate-900 text-sm">{c.name}</div>
            </button>
          );
        })}
      </div>
      {CLASSES.filter((c) => c.k === active).map((c) => (
        <div key={c.k} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-slate-900">{c.name}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Examples</div>
            <div className="mt-1 text-sm text-slate-700">{c.example}</div>
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Rule</div>
            <div className="mt-1 text-sm text-slate-800">{c.rule}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Caveat</div>
            <div className="mt-1 text-sm text-slate-800">{c.caveat}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const PROHIBITED = [
  { label: "Personal Health Info (PHI)", sub: "Diagnoses · treatments · benefit claims · EFAP" },
  { label: "Personal Info (PII)", sub: "SINs · home addresses · named-employee records" },
  { label: "Credentials", sub: "Passwords · API keys · connection strings · tokens" },
  { label: "Legal & HR records", sub: "Investigations · performance management · grievance · legal hold" },
  { label: "Sensitive financial", sub: "Non-public statements · audit working papers · individual payroll" },
  { label: "Critical source code", sub: "Especially anything with embedded creds or data samples" },
];

function ProhibitedGrid() {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {PROHIBITED.map((p) => (
        <div
          key={p.label}
          className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4"
        >
          <div className="flex items-start gap-2">
            <span className="text-rose-600 mt-0.5">⨯</span>
            <div>
              <div className="text-sm font-semibold text-rose-900">{p.label}</div>
              <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{p.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Module14Preview() {
  return (
    <ModuleShell
      moduleNumber="1.4"
      title="Privacy, Data, and Your Obligations"
      minutes={25}
      sectionsCount={9}
      interactiveCount={4}
      objectives={OBJECTIVES}
      sections={SECTIONS}
      prev={{ href: "/preview/module-1-3", label: "Module 1.3 · AI Risks" }}
      next={{ href: "/preview/module-1-5", label: "Module 1.5 · Reporting" }}
    >
      <Section id="laws" n="1.4.1" title="The Saskatchewan privacy landscape">
        <p>
          Four pieces of legislation frame AI use at 3sHealth. You do not need to be a lawyer — you do need to know which one applies when, what each one protects, and where to go when the answer is not obvious.
        </p>
        <Tabs
          items={[
            {
              key: "hipa",
              label: "HIPA",
              subtitle: "The central law for health",
              body: (
                <>
                  <p><b>The Health Information Protection Act</b> (Saskatchewan).</p>
                  <p>Protects <b>personal health information</b>. Applies to trustees — SHA, 3sHealth when acting as an information management service provider, physicians, pharmacists, hospitals.</p>
                  <Tag tone="amber">Most restrictive. PHI gets the highest bar in AI contexts.</Tag>
                </>
              ),
            },
            {
              key: "lafoip",
              label: "LA FOIP",
              subtitle: "Local authorities",
              body: (
                <>
                  <p><b>The Local Authority Freedom of Information and Protection of Privacy Act</b> (Sask.).</p>
                  <p>Protects personal information held by local authorities — regional health authorities, schools, municipalities. SHA is a local authority under LA FOIP.</p>
                </>
              ),
            },
            {
              key: "foip",
              label: "FOIP",
              subtitle: "Provincial government",
              body: (
                <>
                  <p><b>The Freedom of Information and Protection of Privacy Act</b> (Sask.).</p>
                  <p>Protects personal information held by the provincial government. Some 3sHealth work touches FOIP through ministry partners.</p>
                </>
              ),
            },
            {
              key: "pipeda",
              label: "PIPEDA",
              subtitle: "Federal · commercial",
              body: (
                <>
                  <p><b>Personal Information Protection and Electronic Documents Act</b> (Federal).</p>
                  <p>Applies to commercial activity. Because Saskatchewan doesn't have substantially similar private-sector legislation, PIPEDA applies to commercial activity within the province not covered elsewhere.</p>
                </>
              ),
            },
          ]}
        />
        <KeyMessage title="Why this matters for AI specifically">
          When you enter data into an AI tool, you are <b>collecting, using, and potentially disclosing</b> that data — all regulated acts under the applicable Act. An unapproved public AI tool that processes inputs on infrastructure outside Canada may turn a routine internal document into a <b>potential disclosure event</b>. That's why the approved tool register exists.
        </KeyMessage>
      </Section>

      <Section id="position" n="1.4.2" title="3sHealth's position">
        <p>
          3sHealth is a not-for-profit corporation that delivers shared administrative services to the Saskatchewan health system. Depending on the service line, 3sHealth acts as an <b>information management service provider</b> under HIPA, handles employee personal information, and processes operational data that belongs to client organizations.
        </p>
        <KeyMessage>
          The common thread: the data is rarely "ours" in a simple sense. It is held in trust, under contract, under a specific privacy regime. That's why the AUP restrictions feel strong. They are.
        </KeyMessage>
      </Section>

      <Section id="classification" n="1.4.3" title="The AUP data classification">
        <p>
          The AUP sorts data into four classifications. Tier 1 teaches the classifications; Tier 2 Module 2.4 drills application in harder, ambiguous scenarios.
        </p>
        <ClassificationExplorer />
      </Section>

      <Section id="prohibited" n="1.4.4" title="Data explicitly prohibited">
        <p>
          AUP Table 2 lists categories of data that are <b>explicitly prohibited</b> from AI tool input. Tier 1 learners are expected to recognize these on sight.
        </p>
        <ProhibitedGrid />
        <KeyMessage tone="rose" title="Golden rule">
          <div>Never enter prohibited data into an unapproved AI tool.</div>
          <div>Never enter prohibited data into any AI tool unless the tool is approved for that specific classification on the register.</div>
          <div className="font-semibold mt-1">When in doubt, do not enter. Ask your manager or the Privacy Officer.</div>
        </KeyMessage>
      </Section>

      <Section id="approved" n="1.4.5" title="Approved versus unapproved tools">
        <p>
          <b>"Approved"</b> is a specific term. A tool is approved when it appears on the AMS Approved AI Tool Register, for the specific data classification in question, and you hold the Tier level required to use it.
        </p>
        <TwoColCompare
          left={{
            title: "Approved",
            lead: "On the register · evaluated · tenant-bounded",
            points: [
              "Tenanted M365 Copilot (3sHealth work account)",
              "Tools evaluated against privacy & security requirements",
              "Residency specified on the register",
              "Classification & tier requirements documented",
            ],
            tone: "emerald",
          }}
          right={{
            title: "Unapproved",
            lead: "Not on the register — regardless of vendor",
            points: [
              "ChatGPT on a personal account",
              "Claude on a browser tab without enterprise context",
              "Gemini through a personal Google account",
              "Personal-account Copilot (even though tenanted Copilot is approved)",
            ],
            tone: "rose",
          }}
        />
        <p className="text-sm text-slate-600">
          The difference is not the vendor. It is <b>whether the tool has been evaluated against 3sHealth's privacy and security requirements</b>, and whether it operates inside a controlled tenant or outside of one.
        </p>
      </Section>

      <Section id="shadow" n="1.4.6" title="Shadow AI">
        <p>
          Shadow AI — using unapproved AI tools for work purposes, usually with good intentions and time pressure — is called out in <b>AUP Section 12</b>. It is a policy violation in its own right, <i>regardless of whether data was actually exposed</i>.
        </p>
        <KeyMessage tone="rose" title="Why it's a violation on its own">
          Once Shadow AI is in a workflow, the organization has no visibility into what went in, what came back, whose data was processed, or where. If you observe it, report it (Module 1.5 covers how). Reporting is not snitching — it is how the organization catches exposure <b>before</b> it becomes a breach.
        </KeyMessage>
      </Section>

      <Section id="tenant" n="1.4.7" title="Tenant boundaries and data residency">
        <p>
          Two technical ideas worth a few minutes — they come up constantly in AI conversations.
        </p>
        <TwoColCompare
          left={{
            title: "Tenant boundary",
            lead: "The slice of a cloud service that belongs to you",
            points: [
              "3sHealth M365 tenant ≠ your personal Microsoft account",
              "Within your tenant: AI sees what you can see, stays inside",
              "Personal sign-in: outside the tenant, different model, different terms",
              "Enforced by sign-in context — not vendor reputation",
            ],
            tone: "brand",
          }}
          right={{
            title: "Data residency",
            lead: "Where, geographically, data is stored & processed",
            points: [
              "Canadian public/health sectors favour Canadian or non-commercial-US",
              "Register specifies residency for each approved tool",
              "Unapproved tool → residency unknown",
              "Unknown residency is itself a reason for prohibition above Public",
            ],
            tone: "slate",
          }}
        />
      </Section>

      <Section id="activity" n="1.4.8" title='Activity: "Can you enter this?"'>
        <p>For each scenario, decide whether the data can be entered into the given AI tool.</p>
        <ClassifyQuiz
          choices={[
            { k: "permit", label: "Permitted" },
            { k: "caution", label: "Permitted w/ caution" },
            { k: "prohibit", label: "Prohibited" },
          ]}
          items={[
            {
              q: "You paste a published 3sHealth job posting into public web ChatGPT to rewrite it for clarity.",
              a: "prohibit",
              why: "Content is Public, but the tool is unapproved. Using unapproved tools is Shadow AI — regardless of data classification. Use an approved alternative.",
            },
            {
              q: "You use tenanted M365 Copilot in Outlook to draft a polite follow-up to a vendor whose RFP response you have. Vendor name and contract type are in your prompt.",
              a: "caution",
              why: "Tool is approved and tenanted. Data is Internal. Acceptable — avoid anything that drifts into Confidential.",
            },
            {
              q: "You copy an employee's EFAP case summary into tenanted Copilot in Word to rewrite it in plain language for a managerial overview.",
              a: "prohibit",
              why: "EFAP case data is PHI. Prohibited in any AI tool unless explicit consent is obtained and documented (AUP Section 4 + HIPA).",
            },
            {
              q: "You ask tenanted Copilot to summarize a 60-page draft policy marked Internal, inside the 3sHealth tenant.",
              a: "permit",
              why: "Approved tool, appropriate classification. Standard use.",
            },
            {
              q: "You paste a section of PL/SQL — including a database connection string — into an unapproved AI coding assistant to ask for a refactor.",
              a: "prohibit",
              why: "Two violations: unapproved tool AND the data includes a credential (restricted under AUP Table 2). This is Shadow AI plus credentials exposure.",
            },
          ]}
        />
      </Section>

      <Section id="summary" n="1.4.9" title="Module summary">
        <SummaryCards
          items={[
            { n: "01", t: "Four laws", d: "FOIP · LA FOIP · HIPA · PIPEDA. HIPA is most relevant because PHI is most restricted." },
            { n: "02", t: "Four classifications", d: "Public · Internal · Confidential/PHI/PII · Restricted. Each has a different AI rule." },
            { n: "03", t: '"Approved" is specific', d: "On the register for the specific classification, at your Tier. Nothing else counts." },
            { n: "04", t: "Shadow AI is a violation", d: "Using unapproved tools for work is a policy violation on its own." },
            { n: "05", t: "Tenant boundary matters", d: "Tenanted Copilot ≠ personal Copilot. Same name, different tool." },
            { n: "06", t: "Golden rule", d: "When in doubt, do not enter. Ask your manager or the Privacy Officer." },
          ]}
        />
      </Section>
    </ModuleShell>
  );
}
