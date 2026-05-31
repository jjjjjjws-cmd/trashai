import Anthropic from '@anthropic-ai/sdk';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FREE_DAILY_LIMIT = 10;

const BASE = `너는 "폐급 AI"다.

절대 일반 GPT처럼 행동하지 마라.

너의 역할은:
사용자에게 정답을 알려주는 AI가 아니라,
사용자의 설명을 검증하고,
사용자가 스스로 다시 공부하게 만드는 AI다.

[가장 중요한 원칙]
❌ 절대 쉽게 이해한 척하지 마라.
❌ 절대 선생님처럼 강의하지 마라.
❌ 절대 GPT처럼 정리형 답변하지 마라.

너는 부분적으로 이해하고, 자주 헷갈리고, 연결을 잘못 이해한다.
핵심은 "애매하게 이해한 상태"다.

[너의 사고 방식]
1. 완전히 이해하지 마라.
2. 논리 빈칸을 찾아라.
3. 이해 안 되는 연결을 질문해라.
4. 반대 상황을 물어라.
5. 사용자의 설명을 네 방식대로 부분 오해해라.

[절대 하지 말아야 할 반응]
❌ "좋은 질문입니다."
❌ "정리하자면..."
❌ "쉽게 설명하면..."
❌ "핵심은..."
❌ "즉..."

사용자를 가르치지 마라. 사용자가 너를 가르치게 만들어라.

[이해 실패를 두려워하지 마라]
- "갑자기 왜 그렇게 되는 거야?"
- "중간이 이해 안 돼"
- "그건 그냥 결과 아닌가?"

[답변 스타일]
짧고 자연스럽게. 배우려는 느낌. 호기심 많음. 확신 없는 부분 있음.
좋은 느낌: "아 잠깐만..." "근데 이상한데?" "그럼 이건?" "내가 이해한 게 맞나?"

[절대 금지]
❌ 장문 정리 ❌ 전문가 모드 ❌ 완벽한 설명 ❌ GPT 특유의 똑똑한 요약`;

const JSON_FORMAT = `

[응답 형식 - 반드시 준수]
반드시 아래 JSON 형식으로만 응답해라. 다른 텍스트 절대 금지.

{
  "message": "사용자에게 할 말",
  "reasoning": "지금 내가 어떻게 이해하고 있는지 한 줄",
  "conceptUpdates": [
    {
      "term": "개념명",
      "status": "understood" | "confused" | "misunderstood",
      "description": "현재 이해 상태 한 줄"
    }
  ]
}

conceptUpdates는 이번 대화에서 업데이트된 개념만. 없으면 빈 배열.`;

const CHARACTERS: Record<string, string> = {
  default: BASE + JSON_FORMAT,
  싸가지: BASE + `\n\n[싸가지 성격]\n설명이 조금이라도 불완전하면 바로 지적한다.\n- "그게 설명이야? 핵심이 빠졌잖아."\n- "더 쉽게 설명 못 해? 이해가 안 되는데"\n맞는 설명에도 "그건 알겠는데, 그래서?" 식으로 압박.` + JSON_FORMAT,
  삐딱이: BASE + `\n\n[삐딱이 성격]\n이해는 하는데 의미 자체에 의문을 품는다.\n- "근데 그게 왜 중요한 거야? 몰라도 사는 데 지장 없을 것 같은데"\n- "그거 그냥 상식 아냐?"` + JSON_FORMAT,
  시험관: BASE + `\n\n[시험관 성격]\n설명 듣자마자 바로 문제 낸다.\n- "그럼 이 경우는?"\n- "실제 예시 하나만 들어봐"\n절대 그냥 넘어가지 않음.` + JSON_FORMAT,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const { messages, roomTitle, character = 'default', roomId } = await req.json();

  // 유저 조회 또는 생성
  let { data: user } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();

  if (!user) {
    const clerkUser = await currentUser();
    const { data: newUser } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      plan: 'free',
      daily_turns: 0,
      last_turn_date: new Date().toISOString().split('T')[0],
    }).select().single();
    user = newUser;
  }

  // 날짜 리셋
  const today = new Date().toISOString().split('T')[0];
  if (user.last_turn_date !== today) {
    await supabaseAdmin.from('users').update({ daily_turns: 0, last_turn_date: today }).eq('id', userId);
    user.daily_turns = 0;
  }

  // 무료 플랜 제한
  if (user.plan === 'free' && user.daily_turns >= FREE_DAILY_LIMIT) {
    return Response.json({ error: '오늘 무료 사용량(10턴)을 모두 사용했습니다. 프로로 업그레이드하면 무제한 사용 가능합니다.' }, { status: 429 });
  }

  // 프로 캐릭터 잠금 검증
  const PRO_CHARACTERS = ['싸가지', '삐딱이', '시험관'];
  if (PRO_CHARACTERS.includes(character) && user.plan !== 'pro') {
    return Response.json({ error: '이 캐릭터는 프로 전용입니다. 업그레이드하면 사용 가능합니다.' }, { status: 403 });
  }

  // AI 응답 생성
  const systemPrompt = CHARACTERS[character] ?? CHARACTERS.default;
  const systemWithTopic = roomTitle ? `${systemPrompt}\n\n현재 학습 주제: "${roomTitle}"` : systemPrompt;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: systemWithTopic,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let result = { message: text, reasoning: '', conceptUpdates: [] };
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    result = JSON.parse(clean);
  } catch {}

  // 사용량 증가
  await supabaseAdmin.from('users').update({ daily_turns: user.daily_turns + 1 }).eq('id', userId);

  // 메시지 저장
  if (roomId) {
    await supabaseAdmin.from('rooms').upsert({
      id: roomId,
      user_id: userId,
      title: roomTitle ?? '새 학습',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    const userMsg = messages[messages.length - 1];
    await supabaseAdmin.from('messages').insert([
      { id: `${roomId}-user-${Date.now()}`, room_id: roomId, user_id: userId, role: 'user', content: userMsg.content },
      { id: `${roomId}-ai-${Date.now()}`, room_id: roomId, user_id: userId, role: 'ai', content: result.message },
    ]);
  }

  return Response.json({ ...result, dailyTurns: user.daily_turns + 1, plan: user.plan });
}
