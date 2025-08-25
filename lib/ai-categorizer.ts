// AI 기반 메모 카테고리 분류

export type Category = 'To-Do' | '메모' | '아이디어';

// 키워드 기반 로컬 분류 (fallback)
function categorizeByKeywords(content: string): Category {
  const text = content.toLowerCase().trim();
  
  console.log('키워드 분류 시작:', text);
  
  // To-Do 키워드들 - 동작과 의도를 더 포괄적으로 포함
  const todoKeywords = [
    // 기본 동작 동사들
    '해야', '하자', '하기', '할', '가야', '가자', '가기', '보자', '보기', '듣기', '읽기',
    '쓰기', '만들기', '사기', '팔기', '찾기', '배우기', '공부하기', '운동하기',
    
    // 계획/일정 관련
    '예정', '계획', '준비', '완료', '마감', '일정', '스케줄', '약속', '만나기',
    
    // 업무/학습 관련
    '회의', '미팅', '전화', '연락', '이메일', '제출', '발표', '구매', '예약',
    '확인', '검토', '수정', '업데이트', '설치', '설정', '정리', '청소', '방문',
    '신청', '등록', '접수', '처리', '결제', '송금', '입금', '출금',
    
    // 학습 관련
    '공부', '수업', '강의', '시험', '과제', '숙제', '복습', '예습', '암기',
    '연습', '실습', '토익', '토플', '자격증', '시험공부',
    
    // 생활 관련
    '쇼핑', '장보기', '요리', '청소', '빨래', '정리', '이사', '수리', '고치기',
    '병원', '약국', '은행', '우체국', '관공서', '민원', '세금', '보험',
    
    // 영어 키워드
    'todo', 'task', 'do', 'go', 'buy', 'call', 'email', 'meeting', 'deadline',
    'schedule', 'appointment', 'reminder', 'finish', 'complete', 'visit',
    'check', 'review', 'update', 'install', 'setup', 'clean', 'organize',
    'study', 'learn', 'practice', 'exercise', 'work', 'job', 'project'
  ];
  
  // 아이디어 키워드들
  const ideaKeywords = [
    // 창의적 사고
    '아이디어', '생각', '제안', '기획', '창의', '혁신', '개선', '새로운', '방법',
    '만약', '어떨까', '해보자', '시도', '실험', '가능성', '상상', '발상', '구상',
    '디자인', '컨셉', '방향', '전략', '접근', '솔루션', '혁신적', '창조',
    '브레인스토밍', '아이디어회의', '기획회의', '창작', '발명',
    
    // 영어 아이디어 관련
    'idea', 'concept', 'brainstorm', 'creative', 'innovation', 'suggestion',
    'possibility', 'what if', 'maybe', 'could', 'might', 'imagine', 'design',
    'strategy', 'approach', 'solution', 'creative', 'innovative', 'invention'
  ];
  
  // 패턴 기반 분석 추가
  const todoPatterns = [
    /\w+가기$/,     // ~가기 (은행가기, 학교가기)
    /\w+하기$/,     // ~하기 (공부하기, 운동하기)
    /\w+듣기$/,     // ~듣기 (강의듣기, 음악듣기)
    /\w+보기$/,     // ~보기 (영화보기, 책보기)
    /\w+사기$/,     // ~사기 (책사기, 옷사기)
    /\w+배우기$/,   // ~배우기 (영어배우기, 요리배우기)
    /해야\s*\w+/,   // 해야 + 동작
    /가야\s*\w+/,   // 가야 + 장소
    /\d+시\s*\w+/,  // 시간 + 동작 (3시 회의)
    /오늘\s*\w+/,   // 오늘 + 동작
    /내일\s*\w+/,   // 내일 + 동작
  ];
  
  // 키워드 매칭 점수 계산
  let todoScore = 0;
  let ideaScore = 0;
  
  // 기본 키워드 매칭
  todoKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      todoScore += 1;
      console.log(`Todo 키워드 발견: "${keyword}"`);
    }
  });
  
  ideaKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      ideaScore += 1;
      console.log(`아이디어 키워드 발견: "${keyword}"`);
    }
  });
  
  // 패턴 매칭 (To-Do에 가중치 추가)
  todoPatterns.forEach((pattern, index) => {
    if (pattern.test(text)) {
      todoScore += 2; // 패턴 매칭은 더 높은 점수
      console.log(`Todo 패턴 발견: 패턴 ${index + 1}`);
    }
  });
  
  // 문맥 기반 추가 점수
  // 시간 표현이 있으면 To-Do 가능성 높음
  if (/\d+시|\d+월|\d+일|오늘|내일|이번주|다음주|월요일|화요일|수요일|목요일|금요일|토요일|일요일/.test(text)) {
    todoScore += 1;
    console.log('시간 표현 발견 - Todo 점수 +1');
  }
  
  // 장소 표현이 있으면 To-Do 가능성 높음
  if (/은행|병원|학교|회사|마트|카페|식당|도서관|체육관|영화관|공원/.test(text)) {
    todoScore += 1;
    console.log('장소 표현 발견 - Todo 점수 +1');
  }
  
  console.log(`키워드 분석 결과: Todo점수: ${todoScore}, 아이디어점수: ${ideaScore}`);
  
  // 점수가 높은 쪽으로 분류 (임계값 조정)
  if (todoScore > ideaScore && todoScore >= 1) {
    console.log('분류 결과: To-Do');
    return 'To-Do';
  } else if (ideaScore > todoScore && ideaScore >= 1) {
    console.log('분류 결과: 아이디어');
    return '아이디어';
  } else {
    console.log('분류 결과: 메모 (기본값)');
    return '메모';
  }
}

// OpenAI API를 사용한 고급 분류
async function categorizeWithAI(content: string): Promise<Category> {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('AI categorization failed');
    }

    const data = await response.json();
    console.log(`AI 분류 결과: "${content}" -> ${data.category}`);
    return data.category as Category;
  } catch (error) {
    console.warn('AI categorization failed, using keyword fallback:', error);
    return categorizeByKeywords(content);
  }
}

// 메인 분류 함수
export async function categorizeContent(content: string): Promise<Category> {
  // 빈 내용이면 기본 메모
  if (!content.trim()) {
    return '메모';
  }

  console.log('=== 카테고리 분류 시작 ===');
  console.log('입력 내용:', content);

  // 먼저 키워드 분류를 시도 (더 빠르고 안정적)
  const keywordResult = categorizeByKeywords(content);
  
  // AI 분류도 시도하되, 실패하면 키워드 결과 사용
  try {
    const aiResult = await categorizeWithAI(content);
    console.log('최종 결과 (AI):', aiResult);
    return aiResult;
  } catch {
    console.warn('AI 분류 실패, 키워드 결과 사용:', keywordResult);
    return keywordResult;
  }
}

// 카테고리별 색상 매핑
export function getCategoryColor(category: Category): 'yellow' | 'pink' | 'blue' | 'green' {
  switch (category) {
    case 'To-Do':
      return 'pink';  // 분홍색: 긴급/중요한 할 일
    case '아이디어':
      return 'blue';  // 파란색: 창의적/혁신적
    case '메모':
    default:
      return 'yellow'; // 노란색: 기본 메모
  }
}

// 카테고리별 우선순위 (정렬용)
export function getCategoryPriority(category: Category): number {
  switch (category) {
    case 'To-Do': return 1;
    case '아이디어': return 2;
    case '메모': return 3;
    default: return 3;
  }
}