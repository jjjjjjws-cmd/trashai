import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ plan: 'free' });

  const { data } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  return Response.json({ plan: data?.plan ?? 'free' });
}
