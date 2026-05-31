import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/chat');

  return (
    <main className="min-h-screen bg-[#f8f8f6] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">

        {/* 로고 */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <span className="text-amber-600 text-lg font-bold font-mono">AI</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">폐급 AI</h1>
            <p className="text-xs text-stone-400 font-mono">education terminal v1.0</p>
          </div>
        </div>

        {/* 헤드라인 */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-stone-800 leading-tight tracking-tight">
            설명할 수 있어야<br />진짜 이해한 것이다
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            AI를 가르치면서 내 이해를 검증한다.<br />
            설명이 부족하면 AI가 절대 이해하지 못한다.
          </p>
        </div>

        {/* 특징 3가지 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '🧠', title: 'AI가 학생', desc: 'AI가 틀리게 이해한다. 네가 수정해야 한다.' },
            { icon: '📊', title: '사고 추적', desc: 'AI의 오해와 혼란이 실시간으로 보인다.' },
            { icon: '⚡', title: '3가지 성격', desc: '싸가지, 삐딱이, 시험관으로 난이도 조절.' },
          ].map(f => (
            <div key={f.title} className="p-4 rounded-xl bg-white border border-stone-200 text-left">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-sm font-semibold text-stone-700">{f.title}</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <SignInButton mode="modal">
            <button className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium transition-colors duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 시작하기 — 무료
            </button>
          </SignInButton>
          <p className="text-xs text-stone-400 font-mono">무료 플랜 · 하루 10턴 · 신용카드 불필요</p>
        </div>

      </div>
    </main>
  );
}
