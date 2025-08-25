import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Supabase 프로젝트 설정
// 실제 사용 시 environment variables로 변경 필요
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 데이터베이스 타입 정의 (자동 생성 예정)
export type StickyNoteDB = Database['public']['Tables']['sticky_notes']['Row']
export type StickyNoteInsert = Database['public']['Tables']['sticky_notes']['Insert']
export type StickyNoteUpdate = Database['public']['Tables']['sticky_notes']['Update']
