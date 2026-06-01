import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://dumdum-ai.vercel.app';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/upgrade?success=1`,
    cancel_url: `${origin}/upgrade?canceled=1`,
    client_reference_id: userId,
    metadata: { clerkUserId: userId },
    subscription_data: { metadata: { clerkUserId: userId } },
  });

  return NextResponse.json({ url: session.url });
}
