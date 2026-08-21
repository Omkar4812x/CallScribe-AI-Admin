import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCallNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawTranscript: z.string().min(10, "Transcript is required"),
  aiSummary: z.string().optional(),
  aiActionItems: z.string().optional(), // JSON string
  aiFollowUpEmail: z.string().optional(),
  clientId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const callNotes = await prisma.callNote.findMany({
    where: {
      userId: (session.user as any).id,
      ...(clientId ? { clientId } : {}),
    },
    include: {
      client: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ callNotes });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Basic Rate Limiting: Max 5 notes per minute per user to prevent abuse
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentNotesCount = await prisma.callNote.count({
      where: {
        userId: (session.user as any).id,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentNotesCount >= 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before creating more notes." },
        { status: 429 }
      );
    }

    const userDb = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { 
        subscription: true,
        _count: { select: { callNotes: true } }
      },
    });

    if (userDb?.subscription?.status === "free" && (userDb?._count.callNotes ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Free plan limit reached (5 notes max). Please upgrade to Pro in Settings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCallNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const callNote = await prisma.callNote.create({
      data: {
        ...parsed.data,
        userId: (session.user as any).id,
      },
      include: {
        client: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ callNote }, { status: 201 });
  } catch (error) {
    console.error("[CallNotes POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
