import { AIResponseResult, TopicKey } from './types';

interface ResponseBank {
  keywords: string[];
  responses: Array<{
    message: string;
    reasoning: string;
    conceptUpdates: Array<{ term: string; status: 'understood' | 'confused' | 'misunderstood'; description: string }>;
  }>;
}

const STOCK_RESPONSES: ResponseBank[] = [
  {
    keywords: ['거래량', '볼륨', 'volume'],
    responses: [
      {
        message: `거래량이요... 그게 주식이 거래된 '횟수'인 건가요, 아니면 '양'인 건가요? 둘 다 같은 말인가요?\n\n그리고 거래량이 많으면 좋은 건가요? 사람들이 많이 관심 갖는 거니까 좋은 것 같은데...`,
        reasoning: '거래량의 정의를 횟수와 양의 혼동으로 파악 중. 많을수록 좋다는 단순 긍정 논리 적용 중.',
        conceptUpdates: [{ term: '거래량', status: 'confused', description: '거래된 수량 개념 파악 중. 거래량 많음 = 무조건 좋음으로 단순화하는 중' }],
      },
      {
        message: `아 그래서 거래량이 없이 주가가 오르면 위험하다는 거잖아요. 근데 그게 왜 위험해요? 주가가 오르는 건 좋은 거 아닌가요? 거래량이 없어도 오르면 더 좋은 거 아닌가요?`,
        reasoning: '거래량과 주가 방향의 독립적 관계를 이해 못함. 주가 상승 = 항상 좋음이라는 단순 논리 유지 중.',
        conceptUpdates: [{ term: '거래량', status: 'misunderstood', description: '거래량 없이 상승 = 위험 신호라는 개념 역으로 이해 중' }],
      },
      {
        message: `이제 조금 이해됐어요. 거래량은 그 가격 움직임이 진짜인지 확인하는 거잖아요. 근데 그러면 거래량이 항상 많아야 한다는 건가요? 거래량이 평소 대비 5배면 무조건 좋은 신호인가요?`,
        reasoning: '거래량의 상대적 개념은 파악. 하지만 거래량 급증을 항상 긍정 신호로 해석하는 오류 발생.',
        conceptUpdates: [{ term: '거래량', status: 'confused', description: '거래량 상대적 비교 개념 파악. 단, 방향성(매수/매도)은 미파악' }],
      },
    ],
  },
  {
    keywords: ['이동평균', '평균선', '이평선', 'ma', '골든크로스', '데드크로스'],
    responses: [
      {
        message: `이동평균선이요... 그냥 주가를 평균 낸 거잖아요. 근데 5일선, 20일선, 60일선이 있다고 하던데 기간이 길수록 더 정확한 거 아닌가요? 데이터가 더 많으니까요.`,
        reasoning: '이평선 기간과 정확도를 단순 비례로 파악 중. 각 이평선의 다른 목적/역할 미파악.',
        conceptUpdates: [
          { term: '이동평균선', status: 'confused', description: '평균 개념은 이해. 단기/장기선의 다른 역할은 미파악' },
          { term: '골든크로스', status: 'confused', description: '아직 배우지 않은 개념' },
        ],
      },
      {
        message: `골든크로스가 단기선이 장기선 위로 올라가는 거라고 하셨는데... 그럼 이 신호가 나오면 항상 사야 하는 거 아닌가요? 왜 항상 통하지 않는다는 건지 모르겠어요. 신호가 맞으면 맞는 거 아닌가요?`,
        reasoning: '골든크로스 개념 파악. 하지만 기술적 지표의 확률적 특성 미이해. 100% 신뢰 불가능한 이유 미파악.',
        conceptUpdates: [
          { term: '골든크로스', status: 'misunderstood', description: '골든크로스 = 100% 매수 신호로 잘못 이해' },
          { term: '이동평균선', status: 'confused', description: '이평선이 후행 지표라는 개념 미파악' },
        ],
      },
    ],
  },
  {
    keywords: ['지지선', '저항선', '지지', '저항'],
    responses: [
      {
        message: `지지선이 주가가 내려가다가 멈추는 구간이라고요? 근데 그게 왜 거기서 멈춰요? 어떤 힘이 있는 것도 아니잖아요. 사람들이 약속이라도 한 건가요?`,
        reasoning: '지지/저항의 물리적 비유 이해. 하지만 심리적 합의에 의한 형성 원리 미파악.',
        conceptUpdates: [{ term: '지지선/저항선', status: 'confused', description: '선의 존재는 이해. 형성 원리(심리적 지점)는 미파악' }],
      },
    ],
  },
];

const CODING_RESPONSES: ResponseBank[] = [
  {
    keywords: ['재귀', 'recursive', 'recursion'],
    responses: [
      {
        message: `재귀요? 함수가 자기 자신을 부른다고요? 그러면 무한히 계속 자기를 부르는 거 아닌가요? 어떻게 멈춰요? 그냥 반복문 쓰면 더 간단한 것 같은데 왜 재귀를 써요?`,
        reasoning: '재귀의 무한 루프 위험성을 직관적으로 파악. 하지만 기저 조건(base case) 개념 미파악. 반복문과의 차이 미이해.',
        conceptUpdates: [{ term: '재귀', status: 'confused', description: '자기 참조 개념은 이해. 기저 조건 없이는 무한 루프라는 것만 인식' }],
      },
      {
        message: `기저 조건이 있어야 멈춘다는 건 알겠어요. 근데 팩토리얼 예시를 보면 5에서 시작해서 4, 3, 2, 1로 가잖아요. 그럼 결국 반복문이랑 똑같은 거 아닌가요? 왜 재귀가 더 우아하다는 건지 모르겠어요.`,
        reasoning: '기저 조건 이해. 팩토리얼 재귀 흐름 파악. 하지만 콜 스택의 의미와 분할정복 문제에서의 장점 미파악.',
        conceptUpdates: [
          { term: '재귀', status: 'confused', description: '기저 조건 개념 이해. 콜 스택 구조는 미파악' },
          { term: '콜 스택', status: 'confused', description: '아직 배우지 않은 개념' },
        ],
      },
      {
        message: `트리 구조에서 재귀가 왜 편한지는 이제 알겠어요. 근데 재귀를 쓰면 항상 메모리를 더 많이 써요? 그러면 항상 반복문이 더 좋은 거 아닌가요? 성능이 더 좋으면 항상 그걸 써야 하는 거 아닌가요?`,
        reasoning: '재귀의 스택 메모리 사용 이해. 하지만 가독성과 성능 트레이드오프 개념 미파악. 성능만이 유일한 기준이라고 오해.',
        conceptUpdates: [
          { term: '재귀', status: 'misunderstood', description: '스택 메모리 이슈 파악. 하지만 성능 = 항상 최우선이라고 잘못 이해' },
        ],
      },
    ],
  },
  {
    keywords: ['시간복잡도', 'o(n)', '빅오', 'big o', '복잡도'],
    responses: [
      {
        message: `시간복잡도가 O(n)이면 입력이 n개일 때 n번 연산한다는 거죠. 그럼 O(n²)는 항상 나쁜 거 아닌가요? 왜 O(n²) 알고리즘을 아직도 쓰는 데가 있어요?`,
        reasoning: '빅오 표기법 기본 이해. 하지만 상수 계수, 평균/최악 케이스, 실제 데이터 크기 맥락 미파악.',
        conceptUpdates: [
          { term: '시간복잡도', status: 'confused', description: '빅오 표기 기본 이해. n이 작을 때의 실용적 트레이드오프 미파악' },
        ],
      },
      {
        message: `O(log n)이 O(n)보다 빠르다는 건 알겠어요. 이진 탐색이 반으로 나눈다는 것도요. 근데 왜 반으로 나누면 log n이 돼요? log의 밑이 2인 게 왜 이진 탐색이랑 관련 있어요?`,
        reasoning: 'O(log n)의 상대적 속도 이해. 이진 탐색의 분할 방식 파악. 하지만 로그의 수학적 의미와 연결이 미흡.',
        conceptUpdates: [
          { term: '시간복잡도', status: 'confused', description: '빅오 비교 이해. 이진 탐색과 log n의 수학적 연결은 미파악' },
          { term: '이진탐색', status: 'confused', description: '반씩 나누는 방식 이해. 정렬 선행 조건 미파악' },
        ],
      },
    ],
  },
  {
    keywords: ['클래스', '객체', 'class', 'object', '인스턴스'],
    responses: [
      {
        message: `클래스가 설계도고 객체가 실체라는 건 알겠어요. 근데 왜 클래스를 써요? 그냥 함수로 다 하면 안 되나요? 코드가 더 길어지는 것 같은데...`,
        reasoning: '클래스/객체 비유 이해. 하지만 캡슐화, 재사용성, 상태 관리의 필요성 미파악.',
        conceptUpdates: [{ term: '클래스/객체', status: 'confused', description: '설계도-실체 비유 이해. 함수 대비 장점 미파악' }],
      },
    ],
  },
];

const PHYSICS_RESPONSES: ResponseBank[] = [
  {
    keywords: ['관성', '뉴턴', '운동'],
    responses: [
      {
        message: `관성이... 달리는 버스에서 급정거하면 앞으로 쏠리는 거잖아요. 근데 그게 '힘'인가요? 아무것도 밀지 않았는데 왜 앞으로 가는 건지 이해가 안 돼요.`,
        reasoning: '관성의 일상적 현상 연결은 가능. 하지만 관성이 힘이 아닌 물체의 성질이라는 핵심 개념 미파악.',
        conceptUpdates: [{ term: '관성', status: 'confused', description: '현상은 알고 있음. 관성이 힘인지 성질인지 혼동 중' }],
      },
      {
        message: `관성이 힘이 아니라 성질이라는 건 알겠어요. 근데 그럼 왜 무거운 물체가 관성이 더 커요? 질량이 많으면 관성이 크다는 게 왜 그런 거예요? 무게와 질량도 다른 거라고 하던데...`,
        reasoning: '관성 = 성질 이해. 하지만 관성과 질량의 관계(F=ma) 미파악. 무게와 질량의 차이 혼동.',
        conceptUpdates: [
          { term: '관성', status: 'misunderstood', description: '성질 개념 파악. 하지만 질량과의 관계는 잘못 이해 중' },
          { term: '질량 vs 무게', status: 'confused', description: '둘이 다르다는 것은 앎. 차이는 미파악' },
        ],
      },
    ],
  },
  {
    keywords: ['에너지', '운동에너지', '위치에너지', '보존'],
    responses: [
      {
        message: `에너지 보존 법칙이요... 에너지는 사라지지 않고 다른 형태로 바뀐다는 거잖아요. 근데 마찰이 있으면 에너지가 줄어드는 것 같던데요? 뜨거워지는 게 에너지 손실 아닌가요?`,
        reasoning: '에너지 보존 법칙 개념 파악. 하지만 열에너지로의 변환 개념 미파악. 열이 에너지의 한 형태임을 모름.',
        conceptUpdates: [
          { term: '에너지 보존', status: 'confused', description: '에너지 변환 개념 이해. 열에너지를 손실로 오해 중' },
        ],
      },
    ],
  },
];

const ECONOMICS_RESPONSES: ResponseBank[] = [
  {
    keywords: ['기회비용', '비용', '선택'],
    responses: [
      {
        message: `기회비용이... 선택하지 않은 것의 가치라고요? 그럼 제가 오늘 공부 대신 유튜브 봤으면, 기회비용이 공부하는 거잖아요. 근데 공부를 안 했으니까 그 가치를 어떻게 알아요?`,
        reasoning: '기회비용의 기본 정의 파악. 하지만 다음 최선 대안(next best alternative)의 구체적 측정 방법 미파악.',
        conceptUpdates: [{ term: '기회비용', status: 'confused', description: '선택 포기의 가치라는 개념 이해. 측정 방법은 미파악' }],
      },
      {
        message: `기회비용 중에서 제일 가치 있는 대안이 기회비용이라는 건 알겠어요. 근데 그럼 항상 기회비용이 낮은 선택을 해야 하는 건가요? 기회비용이 낮으면 항상 최선의 선택인가요?`,
        reasoning: '기회비용의 상대적 비교 파악. 하지만 절대적 이익과 기회비용의 동시 고려 미파악.',
        conceptUpdates: [{ term: '기회비용', status: 'misunderstood', description: '기회비용 최소화만이 최선이라고 오해 중' }],
      },
    ],
  },
  {
    keywords: ['수요', '공급', '가격', '시장'],
    responses: [
      {
        message: `수요가 늘면 가격이 오른다는 건 알겠어요. 근데 왜 항상 그래요? 회사가 그냥 가격 안 올리면 안 되나요? 착한 회사들은 안 올릴 것 같은데요.`,
        reasoning: '수요-가격 상관관계 기본 파악. 하지만 시장 경쟁 원리와 이익 극대화 동인 미파악.',
        conceptUpdates: [{ term: '수요/공급', status: 'confused', description: '가격 변동 방향 이해. 시장 경쟁에 의한 자동 조정 원리 미파악' }],
      },
    ],
  },
];

const TOPIC_INITIAL_MESSAGES: Record<TopicKey, string> = {
  stock: `안녕하세요... 저 지금 주식에 대해 아무것도 모르는 상태예요.\n\n주식이 뭔지 설명해 주시겠어요? 왜 사람들이 주식을 하는 건지부터 이해가 안 돼요.`,
  coding: `안녕하세요. 코딩을 배우고 싶은데 어디서부터 시작해야 할지 모르겠어요.\n\n프로그래밍이랑 코딩이 다른 건가요? 그리고 왜 변수를 쓰는 건지도 모르겠어요. 그냥 숫자를 직접 쓰면 안 되나요?`,
  physics: `물리를 배우고 싶어요. 근데 솔직히 '힘'이 뭔지도 잘 모르겠어요.\n\n일상에서 쓰는 "힘이 세다"랑 물리에서 말하는 힘은 다른 건가요? 힘을 어떻게 측정해요?`,
  economics: `경제학을 공부하고 싶어요. 수요와 공급은 들어봤는데 제대로 이해는 못했어요.\n\n가격은 누가 정하는 건가요? 회사가 마음대로 정할 수 있는 거 아닌가요?`,
  new: `새로운 주제를 가르쳐 주세요.\n\n어떤 개념이든 처음부터 설명해 주시면 배워볼게요. 저는 정말 아무것도 모르는 상태예요.`,
};

const GENERIC_CONFUSED_RESPONSES = [
  {
    message: `잠깐만요, 방금 말씀하신 내용이 이해가 잘 안 됐어요.\n\n제가 이해한 게 맞는지 확인해 주세요: {paraphrase}\n\n이게 맞는 이해인가요?`,
    reasoning: '사용자 설명에서 핵심 개념 추출 시도 중. 정확한 파악인지 검증 중.',
  },
  {
    message: `아, 그건 알겠어요. 근데 왜 그런 거예요? "그냥 그렇다"가 아니라 이유가 있어야 이해할 수 있을 것 같아요.`,
    reasoning: '현상은 파악. 인과관계 이해 중.',
  },
  {
    message: `음... 제가 이렇게 이해했는데 맞나요?\n\n{concept}은(는) 결국 {wrong_interpretation}이라는 거죠?\n\n근데 그러면 {follow_up_question}은 어떻게 설명해요?`,
    reasoning: '개념을 단순화하려는 시도 중. 새로운 상황 적용 테스트 필요.',
  },
  {
    message: `예시를 들어서 설명해 주실 수 있어요? 지금 말씀하신 내용이 너무 추상적이어서 와닿지 않아요.`,
    reasoning: '추상적 개념을 구체적 예시로 연결하려는 시도 중.',
  },
  {
    message: `그건 알겠어요. 근데 예외가 있지 않나요? 제가 생각하기에는 {edge_case}인 경우에는 그 법칙이 적용 안 될 것 같은데요.`,
    reasoning: '일반 규칙 파악. 엣지 케이스로 검증 시도 중.',
  },
];

const THINKING_MESSAGES = [
  '방금 말씀하신 내용을 이해하려고 노력 중이에요...',
  '음... 생각해보고 있어요...',
  '잠깐, 정리해볼게요...',
  '제 방식으로 이해해볼게요...',
  '이게 제 이해가 맞는지 확인해 볼게요...',
];

function getTopicResponses(topic: TopicKey): ResponseBank[] {
  switch (topic) {
    case 'stock': return STOCK_RESPONSES;
    case 'coding': return CODING_RESPONSES;
    case 'physics': return PHYSICS_RESPONSES;
    case 'economics': return ECONOMICS_RESPONSES;
    default: return [];
  }
}

function findMatchingResponse(
  message: string,
  topic: TopicKey,
  usedIndices: Map<string, number>
): AIResponseResult | null {
  const lowerMessage = message.toLowerCase();
  const responses = getTopicResponses(topic);

  for (const bank of responses) {
    const matches = bank.keywords.some(kw => lowerMessage.includes(kw.toLowerCase()));
    if (matches) {
      const bankKey = bank.keywords[0];
      const currentIndex = usedIndices.get(bankKey) ?? 0;
      const response = bank.responses[Math.min(currentIndex, bank.responses.length - 1)];

      usedIndices.set(bankKey, currentIndex + 1);

      return {
        message: response.message,
        reasoning: response.reasoning,
        conceptUpdates: response.conceptUpdates,
        delay: 1500 + Math.random() * 1500,
      };
    }
  }

  return null;
}

function getGenericResponse(messageCount: number): AIResponseResult {
  const idx = messageCount % GENERIC_CONFUSED_RESPONSES.length;
  const template = GENERIC_CONFUSED_RESPONSES[idx];

  return {
    message: template.message
      .replace('{paraphrase}', '방금 설명하신 내용이 그 개념의 핵심이다')
      .replace('{concept}', '이 개념')
      .replace('{wrong_interpretation}', '제가 생각한 것과 비슷한 것')
      .replace('{follow_up_question}', '다른 상황에서는 어떻게 적용하는지')
      .replace('{edge_case}', '예외적인 상황'),
    reasoning: template.reasoning,
    conceptUpdates: [],
    delay: 1000 + Math.random() * 1000,
  };
}

export function getInitialMessage(topic: TopicKey): string {
  return TOPIC_INITIAL_MESSAGES[topic];
}

export function getThinkingMessage(): string {
  return THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];
}

export function generateAIResponse(
  userMessage: string,
  topic: TopicKey,
  messageCount: number,
  usedIndices: Map<string, number>
): AIResponseResult {
  const specific = findMatchingResponse(userMessage, topic, usedIndices);
  if (specific) return specific;
  return getGenericResponse(messageCount);
}
