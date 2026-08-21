/**
 * Stripe Integration Layer
 *
 * Currently running in STUB MODE — no real Stripe calls are made.
 *
 * To connect real Stripe:
 *   1. Set STRIPE_SECRET_KEY in .env.local (use sk_test_... for test mode)
 *   2. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 *   3. Create a Product + Price in your Stripe Dashboard (Test mode)
 *   4. Set STRIPE_PRO_PRICE_ID to your Price ID (price_...)
 *   5. Uncomment the real Stripe calls below and remove the stubs
 *   6. Set up a webhook: stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_stub_key",
  {
    apiVersion: "2023-10-16" as any, // fallback
    typescript: true,
  }
);

export interface CheckoutResult {
  url: string;
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string
): Promise<CheckoutResult> {
  if (!process.env.STRIPE_PRO_PRICE_ID) {
    throw new Error("Missing STRIPE_PRO_PRICE_ID environment variable.");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: userEmail,
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/settings/billing?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?checkout=cancelled`,
    client_reference_id: userId,
    metadata: { userId },
  });

  return { url: session.url! };
}

export async function createBillingPortalSession(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
  });

  return session.url;
}
