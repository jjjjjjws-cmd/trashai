'use client';

import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

export default function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isAI = message.role === 'ai';

  return (
    <div className={`flex gap-4 group ${isAI ? 'flex-row' : 'flex-row-reverse'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className="flex-shrink-0 mt-1">
        {isAI ? (
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
            <span className="text-amber-600 text-xs font-bold font-mono">AI</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
            <span className="text-stone-500 text-xs font-mono">나</span>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={`flex items-center gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider ${isAI ? 'text-amber-600' : 'text-stone-400'}`}>
            {isAI ? '폐급 AI' : '선생님'}
          </span>
          <span className="text-[10px] text-stone-300 font-mono" suppressHydrationWarning>
            {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isAI
            ? 'bg-white border border-stone-200 text-stone-700 rounded-tl-sm shadow-sm'
            : 'bg-amber-50 border border-amber-200 text-stone-700 rounded-tr-sm'
          }
        `}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {isAI && isLatest && (
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-stone-400 font-mono">이해 패널 업데이트됨</span>
          </div>
        )}
      </div>
    </div>
  );
}
