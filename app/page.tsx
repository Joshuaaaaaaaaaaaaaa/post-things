'use client';

import { useState, useEffect } from 'react';
import { StickyNote, ViewMode } from '@/lib/types';
import { categorizeContent, getCategoryColor } from '@/lib/ai-categorizer';
import StickyNoteInput from '@/components/StickyNoteInput';
import AffinityDiagram from '@/components/AffinityDiagram';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('memo');
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [currentNote, setCurrentNote] = useState<StickyNote | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // 로컬 스토리지에서 노트 불러오기
  useEffect(() => {
    const savedNotes = localStorage.getItem('sticky-notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: StickyNote) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('노트 불러오기 실패:', error);
      }
    }
  }, []);

  // 노트 저장
  const saveNotes = (updatedNotes: StickyNote[]) => {
    try {
      localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('노트 저장 실패:', error);
      // TODO: 에러 알림 표시
    }
  };

  // 새 노트 추가 (AI 분류 포함)
  const addNote = async (content: string) => {
    setIsClassifying(true);
    
    try {
      console.log('AI 분류 시작:', content);
      
      // AI 분류 실행
      const category = await categorizeContent(content);
      const color = getCategoryColor(category);
      
      console.log('분류 완료:', { category, color });
      
      const newNote: StickyNote = {
        id: Date.now().toString(),
        content,
        category, // AI로 분류된 카테고리
        color,    // 카테고리에 맞는 색상
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedNotes = [...notes, newNote];
      saveNotes(updatedNotes);
    } catch (error) {
      console.error('AI 분류 실패:', error);
      
      // 실패 시 기본값으로 저장
      const newNote: StickyNote = {
        id: Date.now().toString(),
        content,
        category: '메모',
        color: 'yellow',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedNotes = [...notes, newNote];
      saveNotes(updatedNotes);
    } finally {
      setIsClassifying(false);
    }
  };

  // 노트 삭제
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  // 노트 완료 처리 (dim)
  const toggleNoteCompletion = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, isCompleted: !note.isCompleted } : note
    );
    saveNotes(updatedNotes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {viewMode === 'memo' ? (
        <StickyNoteInput
          onSave={addNote}
          onDelete={deleteNote}
          onComplete={toggleNoteCompletion}
          onSwitchToAffinity={() => setViewMode('diagram')}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          isClassifying={isClassifying}
        />
      ) : (
        <AffinityDiagram
          notes={notes}
          onNoteSelect={(note) => {
            setCurrentNote(note);
            setViewMode('memo');
          }}
          onSwitchToMemo={() => setViewMode('memo')}
        />
      )}
    </div>
  );
}