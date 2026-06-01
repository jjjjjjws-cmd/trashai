import { createClient } from '@supabase/supabase-js';

// 서버 전용 Supabase 클라이언트. service role key를 쓰므로 RLS를 우회합니다.
// ⚠️ 절대 브라우저(클라이언트 컴포넌트)에서 import 하지 마세요. webhook 등 서버에서만.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
