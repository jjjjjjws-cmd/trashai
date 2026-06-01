import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ⚠️⚠️ 가장 중요: users 테이블에서 Clerk user id 를 담고 있는 "컬럼 이름".
// Supabase 대시보드 > Table Editor > users 에서 직접 확인하고 맞춰주세요.
// 흔한 값: 'clerk_id', 'id', 'user_id'
const USER_ID_COLUMN = 'clerk_id';

async function setPlan(clerkUserId: string, plan: 'free' | 'pro') {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ plan })
    .eq(USER_ID_COLUMN, clerkUserId);
  if (error) console.error('plan 업데이트 실패:', error);
  else console.log(`plan 업데이트 완료: ${clerkUserId} → ${plan}`);
}

export async function POST(req: Request) {
  const body = await req.text(); // 서명 검증에는 raw body가 필요 (JSON 파싱 X)
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error('webhook 서명 검증 실패:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    // 결제 성공 → pro 로 승급
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId =
        session.client_reference_id ?? session.metadata?.clerkUserId;
      if (clerkUserId) await setPlan(clerkUserId, 'pro');
      break;
    }
    // 구독 취소/만료 → 다시 free 로 (구독 모드일 때만 의미 있음)
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const clerkUserId = sub.metadata?.clerkUserId;
      if (clerkUserId) await setPlan(clerkUserId, 'free');
      break;
    }
  }

  return NextResponse.json({ received: true });
}
