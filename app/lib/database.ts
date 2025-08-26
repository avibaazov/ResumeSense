import { supabase } from './supabase';
import type { Database } from './supabase';

// Database types from Supabase
type DatabaseResume = Database['public']['Tables']['resumes']['Row'];
type ResumeInsert = Database['public']['Tables']['resumes']['Insert'];
type DatabaseFeedback = Database['public']['Tables']['feedback']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];

// Now using global Resume and Feedback types from types/index.d.ts

export class DatabaseService {
  // Resume operations
  static async createResume(data: {
    companyName?: string;
    jobTitle?: string;
    resumeFilePath: string;
    imageFilePath: string;
  }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const resumeData: ResumeInsert = {
      user_id: user.id,
      company_name: data.companyName,
      job_title: data.jobTitle,
      resume_file_path: data.resumeFilePath,
      image_file_path: data.imageFilePath,
    };

    const { data: resume, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()
      .single();

    if (error) throw error;
    return resume.id;
  }

  static async getResume(id: string): Promise<Resume | null> {
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (resumeError) throw resumeError;
    if (!resume) return null;

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('resume_id', id)
      .single();

    if (feedbackError) {
      // If no feedback found, return null instead of throwing
      if (feedbackError.code === 'PGRST116') {
        return null;
      }
      throw feedbackError;
    }

    return this.transformToAppResume(resume, feedback);
  }

  static async getUserResumes(): Promise<Resume[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Optimized query: only get resumes that have feedback using INNER JOIN
    const { data: resumesWithFeedback, error } = await supabase
      .from('resumes')
      .select(`
        id,
        company_name,
        job_title,
        resume_file_path,
        image_file_path,
        created_at,
        feedback!inner (
          overall_score,
          ats_score,
          ats_tips,
          tone_style_score,
          tone_style_tips,
          content_score,
          content_tips,
          structure_score,
          structure_tips,
          skills_score,
          skills_tips
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform results directly since we know each resume has exactly one feedback
    return resumesWithFeedback.map(resume => {
      const feedback = resume.feedback[0]; // Always exists due to INNER JOIN
      return this.transformToAppResume(resume as any, feedback as any);
    });
  }

  static async updateResume(id: string, data: Partial<ResumeInsert>): Promise<void> {
    const { error } = await supabase
      .from('resumes')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteResume(id: string): Promise<void> {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Feedback operations
  static async createFeedback(resumeId: string, feedback: Feedback): Promise<void> {
    const feedbackData: FeedbackInsert = {
      resume_id: resumeId,
      overall_score: feedback.overallScore,
      ats_score: feedback.ATS.score,
      ats_tips: feedback.ATS.tips,
      tone_style_score: feedback.toneAndStyle.score,
      tone_style_tips: feedback.toneAndStyle.tips,
      content_score: feedback.content.score,
      content_tips: feedback.content.tips,
      structure_score: feedback.structure.score,
      structure_tips: feedback.structure.tips,
      skills_score: feedback.skills.score,
      skills_tips: feedback.skills.tips,
    };

    const { error } = await supabase
      .from('feedback')
      .insert(feedbackData);

    if (error) throw error;

    // Update resume overall score
    await this.updateResume(resumeId, { 
      overall_score: feedback.overallScore 
    });
  }

  static async deleteFeedback(resumeId: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('resume_id', resumeId);

    if (error) throw error;

    // Clear resume overall score
    await this.updateResume(resumeId, { 
      overall_score: null 
    });
  }

  // Helper method to transform database types to app types
  private static transformToAppResume(resume: DatabaseResume, feedback: DatabaseFeedback): Resume {
    return {
      id: resume.id,
      companyName: resume.company_name || undefined,
      jobTitle: resume.job_title || undefined,
      imagePath: resume.image_file_path,
      resumePath: resume.resume_file_path,
      feedback: {
        overallScore: feedback.overall_score,
        ATS: {
          score: feedback.ats_score,
          tips: feedback.ats_tips as any[],
        },
        toneAndStyle: {
          score: feedback.tone_style_score,
          tips: feedback.tone_style_tips as any[],
        },
        content: {
          score: feedback.content_score,
          tips: feedback.content_tips as any[],
        },
        structure: {
          score: feedback.structure_score,
          tips: feedback.structure_tips as any[],
        },
        skills: {
          score: feedback.skills_score,
          tips: feedback.skills_tips as any[],
        },
      },
    };
  }
}