'use client';

interface TypingIndicatorProps {
  thinkingText?: string;
}

export default function TypingIndicator({ thinkingText }: TypingIndicatorProps) {
  return (
    <div className="flex gap-4 animate-in fade-in duration-200">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <span className="text-amber-600 text-xs font-bold font-mono">AI</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 items-start">
        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600">폐급 AI</span>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
          </div>
          {thinkingText && (
            <span className="text-xs text-stone-400 font-mono italic">{thinkingText}</span>
          )}
        </div>
      </div>
    </div>
  );
}
