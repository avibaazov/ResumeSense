import { create } from "zustand";
import { useAuthStore } from "./auth";
import { DatabaseService } from "./database";
import { StorageService } from "./storage";

interface ResumeStore {
  isLoading: boolean;
  error: string | null;
  
  // Resume operations
  createResume: (data: {
    companyName?: string;
    jobTitle?: string;
    resumeFile: File;
    imageFile: File;
  }) => Promise<string>;
  
  getResume: (id: string) => Promise<Resume | null>;
  getUserResumes: () => Promise<Resume[]>;
  deleteResume: (id: string) => Promise<void>;
  
  // File operations
  getFileUrl: (path: string) => Promise<string>;
  getFileBlob: (path: string) => Promise<Blob>;
  
  // Feedback operations
  createFeedback: (resumeId: string, feedback: Feedback) => Promise<void>;
  deleteFeedback: (resumeId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => {
  const setError = (error: string) => {
    set({ error, isLoading: false });
  };

  const setLoading = (isLoading: boolean) => {
    set({ isLoading });
  };

  return {
    isLoading: false,
    error: null,

    createResume: async (data) => {
      setLoading(true);
      
      try {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('User not authenticated');

        // Upload files
        const [resumePath, imagePath] = await Promise.all([
          StorageService.uploadFile(data.resumeFile, user.id, 'pdf'),
          StorageService.uploadFile(data.imageFile, user.id, 'image'),
        ]);

        // Create resume record
        const resumeId = await DatabaseService.createResume({
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          resumeFilePath: resumePath,
          imageFilePath: imagePath,
        });

        set({ isLoading: false, error: null });
        return resumeId;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create resume');
        throw err;
      }
    },

    getResume: async (id: string) => {
      setLoading(true);
      
      try {
        const resume = await DatabaseService.getResume(id);
        set({ isLoading: false, error: null });
        return resume;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get resume');
        throw err;
      }
    },

    getUserResumes: async () => {
      setLoading(true);
      
      try {
        const resumes = await DatabaseService.getUserResumes();
        set({ isLoading: false, error: null });
        return resumes;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get resumes');
        throw err;
      }
    },

    deleteResume: async (id: string) => {
      setLoading(true);
      
      try {
        // Get resume to find file paths
        const resume = await DatabaseService.getResume(id);
        if (resume) {
          // Delete files from storage
          await Promise.all([
            StorageService.deleteFile(resume.resumePath),
            StorageService.deleteFile(resume.imagePath),
          ]);
        }
        
        // Delete resume record (feedback will be deleted via CASCADE)
        await DatabaseService.deleteResume(id);
        
        set({ isLoading: false, error: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete resume');
        throw err;
      }
    },

    getFileUrl: async (path: string) => {
      try {
        return await StorageService.getFileUrl(path);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get file URL');
        throw err;
      }
    },

    getFileBlob: async (path: string) => {
      try {
        return await StorageService.getFileBlob(path);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get file');
        throw err;
      }
    },

    createFeedback: async (resumeId: string, feedback: Feedback) => {
      setLoading(true);
      
      try {
        await DatabaseService.createFeedback(resumeId, feedback);
        set({ isLoading: false, error: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create feedback');
        throw err;
      }
    },

    deleteFeedback: async (resumeId: string) => {
      setLoading(true);
      
      try {
        await DatabaseService.deleteFeedback(resumeId);
        set({ isLoading: false, error: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete feedback');
        throw err;
      }
    },

    clearError: () => {
      set({ error: null });
    },
  };
});