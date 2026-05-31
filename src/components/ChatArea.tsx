'use client';

import { Message, ChatRoom } from '@/lib/types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { useEffect, useRef, useState } from 'react';

type Character = 'default' | '싸가지' | '삐딱이' | '시험관';

const CHARACTER_CONFIG: Record<Character, { label: string; activeColor: string; desc: string }> = {
  default: { label: '기본',   activeColor: 'bg-stone-100 text-stone-700 border-stone-300',     desc: '순수하게 모르는 AI' },
  싸가지:  { label: '싸가지', activeColor: 'bg-red-50 text-red-600 border-red-300',             desc: '설명 부족하면 바로 지적' },
  삐딱이:  { label: '삐딱이', activeColor: 'bg-purple-50 text-purple-600 border-purple-300',    desc: '이해해도 의미를 의심' },
  시험관:  { label: '시험관', activeColor: 'bg-blue-50 text-blue-600 border-blue-300',          desc: '설명 듣자마자 문제 냄' },
};

const PRO_CHARACTERS: Character[] = ['싸가지', '삐딱이', '시험관'];

interface ChatAreaProps {
  room: ChatRoom;
  messages: Message[];
  isTyping: boolean;
  thinkingText: string;
  isPro: boolean;
  onSendMessage: (content: string, character: Character) => void;
  onToggleSidebar: () => void;
  onToggleStatus: () => void;
}

export default function ChatArea({ room, messages, isTyping, thinkingText, isPro, onSendMessage, onToggleSidebar, onToggleStatus }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [character, setCharacter] = useState<Character>('default');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    onSendMessage(trimmed, character);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  }

  const showEmpty = messages.length === 0 && !isTyping;

  return (
    <div className="flex flex-col h-full bg-[#f8f8f6] min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-800">{room.title}</h2>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-600">교육 중</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">{messages.length}턴 진행 · AI가 배우고 있어요</p>
          </div>
        </div>
        <button onClick={onToggleStatus} className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs text-stone-500 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-mono text-[10px]">이해 상태</span>
        </button>
      </div>

      {/* Character selector */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 bg-white">
        <span className="text-[10px] font-mono text-stone-400 mr-1">AI 성격</span>
        {(Object.keys(CHARACTER_CONFIG) as Character[]).map(c => {
          const isLocked = PRO_CHARACTERS.includes(c) && !isPro;
          return (
            <button
              key={c}
              onClick={() => {
                if (isLocked) return;
                setCharacter(c);
              }}
              title={isLocked ? '프로 전용 기능입니다' : undefined}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 relative
                ${isLocked
                  ? 'bg-transparent text-stone-300 border-transparent cursor-not-allowed'
                  : character === c
                    ? CHARACTER_CONFIG[c].activeColor
                    : 'bg-transparent text-stone-400 border-transparent hover:border-stone-200 hover:text-stone-600'
                }`}
            >
              {CHARACTER_CONFIG[c].label}
              {isLocked && <span className="ml-1 text-[9px]">🔒</span>}
            </button>
          );
        })}
        <span className="text-[10px] font-mono text-stone-300 ml-1">{CHARACTER_CONFIG[character].desc}</span>
        {!isPro && (
          <span className="ml-auto text-[10px] font-mono text-amber-500 cursor-pointer hover:text-amber-600">
            프로로 업그레이드
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <span className="text-amber-600 text-lg font-bold font-mono">?</span>
            </div>
            <div className="text-center max-w-sm">
              <p className="text-stone-600 text-sm font-medium">AI가 기다리고 있어요</p>
              <p className="text-stone-400 text-xs font-mono mt-1.5 leading-relaxed">
                개념을 설명해 주면 AI가 이해하려고 노력할 거예요.<br />
                잘못 이해할 수도 있어요. 계속 가르쳐 주세요.
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatMessage key={msg.id} message={msg} isLatest={idx === messages.length - 1 && msg.role === 'ai'} />
        ))}
        {isTyping && <TypingIndicator thinkingText={thinkingText} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-stone-200 bg-white">
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-[10px] font-mono text-stone-300">↵ 전송</span>
          <span className="text-[10px] font-mono text-stone-300">⇧↵ 줄바꿈</span>
          <div className="flex-1" />
          {isTyping && <span className="text-[10px] font-mono text-amber-500 animate-pulse">AI 응답 중...</span>}
        </div>
        <div className={`flex items-end gap-3 p-3 rounded-xl bg-stone-50 border transition-colors duration-200 ${isTyping ? 'border-stone-200' : 'border-stone-200 focus-within:border-amber-400'}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            rows={1}
            placeholder={isTyping ? 'AI가 생각하는 중...' : `${room.title}에 대해 설명해 주세요...`}
            className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 resize-none outline-none leading-relaxed disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${input.trim() && !isTyping ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-300 font-mono mt-2">AI의 오해를 수정하면서 당신의 이해도 깊어집니다</p>
      </div>
    </div>
  );
}
