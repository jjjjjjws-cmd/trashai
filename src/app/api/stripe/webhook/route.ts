import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ⚠️ users 테이블에서 Clerk user id 가 들어가는 "컬럼 이름". 실제 컬럼명에 맞추세요.
const USER_ID_COLUMN = 'id';

async function setPlan(clerkUserId: string, plan: 'free' | 'pro') {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ plan })
    .eq(USER_ID_COLUMN, clerkUserId);
  if (error) console.error('plan 업데이트 실패:', error);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      const id = s.client_reference_id ?? s.metadata?.clerkUserId;
      if (id) await setPlan(id, 'pro');
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const id = sub.metadata?.clerkUserId;
      if (id) await setPlan(id, 'free');
      break;
    }
  }

  return NextResponse.json({ received: true });
}
