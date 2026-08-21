import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateCallInsights } from "@/lib/ai";
import { z } from "zod";

const generateSchema = z.object({
  rawTranscript: z.string().min(10, "Transcript is too short"),
});

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const insights = await generateCallInsights(parsed.data.rawTranscript);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("[Generate API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
