import { API_BASE_URL, ApiResponse, FileItem } from '../types';

export const ApiService = {
  /**
   * Fetch all files
   */
  getList: async (): Promise<FileItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/list`, {
        method: 'GET',
        mode: 'cors', // Important for cross-origin if backend supports it
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const json: ApiResponse<FileItem[]> = await response.json();
      if (json.code === 200) {
        return json.data;
      } else {
        throw new Error(json.message || "Failed to fetch list");
      }
    } catch (error) {
      console.error("API Error (getList):", error);
      throw error;
    }
  },

  /**
   * Upload a file
   */
  uploadFile: async (file: File, text?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (text) {
      formData.append('text', text);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const json: ApiResponse<any> = await response.json();
      return json;
    } catch (error) {
      console.error("API Error (uploadFile):", error);
      throw error;
    }
  },

  /**
   * Get direct download/preview URL
   */
  getDownloadUrl: (id: string): string => {
    return `${API_BASE_URL}/download/${id}`;
  }
};