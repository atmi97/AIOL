"use client";

import {
  Section,
  Highlight,
  KeyMessage,
  Tag,
  Tabs,
  Accordion,
  FlipCards,
  SummaryCards,
  TwoColCompare,
  Chips,
  ClassifyQuiz,
} from "../index";

export { META_11 } from "./meta";

export function Content11() {
  return (
    <>
      <Section id="plain-language" n="1.1.1" title="AI in plain language">
        <p>
          Artificial intelligence is not magic, and it is not science fiction. A useful working definition for 3sHealth:{" "}
          <Highlight>AI is software that learns patterns from data</Highlight> and uses those patterns to make predictions or generate content.
        </p>
        <TwoColCompare
          left={{
            title: "Traditional software",
            lead: "Follows rules a developer wrote",
            points: [
              "Explicit formulas, coded by hand",
              "Same input → same output, every time",
              "Rules are visible and reviewable",
            ],
            tone: "slate",
          }}
          right={{
            title: "AI",
            lead: "Learns patterns from example data",
            points: [
              "Trained on large amounts of examples",
              "Produces likely answers — not guaranteed ones",
              "Patterns are statistical, not hand-written",
            ],
            tone: "brand",
          }}
        />
        <KeyMessage>
          AI learns patterns from data. It does not reason the way humans reason. It predicts what is likely to come next based on what came before in its training data.
        </KeyMessage>
      </Section>

      <Section id="three-types" n="1.1.2" title="Three types of AI you will encounter">
        <p>Not all AI works the same way. Three categories cover almost everything AMS staff will see.</p>
        <Tabs
          items={[
            {
              key: "rule",
              label: "Rule-based",
              subtitle: "Oldest · deterministic",
              body: (
                <>
                  <p>
                    A developer writes explicit rules — <i>"if the email contains 'lottery' from an unknown sender, route to spam"</i> — and the software applies them. Often called "AI" for marketing reasons, but they do not learn.
                  </p>
                  <p>Most legacy business-rules engines, including many validations in Oracle Fusion, fall into this category.</p>
                  <Tag>Same input → same output, every time.</Tag>
                </>
              ),
            },
            {
              key: "ml",
              label: "Machine learning",
              subtitle: "Narrow · trained on examples",
              body: (
                <>
                  <p>ML systems learn a <b>model</b> from historical data, then apply it to new inputs.</p>
                  <p>Already in your hands: email autocomplete, credit-card fraud detection, Teams suggested replies, ServiceNow ticket routing.</p>
                  <Tag>Usually narrow — a fraud model can't write a performance review.</Tag>
                </>
              ),
            },
            {
              key: "gen",
              label: "Generative AI",
              subtitle: "What this program is about",
              body: (
                <>
                  <p>Creates new content — text, code, images, summaries — from a prompt. Tools: Microsoft 365 Copilot, ChatGPT, Claude, GitHub Copilot.</p>
                  <p>Under the hood: large language models trained on massive text corpora, predicting one token at a time.</p>
                  <Tag tone="amber">Most likely to touch 3sHealth data — and most likely to sound confident when wrong.</Tag>
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section id="already-use" n="1.1.3" title="AI you already use">
        <p>
          AI has been part of your daily tools for years. The shift with generative AI is that it is suddenly very visible, very capable of producing finished-looking content, and very easy to misuse.
        </p>
        <Chips
          items={[
            "Spam filtering",
            "Predictive search",
            "Turn-by-turn navigation",
            "Auto-capitalization",
            "Photo tagging",
            "Netflix recommendations",
            "SharePoint search ranking",
            "Grammar suggestions",
          ]}
        />
      </Section>

      <Section id="ams-systems" n="1.1.4" title="AI in AMS-managed systems">
        <p>
          Across the platforms AMS supports, AI is either live, rolling out, or actively being planned. The authoritative source is the approved tool register maintained by the AI Steering Committee.
        </p>
        <Accordion
          items={[
            {
              title: "Oracle Fusion",
              subtitle: "ERP · HCM · SCM · EPM",
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>AI agents in 26A / 26B releases (finance, procurement, HCM)</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>AI-assisted reporting & analytics</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Natural-language queries against Fusion data</li>
                </ul>
              ),
            },
            {
              title: "Microsoft 365",
              subtitle: "Copilot across Office + Teams",
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Copilot in Word, Excel, PowerPoint, Outlook, Teams</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Meeting recap + action-item extraction</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>AI search across your tenant</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Agents built on Copilot Studio</li>
                </ul>
              ),
            },
            {
              title: "ServiceNow",
              subtitle: "Virtual Agent + Now Assist",
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Virtual Agent for self-service</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>AI-assisted ticket routing & categorization</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Now Assist for knowledge search + ticket summarization</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Predictive Intelligence for incident grouping</li>
                </ul>
              ),
            },
            {
              title: "BI tooling",
              subtitle: "Natural-language analytics",
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>NL question-answering on dashboards</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>AI-assisted data prep</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Visualization suggestions</li>
                </ul>
              ),
            },
            {
              title: "Application development",
              subtitle: "AI coding assistants (Tier 2 · Track D)",
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Claude Code</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>GitHub Copilot</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>GPT-based tools</li>
                  <li className="flex gap-2"><span className="text-brand-500 mt-0.5">▸</span>Codex</li>
                </ul>
              ),
            },
          ]}
        />
      </Section>

      <Section id="what-its-not" n="1.1.5" title="What AI is not">
        <p>An equally important part of AI literacy is knowing what AI is not. Click each card to see what to watch for.</p>
        <FlipCards
          items={[
            {
              title: "Not sentient",
              front: "AI has no experience, beliefs, or intent.",
              back: "When an assistant says 'I think' — that is fluent generation, not an inner view. Treating AI output as opinion leads people to over-trust it.",
            },
            {
              title: "Not infallible",
              front: "It's wrong more often than most people expect.",
              back: "Confidently and subtly wrong. Every AI output requires human verification before it is acted on. Module 1.3 covers the failure modes.",
            },
            {
              title: "Not a human replacement",
              front: "It can draft, summarize, analyze — not decide.",
              back: "It can't take accountability. Under 3sHealth's AUP and AIGC policy, the person using AI is accountable for what AI produces on their behalf.",
            },
            {
              title: "Not confidential by default",
              front: "Some tools are inside your tenant. Others aren't.",
              back: "Public services may use your prompts for model training. The difference matters. Module 1.4 covers what's approved.",
            },
          ]}
        />
        <KeyMessage tone="amber" title="Never confuse fluency with accuracy">
          A well-written, confidently worded, perfectly formatted AI output can still be factually wrong. Polished presentation is not evidence of correctness. Always verify before acting.
        </KeyMessage>
      </Section>

      <Section id="activity" n="1.1.6" title="Activity: Is this AI?">
        <p>For each feature below, classify it. Click your answer — you'll see whether you're right and why.</p>
        <ClassifyQuiz
          choices={[
            { k: "rule", label: "Rule-based" },
            { k: "ml", label: "Machine learning" },
            { k: "gen", label: "Generative AI" },
            { k: "none", label: "Not AI" },
          ]}
          items={[
            { q: "A ServiceNow workflow that routes tickets with 'payroll' in the subject to the Payroll team.", a: "rule", why: "A simple keyword-matching rule configured in ServiceNow. No learning involved." },
            { q: "Outlook's suggested reply feature — three short responses based on the incoming email.", a: "gen", why: "Suggested replies use a language model trained on massive amounts of email text." },
            { q: "A Copilot request in Word asking for a plain-language summary of a 40-page policy.", a: "gen", why: "Copilot produces new summary text. Classic generative AI." },
            { q: "Excel's SUM formula totalling a column of values.", a: "none", why: "SUM is a fixed formula. Same result every time — no AI." },
            { q: "Oracle Fusion Recruiting flagging a candidate as a potential match based on résumé text.", a: "ml", why: "A learned ranking model applied to résumé text. Not generative — no new content." },
            { q: "ServiceNow Virtual Agent answering 'how do I reset my 3sHealth password?' conversationally.", a: "gen", why: "A language model produces the conversational response." },
            { q: "A Power BI dashboard that refreshes every morning at 6:00 a.m.", a: "none", why: "A scheduled refresh is automation, not intelligence." },
            { q: "Claude Code suggesting a refactor of a PL/SQL stored procedure.", a: "gen", why: "A coding assistant that produces new code is generative AI." },
            { q: "Outlook's red-squiggle spelling check.", a: "rule", why: "Dictionary-based. Grammar suggestions in newer Office add an ML layer on top." },
            { q: "A Teams meeting recap that pulls out action items, owners, and decisions.", a: "gen", why: "A language model identifies and rephrases key points from the transcript." },
          ]}
        />
      </Section>

      <Section id="summary" n="1.1.7" title="Module summary">
        <SummaryCards
          items={[
            { n: "01", t: "AI learns patterns", d: "Software that learns from data to predict or generate — not programmed rule by rule." },
            { n: "02", t: "Three categories", d: "Rule-based · machine learning · generative AI. This program focuses on generative AI." },
            { n: "03", t: "Already in your tools", d: "Oracle Fusion 26A/26B, Microsoft 365 Copilot, and ServiceNow are the three main surfaces at 3sHealth." },
            { n: "04", t: "What AI is not", d: "Not sentient. Not infallible. Not a substitute for judgment. Not confidential by default." },
            { n: "05", t: "Fluency ≠ accuracy", d: "Polished output can still be wrong. Always verify before acting." },
          ]}
        />
      </Section>
    </>
  );
}
