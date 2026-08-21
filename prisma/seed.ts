import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@callscribe.ai" },
    update: {},
    create: {
      name: "Alex Consultant",
      email: "demo@callscribe.ai",
      passwordHash,
      subscription: {
        create: {
          status: "free",
        },
      },
    },
  });

  console.log(`✅ User: ${user.email}`);

  // Create clients
  const clientAcme = await prisma.client.upsert({
    where: { id: "seed-client-acme" },
    update: {},
    create: {
      id: "seed-client-acme",
      name: "Acme Corp Rebrand",
      color: "#6366f1",
      userId: user.id,
    },
  });

  const clientBeta = await prisma.client.upsert({
    where: { id: "seed-client-beta" },
    update: {},
    create: {
      id: "seed-client-beta",
      name: "Beta Startup Launch",
      color: "#10b981",
      userId: user.id,
    },
  });

  console.log(`✅ Clients: ${clientAcme.name}, ${clientBeta.name}`);

  // Create sample call notes
  const notes = [
    {
      id: "seed-note-1",
      title: "Q2 Strategy Kickoff — Acme Corp",
      rawTranscript:
        "Alex: Good morning everyone. Let's get started on the Q2 roadmap. Sarah: We need to finalize the brand guidelines by end of April. Tom: Budget is approved for the design sprint. Alex: Great. Let's schedule weekly syncs.",
      aiSummary:
        "**Q2 Strategy Kickoff**\n- Team aligned on Q2 priorities and roadmap\n- Brand guidelines to be finalized by end of April\n- Budget approved for design sprint\n- Weekly syncs scheduled",
      aiActionItems: JSON.stringify([
        { task: "Finalize brand guidelines", owner: "Sarah", dueDate: "2026-04-30" },
        { task: "Set up weekly sync calendar invites", owner: "Alex", dueDate: "2026-04-08" },
        { task: "Share approved budget breakdown", owner: "Tom", dueDate: "2026-04-10" },
      ]),
      aiFollowUpEmail:
        "Subject: Q2 Kickoff Recap — Next Steps\n\nHi team,\n\nThank you for a productive kickoff call! Here's a summary of our agreements:\n\n- Brand guidelines due: April 30 (Sarah)\n- Budget breakdown shared by: April 10 (Tom)\n- Weekly syncs starting next Monday\n\nLooking forward to a great Q2!\n\nBest,\nAlex",
      clientId: clientAcme.id,
      userId: user.id,
    },
    {
      id: "seed-note-2",
      title: "Product Demo — Beta Startup",
      rawTranscript:
        "Alex: Thanks for joining the demo. Client: The product looks great. We love the onboarding flow. Alex: We can customize the dashboard for your team. Client: When can we go live? Alex: Two weeks from today if contracts are signed by Friday.",
      aiSummary:
        "**Product Demo Recap**\n- Client responded positively to the product demo\n- Onboarding flow highlighted as a strength\n- Dashboard customization discussed\n- Go-live target: 2 weeks, contingent on contract signature by Friday",
      aiActionItems: JSON.stringify([
        { task: "Send contract for signature", owner: "Alex", dueDate: "2026-04-07" },
        { task: "Prepare customized dashboard mockups", owner: "Alex", dueDate: "2026-04-10" },
        { task: "Sign and return contract", owner: "Client", dueDate: "2026-04-11" },
      ]),
      aiFollowUpEmail:
        "Subject: Demo Follow-Up — Next Steps to Go Live\n\nHi,\n\nThank you for your time today! It was great to see your enthusiasm for the product.\n\nTo hit our 2-week go-live target:\n1. I'll send the contract by EOD Friday\n2. Please sign and return by April 11\n3. I'll share dashboard mockups by April 10\n\nExcited to get you launched!\n\nBest,\nAlex",
      clientId: clientBeta.id,
      userId: user.id,
    },
    {
      id: "seed-note-3",
      title: "Discovery Call — Potential Client",
      rawTranscript:
        "Alex: Tell me about your current workflow. Prospect: We have 5 consultants who all take notes manually after calls. It's a mess. Alex: How much time does that take per week? Prospect: At least 3 hours per person. Alex: CallScribe can reduce that to under 30 minutes.",
      aiSummary:
        "**Discovery Call Recap**\n- Prospect has 5 consultants doing manual note-taking\n- Current process: ~3 hours/person/week\n- Main pain point: inconsistency and time waste\n- CallScribe value prop resonated strongly",
      aiActionItems: JSON.stringify([
        { task: "Send product overview deck", owner: "Alex", dueDate: "2026-04-06" },
        { task: "Schedule 30-min trial onboarding", owner: "Alex", dueDate: "2026-04-09" },
        { task: "Loop in IT contact for SSO discussion", owner: "Prospect", dueDate: "2026-04-10" },
      ]),
      aiFollowUpEmail:
        "Subject: Great to Meet You — Here's What We Discussed\n\nHi,\n\nThank you for sharing your current workflow with me. I completely understand the pain of spending 3 hours a week on manual summaries!\n\nNext steps:\n- I'll send our product overview deck today\n- Let's schedule a 30-minute trial onboarding\n- If you can loop in your IT contact, we can discuss SSO options\n\nLooking forward to helping your team get those hours back!\n\nBest,\nAlex",
      clientId: null,
      userId: user.id,
    },
  ];

  for (const note of notes) {
    await prisma.callNote.upsert({
      where: { id: note.id },
      update: {},
      create: note,
    });
  }

  console.log(`✅ Call notes seeded (${notes.length})`);
  console.log("\n🎉 Seed complete!");
  console.log("   Login: demo@callscribe.ai / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
