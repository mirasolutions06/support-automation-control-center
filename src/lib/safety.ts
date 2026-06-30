import type { TicketRecord } from "./types";

export type SafetySeverity = "none" | "low" | "medium" | "high";

export type SafetyFlag = {
  code:
    | "refund_promise"
    | "refund_missing_verification"
    | "legal_admission"
    | "angry_tone"
    | "missing_escalation";
  label: string;
  severity: Exclude<SafetySeverity, "none">;
  message: string;
};

export type SafetyCheckResult = {
  passed: boolean;
  severity: SafetySeverity;
  flags: SafetyFlag[];
  summary: string;
};

type SafetyTicket = Pick<TicketRecord, "intent" | "priority" | "sentiment">;

const severityRank: Record<SafetySeverity, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

function includesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function maxSeverity(flags: SafetyFlag[]): SafetySeverity {
  if (flags.length === 0) {
    return "none";
  }

  return flags.reduce<SafetySeverity>(
    (current, flag) =>
      severityRank[flag.severity] > severityRank[current] ? flag.severity : current,
    "none",
  );
}

export function evaluateDraftSafety(ticket: SafetyTicket, draft: string): SafetyCheckResult {
  const text = draft.toLowerCase();
  const flags: SafetyFlag[] = [];

  if (
    includesAny(text, [
      /\b(guarantee|promise|definitely|immediately|today)\b[\s\S]{0,50}\b(refund|credit|reimburse)\b/,
      /\b(refund|credit|reimburse)\b[\s\S]{0,50}\b(guarantee|promise|definitely|immediately|today)\b/,
      /\b(refund|credit|reimbursement)\s+(has been|is already|will be)\s+(processed|issued|completed)\b/,
    ])
  ) {
    flags.push({
      code: "refund_promise",
      label: "Refund promise",
      severity: "high",
      message: "Draft appears to promise a refund or credit before verification.",
    });
  }

  if (
    ticket.intent === "refund_request" &&
    /\b(refund|credit|reimburse)\b/.test(text) &&
    !includesAny(text, [/\b(verify|confirm|review|check|validate)\b/, /\bif\b[\s\S]{0,40}\b(confirm|verified|valid)\b/])
  ) {
    flags.push({
      code: "refund_missing_verification",
      label: "Refund verification",
      severity: "medium",
      message: "Refund language should mention verification before committing to an outcome.",
    });
  }

  if (
    includesAny(text, [
      /\b(we|our company|the company)\b[\s\S]{0,40}\b(admit|accept|acknowledge)\b[\s\S]{0,60}\b(fault|liability|liable|negligence|breach)\b/,
      /\b(our fault|legally responsible|we are liable|we were negligent)\b/,
    ])
  ) {
    flags.push({
      code: "legal_admission",
      label: "Legal admission",
      severity: "high",
      message: "Draft may admit fault, liability, negligence, or breach.",
    });
  }

  if (includesAny(text, [/\b(calm down|obviously|as we already told you|not our problem)\b/, /\byou should have\b/])) {
    flags.push({
      code: "angry_tone",
      label: "Angry tone",
      severity: "high",
      message: "Draft contains language that could escalate an already tense customer exchange.",
    });
  }

  const requiresEscalationOwner =
    ticket.intent === "angry_complaint" ||
    ticket.sentiment === "angry" ||
    (ticket.priority === "urgent" && ticket.intent !== "lead_inquiry");

  if (
    requiresEscalationOwner &&
    !includesAny(text, [/\bescalat/, /\bincident\b/, /\boperations\b/, /\bsupport lead\b/, /\bsenior\b/, /\bspecialist\b/])
  ) {
    flags.push({
      code: "missing_escalation",
      label: "Missing escalation",
      severity: "high",
      message: "Urgent or angry complaints should explicitly route to an escalation owner.",
    });
  }

  const severity = maxSeverity(flags);

  return {
    passed: severity !== "high",
    severity,
    flags,
    summary:
      flags.length === 0
        ? "No safety issues detected."
        : `${flags.length} safety ${flags.length === 1 ? "issue" : "issues"} detected.`,
  };
}
