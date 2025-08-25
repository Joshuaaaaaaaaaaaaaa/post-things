'use client';

import { useState, useEffect } from 'react';
import { StickyNote, ViewMode } from '@/lib/types';
import { categorizeContent, getCategoryColor } from '@/lib/ai-categorizer';
import { 
  fetchNotesFromSupabase, 
  saveNoteToSupabase, 
  updateNoteInSupabase, 
  deleteNoteFromSupabase,
  migrateLocalStorageToSupabase,
  checkSupabaseConnection 
} from '@/lib/supabase-api';
import StickyNoteInput from '@/components/StickyNoteInput';
import AffinityDiagram from '@/components/AffinityDiagram';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('memo');
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [currentNote, setCurrentNote] = useState<StickyNote | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase 연결 및 데이터 로딩
  useEffect(() => {
    async function initializeApp() {
      setIsLoading(true);
      
      try {
        // 1. Supabase 연결 확인
        const isConnected = await checkSupabaseConnection();
        setIsSupabaseConnected(isConnected);
        
        if (isConnected) {
          console.log('✅ Supabase 연결 성공');
          
          // 2. LocalStorage → Supabase 마이그레이션 (최초 1회)
          await migrateLocalStorageToSupabase();
          
          // 3. Supabase에서 노트 로드
          const supabaseNotes = await fetchNotesFromSupabase();
          setNotes(supabaseNotes);
          console.log(`📋 ${supabaseNotes.length}개 노트 로드됨`);
        } else {
          console.warn('⚠️ Supabase 연결 실패, LocalStorage 사용');
          
          // Supabase 실패 시 LocalStorage 사용
          const savedNotes = localStorage.getItem('sticky-notes');
          if (savedNotes) {
            try {
              const parsedNotes = JSON.parse(savedNotes).map((note: StickyNote) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: new Date(note.updatedAt),
              }));
              setNotes(parsedNotes);
              console.log(`📋 LocalStorage에서 ${parsedNotes.length}개 노트 로드됨`);
            } catch (error) {
              console.error('LocalStorage 노트 불러오기 실패:', error);
            }
          }
        }
      } catch (error) {
        console.error('앱 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeApp();
  }, []);

  // 노트 저장 (Supabase + LocalStorage 백업)
  const saveNotes = async (updatedNotes: StickyNote[]) => {
    try {
      // 즉시 UI 업데이트
      setNotes(updatedNotes);
      
      if (isSupabaseConnected) {
        // Supabase에 저장 (백그라운드)
        // 개별 노트 처리는 addNote, updateNote에서 담당
        console.log('📋 노트 목록 업데이트됨');
      } else {
        // Supabase 미연결 시 LocalStorage 사용
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
        console.log('💾 LocalStorage에 저장됨');
      }
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
      
      // Supabase에 개별 저장
      if (isSupabaseConnected) {
        const success = await saveNoteToSupabase(newNote);
        if (success) {
          console.log('✅ Supabase에 노트 저장 성공');
        } else {
          console.warn('⚠️ Supabase 저장 실패, LocalStorage 백업');
          localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
        }
      }
      
      await saveNotes(updatedNotes);
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
  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    
    // Supabase에서 삭제
    if (isSupabaseConnected) {
      const success = await deleteNoteFromSupabase(id);
      if (success) {
        console.log('✅ Supabase에서 노트 삭제 성공');
      } else {
        console.warn('⚠️ Supabase 삭제 실패, LocalStorage 백업');
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      }
    }
    
    await saveNotes(updatedNotes);
  };

  // 노트 완료 처리 (dim)
  const toggleNoteCompletion = async (id: string) => {
    const noteToUpdate = notes.find(note => note.id === id);
    if (!noteToUpdate) return;
    
    const updatedNote = { 
      ...noteToUpdate, 
      isCompleted: !noteToUpdate.isCompleted,
      updatedAt: new Date()
    };
    
    const updatedNotes = notes.map(note =>
      note.id === id ? updatedNote : note
    );
    
    // Supabase에서 업데이트
    if (isSupabaseConnected) {
      const success = await updateNoteInSupabase(updatedNote);
      if (success) {
        console.log('✅ Supabase에서 노트 업데이트 성공');
      } else {
        console.warn('⚠️ Supabase 업데이트 실패, LocalStorage 백업');
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      }
    }
    
    await saveNotes(updatedNotes);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isSupabaseConnected ? '☁️ 클라우드 동기화 중...' : '📱 앱 로딩 중...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 연결 상태 표시 */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isSupabaseConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isSupabaseConnected ? '☁️ 클라우드 동기화' : '📱 로컬 저장'}
        </div>
      </div>
      
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