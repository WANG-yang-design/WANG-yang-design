
export interface FileItem {
  id: string;
  text?: string; // Description or filename
  filetype?: string; // Optional to prevent crashes if missing
  filepath?: string; // Backend path, usually not needed for frontend display
  created_at?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export enum FileCategory {
  ALL = 'ALL',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export const API_BASE_URL = "https://1bf9fcae.r38.cpolar.top";

// Mapping extensions to allow-list (optional client side check)
export const SUPPORTED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  audio: ['mp3', 'wav'],
  video: ['mp4', 'avi', 'mov'],
  doc: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md', 'txt']
};