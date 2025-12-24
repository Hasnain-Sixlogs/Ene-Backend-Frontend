// Digital Bible Platform (DBT) API Service
// Documentation: https://4.dbt.io/api
// 
// TODO: Move API_KEY to environment variable for better security
// Create .env file with: VITE_DBT_API_KEY=your_api_key_here

const API_BASE_URL = import.meta.env.VITE_DBT_API_BASE_URL || 'https://4.dbt.io/api';
const API_KEY = import.meta.env.VITE_DBT_API_KEY || '851b4b78-fcf6-47fc-89c7-4e8d11446e26';
const API_VERSION = '4';

import type {
  BiblesResponse,
  LanguagesResponse,
  BooksResponse,
  ContentResponse,
  ChapterContentResponse,
  Bible,
  Language,
  Book,
} from '@/types/bible';

/**
 * Get bibles by language code
 * @param languageCode - ISO language code (e.g., 'urd', 'eng')
 * @returns Promise with bibles data
 */
export const getBiblesByLanguage = async (languageCode: string): Promise<BiblesResponse> => {
  const url = `${API_BASE_URL}/bibles?v=${API_VERSION}&language_code=${languageCode}&key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch bibles: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Search languages by name or code
 * @param searchTerm - Language name or code to search for
 * @param page - Page number (default: 1)
 * @returns Promise with languages data
 */
export const searchLanguages = async (searchTerm: string, page: number = 1): Promise<LanguagesResponse> => {
  const url = `${API_BASE_URL}/languages/search/${encodeURIComponent(searchTerm)}?v=${API_VERSION}&page=${page}&key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to search languages: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Get all books/chapters for a specific bible
 * @param bibleId - Bible abbreviation (e.g., 'ENGESV', 'URDCBC')
 * @param verifyContent - Whether to verify content availability (default: true)
 * @returns Promise with books data
 */
export const getBibleBooks = async (bibleId: string, verifyContent: boolean = true): Promise<BooksResponse> => {
  const url = `${API_BASE_URL}/bibles/${bibleId}/book?v=${API_VERSION}&key=${API_KEY}&verify_content=${verifyContent}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch bible books: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Get chapter content (text, audio, or video) for a specific chapter
 * @param filesetId - Fileset ID for content (e.g., 'URDIRVN_ET', 'URDIRVN_DA', 'URDIRVN_DV')
 * @param bookId - Book ID (e.g., 'GEN', 'MAT')
 * @param chapter - Chapter number as string (e.g., '1', '2')
 * @returns Promise with chapter content
 */
export const getChapterContent = async (
  filesetId: string,
  bookId: string,
  chapter: string | number
): Promise<ChapterContentResponse> => {
  const chapterStr = typeof chapter === 'number' ? chapter.toString() : chapter;
  const url = `${API_BASE_URL}/bibles/filesets/${filesetId}/${bookId}/${chapterStr}?v=${API_VERSION}&key=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    // Handle 404 as content not available (not an error)
    if (response.status === 404) {
      const error = new Error(`Content not available for ${filesetId}/${bookId}/${chapterStr}`);
      (error as { status?: number }).status = 404;
      throw error;
    }
    // For other errors, provide better error message
    const statusText = response.statusText || `HTTP ${response.status}`;
    const error = new Error(`Failed to fetch chapter content (${statusText})`);
    (error as { status?: number }).status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * Get text content (PDFs/text) for a specific chapter
 * @param filesetId - Fileset ID for text content (e.g., 'URDIRVN_ET')
 * @param bookId - Book ID (e.g., 'GEN', 'MAT')
 * @param chapter - Chapter number (e.g., 1)
 * @returns Promise with text content
 */
export const getTextContent = async (
  filesetId: string,
  bookId: string,
  chapter: number | string
): Promise<ChapterContentResponse> => {
  return getChapterContent(filesetId, bookId, chapter);
};

/**
 * Get audio/video content for a specific chapter
 * @param filesetId - Fileset ID for audio/video content (e.g., 'URDIRVN_DA')
 * @param bookId - Book ID (e.g., 'GEN', 'LUK')
 * @param chapter - Chapter number (e.g., 1)
 * @returns Promise with audio/video content
 */
export const getAudioVideoContent = async (
  filesetId: string,
  bookId: string,
  chapter: number | string
): Promise<ChapterContentResponse> => {
  return getChapterContent(filesetId, bookId, chapter);
};

/**
 * Helper function to get text fileset IDs from bible data (in priority order)
 * Priority: text_plain > text_json > text_usx > text_format > text
 * Also considers book's testament (OT/NT) to match fileset size
 */
export const getTextFilesetIds = (bible: Bible, bookTestament?: string): string[] => {
  const textTypes = ['text_plain', 'text_json', 'text_usx', 'text_format', 'text'];
  const filesetIds: string[] = [];
  
  // Check new structure first
  if (bible.filesets.text && bible.filesets.text.length > 0) {
    // Filter by testament if provided
    const filtered = bookTestament 
      ? bible.filesets.text.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : bible.filesets.text;
    
    // Sort by priority
    for (const type of textTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      filesetIds.push(...matching.map(fs => fs.id));
    }
  }
  
  // Fallback to legacy structure
  for (const orgKey in bible.filesets) {
    const filesets = bible.filesets[orgKey as keyof typeof bible.filesets];
    if (!filesets || !Array.isArray(filesets)) continue;
    
    // Filter by testament if provided
    const filtered = bookTestament
      ? filesets.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : filesets;
    
    // Sort by priority
    for (const type of textTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      matching.forEach(fs => {
        if (!filesetIds.includes(fs.id)) {
          filesetIds.push(fs.id);
        }
      });
    }
  }
  
  return filesetIds;
};

/**
 * Helper function to get text fileset ID from bible data (first available)
 */
export const getTextFilesetId = (bible: Bible, bookTestament?: string): string | null => {
  const ids = getTextFilesetIds(bible, bookTestament);
  return ids.length > 0 ? ids[0] : null;
};

/**
 * Helper function to get audio fileset IDs from bible data (in priority order)
 * Priority: audio > audio_drama > audio_stream > audio_drama_stream
 * Also considers book's testament (OT/NT) to match fileset size
 */
export const getAudioFilesetIds = (bible: Bible, bookTestament?: string): string[] => {
  const audioTypes = ['audio', 'audio_drama', 'audio_stream', 'audio_drama_stream'];
  const filesetIds: string[] = [];
  
  // Check new structure first
  if (bible.filesets.audio && bible.filesets.audio.length > 0) {
    // Filter by testament if provided
    const filtered = bookTestament 
      ? bible.filesets.audio.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : bible.filesets.audio;
    
    // Sort by priority
    for (const type of audioTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      filesetIds.push(...matching.map(fs => fs.id));
    }
  }
  
  // Fallback to legacy structure
  for (const orgKey in bible.filesets) {
    const filesets = bible.filesets[orgKey as keyof typeof bible.filesets];
    if (!filesets || !Array.isArray(filesets)) continue;
    
    // Filter by testament if provided
    const filtered = bookTestament
      ? filesets.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : filesets;
    
    // Sort by priority
    for (const type of audioTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      matching.forEach(fs => {
        if (!filesetIds.includes(fs.id)) {
          filesetIds.push(fs.id);
        }
      });
    }
  }
  
  return filesetIds;
};

/**
 * Helper function to get audio fileset ID from bible data (first available)
 */
export const getAudioFilesetId = (bible: Bible, bookTestament?: string): string | null => {
  const ids = getAudioFilesetIds(bible, bookTestament);
  return ids.length > 0 ? ids[0] : null;
};

/**
 * Helper function to get video fileset IDs from bible data (in priority order)
 * Priority: video > video_stream
 * Also considers book's testament (OT/NT) to match fileset size
 */
export const getVideoFilesetIds = (bible: Bible, bookTestament?: string): string[] => {
  const videoTypes = ['video', 'video_stream'];
  const filesetIds: string[] = [];
  
  // Check new structure first
  if (bible.filesets.video && bible.filesets.video.length > 0) {
    // Filter by testament if provided
    const filtered = bookTestament 
      ? bible.filesets.video.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : bible.filesets.video;
    
    // Sort by priority
    for (const type of videoTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      filesetIds.push(...matching.map(fs => fs.id));
    }
  }
  
  // Fallback to legacy structure
  for (const orgKey in bible.filesets) {
    const filesets = bible.filesets[orgKey as keyof typeof bible.filesets];
    if (!filesets || !Array.isArray(filesets)) continue;
    
    // Filter by testament if provided
    const filtered = bookTestament
      ? filesets.filter(fs => {
          const size = fs.size?.toUpperCase();
          if (bookTestament === 'OT') return size === 'OT' || size === 'NTOTP' || size === 'NTPOTP';
          if (bookTestament === 'NT') return size === 'NT' || size === 'NTOTP' || size === 'NTPOTP';
          return true;
        })
      : filesets;
    
    // Sort by priority
    for (const type of videoTypes) {
      const matching = filtered.filter(fs => fs.type === type);
      matching.forEach(fs => {
        if (!filesetIds.includes(fs.id)) {
          filesetIds.push(fs.id);
        }
      });
    }
  }
  
  return filesetIds;
};

/**
 * Helper function to get video fileset ID from bible data (first available)
 */
export const getVideoFilesetId = (bible: Bible, bookTestament?: string): string | null => {
  const ids = getVideoFilesetIds(bible, bookTestament);
  return ids.length > 0 ? ids[0] : null;
};

