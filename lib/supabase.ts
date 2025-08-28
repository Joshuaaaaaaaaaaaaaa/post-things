import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types.js'

// Supabase 프로젝트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Cloud synchronization will be disabled.')
}

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'dummy_key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// 데이터베이스 타입 정의 (자동 생성 예정)
export type StickyNoteDB = Database['public']['Tables']['sticky_notes']['Row']
export type StickyNoteInsert = Database['public']['Tables']['sticky_notes']['Insert']
export type StickyNoteUpdate = Database['public']['Tables']['sticky_notes']['Update']