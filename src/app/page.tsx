import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const features = [
  {
    title: 'AI는 학생',
    desc: '일부러 멍청합니다. 당신이 가르쳐야 이해해요.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 10 12 5 2 10l10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: '이해도 추적',
    desc: '뭘 알아듣고 헷갈리는지 실시간으로.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: '성격 선택',
    desc: '싸가지·삐딱이·시험관. 더 깐깐하게.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/chat');

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">

        <div className="inline-flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-sm font-medium">P</div>
          <span className="text-base font-medium text-neutral-900">폐급 AI</span>
        </div>

        <h1 className="text-4xl font-medium leading-tight tracking-tight text-neutral-900">
          가르치면서<br />배운다
        </h1>
        <p className="mt-4 mb-6 mx-auto max-w-sm text-[15px] leading-relaxed text-neutral-500">
          멍청한 AI에게 개념을 설명해 보세요. 막히는 지점이 곧 당신이 모르는 부분입니다.
        </p>

        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            구글로 무료 시작
          </button>
        </SignInButton>
        <p className="mt-3 text-xs text-neutral-400">카드 등록 없이 · 하루 10턴 무료</p>

        <div className="mt-9 mx-auto max-w-md text-left bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-200">
            <span className="text-[13px] font-medium text-neutral-900">광합성</span>
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">교육 중</span>
          </div>
          <div className="px-3.5 py-4 space-y-3">
            <div className="flex gap-2.5">
              <div className="w-6 h-6 shrink-0 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-medium">AI</div>
              <div className="text-[13px] leading-relaxed text-neutral-900 bg-neutral-100 px-3 py-2 rounded-xl">광합성이요? 식물이 햇빛을 먹는 거 아니에요?</div>
            </div>
            <div className="flex justify-end">
              <div className="text-[13px] leading-relaxed text-white bg-neutral-900 px-3 py-2 rounded-xl max-w-[78%]">먹는 게 아니라, 빛 에너지로 양분을 만드는 거야.</div>
            </div>
            <div className="flex gap-2.5">
              <div className="w-6 h-6 shrink-0 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-medium">AI</div>
              <div className="text-[13px] leading-relaxed text-neutral-900 bg-neutral-100 px-3 py-2 rounded-xl">아하… 햇빛은 재료가 아니라 에너지원이군요!</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-t border-neutral-200 bg-neutral-50">
            <span className="text-[11px] text-neutral-400 shrink-0">이해도</span>
            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-neutral-900" style={{ width: '60%' }} />
            </div>
            <span className="text-xs font-medium text-neutral-900 shrink-0">60%</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {features.map(f => (
            <div key={f.title} className="p-4 rounded-xl bg-white border border-neutral-200 text-left">
              <div className="text-neutral-900">{f.icon}</div>
              <p className="mt-2.5 text-[13px] font-medium text-neutral-900">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-neutral-400">폐급 AI · 가르치며 배우는 학습 도구</p>

      </div>
    </main>
  );
}
