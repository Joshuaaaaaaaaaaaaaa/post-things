'use client';

import { useState, useEffect, useRef } from 'react';
import { StickyNote } from '@/lib/types';
import { getCategoryColor, categorizeContent } from '@/lib/ai-categorizer';
import { useGestures } from '@/hooks/useGestures';
import { Check, X, Brain } from 'lucide-react';

interface StickyNoteInputProps {
  onSave: (content: string) => void;
  onDelete: (id: string) => void;
  onSwitchToAffinity: () => void;
  currentNote: StickyNote | null;
  setCurrentNote: (note: StickyNote | null) => void;
  isClassifying?: boolean; // AI 분류 중 상태
}

export default function StickyNoteInput({
  onSave,
  onDelete,
  onSwitchToAffinity,
  currentNote,
  setCurrentNote,
  isClassifying = false
}: StickyNoteInputProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [feedback, setFeedback] = useState<'save' | 'delete' | 'classifying' | null>(null);
  // 초기 색상을 currentNote에 따라 즉시 결정
  const getInitialColor = () => {
    if (currentNote) {
      const colorMap = {
        yellow: 'bg-yellow-200',
        pink: 'bg-pink-200',
        blue: 'bg-blue-200',
        green: 'bg-green-200'
      };
      return colorMap[currentNote.color];
    }
    return 'bg-yellow-200';
  };
  
  const [stickyColor, setStickyColor] = useState(getInitialColor());
  const [isMounted, setIsMounted] = useState(false); // 클라이언트 마운트 확인
  const [fontSize, setFontSize] = useState('text-xl'); // 동적 폰트 크기
  
  // 인터랙션 관련 상태
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 클라이언트 마운트 후 기본 색상 설정
  useEffect(() => {
    setIsMounted(true);
    // 기본적으로 노란색(메모)으로 시작
    setStickyColor('bg-yellow-200');
  }, []);

  // 실제 텍스트박스 크기 기반 폰트 크기 조정
  useEffect(() => {
    if (textareaRef.current && content && isMounted) {
      const textarea = textareaRef.current;
      
      // 사용 가능한 텍스트 영역 크기 계산 (패딩 제외)
      const availableHeight = textarea.clientHeight - 64; // 상하 패딩 32px씩 제외
      const availableWidth = textarea.clientWidth - 24; // 좌우 패딩 12px씩 제외
      
      // 폰트 크기 옵션들 (큰 것부터 작은 것 순서)
      const fontSizes = [
        { class: 'text-xl', size: 20 },
        { class: 'text-lg', size: 18 },
        { class: 'text-base', size: 16 },
        { class: 'text-sm', size: 14 },
        { class: 'text-xs', size: 12 }
      ];
      
      let selectedSize = 'text-xs'; // 기본값은 가장 작은 크기
      
      // 각 폰트 크기에서 텍스트가 차지하는 실제 공간 측정
      for (const fontOption of fontSizes) {
        // 임시 div 생성해서 실제 텍스트 크기 측정
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.fontSize = `${fontOption.size}px`;
        tempDiv.style.fontFamily = 'inherit';
        tempDiv.style.lineHeight = '1.625'; // leading-relaxed와 동일
        tempDiv.style.width = `${availableWidth}px`;
        tempDiv.style.wordWrap = 'break-word';
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.padding = '0';
        tempDiv.style.margin = '0';
        tempDiv.textContent = content;
        
        document.body.appendChild(tempDiv);
        const textHeight = tempDiv.scrollHeight;
        document.body.removeChild(tempDiv);
        
        // 텍스트가 사용 가능한 공간에 들어가면 이 크기 사용
        if (textHeight <= availableHeight) {
          selectedSize = fontOption.class;
          break;
        }
      }
      
      setFontSize(selectedSize);
    } else if (!content) {
      // 내용이 없으면 기본 큰 크기
      setFontSize('text-xl');
    }
  }, [content, isMounted]);

  // 실시간 색상 미리보기 (개선된 키워드 분류) - 새 메모일 때만
  useEffect(() => {
    if (content.trim() && isMounted && !currentNote) {
      const text = content.toLowerCase();
      let previewCategory: 'To-Do' | '아이디어' | '메모' = '메모';
      
      // 빠른 키워드 체크 (주요 키워드만)
      const quickTodoKeywords = [
        '해야', '하자', '하기', '할', '가야', '가기', '보기', '듣기', '읽기', '사기', '배우기',
        '회의', '미팅', '예약', '공부', '강의', '시험', '은행', '병원', '학교', '회사',
        'todo', 'task', 'do', 'go', 'buy', 'study', 'meeting', 'work'
      ];
      
      const quickIdeaKeywords = [
        '아이디어', '생각', '제안', '기획', '새로운', '창의', '혁신', '개선',
        'idea', 'concept', 'creative', 'innovation', 'new'
      ];
      
      // 패턴 체크
      const todoPatterns = [
        /\w+가기$/,     // ~가기
        /\w+하기$/,     // ~하기  
        /\w+듣기$/,     // ~듣기
        /\w+보기$/,     // ~보기
        /\w+사기$/,     // ~사기
        /\w+배우기$/,   // ~배우기
      ];
      
      let todoScore = 0;
      let ideaScore = 0;
      
      // 키워드 점수
      quickTodoKeywords.forEach(keyword => {
        if (text.includes(keyword)) todoScore++;
      });
      
      quickIdeaKeywords.forEach(keyword => {
        if (text.includes(keyword)) ideaScore++;
      });
      
      // 패턴 점수 (가중치)
      todoPatterns.forEach(pattern => {
        if (pattern.test(text)) todoScore += 2;
      });
      
      // 시간/장소 표현 체크
      if (/\d+시|오늘|내일|월요일|화요일|수요일|목요일|금요일/.test(text)) {
        todoScore += 1;
      }
      
      if (/은행|병원|학교|회사|마트|카페/.test(text)) {
        todoScore += 1;
      }
      
      // 분류 결정
      if (todoScore > ideaScore && todoScore >= 1) {
        previewCategory = 'To-Do';
      } else if (ideaScore > todoScore && ideaScore >= 1) {
        previewCategory = '아이디어';
      }
      
      const previewColor = getCategoryColor(previewCategory);
      const colorMap = {
        yellow: 'bg-yellow-200',
        pink: 'bg-pink-200',
        blue: 'bg-blue-200',
        green: 'bg-green-200'
      };
      
      setStickyColor(colorMap[previewColor]);
    } else if (!content.trim() && !currentNote) {
      // 빈 내용이면 기본 노란색 (새 메모일 때만)
      setStickyColor('bg-yellow-200');
    }
  }, [content, isMounted, currentNote]);

  // 편집 모드일 때 포커스 및 키보드 활성화
  useEffect(() => {
    if (isEditing && textareaRef.current && !isClassifying) {
      textareaRef.current.focus();
    }
  }, [isEditing, isClassifying]);

  // 현재 노트가 설정되면 편집 모드로 전환
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
      setIsEditing(true);
      // 기존 노트의 색상을 즉시 설정 (깜빡임 방지)
      const colorMap = {
        yellow: 'bg-yellow-200',
        pink: 'bg-pink-200',
        blue: 'bg-blue-200',
        green: 'bg-green-200'
      };
      // 즉시 색상 설정으로 깜빡임 방지
      setStickyColor(colorMap[currentNote.color]);
    } else {
      setContent('');
      setIsEditing(true);
      // 새 메모는 기본 노란색으로 시작
      setStickyColor('bg-yellow-200');
    }
  }, [currentNote]);

  // AI 분류 중 상태 표시
  useEffect(() => {
    if (isClassifying) {
      setFeedback('classifying');
    } else if (feedback === 'classifying') {
      setFeedback('save');
      setTimeout(() => setFeedback(null), 1000);
    }
  }, [isClassifying, feedback]);

  // 피드백 표시 후 자동 숨김
  useEffect(() => {
    if (feedback && feedback !== 'classifying') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);





  const handleSave = () => {
    if (content.trim() && !isClassifying) {
      setFeedback('classifying');
      onSave(content.trim());
      setContent('');
      setCurrentNote(null);
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (!isClassifying) {
      setFeedback('delete');
      if (currentNote) {
        onDelete(currentNote.id);
        setCurrentNote(null);
      }
      setContent('');
      setIsEditing(true);
    }
  };

  // PC용 더블클릭으로 Affinity Diagram 진입
  const handleDoubleClick = (e: React.MouseEvent) => {
    console.log('Double click triggered - switching to affinity'); // 디버깅용
    e.preventDefault();
    e.stopPropagation();
    if (!isClassifying) {
      onSwitchToAffinity();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isClassifying) {
      e.preventDefault();
      handleSave();
    }
  };

  // 실시간 드래그 핸들러
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null);
  
  const handleDragStart = (x: number, y: number) => {
    setIsDragging(true);
    setIsInteracting(true);
    setDragDirection(null); // 방향 초기화
    console.log('Real-time drag started'); // 디버깅용
  };

  const handleDragMove = (deltaX: number, deltaY: number) => {
    if (!isDragging) return;
    
    // 첫 움직임에서 방향 결정 (한번 결정되면 고정)
    if (!dragDirection && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDragDirection('horizontal');
      } else {
        setDragDirection('vertical');
      }
    }
    
    // 방향에 따라 제한된 움직임
    if (dragDirection === 'horizontal') {
      // 가로 방향: X축만 움직임, 화면 끝까지 가능
      const maxX = window.innerWidth / 2 - 100; // 화면 절반 정도까지
      const limitedX = Math.max(-maxX, Math.min(maxX, deltaX));
      setOffset({ x: limitedX, y: 0 });
    } else if (dragDirection === 'vertical') {
      // 세로 방향: Y축만 움직임, 화면 끝까지 가능
      const maxY = window.innerHeight / 2 - 100; // 화면 절반 정도까지
      const limitedY = Math.max(-maxY, Math.min(maxY, deltaY));
      setOffset({ x: 0, y: limitedY });
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    console.log('Real-time drag ended', { dragDirection, offset }); // 디버깅용
    setIsDragging(false);
    
    // 드래그 종료 시 방향과 거리에 따라 액션 결정
    const threshold = 50; // 액션 실행 임계값 (더 크게)
    
    if (dragDirection === 'vertical') {
      // 세로 방향 드래그
      if (offset.y < -threshold) {
        // 위로 드래그 → 저장
        if (content.trim() && !isClassifying) {
          if (textareaRef.current) {
            textareaRef.current.blur();
          }
          setTimeout(() => handleSave(), 200);
        }
      } else if (offset.y > threshold) {
        // 아래로 드래그 → 어피니티 다이어그램
        if (!isClassifying) {
          setTimeout(() => onSwitchToAffinity(), 200);
        }
      }
    } else if (dragDirection === 'horizontal') {
      // 가로 방향 드래그
      if (Math.abs(offset.x) > threshold) {
        // 좌우 드래그 → 삭제
        if (!isClassifying) {
          setTimeout(() => handleDelete(), 200);
        }
      }
    }
    
    // 상태 초기화 및 원위치로 복귀 (탄성 효과)
    setDragDirection(null);
    setTimeout(() => {
      setOffset({ x: 0, y: 0 });
      setIsInteracting(false);
    }, 100);
  };

  // 방향별 인터랙션 핸들러 (스와이프용 - 백업)
  const handleDirectionalMove = (direction: 'up' | 'down' | 'left' | 'right', intensity: number = 1) => {
    setIsInteracting(true);
    
    const moveAmount = 15 * intensity; // 기본 이동량
    
    switch (direction) {
      case 'up':
        setOffset({ x: 0, y: -moveAmount });
        break;
      case 'down':
        setOffset({ x: 0, y: moveAmount });
        break;
      case 'left':
        setOffset({ x: -moveAmount, y: 0 });
        break;
      case 'right':
        setOffset({ x: moveAmount, y: 0 });
        break;
    }
    
    // 0.3초 후 원위치로 복귀 (탄성 효과)
    setTimeout(() => {
      setOffset({ x: 0, y: 0 });
      setIsInteracting(false);
    }, 300);
  };

  // 제스처 처리 (실시간 드래그 + 스와이프 + 핀치)
  const { onTouchStart, onTouchMove, onTouchEnd } = useGestures({
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onSwipeUp: () => {
      console.log('Swipe up triggered'); // 디버깅용
      if (!isDragging) { // 드래그 중이 아닐 때만 스와이프 처리
        handleDirectionalMove('up', 2);
        if (content.trim() && !isClassifying) {
          if (textareaRef.current) {
            textareaRef.current.blur();
          }
          setTimeout(() => handleSave(), 200);
        }
      }
    },
    onSwipeDown: () => {
      console.log('Swipe down triggered - switching to affinity'); // 디버깅용
      if (!isDragging) {
        handleDirectionalMove('down', 2);
        if (!isClassifying) {
          setTimeout(() => onSwitchToAffinity(), 200);
        }
      }
    },
    onSwipeLeft: () => {
      console.log('Swipe left triggered'); // 디버깅용
      if (!isDragging) {
        handleDirectionalMove('left', 2);
        if (!isClassifying) {
          setTimeout(() => handleDelete(), 200);
        }
      }
    },
    onSwipeRight: () => {
      console.log('Swipe right triggered'); // 디버깅용
      if (!isDragging) {
        handleDirectionalMove('right', 2);
        if (!isClassifying) {
          setTimeout(() => handleDelete(), 200);
        }
      }
    },
    onPinchOut: () => {
      console.log('Pinch out triggered - switching to affinity'); // 디버깅용
      if (!isClassifying) {
        onSwitchToAffinity();
      }
    }
  });


  // 클라이언트 마운트 전에는 기본 색상으로 렌더링
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
        <div className="relative w-full max-w-sm aspect-square bg-yellow-200 rounded-lg shadow-lg" style={{ margin: '0 20px' }}>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-yellow-300 rounded-b-sm opacity-60"></div>
          <textarea
            placeholder="메모를 입력하세요."
            className="w-full h-full p-3 pt-8 pb-8 bg-transparent border-none outline-none resize-none text-xl text-gray-800 placeholder-gray-500 leading-relaxed"
            disabled
          />
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">0/100</div>
          <div className="absolute bottom-1 left-2 text-xs text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50 overscroll-none">
      <div
        ref={containerRef}
        className={`relative w-full max-w-sm aspect-square ${stickyColor} rounded-lg shadow-lg transform cursor-pointer touch-none ${
          isClassifying ? 'opacity-75' : ''
        } ${isDragging ? 'scale-110 shadow-2xl' : isInteracting ? 'scale-105' : 'active:scale-95'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ 
          margin: '0 20px',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isDragging ? 'transform 0s' : 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' // 드래그 중에는 즉시 반응
        }}
      >
        {/* 포스트잇 상단 접착 부분 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-yellow-300 rounded-b-sm opacity-60"></div>
        
        {/* 텍스트 입력 영역 - 패딩 줄이고 전체 크기 활용 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 100))}
          onKeyDown={handleKeyDown}
          placeholder="메모를 입력하세요."
          className={`w-full h-full p-3 pt-8 pb-8 bg-transparent border-none outline-none resize-none ${fontSize} text-gray-800 placeholder-gray-500 leading-relaxed touch-none transition-all duration-200`}
          maxLength={100}
          disabled={isClassifying}
        />
        
        {/* 글자 수 표시 */}
        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
          {content.length}/100
        </div>
        
        {/* 안내 텍스트 - PC와 모바일 모두 지원 */}
        <div className="absolute bottom-1 left-2 text-xs text-gray-500">
          {isClassifying ? 'AI 분류 중...' : '↑완료 | ↓다이어그램 | ←→삭제'}
        </div>

        {/* 피드백 아이콘 */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
            <div className="bg-white rounded-full p-3 shadow-lg">
              {feedback === 'save' ? (
                <Check className="w-8 h-8 text-green-500" />
              ) : feedback === 'delete' ? (
                <X className="w-8 h-8 text-red-500" />
              ) : feedback === 'classifying' ? (
                <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}