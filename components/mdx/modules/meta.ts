// Plain (non-client) module metadata. Importable from both server components
// (/module/[slug]) and client components (/preview/*) without RSC boundary
// quirks. The bulky Section JSX still lives in the per-module *.tsx files.

export type ModuleMeta = {
  moduleNumber: string;
  title: string;
  minutes: number;
  sectionsCount: number;
  interactiveCount: number;
  objectives: string[];
  sections: { id: string; n: string; label: string }[];
};

export const META_11: ModuleMeta = {
  moduleNumber: "1.1",
  title: "What Is AI?",
  minutes: 30,
  sectionsCount: 7,
  interactiveCount: 4,
  objectives: [
    "Define AI, machine learning, and generative AI in plain language",
    "Distinguish AI from traditional software",
    "Identify AI applications in everyday life and AMS systems",
    "Describe what AI is not — its limits as a tool",
  ],
  sections: [
    { id: "plain-language", n: "1.1.1", label: "AI in plain language" },
    { id: "three-types", n: "1.1.2", label: "Three types of AI" },
    { id: "already-use", n: "1.1.3", label: "AI you already use" },
    { id: "ams-systems", n: "1.1.4", label: "AI in AMS systems" },
    { id: "what-its-not", n: "1.1.5", label: "What AI is not" },
    { id: "activity", n: "1.1.6", label: "Activity: Is this AI?" },
    { id: "summary", n: "1.1.7", label: "Summary" },
  ],
};

export const META_12: ModuleMeta = {
  moduleNumber: "1.2",
  title: "AI at AMS",
  minutes: 20,
  sectionsCount: 8,
  interactiveCount: 4,
  objectives: [
    "Identify AI tools currently approved or planned within AMS-managed platforms",
    "Describe the purpose and structure of the AI Operator Licence Program",
    "Describe your personal role in responsible AI adoption at 3sHealth",
  ],
  sections: [
    { id: "landscape", n: "1.2.1", label: "Current AI landscape" },
    { id: "whats-coming", n: "1.2.2", label: "What is coming" },
    { id: "why-licence", n: "1.2.3", label: "Why an operator licence?" },
    { id: "tiers", n: "1.2.4", label: "The four tiers" },
    { id: "governance", n: "1.2.5", label: "Governance & AIGC" },
    { id: "your-role", n: "1.2.6", label: "Your role" },
    { id: "activity", n: "1.2.7", label: "Activity: AI footprint" },
    { id: "summary", n: "1.2.8", label: "Summary" },
  ],
};

export const META_13: ModuleMeta = {
  moduleNumber: "1.3",
  title: "AI Risks and Limitations",
  minutes: 25,
  sectionsCount: 6,
  interactiveCount: 3,
  objectives: [
    "Explain what AI hallucinations are and why they occur",
    "Identify common types of AI bias and their impact on administrative systems",
    "Recognize the limits of AI accuracy in AMS contexts",
    "Apply a simple skepticism habit to any AI-generated output",
  ],
  sections: [
    { id: "hallucinations", n: "1.3.1", label: "Hallucinations" },
    { id: "bias", n: "1.3.2", label: "Bias" },
    { id: "errors", n: "1.3.3", label: "Errors in admin context" },
    { id: "confidence", n: "1.3.4", label: "The confidence problem" },
    { id: "spot", n: "1.3.5", label: "Activity: Spot the error" },
    { id: "summary", n: "1.3.6", label: "Summary" },
  ],
};

export const META_14: ModuleMeta = {
  moduleNumber: "1.4",
  title: "Privacy, Data, and Your Obligations",
  minutes: 25,
  sectionsCount: 9,
  interactiveCount: 4,
  objectives: [
    "Describe FOIP, LA FOIP, HIPA, and PIPEDA in plain language",
    "Apply the AUP classification to realistic AMS data",
    "Distinguish approved from unapproved AI tools — and the cost of Shadow AI",
    "Decide whether a given piece of data can be entered into a given AI tool",
  ],
  sections: [
    { id: "laws", n: "1.4.1", label: "Sask privacy landscape" },
    { id: "position", n: "1.4.2", label: "3sHealth's position" },
    { id: "classification", n: "1.4.3", label: "AUP data classification" },
    { id: "prohibited", n: "1.4.4", label: "Prohibited data" },
    { id: "approved", n: "1.4.5", label: "Approved vs unapproved" },
    { id: "shadow", n: "1.4.6", label: "Shadow AI" },
    { id: "tenant", n: "1.4.7", label: "Tenant & residency" },
    { id: "activity", n: "1.4.8", label: "Activity: Can you enter this?" },
    { id: "summary", n: "1.4.9", label: "Summary" },
  ],
};

export const META_15: ModuleMeta = {
  moduleNumber: "1.5",
  title: "Reporting and Accountability",
  minutes: 20,
  sectionsCount: 8,
  interactiveCount: 3,
  objectives: [
    "Apply the human-bookend accountability model to AI-assisted work",
    "Recognize when an AI issue should be reported, and the category it falls into",
    "Use ServiceNow to report an AI incident through the AI Incident Category",
    "Describe the escalation path from reporter to AIGC",
  ],
  sections: [
    { id: "accountability", n: "1.5.1", label: "Human accountability" },
    { id: "incidents", n: "1.5.2", label: "What counts as an incident" },
    { id: "how", n: "1.5.3", label: "How to report" },
    { id: "escalation", n: "1.5.4", label: "Escalation path" },
    { id: "help", n: "1.5.5", label: "Where to get help" },
    { id: "culture", n: "1.5.6", label: "A note on culture" },
    { id: "scenario", n: "1.5.7", label: "Scenario walkthrough" },
    { id: "summary", n: "1.5.8", label: "Summary" },
  ],
};

export const ALL_META: Record<string, ModuleMeta> = {
  "module-1.1": META_11,
  "module-1.2": META_12,
  "module-1.3": META_13,
  "module-1.4": META_14,
  "module-1.5": META_15,
};
