import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.AI_PROVIDER = "fallback";
process.env.DEMO_FORCE_MEMORY_STORE = "true";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesPath = path.join(root, "evals", "fixtures", "support-tickets.json");
const fixtures = JSON.parse(await readFile(fixturesPath, "utf8"));

const [{ generateTicketDraft }, { retrievePolicyGrounding }, { evaluateDraftSafety }] = await Promise.all([
  import("../src/lib/ai.ts"),
  import("../src/lib/policies.ts"),
  import("../src/lib/safety.ts"),
]);

const failures = [];
const results = [];

function fail(caseName, message) {
  failures.push(`${caseName}: ${message}`);
}

function makeTicket(input) {
  const now = new Date().toISOString();

  return {
    id: `eval_${input.customerEmail}`,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    subject: input.subject,
    body: input.body,
    source: input.source,
    status: "new",
    intent: "general_support",
    sentiment: "neutral",
    priority: "normal",
    aiDraft: null,
    finalResponse: null,
    aiProvider: null,
    aiModel: null,
    sendProvider: null,
    sendResult: null,
    metadata: input.metadata ?? null,
    createdAt: now,
    updatedAt: now,
    auditEvents: [],
  };
}

for (const testCase of fixtures.classificationCases) {
  const ticket = makeTicket(testCase.input);
  const policyGrounding = retrievePolicyGrounding(ticket);
  const draft = await generateTicketDraft(ticket, policyGrounding);
  const safety = evaluateDraftSafety(
    {
      intent: draft.intent,
      priority: draft.priority,
      sentiment: draft.sentiment,
    },
    draft.draft,
  );

  if (draft.intent !== testCase.expected.intent) {
    fail(testCase.name, `intent expected ${testCase.expected.intent}, got ${draft.intent}`);
  }

  if (draft.sentiment !== testCase.expected.sentiment) {
    fail(testCase.name, `sentiment expected ${testCase.expected.sentiment}, got ${draft.sentiment}`);
  }

  if (draft.priority !== testCase.expected.priority) {
    fail(testCase.name, `priority expected ${testCase.expected.priority}, got ${draft.priority}`);
  }

  if (draft.estimatedCostUsd === null) {
    fail(testCase.name, "estimated cost should be recorded for the deterministic eval route");
  }

  if (/\[(your name|name|agent name|support rep|representative)\]/i.test(draft.draft)) {
    fail(testCase.name, "draft should not contain unresolved signoff placeholders");
  }

  if (safety.severity !== testCase.expected.safetySeverity) {
    fail(
      testCase.name,
      `safety severity expected ${testCase.expected.safetySeverity}, got ${safety.severity}`,
    );
  }

  const policyIds = policyGrounding.citations.map((citation) => citation.id);
  for (const expectedPolicyId of testCase.expected.policyIds ?? []) {
    if (!policyIds.includes(expectedPolicyId)) {
      fail(testCase.name, `missing expected policy source ${expectedPolicyId}`);
    }
  }

  results.push({
    name: testCase.name,
    intent: draft.intent,
    sentiment: draft.sentiment,
    priority: draft.priority,
    cost: draft.estimatedCostUsd,
    safety: safety.severity,
    policies: policyIds.join(", "),
    latencyMs: draft.latencyMs,
    route: draft.routeReason,
  });
}

for (const testCase of fixtures.safetyCases) {
  const safety = evaluateDraftSafety(testCase.ticket, testCase.draft);
  const actualFlags = safety.flags.map((flag) => flag.code).sort();
  const expectedFlags = [...testCase.expected.flags].sort();

  if (safety.passed !== testCase.expected.passed) {
    fail(testCase.name, `passed expected ${testCase.expected.passed}, got ${safety.passed}`);
  }

  if (safety.severity !== testCase.expected.severity) {
    fail(testCase.name, `severity expected ${testCase.expected.severity}, got ${safety.severity}`);
  }

  for (const expectedFlag of expectedFlags) {
    if (!actualFlags.includes(expectedFlag)) {
      fail(testCase.name, `missing expected flag ${expectedFlag}`);
    }
  }

  for (const actualFlag of actualFlags) {
    if (!expectedFlags.includes(actualFlag)) {
      fail(testCase.name, `unexpected flag ${actualFlag}`);
    }
  }

  results.push({
    name: testCase.name,
    expectedFlags,
    actualFlags,
    safety: safety.severity,
  });
}

console.log("Human-in-the-loop support agent evals");
console.table(results);

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nPassed ${results.length} eval cases.`);
