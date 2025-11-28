
import { FileCategory, FileItem } from '../types';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileQuestion 
} from 'lucide-react';

export const getCategoryFromMime = (mime?: string): FileCategory => {
  // Defensive check: Ensure mime is a valid string
  if (!mime || typeof mime !== 'string') return FileCategory.DOCUMENT;
  
  const lowerMime = mime.toLowerCase();
  
  if (lowerMime.startsWith('image/')) return FileCategory.IMAGE;
  if (lowerMime.startsWith('video/')) return FileCategory.VIDEO;
  if (lowerMime.startsWith('audio/')) return FileCategory.AUDIO;
  
  // Common document mime types
  if (
    lowerMime.includes('pdf') ||
    lowerMime.includes('word') ||
    lowerMime.includes('excel') ||
    lowerMime.includes('sheet') ||
    lowerMime.includes('presentation') ||
    lowerMime.includes('text/') || 
    lowerMime.includes('csv') ||
    lowerMime.includes('markdown')
  ) {
    return FileCategory.DOCUMENT;
  }

  return FileCategory.DOCUMENT;
};

export const getIconForCategory = (category: FileCategory) => {
  switch (category) {
    case FileCategory.IMAGE: return ImageIcon;
    case FileCategory.VIDEO: return Video;
    case FileCategory.AUDIO: return Music;
    case FileCategory.DOCUMENT: return FileText;
    default: return FileQuestion;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
