// xAPI statement shape — stored as-is in XApiStatement.resultJson so the
// audit trail can be exported to an LRS or Oracle LMS later without
// backfilling data structure.

import { prisma } from "./prisma";

const XAPI_VERBS = {
  viewed: "http://id.tincanapi.com/verb/viewed",
  completed: "http://adlnet.gov/expapi/verbs/completed",
  attempted: "http://adlnet.gov/expapi/verbs/attempted",
  passed: "http://adlnet.gov/expapi/verbs/passed",
  failed: "http://adlnet.gov/expapi/verbs/failed",
} as const;

export type XApiVerb = keyof typeof XAPI_VERBS;

export async function recordModuleView(userId: string, moduleId: string) {
  await prisma.xApiStatement.create({
    data: {
      userId,
      verb: "viewed",
      objectType: "module",
      objectId: moduleId,
    },
  });
}

export async function recordModuleCompletion(userId: string, moduleId: string) {
  await prisma.xApiStatement.create({
    data: {
      userId,
      verb: "completed",
      objectType: "module",
      objectId: moduleId,
    },
  });
}

export function toStatement(row: {
  userId: string;
  verb: string;
  objectType: string;
  objectId: string;
  createdAt: Date;
  resultJson?: string | null;
}) {
  const verbIri = XAPI_VERBS[row.verb as XApiVerb] ?? row.verb;
  return {
    actor: { account: { homePage: "https://3shealth.ca/aiol", name: row.userId } },
    verb: { id: verbIri, display: { "en-CA": row.verb } },
    object: {
      id: `urn:3shealth:aiol:${row.objectType}:${row.objectId}`,
      definition: { type: `urn:3shealth:aiol:${row.objectType}` },
    },
    result: row.resultJson ? JSON.parse(row.resultJson) : undefined,
    timestamp: row.createdAt.toISOString(),
  };
}
