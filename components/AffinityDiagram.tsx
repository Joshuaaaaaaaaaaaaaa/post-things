'use client';

import { useState } from 'react';
import { StickyNote } from '@/lib/types';
import { getCategoryPriority } from '@/lib/ai-categorizer';
import { Edit3, Clock, Grid, Tag, MoreVertical, Check, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortType = 'category' | 'topic' | 'time';

interface AffinityDiagramProps {
  notes: StickyNote[];
  onNoteSelect: (note: StickyNote | null) => void;
  onSwitchToMemo: () => void;
  onNoteComplete: (id: string) => void;
  onNoteDelete: (id: string) => void;
}

export default function AffinityDiagram({
  notes,
  onNoteSelect,
  onSwitchToMemo,
  onNoteComplete,
  onNoteDelete
}: AffinityDiagramProps) {
  const [sortType, setSortType] = useState<SortType>('category');
  const [actionFeedback, setActionFeedback] = useState<{ [key: string]: 'complete' | 'delete' | null }>({});
  
  const handleNoteClick = (note: StickyNote, e: React.MouseEvent) => {
    // 더보기 메뉴 클릭 시 이벤트 전파 중단
    if ((e.target as HTMLElement).closest('.more-menu')) {
      e.stopPropagation();
      return;
    }
    onNoteSelect(note);
    onSwitchToMemo();
  };

  const handleNewMemo = () => {
    onNoteSelect(null);
    onSwitchToMemo();
  };

  // 완료 처리 with 피드백
  const handleComplete = (noteId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // 피드백 표시
    setActionFeedback(prev => ({ ...prev, [noteId]: 'complete' }));
    
    // 실제 완료 처리
    setTimeout(() => {
      onNoteComplete(noteId);
      // 피드백 제거
      setTimeout(() => {
        setActionFeedback(prev => ({ ...prev, [noteId]: null }));
      }, 500);
    }, 300);
  };

  // 삭제 처리 with 피드백
  const handleDelete = (noteId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // 피드백 표시
    setActionFeedback(prev => ({ ...prev, [noteId]: 'delete' }));
    
    // 실제 삭제 처리
    setTimeout(() => {
      onNoteDelete(noteId);
      // 피드백 제거
      setTimeout(() => {
        setActionFeedback(prev => ({ ...prev, [noteId]: null }));
      }, 500);
    }, 300);
  };

  // 주제 추출 함수 개선
  const extractTopic = (content: string): string => {
    // 복합 키워드 먼저 체크 (순서 중요)
    const complexKeywords = [
      'AI Fitness',
      'Next.js',
      'React Native',
      'UI/UX',
    ];
    
    // 중요 패턴 (우선순위 순서대로)
    const patterns = [
      // 사람 + 보고/회의/미팅
      /([가-힣]+[님께서|님과|님|상무|부장|차장|과장])\s*([가-힣]*(?:보고|회의|미팅))/,
      // 사람 + 행동
      /([가-힣]+[님께서|님과|님|상무|부장|차장|과장])\s*([가-힣]+)/,
      // 회의/미팅/보고 관련
      /([가-힣]+(?:보고|회의|미팅))/,
      // 프로젝트/제품 이름
      /([A-Za-z\s]+(?:\s*[0-9]*\.[0-9x]*|\s*프로젝트|서비스|앱|웹))/,
    ];

    // 불필요한 단어/조사 제거
    const stopWords = ['에서', '에게', '으로', '하고', '하자', '할', '을', '를', '이', '가', '및', '등'];
    
    // 1. 복합 키워드 체크
    for (const keyword of complexKeywords) {
      if (content.includes(keyword)) {
        return keyword;
      }
    }
    
    // 2. 중요 패턴 체크
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        // 패턴에 따라 적절한 부분 반환
        if (match[2] && (match[2].includes('보고') || match[2].includes('회의') || match[2].includes('미팅'))) {
          return `${match[1]} ${match[2]}`;
        }
        return match[1];
      }
    }
    
    // 3. 문장을 단어로 분리하고 전처리
    const words = content
      .split(/[\s,]+/)
      .filter(word => !stopWords.includes(word))
      .filter(word => word.length >= 2);
    
    // 4. 연속된 의미있는 단어 찾기
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i];
      const next = words[i + 1];
      
      // 영문+숫자 조합이나 의미있는 단어 조합
      if ((/[A-Za-z]/.test(current) && /[A-Za-z0-9]/.test(next)) ||
          (current.length >= 2 && next.length >= 2)) {
        return `${current} ${next}`;
      }
    }
    
    return words[0] || '기타';
  };

  // 주제별 그룹화 함수
  const groupByTopic = (notes: StickyNote[]) => {
    return notes.reduce((acc, note) => {
      const topic = extractTopic(note.content);
      if (!acc[topic]) {
        acc[topic] = [];
      }
      acc[topic].push(note);
      return acc;
    }, {} as Record<string, StickyNote[]>);
  };

  // 카테고리별 그룹화 함수
  const groupByCategory = (notes: StickyNote[]) => {
    return notes.reduce((acc, note) => {
      if (!acc[note.category]) {
        acc[note.category] = [];
      }
      acc[note.category].push(note);
      return acc;
    }, {} as Record<string, StickyNote[]>);
  };

  // 시간별 정렬 함수
  const sortByTime = (notes: StickyNote[]) => {
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    // 날짜별로 그룹화
    const groupedByDate = sortedNotes.reduce((acc, note) => {
      const noteDate = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt);
      const dateKey = format(noteDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(note);
      return acc;
    }, {} as Record<string, StickyNote[]>);

    return { sortedNotes, groupedByDate };
  };

  // 정렬된 노트와 그룹 가져오기
  const getSortedNotesAndGroups = () => {
    switch (sortType) {
      case 'category':
        const groupedByCategory = groupByCategory(notes);
        const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
          return getCategoryPriority(a as 'To-Do' | '메모' | '아이디어') - getCategoryPriority(b as 'To-Do' | '메모' | '아이디어');
        });
        return { groups: sortedCategories, groupedNotes: groupedByCategory, isTimeline: false };
      
      case 'topic':
        const groupedByTopic = groupByTopic(notes);
        const sortedTopics = Object.keys(groupedByTopic).sort();
        return { groups: sortedTopics, groupedNotes: groupedByTopic, isTimeline: false };
      
      case 'time':
        const { groupedByDate } = sortByTime(notes);
        const sortedDates = Object.keys(groupedByDate).sort().reverse();
        return { groups: sortedDates, groupedNotes: groupedByDate, isTimeline: true };
    }
  };

  // 카테고리별 색상 테마
  const getTheme = (group: string) => {
    switch (group) {
      case 'To-Do':
        return {
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          title: 'text-pink-800',
          badge: 'bg-pink-100 text-pink-800'
        };
      case '아이디어':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800'
        };
    }
  };

  const { groups, groupedNotes, isTimeline } = getSortedNotesAndGroups();

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* 정렬 옵션 선택 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2">
          <button
            onClick={() => setSortType('category')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              sortType === 'category'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <Tag size={18} />
            <span className="text-base">카테고리별</span>
          </button>
          <button
            onClick={() => setSortType('topic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              sortType === 'topic'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <Grid size={18} />
            <span className="text-base">주제별</span>
          </button>
          <button
            onClick={() => setSortType('time')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              sortType === 'time'
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <Clock size={18} />
            <span className="text-base">시간순</span>
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg mb-4">아직 작성된 포스트잇이 없습니다.</p>
          <p className="text-base text-gray-400">우측 하단 버튼을 눌러 첫 메모를 작성해보세요!</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {groups.map((group) => {
            const groupNotes = groupedNotes[group];
            const theme = getTheme(group);
            // 완료되지 않은 노트만 카운트
            const activeCount = groupNotes.filter(note => !note.isCompleted).length;
            const completedCount = groupNotes.filter(note => note.isCompleted).length;
            
            return (
              <div key={group} className={`${isTimeline ? '' : `${theme.bg} ${theme.border} border-2`} rounded-xl p-6`}>
                {/* 그룹 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {isTimeline ? (
                      <h2 className="text-2xl font-bold text-gray-800">
                        {format(new Date(group), 'M월 d일 (E)', { locale: ko })}
                      </h2>
                    ) : (
                      <>
                        <h2 className={`text-2xl font-bold ${theme.title}`}>{group}</h2>
                        <span className={`px-4 py-1.5 rounded-full text-base font-medium ${theme.badge}`}>
                          {activeCount}개
                        </span>
                        {group === 'To-Do' && completedCount > 0 && (
                          <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">
                            {completedCount}개 완료
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* 노트 그리드/타임라인 */}
                <div className={`grid ${isTimeline ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                  {groupNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={(e) => handleNoteClick(note, e)}
                      className={`relative p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                        note.color === 'yellow' ? 'bg-yellow-200 hover:bg-yellow-300' :
                        note.color === 'pink' ? 'bg-pink-200 hover:bg-pink-300' :
                        note.color === 'blue' ? 'bg-blue-200 hover:bg-blue-300' : 
                        'bg-green-200 hover:bg-green-300'
                      } ${
                        isTimeline ? 'transform-none hover:translate-x-2' : 'aspect-square transform hover:scale-105'
                      }`}
                      style={{ height: isTimeline ? 'auto' : undefined }}
                    >
                      {/* 더보기 메뉴 */}
                      <div className="absolute top-2 right-2 more-menu z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="hover:bg-black/10 p-1 rounded-full">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!note.isCompleted && (
                              <DropdownMenuItem onClick={(e) => handleComplete(note.id, e)}>
                                <Check className="w-4 h-4 mr-2" />
                                <span>완료</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => handleDelete(note.id, e)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span>삭제</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* 포스트잇 상단 접착 부분 */}
                      <div className="relative h-full">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1.5 bg-yellow-300 rounded-b-sm opacity-60 -mt-2"></div>
                        
                        <div className="h-full flex flex-col justify-between pt-2">
                          {/* 메모 내용 */}
                          <div className="flex-1">
                            <p className="text-base leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                          
                          {/* 하단 정보 */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-gray-600 font-medium">
                              {format(note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt), 'M월 d일 (E) HH:mm', { locale: ko })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 완료 오버레이 */}
                      {note.isCompleted && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                          <span className="text-white text-lg font-bold">완료</span>
                        </div>
                      )}

                      {/* 액션 피드백 */}
                      {actionFeedback[note.id] && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center z-30">
                          <div className="bg-white rounded-full p-3 shadow-lg">
                            {actionFeedback[note.id] === 'complete' ? (
                              <Check className="w-8 h-8 text-green-500" />
                            ) : (
                              <X className="w-8 h-8 text-red-500" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {groupNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-base">
                      이 {
                        sortType === 'category' ? '카테고리' : 
                        sortType === 'topic' ? '주제' : '날짜'
                      }에는 아직 메모가 없습니다.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 플로팅 새 메모 작성 버튼 */}
      <button
        onClick={handleNewMemo}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-10"
        aria-label="새 메모 작성"
      >
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  );
}