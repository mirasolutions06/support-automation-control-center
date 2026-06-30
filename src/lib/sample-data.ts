import type { InboundTicketInput } from "./validation";

export const sampleTickets: InboundTicketInput[] = [
  {
    customerName: "Priya Shah",
    customerEmail: "priya.shah@example.com",
    subject: "Refund request for duplicate charge",
    body: "Hi team, I was charged twice for my Pro plan renewal this morning. I only authorized one payment. Can you refund the duplicate charge today? I need this resolved before finance closes our books.",
    source: "demo",
    metadata: {
      accountPlan: "Pro",
      policy: "Duplicate billing can be refunded after payment verification.",
    },
  },
  {
    customerName: "Marcus Reed",
    customerEmail: "marcus.reed@example.com",
    subject: "This outage has been unacceptable",
    body: "I am furious. Your dashboard has been down twice this week and my team missed customer follow-ups because of it. I do not want a generic apology. Tell me what happened and what you are doing to stop this.",
    source: "demo",
    metadata: {
      accountPlan: "Business",
      policy: "Acknowledge severity, do not admit legal liability, offer incident follow-up.",
    },
  },
  {
    customerName: "Aisha Morgan",
    customerEmail: "aisha.morgan@example.com",
    subject: "Can you automate routing for our support inbox?",
    body: "We run a 14-person operations team and get around 650 support and lead emails a week. We want AI help, but we do not want a bot sending unapproved messages. Can someone walk us through a safe rollout?",
    source: "lead_form",
    metadata: {
      companySize: "14-person operations team",
      opportunity: "Human-in-the-loop automation rollout",
    },
  },
];
