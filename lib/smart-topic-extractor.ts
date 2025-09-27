// 스마트 토픽 추출기 - 연속 컨텍스트 기반 개선
// Pinterest 스타일의 컨텍스트 이해 시스템

import { StickyNote } from './types';

// 기본 토픽 분류를 위한 도메인별 키워드
const DOMAIN_KEYWORDS = {
  '업무': [
    // 회사 관련
    '회의', '미팅', '보고', '발표', '프레젠테이션',
    '팀장', '과장', '부장', '상무', '대리', '차장', '사장',
    '회사', '사무실', '출장', '업무', '프로젝트', '계획',
    '일정', '스케줄', '데드라인', '마감', '납기',
    
    // 업무 행동
    '검토', '승인', '결재', '협의', '논의', '상의',
    '기획', '설계', '분석', '평가', '점검'
  ],
  
  '개발': [
    // 기술 스택
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js',
    'Python', 'Java', 'C++', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap',
    'API', 'REST', 'GraphQL', 'Database', 'SQL',
    'Git', 'GitHub', 'GitLab', 'Docker', 'AWS',
    
    // 개발 활동
    '코딩', '개발', '프로그래밍', '구현', '리팩토링',
    '디버깅', '테스트', '배포', '릴리즈', '버그',
    '성능', '최적화', '알고리즘', '아키텍처',
    '컴포넌트', '모듈', '라이브러리', '프레임워크'
  ],
  
  '학습': [
    // 학습 관련
    '공부', '학습', '강의', '강좌', '튜토리얼',
    '책', '독서', '정리', '요약', '복습',
    '이해', '개념', '원리', '이론', '실습',
    '자격증', '시험', '과제', '숙제',
    
    // 학습 도구
    '노트', '필기', '정리', '메모장', '기록'
  ],
  
  '건강': [
    // 운동
    '운동', '헬스', '헬스장', '피트니스', '요가',
    '달리기', '조깅', '수영', '자전거', '등산',
    '홈트', '홈트레이닝', '스트레칭', '근력',
    
    // 건강 관리
    '건강', '다이어트', '식단', '영양', '칼로리',
    '병원', '의사', '약', '치료', '검진'
  ],
  
  '생활': [
    // 일상
    '집', '가족', '엄마', '아빠', '형', '누나', '동생',
    '친구', '연인', '남친', '여친', '데이트',
    '쇼핑', '마트', '장보기', '요리', '청소',
    '빨래', '설거지', '정리정돈',
    
    // 여가
    '영화', '드라마', '게임', '음악', '책',
    '카페', '맛집', '여행', '휴가', '주말'
  ],
  
  '아이디어': [
    // 창작
    '아이디어', '기획', '제안', '컨셉', '콘셉트',
    '브레인스토밍', '아이디어', '창작', '디자인',
    '혁신', '개선', '발상', '영감',
    
    // 사업
    '사업', '창업', '스타트업', '비즈니스',
    '수익', '마케팅', '전략', '기회'
  ]
};

// 개인 키워드 패턴 타입 정의
interface PersonalKeywordPattern {
  [keyword: string]: {
    topic: string;
    frequency: number;
    lastUsed: string;
  };
}

// 연속 컨텍스트 분석 결과
interface ContextAnalysis {
  dominantTopic: string;
  confidence: number;
  isStrongContext: boolean;
  recentMemos: StickyNote[];
  topicFrequency: { [topic: string]: number };
}

// 토픽 분류 결과
interface TopicClassification {
  topic: string;
  confidence: number;
  reason: string;
  method: 'context' | 'personal' | 'domain' | 'basic';
}

/**
 * 기본 도메인 기반 토픽 추출
 * 도메인별 키워드를 사용하여 기본적인 토픽을 분류합니다.
 */
export function extractBasicTopic(content: string): string {
  const text = content.toLowerCase();
  
  // 각 도메인별 점수 계산
  const domainScores: { [domain: string]: number } = {};
  
  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        // 키워드 길이에 따른 가중치 (긴 키워드일수록 더 정확)
        score += keyword.length >= 3 ? 2 : 1;
      }
    });
    domainScores[domain] = score;
  });
  
  // 가장 높은 점수의 도메인 반환
  const topDomain = Object.entries(domainScores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );
  
  return topDomain[1] > 0 ? topDomain[0] : '기타';
}

/**
 * 연속 작성 메모의 컨텍스트 분석
 * 최근 1시간 내 작성된 메모들의 패턴을 분석합니다.
 */
export function analyzeConsecutiveContext(newContent: string, allMemos: StickyNote[]): ContextAnalysis | null {
  // 1시간 이내에 작성된 메모들 필터링
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentMemos = allMemos
    .filter(memo => new Date(memo.createdAt) > oneHourAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (recentMemos.length < 2) {
    return null; // 컨텍스트 분석을 위한 충분한 데이터가 없음
  }
  
  // 최근 메모들의 주제 분석
  const recentTopics = recentMemos.map(memo => extractBasicTopic(memo.content));
  
  // 주제 빈도 계산
  const topicFrequency: { [topic: string]: number } = {};
  recentTopics.forEach(topic => {
    if (topic !== '기타') { // '기타'는 제외
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    }
  });
  
  if (Object.keys(topicFrequency).length === 0) {
    return null; // 의미있는 주제가 없음
  }
  
  // 가장 빈번한 주제 찾기
  const dominantTopic = Object.entries(topicFrequency).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];
  
  // 지배적 주제의 비율 계산
  const totalValidTopics = Object.values(topicFrequency).reduce((sum, count) => sum + count, 0);
  const confidence = topicFrequency[dominantTopic] / totalValidTopics;
  
  return {
    dominantTopic,
    confidence,
    isStrongContext: confidence >= 0.6 && recentMemos.length >= 3, // 60% 이상 + 3개 이상 메모
    recentMemos,
    topicFrequency
  };
}

/**
 * 개인 키워드 패턴 학습
 * 사용자가 자주 사용하는 키워드와 그에 대응되는 주제를 학습합니다.
 */
export function learnPersonalKeywordPatterns(allMemos: StickyNote[]): PersonalKeywordPattern {
  const patterns: PersonalKeywordPattern = {};
  
  allMemos.forEach(memo => {
    const topic = extractBasicTopic(memo.content);
    if (topic === '기타') return; // 기타는 학습에서 제외
    
    // 메모에서 2글자 이상의 의미있는 단어들 추출
    const words = memo.content
      .split(/[\s,\.!?]+/)
      .filter(word => word.length >= 2)
      .filter(word => !/^[가-힣]{1}$/.test(word)) // 조사 제외
      .filter(word => !['그것', '이것', '저것', '하기', '되는', '있는', '없는'].includes(word));
    
    words.forEach(word => {
      if (!patterns[word]) {
        patterns[word] = {
          topic: topic,
          frequency: 1,
          lastUsed: memo.createdAt instanceof Date ? memo.createdAt.toISOString() : memo.createdAt
        };
      } else {
        // 같은 주제로 사용된 경우 빈도 증가
        if (patterns[word].topic === topic) {
          patterns[word].frequency++;
          patterns[word].lastUsed = memo.createdAt instanceof Date ? memo.createdAt.toISOString() : memo.createdAt;
        }
        // 다른 주제로 사용된 경우, 더 최근 것으로 업데이트 (빈도가 높은 경우만)
        else if (patterns[word].frequency < 3) {
          patterns[word] = {
            topic: topic,
            frequency: 1,
            lastUsed: memo.createdAt instanceof Date ? memo.createdAt.toISOString() : memo.createdAt
          };
        }
      }
    });
  });
  
  // 빈도가 2 이상인 것들만 유지 (노이즈 제거)
  const filteredPatterns: PersonalKeywordPattern = {};
  Object.entries(patterns).forEach(([keyword, data]) => {
    if (data.frequency >= 2) {
      filteredPatterns[keyword] = data;
    }
  });
  
  return filteredPatterns;
}

/**
 * 개인 키워드 패턴을 사용한 토픽 예측
 */
function predictTopicWithPersonalPattern(content: string, personalPatterns: PersonalKeywordPattern): string | null {
  const words = content
    .split(/[\s,\.!?]+/)
    .filter(word => word.length >= 2);
  
  let bestMatch = { topic: '', confidence: 0 };
  
  words.forEach(word => {
    if (personalPatterns[word]) {
      const pattern = personalPatterns[word];
      // 빈도가 높을수록 신뢰도 증가
      const confidence = Math.min(pattern.frequency / 5, 1); // 최대 1.0
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { topic: pattern.topic, confidence };
      }
    }
  });
  
  // 신뢰도가 0.4 이상일 때만 개인 패턴 사용
  return bestMatch.confidence >= 0.4 ? bestMatch.topic : null;
}

/**
 * 애매한 주제인지 판단
 */
function isAmbiguousTopic(topic: string): boolean {
  const ambiguousTopics = ['기타', '일반', '메모', null, undefined];
  return ambiguousTopics.includes(topic);
}

/**
 * 메인 토픽 분류 함수
 * 컨텍스트 분석 + 개인 패턴 + 도메인 키워드를 종합하여 최적의 토픽을 추출합니다.
 */
export function classifyTopicSmart(content: string, allMemos: StickyNote[]): TopicClassification {
  // 1. 연속 컨텍스트 분석
  const context = analyzeConsecutiveContext(content, allMemos);
  
  // 2. 개인 키워드 패턴 학습 및 예측
  const personalPatterns = learnPersonalKeywordPatterns(allMemos);
  const personalTopic = predictTopicWithPersonalPattern(content, personalPatterns);
  
  // 3. 기본 도메인 분류
  const basicTopic = extractBasicTopic(content);
  
  // 4. 우선순위에 따른 최종 분류
  
  // 첫 번째 우선순위: 강한 컨텍스트가 있고 기본 분류가 애매한 경우
  if (context && context.isStrongContext && isAmbiguousTopic(basicTopic)) {
    return {
      topic: context.dominantTopic,
      confidence: context.confidence,
      reason: `최근 ${Math.round(context.confidence * 100)}%의 메모가 ${context.dominantTopic} 관련`,
      method: 'context'
    };
  }
  
  // 두 번째 우선순위: 개인 패턴이 명확한 경우
  if (personalTopic && !isAmbiguousTopic(personalTopic)) {
    const pattern = Object.values(personalPatterns).find(p => p.topic === personalTopic);
    return {
      topic: personalTopic,
      confidence: Math.min((pattern?.frequency || 1) / 5, 1),
      reason: `개인 키워드 패턴 (${pattern?.frequency || 1}회 사용)`,
      method: 'personal'
    };
  }
  
  // 세 번째 우선순위: 도메인 키워드가 명확한 경우
  if (!isAmbiguousTopic(basicTopic)) {
    return {
      topic: basicTopic,
      confidence: 0.7,
      reason: '도메인 키워드 매칭',
      method: 'domain'
    };
  }
  
  // 네 번째 우선순위: 약한 컨텍스트라도 사용
  if (context && context.confidence >= 0.4) {
    return {
      topic: context.dominantTopic,
      confidence: context.confidence,
      reason: `컨텍스트 참조 (${Math.round(context.confidence * 100)}% 일치)`,
      method: 'context'
    };
  }
  
  // 마지막 수단: 기본 분류
  return {
    topic: basicTopic !== '기타' ? basicTopic : '일반',
    confidence: 0.3,
    reason: '기본 분류',
    method: 'basic'
  };
}

/**
 * 사용자 패턴 저장/로드 (LocalStorage)
 */
export function saveUserPatterns(patterns: PersonalKeywordPattern): void {
  const data = {
    patterns,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  };
  localStorage.setItem('user-topic-patterns', JSON.stringify(data));
}

export function loadUserPatterns(): PersonalKeywordPattern {
  try {
    const saved = localStorage.getItem('user-topic-patterns');
    if (saved) {
      const data = JSON.parse(saved);
      return data.patterns || {};
    }
  } catch (error) {
    console.warn('사용자 패턴 로드 실패:', error);
  }
  return {};
}

/**
 * 토픽 분류 테스트 함수
 */
export function testSmartTopicExtractor(): void {
  console.log('🧪 스마트 토픽 추출기 테스트 시작');
  
  const testMemos: StickyNote[] = [
    { id: '1', content: 'React 컴포넌트 리팩토링', category: '메모', color: 'yellow', isCompleted: false, createdAt: new Date(Date.now() - 30 * 60 * 1000), updatedAt: new Date() },
    { id: '2', content: 'TypeScript 타입 에러 해결', category: '아이디어', color: 'blue', isCompleted: false, createdAt: new Date(Date.now() - 20 * 60 * 1000), updatedAt: new Date() },
    { id: '3', content: 'Next.js 라우팅 공부', category: '메모', color: 'yellow', isCompleted: false, createdAt: new Date(Date.now() - 10 * 60 * 1000), updatedAt: new Date() }
  ];
  
  const testCases = [
    { content: '성능 최적화', expected: '개발' },
    { content: '김팀장님과 회의', expected: '업무' },
    { content: '오늘 점심 뭐 먹지', expected: '생활' },
    { content: 'API 연결', expected: '개발' }, // 컨텍스트 기반
    { content: '복사', expected: '업무' } // 컨텍스트 기반 (회사에서 자료 복사)
  ];
  
  console.log('\n📊 테스트 결과:');
  testCases.forEach((testCase, index) => {
    const result = classifyTopicSmart(testCase.content, testMemos);
    const isCorrect = result.topic === testCase.expected;
    
    console.log(`${index + 1}. "${testCase.content}"`);
    console.log(`   예상: ${testCase.expected} | 결과: ${result.topic} | ${isCorrect ? '✅' : '❌'}`);
    console.log(`   신뢰도: ${Math.round(result.confidence * 100)}% | 방법: ${result.method}`);
    console.log(`   이유: ${result.reason}\n`);
  });
  
  const accuracy = testCases.filter((testCase, index) => {
    const result = classifyTopicSmart(testCase.content, testMemos);
    return result.topic === testCase.expected;
  }).length / testCases.length;
  
  console.log(`🎯 전체 정확도: ${Math.round(accuracy * 100)}%`);
}

/**
 * 디버깅용 컨텍스트 정보 출력
 */
export function debugTopicClassification(content: string, allMemos: StickyNote[]): void {
  console.log(`🔍 토픽 분류 디버깅: "${content}"`);
  
  const context = analyzeConsecutiveContext(content, allMemos);
  const basicTopic = extractBasicTopic(content);
  const personalPatterns = learnPersonalKeywordPatterns(allMemos);
  const personalTopic = predictTopicWithPersonalPattern(content, personalPatterns);
  
  console.log('📊 분석 결과:');
  console.log('- 기본 토픽:', basicTopic);
  console.log('- 개인 패턴 토픽:', personalTopic || '없음');
  console.log('- 컨텍스트:', context ? 
    `${context.dominantTopic} (신뢰도: ${Math.round(context.confidence * 100)}%, 강함: ${context.isStrongContext})` : 
    '없음'
  );
  
  if (context) {
    console.log('- 최근 메모 주제 분포:', context.topicFrequency);
  }
  
  const finalResult = classifyTopicSmart(content, allMemos);
  console.log('🎯 최종 분류:', finalResult);
}

