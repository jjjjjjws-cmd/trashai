export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export type ConceptStatus = 'understood' | 'confused' | 'misunderstood';

export interface Concept {
  id: string;
  term: string;
  status: ConceptStatus;
  description: string;
}

export interface AIUnderstandingState {
  understood: Concept[];
  confused: Concept[];
  misunderstood: Concept[];
  currentReasoning: string;
  comprehensionScore: number;
}

export interface ChatRoom {
  id: string;
  title: string;
  topic: TopicKey;
  icon: string;
  lastMessage?: string;
  messageCount: number;
  isActive?: boolean;
}

export type TopicKey = 'stock' | 'coding' | 'physics' | 'economics' | 'new';

export interface AIResponseResult {
  message: string;
  reasoning: string;
  conceptUpdates: ConceptUpdate[];
  delay: number;
}

export interface ConceptUpdate {
  term: string;
  status: ConceptStatus;
  description: string;
}
