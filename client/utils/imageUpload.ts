import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `issue-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  });

  return Promise.all(uploadPromises);
}

export async function deleteImage(url: string): Promise<void> {
  // Extract the file path from the URL
  const urlParts = url.split('/');
  const filePath = urlParts.slice(-2).join('/'); // Gets 'issue-images/filename.ext'

  const { error } = await supabase.storage
    .from('images')
    .remove([filePath]);

  if (error) {
    throw error;
  }
}
