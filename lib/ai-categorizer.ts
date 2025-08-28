/**
 * AI 기반 콘텐츠 분류 시스템
 * 실용적이고 정확한 분류를 위한 개선된 로직
 */

// 카테고리 타입 정의
export type Category = 'To-Do' | '메모' | '아이디어';

// 강화된 To-Do 패턴 정의
const TODO_PATTERNS = {
  // 행동 동사 패턴
  actionVerbs: [
    // 일반적인 행동
    '하기', '가기', '보기', '듣기', '읽기', '사기', '팔기', '만들기', '준비하기',
    '정리하기', '청소하기', '세탁하기', '요리하기', '운동하기', '공부하기',
    // 업무 관련
    '회의하기', '보고하기', '발표하기', '작성하기', '검토하기', '수정하기',
    '완료하기', '제출하기', '확인하기', '연락하기', '예약하기', '신청하기',
    // 소통 관련
    '전화하기', '메일보내기', '채팅하기', '미팅하기', '상담하기',
    // 영어 동사
    'do', 'go', 'see', 'buy', 'make', 'call', 'send', 'meet', 'check', 'finish'
  ],
  
  // 장소 기반 패턴
  places: [
    '은행', '병원', '학교', '회사', '마트', '카페', '식당', '헬스장', '도서관',
    '우체국', '관공서', '약국', '미용실', '세탁소', '주유소', '편의점',
    '백화점', '영화관', '공원', '집', '사무실', '회의실'
  ],
  
  // 시간 표현
  timeExpressions: [
    '오늘', '내일', '모레', '이번주', '다음주', '월요일', '화요일', '수요일', 
    '목요일', '금요일', '토요일', '일요일', '아침', '점심', '저녁', '밤',
    '오전', '오후', '새벽', '자정'
  ],
  
  // 할일 키워드
  taskKeywords: [
    '일정', '스케줄', '예약', '약속', '미팅', '회의', '업무', '과제', '숙제',
    '할일', '해야', '필요', '준비', '계획', '목표', '완료', '마감', '데드라인',
    '신청', '접수', '제출', '납부', '결제', '구매', '주문', '배송', '수령'
  ],
  
  // 문장 패턴 (정규식)
  sentencePatterns: [
    /(.+)\s*(해야|하자|할까|하기|가기|보기|듣기|읽기|사기|만들기|예약|신청|제출|완료)$/,
    /(.+)\s*(에\s+가기|을\s+하기|를\s+하기|와\s+만나기|랑\s+만나기)$/,
    /(.+)\s*(체크|확인|검토|수정|작성|정리|준비)$/,
    /(미팅|회의|만남|약속)\s*(.+)/,
    /(.+)\s*(까지|전에|후에)\s*(해야|하기|완료)/
  ]
};

// 아이디어 패턴 정의
const IDEA_PATTERNS = {
  keywords: [
    // 창의성 관련
    '아이디어', '생각', '컨셉', '기획', '제안', '방안', '아이템', '콘텐츠',
    '창의', '혁신', '개선', '새로운', '참신한', '독특한', '흥미로운',
    // 브레인스토밍 관련
    '브레인스토밍', '아이디어회의', '기획회의', '전략', '방향성', '비전',
    // 영어
    'idea', 'concept', 'creative', 'innovation', 'brainstorm', 'design',
    'strategy', 'vision', 'inspiration', 'solution'
  ],
  
  patterns: [
    /(.+)하면\s+어떨까/,
    /(.+)는\s+어때/,
    /만약\s+(.+)/,
    /(.+)면\s+좋겠다/,
    /(.+)디자인/,
    /(.+)기획/,
    /(.+)전략/
  ]
};

// 메모 패턴 (기본값이므로 간단하게)
const MEMO_PATTERNS = {
  keywords: [
    '메모', '기록', '노트', '참고', '정보', '내용', '사실', '데이터',
    '기억', '보관', '저장', '중요', '알림', '안내', '공지'
  ]
};

/**
 * 개선된 키워드 기반 분류 함수
 */
export function categorizeByKeywords(content: string): Category {
  const text = content.toLowerCase().trim();
  
  if (!text) return '메모';
  
  let todoScore = 0;
  let ideaScore = 0;
  let memoScore = 0;
  
  // 1. To-Do 점수 계산
  
  // 행동 동사 체크 (높은 가중치)
  TODO_PATTERNS.actionVerbs.forEach(verb => {
    if (text.includes(verb)) {
      todoScore += 3;
    }
  });
  
  // 장소 기반 패턴 (높은 가중치)
  TODO_PATTERNS.places.forEach(place => {
    if (text.includes(place)) {
      todoScore += 2;
    }
  });
  
  // 시간 표현 (중간 가중치)
  TODO_PATTERNS.timeExpressions.forEach(time => {
    if (text.includes(time)) {
      todoScore += 1;
    }
  });
  
  // 할일 키워드 (중간 가중치)
  TODO_PATTERNS.taskKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      todoScore += 2;
    }
  });
  
  // 문장 패턴 체크 (매우 높은 가중치)
  TODO_PATTERNS.sentencePatterns.forEach(pattern => {
    if (pattern.test(text)) {
      todoScore += 5;
    }
  });
  
  // 2. 아이디어 점수 계산
  
  // 아이디어 키워드
  IDEA_PATTERNS.keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      ideaScore += 2;
    }
  });
  
  // 아이디어 패턴
  IDEA_PATTERNS.patterns.forEach(pattern => {
    if (pattern.test(text)) {
      ideaScore += 3;
    }
  });
  
  // 3. 메모 점수 계산
  MEMO_PATTERNS.keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      memoScore += 1;
    }
  });
  
  // 4. 특별한 규칙들
  
  // 질문 형태는 아이디어로 분류 경향
  if (text.includes('?') || text.includes('어떨까') || text.includes('어때')) {
    ideaScore += 2;
  }
  
  // 명령형/청유형은 To-Do로 분류 경향
  if (text.endsWith('하자') || text.endsWith('해야지') || text.endsWith('할까')) {
    todoScore += 3;
  }
  
  // 단순 정보/사실은 메모로 분류
  if (text.includes('이다') || text.includes('입니다') || text.includes('것') || text.includes('정보')) {
    memoScore += 2;
  }
  
  // 5. 디버깅 로그
  console.log(`분류 분석: "${content}"`);
  console.log(`점수 - To-Do: ${todoScore}, 아이디어: ${ideaScore}, 메모: ${memoScore}`);
  
  // 6. 최종 분류 결정
  if (todoScore >= 3 && todoScore > ideaScore && todoScore > memoScore) {
    console.log('최종 분류: To-Do');
    return 'To-Do';
  } else if (ideaScore >= 2 && ideaScore > todoScore && ideaScore > memoScore) {
    console.log('최종 분류: 아이디어');
    return '아이디어';
  } else {
    console.log('최종 분류: 메모');
    return '메모';
  }
}

/**
 * AI 분류 함수 (API 호출)
 */
export async function categorizeWithAI(content: string): Promise<Category> {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    return data.category as Category;
  } catch (error) {
    console.warn('AI 분류 실패, 키워드 분류로 대체:', error);
    return categorizeByKeywords(content);
  }
}

/**
 * 메인 분류 함수
 */
export async function categorizeContent(content: string): Promise<Category> {
  // 우선 개선된 키워드 분류 사용
  // AI 분류는 백업으로 사용 (필요시 활성화)
  return categorizeByKeywords(content);
}

/**
 * 카테고리별 색상 반환
 */
export function getCategoryColor(category: Category): 'yellow' | 'pink' | 'blue' | 'green' {
  const colorMap = {
    'To-Do': 'pink',
    '아이디어': 'blue',
    '메모': 'yellow'
  };
  return colorMap[category] as 'yellow' | 'pink' | 'blue' | 'green';
}

/**
 * 카테고리 우선순위 반환 (정렬용)
 */
export function getCategoryPriority(category: Category): number {
  const priorityMap = {
    'To-Do': 1,
    '아이디어': 2,
    '메모': 3
  };
  return priorityMap[category] || 99;
}