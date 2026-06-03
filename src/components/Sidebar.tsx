'use client';

import { ChatRoom } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';

interface SidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string;
  onSelectRoom: (room: ChatRoom) => void;
  onNewRoom: (title: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ rooms, activeRoomId, onSelectRoom, onNewRoom, isOpen, onClose }: SidebarProps) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function handleNewRoomSubmit() {
    const title = newTitle.trim();
    if (!title) { setCreating(false); setNewTitle(''); return; }
    onNewRoom(title);
    setCreating(false);
    setNewTitle('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleNewRoomSubmit();
    if (e.key === 'Escape') { setCreating(false); setNewTitle(''); }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col
        bg-white border-r border-neutral-200
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-4 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5b5bd6] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">P</span>
            </div>
            <h1 className="text-sm font-semibold text-neutral-900 tracking-tight">폐급 AI</h1>
          </div>
        </div>

        <div className="p-3 border-b border-neutral-100">
          {creating ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#5b5bd6] bg-[#eeedfe]">
              <input
                ref={inputRef}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleNewRoomSubmit}
                placeholder="주제 입력 후 Enter..."
                className="flex-1 bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none font-medium"
              />
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#5b5bd6] hover:bg-[#4d4dc6] text-white text-sm font-medium transition-colors duration-200 group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              새 학습 시작
            </button>
          )}
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] text-neutral-400">학습 세션</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {rooms.map((room) => {
            const isActive = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-start gap-3 group ${isActive ? 'bg-neutral-100 border border-neutral-200' : 'hover:bg-neutral-50 border border-transparent'}`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-sm ${isActive ? 'bg-neutral-200' : 'bg-neutral-100'}`}>
                  {room.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-700'}`}>
                      {room.title}
                    </span>
                    {room.messageCount > 0 && (
                      <span className="text-[10px] text-neutral-400 flex-shrink-0">{room.messageCount}턴</span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5 leading-tight">{room.lastMessage}</p>
                  )}
                </div>
                {isActive && <div className="w-1 h-1 rounded-full bg-[#5b5bd6] flex-shrink-0 mt-2" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-2.5">
            <UserButton />
            <p className="text-[11px] text-neutral-400">AI 교육 세션 진행 중</p>
          </div>
        </div>
      </aside>
    </>
  );
}
