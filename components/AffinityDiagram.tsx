'use client';

import { StickyNote } from '@/lib/types';
import { getCategoryPriority } from '@/lib/ai-categorizer';
import { Edit3 } from 'lucide-react';

interface AffinityDiagramProps {
  notes: StickyNote[];
  onNoteSelect: (note: StickyNote) => void;
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
  
  const handleNoteClick = (note: StickyNote) => {
    onNoteSelect(note);
    onSwitchToMemo(); // 노트 선택 시 자동으로 메모 모드로 전환
  };

  // 새 메모 작성 (이전 내용 초기화)
  const handleNewMemo = () => {
    onNoteSelect(null); // 현재 노트를 null로 설정하여 초기화
    onSwitchToMemo();
  };

  // 카테고리별로 노트 그룹화 및 정렬
  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, StickyNote[]>);

  // 카테고리를 우선순위에 따라 정렬
  const sortedCategories = Object.keys(groupedNotes).sort((a, b) => {
    return getCategoryPriority(a as any) - getCategoryPriority(b as any);
  });

  // 카테고리별 색상 테마
  const getCategoryTheme = (category: string) => {
    switch (category) {
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
      case '메모':
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg mb-4">아직 작성된 포스트잇이 없습니다.</p>
          <p className="text-sm text-gray-400">우측 하단 버튼을 눌러 첫 메모를 작성해보세요!</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          {sortedCategories.map((category) => {
            const categoryNotes = groupedNotes[category];
            const theme = getCategoryTheme(category);
            const completedCount = categoryNotes.filter(note => note.isCompleted).length;
            
            return (
              <div key={category} className={`${theme.bg} ${theme.border} border-2 rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-xl font-bold ${theme.title}`}>{category}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme.badge}`}>
                      {categoryNotes.length}개
                    </span>
                    {category === 'To-Do' && completedCount > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {completedCount}개 완료
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {categoryNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className={`p-3 rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                        note.color === 'yellow' ? 'bg-yellow-200 hover:bg-yellow-300' :
                        note.color === 'pink' ? 'bg-pink-200 hover:bg-pink-300' :
                        note.color === 'blue' ? 'bg-blue-200 hover:bg-blue-300' : 
                        'bg-green-200 hover:bg-green-300'
                      } ${note.isCompleted ? 'opacity-50 scale-95' : ''}`}
                      style={{ aspectRatio: '1/1' }}
                    >
                      {/* 포스트잇 상단 접착 부분 */}
                      <div className="relative h-full">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-yellow-300 rounded-b-sm opacity-60 -mt-1"></div>
                        
                        <div className="h-full flex flex-col justify-between pt-2">
                          <p className="text-xs leading-relaxed line-clamp-4 flex-1">
                            {note.content}
                          </p>
                          
                          {note.isCompleted && (
                            <div className="flex justify-center mt-1">
                              <span className="text-green-600 text-lg">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {categoryNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">이 카테고리에는 아직 메모가 없습니다.</p>
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-10"
        aria-label="새 메모 작성"
      >
        <Edit3 className="w-6 h-6" />
      </button>
    </div>
  );
}