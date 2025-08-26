-- Supabase Migration Schema for ResumeSense
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT,
  job_title TEXT,
  resume_file_path TEXT NOT NULL, -- Supabase Storage path
  image_file_path TEXT NOT NULL,  -- Supabase Storage path
  overall_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER NOT NULL,
  ats_score INTEGER NOT NULL,
  ats_tips JSONB NOT NULL DEFAULT '[]',
  tone_style_score INTEGER NOT NULL,
  tone_style_tips JSONB NOT NULL DEFAULT '[]',
  content_score INTEGER NOT NULL,
  content_tips JSONB NOT NULL DEFAULT '[]',
  structure_score INTEGER NOT NULL,
  structure_tips JSONB NOT NULL DEFAULT '[]',
  skills_score INTEGER NOT NULL,
  skills_tips JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view feedback for own resumes" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = feedback.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feedback for own resumes" ON public.feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = feedback.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feedback for own resumes" ON public.feedback
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = feedback.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feedback for own resumes" ON public.feedback
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = feedback.resume_id 
      AND resumes.user_id = auth.uid()
    )
  );

-- Storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies
CREATE POLICY "Users can upload own resume files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own resume files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own resume files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to automatically create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Performance indexes for optimized queries
CREATE INDEX idx_resumes_user_id_created_at ON public.resumes(user_id, created_at DESC);
CREATE INDEX idx_feedback_resume_id ON public.feedback(resume_id);

-- Composite index for the getUserResumes JOIN query
CREATE INDEX idx_resumes_user_feedback ON public.resumes(user_id) 
  WHERE EXISTS (SELECT 1 FROM public.feedback WHERE feedback.resume_id = resumes.id);