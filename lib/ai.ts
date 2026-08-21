/**
 * AI Abstraction Layer
 *
 * This file is the SINGLE PLACE to swap in a real AI provider.
 *
 * To connect OpenAI GPT-4:
 *   1. npm install openai
 *   2. Set OPENAI_API_KEY in .env
 *   3. Replace the mock implementation below with:
 *      import OpenAI from "openai";
 *      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *      const completion = await openai.chat.completions.create({ ... });
 *
 * To connect Google Gemini:
 *   1. npm install @google/generative-ai
 *   2. Set GEMINI_API_KEY in .env
 *   3. Replace the mock implementation below with the Gemini SDK call.
 */

export interface ActionItem {
  task: string;
  owner: string;
  dueDate: string;
}

export interface CallInsights {
  aiSummary: string;
  aiActionItems: ActionItem[];
  aiFollowUpEmail: string;
}

/**
 * generateCallInsights — processes a call rawTranscript and returns structured insights.
 *
 * @param rawTranscript - The raw call transcript text
 * @returns CallInsights with aiSummary, aiActionItems, and a follow-up aiFollowUpEmail
 *
 * TODO: Replace this entire function body with a real AI API call when ready.
 */
export async function generateCallInsights(
  rawTranscript: string
): Promise<CallInsights> {
  // Simulate a ~1s API call delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // ─── MOCK RESPONSE ───────────────────────────────────────────────
  // This is returned for all transcripts until a real AI is connected.
  const wordCount = rawTranscript.split(/\s+/).length;

  return {
    aiSummary: `**Meeting Overview** (${wordCount} words analyzed)\n\n` +
      `- The call covered project scope, timelines, and stakeholder expectations.\n` +
      `- Client expressed satisfaction with current progress but flagged concerns around delivery dates.\n` +
      `- Budget was discussed; client approved a 10% contingency buffer.\n` +
      `- Next milestone is the MVP demo scheduled for end of month.\n` +
      `- Team agreed to bi-weekly syncs going forward.`,

    aiActionItems: [
      {
        task: "Send revised project timeline with updated milestones",
        owner: "Consultant",
        dueDate: "2026-04-11",
      },
      {
        task: "Share budget breakdown document with contingency line items",
        owner: "Consultant",
        dueDate: "2026-04-09",
      },
      {
        task: "Schedule MVP demo session with client team",
        owner: "Client",
        dueDate: "2026-04-14",
      },
      {
        task: "Review and approve updated scope of work document",
        owner: "Client",
        dueDate: "2026-04-12",
      },
    ],

    aiFollowUpEmail: `Subject: Follow-Up: Our Call Today — Next Steps & Action Items

Hi [Client Name],

Thank you for our call today. It was great to align on the project direction and I appreciate your continued partnership.

Here's a quick recap of what we discussed and the next steps we agreed on:

**Summary**
- Reviewed project progress and overall timeline
- Discussed budget contingency (10% buffer approved)
- Planned for MVP demo at end of month
- Agreed on bi-weekly check-ins going forward

**Action Items**
- [Consultant] Send revised project timeline by April 11
- [Consultant] Share budget breakdown document by April 9
- [Client] Schedule MVP demo session by April 14
- [Client] Review and approve updated scope of work by April 12

Please don't hesitate to reach out if you have any questions before our next check-in.

Looking forward to a great outcome on this project!

Best regards,
[Your Name]
[Your Company]
[Your Phone / Email]`,
  };
  // ─────────────────────────────────────────────────────────────────
}
