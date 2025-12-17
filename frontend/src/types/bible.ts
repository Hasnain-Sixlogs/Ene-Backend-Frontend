// TypeScript types for Digital Bible Platform (DBT) API responses

export interface Bible {
  id: string;
  dblId?: string;
  abbreviation: string;
  name: string;
  nameLocal?: string;
  description?: string;
  descriptionLocal?: string;
  language: {
    id: string;
    name: string;
    script?: string;
    scriptDirection?: string;
  };
  countries?: Array<{
    id: string;
    name: string;
    nameLocal?: string;
  }>;
  type?: string;
  updatedAt?: string;
  audioBibles?: unknown[];
  textBibles?: unknown[];
  filesets: {
    text?: Fileset[];
    audio?: Fileset[];
    video?: Fileset[];
  };
  // Legacy support
  abbr?: string;
  vname?: string | null;
  autonym?: string;
  language_id?: number;
  language_rolv_code?: string | null;
  iso?: string;
  date?: string;
}

export interface Fileset {
  id: string;
  type: string;
  size: string;
  bitrate?: string | null;
  duration?: string | null;
  container?: string | null;
  codec?: string | null;
  resolution?: string | null;
  stock_no?: string | null;
  product_code?: string | null;
  volume?: string;
  timing_est_err?: string;
}

export interface Language {
  id: string;
  name: string;
  iso: string;
  iso_name?: string;
  script?: string;
  script_direction?: string;
  glotto_id?: string | null;
  autonym?: string;
  bibles?: number;
  rolv_code?: string | null;
  deleted_at?: string | null;
}

export interface Book {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong?: string;
  nameLongLocal?: string;
  chapters: ChapterInfo[] | number[]; // Can be ChapterInfo objects or just numbers
  // Legacy support
  book_id?: string;
  book_id_usfx?: string;
  book_id_osis?: string;
  testament?: "OT" | "NT";
  testament_order?: number;
  book_order?: string;
  book_group?: string;
  name_short?: string;
  content_types?: string[] | {
    [key: string]: string;
  };
}

export interface ChapterInfo {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  content: Array<{
    verseId?: string;
    verseCount?: number;
  }>;
}

export interface Verse {
  verseId: string;
  verseNumber: string;
  verseText: string;
  verseAudio?: string;
  verseStart?: number;
  verseEnd?: number;
  [key: string]: unknown;
}

export interface VerseTextItem {
  book_id?: string;
  book_name?: string;
  book_name_alt?: string;
  chapter?: number;
  chapter_alt?: string;
  verse_start?: number;
  verse_start_alt?: string;
  verse_end?: number;
  verse_end_alt?: string;
  verse_text?: string;
  [key: string]: unknown;
}

export interface ChapterContent {
  id?: string;
  bibleId?: string;
  bookId?: string;
  book_id?: string;
  book_name?: string;
  chapterId?: string;
  chapter_start?: number;
  chapter_end?: number | null;
  number?: string;
  content?: Verse[] | VerseTextItem[]; // Can be Verse array or VerseTextItem array
  audioUrl?: string;
  videoUrl?: string;
  path?: string; // Direct path to audio/video/text file
  textUrl?: string; // Direct URL to text file (e.g., .usx, .xml)
  url?: string; // Generic URL for content
  duration?: number | string;
  verse_start?: number;
  verse_end?: number | null;
  timestamp?: string | null;
  thumbnail?: string | null;
  filesize_in_bytes?: number;
  youtube_url?: string | null;
  next?: {
    id: string;
    number: string;
  };
  previous?: {
    id: string;
    number: string;
  };
  [key: string]: unknown;
}

export interface BibleContent {
  // This will vary based on content type (text, audio, video)
  [key: string]: unknown;
}

// API Response types according to OpenAPI spec
export interface V4BibleFilesetsChapterResponse {
  data: VerseTextItem[];
}

// Legacy types for backward compatibility
export interface VerseContent {
  verse?: string;
  text?: string;
  [key: string]: unknown;
}

export interface TextContentData {
  verses?: Record<string, string | VerseContent>;
  content?: string;
  text?: string;
  [key: string]: unknown;
}

export interface MediaFile {
  url?: string;
  name?: string;
  duration?: string | number;
  mime_type?: string;
  [key: string]: unknown;
}

export interface AudioVideoContentData {
  // Direct path property (legacy structure)
  path?: string;
  duration?: number | string;
  book_id?: string;
  book_name?: string;
  chapter_start?: number;
  chapter_end?: number | null;
  verse_start?: number;
  verse_start_alt?: string;
  verse_end?: number | null;
  verse_end_alt?: string | null;
  timestamp?: string | null;
  thumbnail?: string | null;
  filesize_in_bytes?: number;
  youtube_url?: string | null;
  // Alternative structures
  files?: MediaFile[];
  url?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      next_page_url: string | null;
      prev_page_url: string | null;
      from: number;
      to: number;
    };
  };
}

export interface BiblesResponse extends ApiResponse<Bible[]> {}
export interface LanguagesResponse extends ApiResponse<Language[]> {}
export interface BooksResponse extends ApiResponse<Book[]> {}
export interface ContentResponse extends ApiResponse<BibleContent> {}
export interface ChapterContentResponse extends ApiResponse<ChapterContent> {}

