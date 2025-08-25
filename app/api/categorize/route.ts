import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    console.log('API 분류 요청:', content);

    // OpenAI API 키가 설정되어 있지 않으면 키워드 기반 분류 사용
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.log('OPENAI_API_KEY not found, using enhanced keyword categorization');
      
      // 향상된 키워드 기반 서버 분류
      const text = content.toLowerCase().trim();
      let category = '메모';
      
      // To-Do 키워드들 (확장된 버전)
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
        '아이디어', '생각', '제안', '기획', '창의', '혁신', '개선', '새로운', '방법',
        '만약', '어떨까', '해보자', '시도', '실험', '가능성', '상상', '발상', '구상',
        '디자인', '컨셉', '방향', '전략', '접근', '솔루션', '혁신적', '창조',
        '브레인스토밍', '아이디어회의', '기획회의', '창작', '발명',
        'idea', 'concept', 'brainstorm', 'creative', 'innovation', 'suggestion',
        'possibility', 'what if', 'maybe', 'could', 'might', 'imagine', 'design',
        'strategy', 'approach', 'solution', 'creative', 'innovative', 'invention'
      ];
      
      // 패턴 기반 분석
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
      
      let todoScore = 0;
      let ideaScore = 0;
      
      // 키워드 매칭
      todoKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          todoScore++;
          console.log(`Todo 키워드 발견: "${keyword}"`);
        }
      });
      
      ideaKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          ideaScore++;
          console.log(`아이디어 키워드 발견: "${keyword}"`);
        }
      });
      
      // 패턴 매칭 (가중치 추가)
      todoPatterns.forEach((pattern, index) => {
        if (pattern.test(text)) {
          todoScore += 2; // 패턴 매칭은 더 높은 점수
          console.log(`Todo 패턴 발견: 패턴 ${index + 1}`);
        }
      });
      
      // 문맥 기반 추가 점수
      if (/\d+시|\d+월|\d+일|오늘|내일|이번주|다음주|월요일|화요일|수요일|목요일|금요일|토요일|일요일/.test(text)) {
        todoScore += 1;
        console.log('시간 표현 발견 - Todo 점수 +1');
      }
      
      if (/은행|병원|학교|회사|마트|카페|식당|도서관|체육관|영화관|공원/.test(text)) {
        todoScore += 1;
        console.log('장소 표현 발견 - Todo 점수 +1');
      }
      
      console.log(`키워드 점수 - Todo: ${todoScore}, 아이디어: ${ideaScore}`);
      
      if (todoScore > ideaScore && todoScore >= 1) {
        category = 'To-Do';
      } else if (ideaScore > todoScore && ideaScore >= 1) {
        category = '아이디어';
      }
      
      console.log(`최종 분류 결과: ${category}`);
      return NextResponse.json({ category });
    }

    // OpenAI API 사용
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `다음 텍스트를 3개 카테고리 중 하나로 분류해주세요:
            
1. "To-Do" - 해야 할 일, 액션 아이템, 업무, 약속, 일정 등
2. "아이디어" - 창의적 생각, 제안, 기획, 브레인스토밍, 혁신적 아이디어 등  
3. "메모" - 일반적인 기록, 정보, 위 두 카테고리에 해당하지 않는 내용

정확히 "To-Do", "아이디어", "메모" 중 하나만 응답해주세요.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const category = data.choices[0]?.message?.content?.trim() || '메모';

    // 유효한 카테고리인지 확인
    const validCategories = ['To-Do', '아이디어', '메모'];
    const finalCategory = validCategories.includes(category) ? category : '메모';

    console.log(`OpenAI 분류 결과: ${finalCategory}`);
    return NextResponse.json({ category: finalCategory });

  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json({ category: '메모' }); // 기본값 반환
  }
}