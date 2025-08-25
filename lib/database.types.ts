export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sticky_notes: {
        Row: {
          id: string
          content: string
          category: 'To-Do' | '메모' | '아이디어'
          color: 'yellow' | 'pink' | 'blue' | 'green'
          is_completed: boolean
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          content: string
          category: 'To-Do' | '메모' | '아이디어'
          color: 'yellow' | 'pink' | 'blue' | 'green'
          is_completed?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          content?: string
          category?: 'To-Do' | '메모' | '아이디어'
          color?: 'yellow' | 'pink' | 'blue' | 'green'
          is_completed?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
