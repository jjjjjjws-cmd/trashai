import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  // 로그인한 Clerk 유저 확인
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 결제 후 돌아올 주소 (요청 origin 우선)
  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://dumdum-ai.vercel.app';

  const session = await stripe.checkout.sessions.create({
    // ▼▼▼ 한 번만 결제하는 방식으로 바꾸려면 'subscription' → 'payment' 로 변경하고,
    //     아래 subscription_data 줄을 통째로 지우면 됩니다.
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/upgrade?success=1`,
    cancel_url: `${origin}/upgrade?canceled=1`,
    client_reference_id: userId, // webhook에서 누가 결제했는지 식별
    metadata: { clerkUserId: userId },
    subscription_data: { metadata: { clerkUserId: userId } }, // ← payment 모드면 삭제
  });

  return NextResponse.json({ url: session.url });
}
