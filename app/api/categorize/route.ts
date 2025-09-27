import { NextRequest, NextResponse } from 'next/server';
import { categorizeByKeywords } from '@/lib/ai-categorizer';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🔍 API 분류 요청:', content);

    // 🧠 개선된 통합 분류 시스템 사용
    const category = categorizeByKeywords(content);
    
    console.log('✅ 최종 분류 결과:', category);

    return NextResponse.json({ 
      category,
      version: '2.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 분류 API 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}