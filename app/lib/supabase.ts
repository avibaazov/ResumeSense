import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqqgayxmdjwlxukzfltf.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database type definitions
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          job_title: string | null
          resume_file_path: string
          image_file_path: string
          overall_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          job_title?: string | null
          resume_file_path: string
          image_file_path: string
          overall_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          job_title?: string | null
          resume_file_path?: string
          image_file_path?: string
          overall_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          resume_id: string
          overall_score: number
          ats_score: number
          ats_tips: any[]
          tone_style_score: number
          tone_style_tips: any[]
          content_score: number
          content_tips: any[]
          structure_score: number
          structure_tips: any[]
          skills_score: number
          skills_tips: any[]
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          overall_score: number
          ats_score: number
          ats_tips?: any[]
          tone_style_score: number
          tone_style_tips?: any[]
          content_score: number
          content_tips?: any[]
          structure_score: number
          structure_tips?: any[]
          skills_score: number
          skills_tips?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          overall_score?: number
          ats_score?: number
          ats_tips?: any[]
          tone_style_score?: number
          tone_style_tips?: any[]
          content_score?: number
          content_tips?: any[]
          structure_score?: number
          structure_tips?: any[]
          skills_score?: number
          skills_tips?: any[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}