'use client';

import { AIUnderstandingState, Concept, ConceptStatus } from '@/lib/types';

interface AIStatusPanelProps {
  state: AIUnderstandingState;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<ConceptStatus, { color: string; bgColor: string; borderColor: string; dot: string; label: string; icon: string }> = {
  understood:    { color: 'text-emerald-600', bgColor: 'bg-emerald-50',  borderColor: 'border-emerald-200', dot: 'bg-emerald-500', label: '이해함',  icon: '✔' },
  confused:      { color: 'text-amber-600',   bgColor: 'bg-amber-50',    borderColor: 'border-amber-200',   dot: 'bg-amber-500',   label: '헷갈림',  icon: '?' },
  misunderstood: { color: 'text-red-500',     bgColor: 'bg-red-50',      borderColor: 'border-red-200',     dot: 'bg-red-500',     label: '오해 중', icon: '✗' },
};

function ConceptCard({ concept }: { concept: Concept }) {
  const config = STATUS_CONFIG[concept.status];
  return (
    <div className={`px-3 py-2.5 rounded-lg border ${config.bgColor} ${config.borderColor} animate-in fade-in slide-in-from-left-1 duration-300`}>
      <div className="flex items-start gap-2">
        <span className={`text-[11px] font-bold mt-0.5 flex-shrink-0 ${config.color}`}>{config.icon}</span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${config.color}`}>{concept.term}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{concept.description}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, concepts, status }: { title: string; concepts: Concept[]; status: ConceptStatus }) {
  const config = STATUS_CONFIG[status];
  if (concepts.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
        <span className="text-[11px] text-neutral-400">{title}</span>
        <div className="flex-1 h-px bg-neutral-200" />
        <span className={`text-[11px] ${config.color}`}>{concepts.length}</span>
      </div>
      <div className="space-y-1.5 pl-3.5">
        {concepts.map(concept => <ConceptCard key={concept.id} concept={concept} />)}
      </div>
    </div>
  );
}

export default function AIStatusPanel({ state, isOpen, onClose }: AIStatusPanelProps) {
  const totalConcepts = state.understood.length + state.confused.length + state.misunderstood.length;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 xl:hidden" onClick={onClose} />}

      <aside className={`
        fixed xl:static inset-y-0 right-0 z-50
        w-80 flex flex-col
        bg-white border-l border-neutral-200
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="px-4 py-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-neutral-700 tracking-tight">AI 이해 상태</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {totalConcepts === 0 ? '학습된 개념 없음' : `${totalConcepts}개 개념 추적 중`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-400">이해도</span>
                <span className="text-sm font-bold text-[#5b5bd6]">{state.comprehensionScore}%</span>
              </div>
              <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5b5bd6] rounded-full transition-all duration-700 ease-out" style={{ width: `${state.comprehensionScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {state.currentReasoning && (
          <div className="mx-3 mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5b5bd6] animate-pulse" />
              <span className="text-[10px] text-neutral-400">AI 현재 추론</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">{state.currentReasoning}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-5 mt-2">
          {totalConcepts === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                <span className="text-neutral-400 text-lg">?</span>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500">아직 배운 개념이 없어요</p>
                <p className="text-[10px] text-neutral-400 mt-1">무언가를 가르쳐 보세요</p>
              </div>
            </div>
          ) : (
            <>
              <Section title="이해함" concepts={state.understood} status="understood" />
              <Section title="헷갈리는 중" concepts={state.confused} status="confused" />
              <Section title="오해하고 있음" concepts={state.misunderstood} status="misunderstood" />
            </>
          )}
        </div>

        <div className="p-3 border-t border-neutral-100">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '이해', count: state.understood.length,    color: 'text-emerald-600', bg: 'bg-emerald-50'  },
              { label: '헷갈림', count: state.confused.length,    color: 'text-amber-600',   bg: 'bg-amber-50'    },
              { label: '오해',  count: state.misunderstood.length, color: 'text-red-500',     bg: 'bg-red-50'      },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-lg p-2 text-center`}>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.count}</p>
                <p className={`text-[10px] ${stat.color} opacity-70`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
