import { supabase } from './supabase';

export class StorageService {
  private static BUCKET = 'resumes';

  // Upload a file and return its path
  static async uploadFile(file: File, userId: string, type: 'pdf' | 'image'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${type}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .upload(filePath, file);

    if (error) throw error;
    
    return data.path;
  }

  // Get a signed URL for a file (for display)
  static async getFileUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    
    return data.signedUrl;
  }

  // Get file as blob (for processing)
  static async getFileBlob(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .download(path);

    if (error) throw error;
    
    return data;
  }

  // Delete a file
  static async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET)
      .remove([path]);

    if (error) throw error;
  }

  // Upload multiple files (for compatibility with existing upload pattern)
  static async uploadFiles(files: File[]): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const uploadPromises = files.map(file => {
      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      return this.uploadFile(file, user.id, type);
    });

    return Promise.all(uploadPromises);
  }

  // Utility to determine file type from path
  static getFileType(path: string): 'pdf' | 'image' {
    return path.startsWith('image/') ? 'image' : 'pdf';
  }

  // Create a download URL that doesn't expire (for PDFs that need to be opened in new tab)
  static async getPublicUrl(path: string): Promise<string> {
    const { data } = supabase.storage
      .from(this.BUCKET)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}