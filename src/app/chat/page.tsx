'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import AIStatusPanel from '@/components/AIStatusPanel';
import { Message, ChatRoom, AIUnderstandingState, Concept, ConceptUpdate } from '@/lib/types';
import { getThinkingMessage } from '@/lib/aiEngine';

const INITIAL_UNDERSTANDING: AIUnderstandingState = {
  understood: [],
  confused: [],
  misunderstood: [],
  currentReasoning: '',
  comprehensionScore: 0,
};

function calcScore(state: AIUnderstandingState): number {
  const total = state.understood.length + state.confused.length + state.misunderstood.length;
  if (total === 0) return 0;
  return Math.round((state.understood.length * 100 + state.confused.length * 30) / total);
}

function applyConceptUpdates(
  current: AIUnderstandingState,
  updates: ConceptUpdate[],
  reasoning: string
): AIUnderstandingState {
  const next = {
    understood: [...current.understood],
    confused: [...current.confused],
    misunderstood: [...current.misunderstood],
    currentReasoning: reasoning,
    comprehensionScore: 0,
  };

  for (const update of updates) {
    const id = update.term.toLowerCase().replace(/[\s/]/g, '_');
    const concept: Concept = { id, term: update.term, status: update.status, description: update.description };
    next.understood = next.understood.filter(c => c.id !== id);
    next.confused = next.confused.filter(c => c.id !== id);
    next.misunderstood = next.misunderstood.filter(c => c.id !== id);
    if (update.status === 'understood') next.understood.push(concept);
    else if (update.status === 'confused') next.confused.push(concept);
    else next.misunderstood.push(concept);
  }

  next.comprehensionScore = calcScore(next);
  return next;
}

let roomCounter = 0;

export default function Home() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});
  const [historyByRoom, setHistoryByRoom] = useState<Record<string, Array<{ role: 'user' | 'assistant'; content: string }>>>({});
  const [understandingByRoom, setUnderstandingByRoom] = useState<Record<string, AIUnderstandingState>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { if (d.plan === 'pro') setIsPro(true); })
      .catch(() => {});
  }, []);

  const activeRoom = rooms.find(r => r.id === activeRoomId) ?? null;
  const messages = activeRoomId ? (messagesByRoom[activeRoomId] ?? []) : [];
  const understanding = activeRoomId ? (understandingByRoom[activeRoomId] ?? INITIAL_UNDERSTANDING) : INITIAL_UNDERSTANDING;

  const selectRoom = useCallback((room: ChatRoom) => {
    setActiveRoomId(room.id);
    setSidebarOpen(false);
  }, []);

  const sendMessage = useCallback(async (content: string, character: string = 'default') => {
    const roomId = activeRoomId;
    if (!roomId) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const userMsg: Message = {
      id: `${roomId}-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessagesByRoom(prev => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), userMsg] }));
    setRooms(prev => prev.map(r => r.id === roomId
      ? { ...r, lastMessage: content.slice(0, 40), messageCount: r.messageCount + 1 }
      : r
    ));

    setIsTyping(true);
    setThinkingText(getThinkingMessage());

    // 대화 히스토리 구성
    const prevHistory = historyByRoom[roomId] ?? [];
    const newHistory = [...prevHistory, { role: 'user' as const, content }];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, roomTitle: room.title, character, roomId }),
      });

      const result = await res.json();
      if (result.plan === 'pro') setIsPro(true);

      const aiMsg: Message = {
        id: `${roomId}-ai-${Date.now()}`,
        role: 'ai',
        content: result.message,
        timestamp: new Date(),
      };

      setMessagesByRoom(prev => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), aiMsg] }));

      // 히스토리 업데이트
      setHistoryByRoom(prev => ({
        ...prev,
        [roomId]: [...newHistory, { role: 'assistant' as const, content: result.message }],
      }));

      if (result.conceptUpdates?.length > 0 || result.reasoning) {
        setUnderstandingByRoom(prev => ({
          ...prev,
          [roomId]: applyConceptUpdates(
            prev[roomId] ?? INITIAL_UNDERSTANDING,
            result.conceptUpdates ?? [],
            result.reasoning ?? ''
          ),
        }));
      }
    } catch {
      const errMsg: Message = {
        id: `${roomId}-err-${Date.now()}`,
        role: 'ai',
        content: 'API 오류가 발생했어요. .env.local에 ANTHROPIC_API_KEY가 설정되어 있는지 확인해 주세요.',
        timestamp: new Date(),
      };
      setMessagesByRoom(prev => ({ ...prev, [roomId]: [...(prev[roomId] ?? []), errMsg] }));
    }

    setIsTyping(false);
    setThinkingText('');
  }, [activeRoomId, rooms, historyByRoom]);

  function createNewRoom(title: string) {
    roomCounter++;
    const id = String(roomCounter + Date.now());
    const newRoom: ChatRoom = {
      id,
      title: title || `새 학습 #${roomCounter}`,
      topic: 'new',
      icon: '✦',
      messageCount: 0,
    };

    const greeting = `"${newRoom.title}"에 대해 가르쳐 주신다고요?\n\n솔직히 저는 그게 뭔지 전혀 몰라요. 처음부터 설명해 주시면 배워볼게요.`;
    const greetMsg: Message = {
      id: `${id}-greeting`,
      role: 'ai',
      content: greeting,
      timestamp: new Date(),
    };

    setRooms(prev => [...prev, newRoom]);
    setMessagesByRoom(prev => ({ ...prev, [id]: [greetMsg] }));
    setActiveRoomId(id);
    setSidebarOpen(false);
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#f8f8f6]">
      <Sidebar
        rooms={rooms}
        activeRoomId={activeRoomId ?? ''}
        onSelectRoom={selectRoom}
        onNewRoom={createNewRoom}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 overflow-hidden">
        {activeRoom ? (
          <ChatArea
            room={activeRoom}
            messages={messages}
            isTyping={isTyping}
            thinkingText={thinkingText}
            isPro={isPro}
            onSendMessage={sendMessage}
            onToggleSidebar={() => setSidebarOpen(true)}
            onToggleStatus={() => setStatusOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <span className="text-amber-600 text-lg font-bold font-mono">AI</span>
            </div>
            <div className="text-center">
              <p className="text-stone-600 text-sm font-medium">왼쪽에서 새 학습을 시작하세요</p>
              <p className="text-stone-400 text-xs font-mono mt-1">주제를 입력하면 AI가 배우기 시작합니다</p>
            </div>
          </div>
        )}
      </main>

      <AIStatusPanel
        state={understanding}
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
      />
    </div>
  );
}
