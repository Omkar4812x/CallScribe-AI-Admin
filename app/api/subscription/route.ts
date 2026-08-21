import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { subscription: true },
  });

  return NextResponse.json({
    subscriptionStatus: user?.subscription?.status ?? "free",
    stripeCustomerId: user?.subscription?.stripeCustomerId ?? null,
  });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { intent } = await req.json(); // "upgrade" | "manage"

  const user = session.user as any;

  if (intent === "manage") {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });
    const customerId = dbUser?.subscription?.stripeCustomerId;
    if (!customerId) {
       return NextResponse.json({ error: "No customer ID" }, { status: 400 });
    }
    const { createBillingPortalSession } = await import("@/lib/stripe");
    const portalUrl = await createBillingPortalSession(customerId);
    return NextResponse.json({ url: portalUrl });
  } else {
    // default upgrade
    const result = await createCheckoutSession(user.id, user.email ?? "");
    return NextResponse.json({ url: result.url });
  }
}
