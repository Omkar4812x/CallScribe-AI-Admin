import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(50),
  color: z.string().optional().default("#6366f1"),
});

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { userId: (session.user as any).id },
    include: { _count: { select: { callNotes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        ...parsed.data,
        userId: (session.user as any).id,
      },
      include: { _count: { select: { callNotes: true } } },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("[Clients POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
