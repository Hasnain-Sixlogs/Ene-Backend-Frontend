import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft, Book as BookIcon, Loader2, FileText, Headphones, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getBibleBooks,
  getTextContent,
  getAudioVideoContent,
  getTextFilesetId,
  getTextFilesetIds,
  getAudioFilesetId,
  getAudioFilesetIds,
  getVideoFilesetId,
  getVideoFilesetIds,
  getBiblesByLanguage,
} from "@/services/bibleApi";
import type { Bible, Book, ChapterInfo, ChapterContent, ChapterContentResponse, Verse, VerseTextItem } from "@/types/bible";

export default function BibleChapterView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const bibleId = searchParams.get("bibleId");
  const bookId = searchParams.get("bookId");
  const chapterParam = searchParams.get("chapter");
  const languageCode = searchParams.get("lang") || "urd";
  
  const [bible, setBible] = useState<Bible | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bibleBooks, setBibleBooks] = useState<Book[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterParam || "1");
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [textContent, setTextContent] = useState<ChapterContent | null>(null);
  const [audioContent, setAudioContent] = useState<ChapterContent | null>(null);
  const [videoContent, setVideoContent] = useState<ChapterContent | null>(null);
  const [activeContentTab, setActiveContentTab] = useState<string>("text");
  const [parsedTextContent, setParsedTextContent] = useState<string>("");
  const [isLoadingText, setIsLoadingText] = useState(false);

  // Helper function to format duration (seconds to readable format)
  const formatDuration = (duration: number | string | undefined): string => {
    if (!duration) return '';
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
    if (isNaN(seconds)) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to check if content has valid media
  const hasValidAudioContent = (content: ChapterContent | null): boolean => {
    if (!content) return false;
    // Check for path property (direct audio file URL)
    if (content.path) return true;
    // Check for audioUrl property
    if (content.audioUrl) return true;
    // Check for verse audio in content array
    if (content.content && content.content.length > 0 && content.content.some(v => v.verseAudio)) return true;
    return false;
  };

  const hasValidVideoContent = (content: ChapterContent | null): boolean => {
    if (!content) return false;
    // Check for path property (could be video)
    if (content.path) {
      const pathStr = String(content.path);
      if (pathStr.includes('.mp4') || pathStr.includes('.webm') || pathStr.includes('.mov') || 
          pathStr.includes('video') || pathStr.includes('/video/')) {
        return true;
      }
    }
    // Check for videoUrl property
    if (content.videoUrl) return true;
    // Check if content is an array with video items
    if (Array.isArray(content)) {
      return content.length > 0 && content.some((item: unknown) => {
        const video = item as Record<string, unknown>;
        return video.path && String(video.path).includes('video');
      });
    }
    return false;
  };

  const hasValidTextContent = (content: ChapterContent | null): boolean => {
    if (!content) return false;
    // Check if content is an array (direct array response)
    if (Array.isArray(content)) {
      return content.length > 0 && content.some((item: unknown) => {
        const verse = item as Record<string, unknown>;
        return verse.verse_text || verse.verseText || (verse.path && String(verse.path).includes('/text/'));
      });
    }
    // Check for URL/path to text file (e.g., .usx, .xml, .txt, or /text/ path)
    if (content.path) {
      const pathStr = String(content.path);
      if (pathStr.includes('.usx') || pathStr.includes('.xml') || pathStr.includes('.txt') || pathStr.includes('/text/')) {
        return true;
      }
    }
    if (content.textUrl) {
      const urlStr = String(content.textUrl);
      if (urlStr.includes('.usx') || urlStr.includes('.xml') || urlStr.includes('.txt') || urlStr.includes('/text/')) {
        return true;
      }
    }
    if (content.url) {
      const urlStr = String(content.url);
      if (urlStr.includes('.usx') || urlStr.includes('.xml') || urlStr.includes('.txt') || urlStr.includes('/text/')) {
        return true;
      }
    }
    // Check for content array with verseText or verse_text
    if (content.content && Array.isArray(content.content) && content.content.length > 0) {
      return content.content.some((v: unknown) => {
        const verse = v as Record<string, unknown>;
        return verse.verseText || verse.verse_text;
      });
    }
    return false;
  };

  // Check if book has content type available (from content_types property)
  const hasBookContentType = (type: 'text' | 'audio' | 'video'): boolean => {
    if (!selectedBook?.content_types) return false;
    const contentTypes = selectedBook.content_types;
    
    // Handle content_types as array of strings
    if (Array.isArray(contentTypes)) {
      if (type === 'text') {
        return contentTypes.some(ct => 
          ct.includes('text') || ct.includes('pdf') || ct === 'et' || ct === 'ep' || 
          ct === 'text_plain' || ct === 'text_format'
        );
      } else if (type === 'audio') {
        return contentTypes.some(ct => 
          ct.includes('audio') || ct === 'audio_drama' || ct === 'audio_stream' || 
          ct === 'audio_narrative' || ct === 'da' || ct === 'na'
        );
      } else if (type === 'video') {
        return contentTypes.some(ct => 
          ct.includes('video') || ct === 'video_drama' || ct === 'video_stream' || 
          ct === 'video_narrative' || ct === 'dv' || ct === 'nv'
        );
      }
    } 
    // Handle content_types as object (legacy format)
    else if (typeof contentTypes === 'object') {
      if (type === 'text') {
        return !!(contentTypes.text || contentTypes.text_plain || contentTypes.text_format || 
                  contentTypes.pdf || contentTypes.et || contentTypes.ep);
      } else if (type === 'audio') {
        return !!(contentTypes.audio || contentTypes.audio_stream || contentTypes.audio_drama || 
                  contentTypes.audio_narrative || contentTypes.da || contentTypes.na);
      } else if (type === 'video') {
        return !!(contentTypes.video || contentTypes.video_stream || contentTypes.video_drama || 
                  contentTypes.video_narrative || contentTypes.dv || contentTypes.nv);
      }
    }
    return false;
  };

  // Check if bible has fileset for content type
  const hasBibleFileset = (type: 'text' | 'audio' | 'video'): boolean => {
    if (!bible?.filesets) return false;
    if (type === 'text') return !!(bible.filesets.text && bible.filesets.text.length > 0);
    if (type === 'audio') return !!(bible.filesets.audio && bible.filesets.audio.length > 0);
    if (type === 'video') return !!(bible.filesets.video && bible.filesets.video.length > 0);
    return false;
  };

  // Combined check for content availability
  const isContentAvailable = (type: 'text' | 'audio' | 'video'): boolean => {
    // PRIORITY 1: Check if we have actually loaded content (this is most accurate)
    if (type === 'text' && hasValidTextContent(textContent)) return true;
    if (type === 'audio' && hasValidAudioContent(audioContent)) return true;
    if (type === 'video' && hasValidVideoContent(videoContent)) return true;
    
    // PRIORITY 2: If no content loaded yet, check metadata (book content_types or bible filesets)
    // This helps enable tabs before content is loaded
    return hasBookContentType(type) || hasBibleFileset(type);
  };

  // Fetch bible and books
  useEffect(() => {
    const fetchData = async () => {
      if (!bibleId) {
        toast({
          title: "Error",
          description: "Bible ID is required",
          variant: "destructive",
        });
        navigate("/bible-management");
        return;
      }

      setIsLoadingBooks(true);
      try {
        // Fetch bible to get fileset info
        const biblesResponse = await getBiblesByLanguage(languageCode);
        const foundBible = biblesResponse.data.find(b => 
          b.id === bibleId || b.abbreviation === bibleId || b.abbr === bibleId
        );
        
        if (!foundBible) {
          toast({
            title: "Error",
            description: "Bible not found",
            variant: "destructive",
          });
          navigate("/bible-management");
          return;
        }

        setBible(foundBible);

        // Fetch books
        const booksResponse = await getBibleBooks(foundBible.id || bibleId);
        setBibleBooks(booksResponse.data);

        // Find and set selected book
        if (bookId) {
          const book = booksResponse.data.find(b => 
            b.id === bookId || b.abbreviation === bookId || b.book_id === bookId
          );
          if (book) {
            setSelectedBook(book);
            if (chapterParam) {
              setSelectedChapter(chapterParam);
            } else if (book.chapters && book.chapters.length > 0) {
              // Filter out intro chapters and get first real chapter (handle both ChapterInfo objects and number arrays)
              const firstChapter = book.chapters.find(ch => {
                const chapterNum = typeof ch === 'object' ? ch.number : ch;
                return chapterNum !== 'intro' && chapterNum !== undefined;
              });
              if (firstChapter) {
                const chapterNum = typeof firstChapter === 'object' ? firstChapter.number : firstChapter;
                setSelectedChapter(String(chapterNum));
              }
            }
          }
        } else if (booksResponse.data.length > 0) {
          // Default to first book if no book specified
          const firstBook = booksResponse.data[0];
          setSelectedBook(firstBook);
          if (firstBook.chapters && firstBook.chapters.length > 0) {
            // Filter out intro chapters and get first real chapter (handle both ChapterInfo objects and number arrays)
            const firstChapter = firstBook.chapters.find(ch => {
              const chapterNum = typeof ch === 'object' ? ch.number : ch;
              return chapterNum !== 'intro' && chapterNum !== undefined;
            });
            if (firstChapter) {
              const chapterNum = typeof firstChapter === 'object' ? firstChapter.number : firstChapter;
              setSelectedChapter(String(chapterNum));
            }
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch bible data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchData();
  }, [bibleId, bookId, languageCode, chapterParam, navigate]);

  // Fetch chapter content when chapter changes
  useEffect(() => {
    if (!bible || !selectedBook || !selectedChapter) return;

    const fetchChapterContent = async () => {
      setIsLoadingContent(true);
      setTextContent(null);
      setAudioContent(null);
      setVideoContent(null);

      try {
        // Get book ID and testament (support both new and legacy structures)
        const bookId = selectedBook.id || selectedBook.abbreviation || selectedBook.book_id || '';
        const bookTestament = selectedBook.testament || (selectedBook.book_id ? 
          (['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', 
            '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 
            'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 
            'HAG', 'ZEC', 'MAL'].includes(selectedBook.book_id) ? 'OT' : 'NT') : undefined);

        // Get fileset IDs in priority order (considering book's testament)
        const textFilesetIds = getTextFilesetIds(bible, bookTestament);
        const audioFilesetIds = getAudioFilesetIds(bible, bookTestament);
        const videoFilesetIds = getVideoFilesetIds(bible, bookTestament);

        // Debug logging
        console.log('Fetching chapter content:', {
          textFilesetIds,
          audioFilesetIds,
          videoFilesetIds,
          bookId,
          bookTestament,
          selectedChapter,
          bookContentTypes: selectedBook.content_types
        });

        // Helper function to process text response
        const processTextResponse = (response: ChapterContentResponse): { type: string; data: ChapterContent | null } => {
          const responseUnknown = response as unknown;
          
          // Check if response is a direct URL string
          if (typeof responseUnknown === 'string' && (responseUnknown.startsWith('http://') || responseUnknown.startsWith('https://'))) {
            return { type: 'text', data: { path: responseUnknown } };
          }
          
          // Check if response is an array directly
          if (Array.isArray(responseUnknown)) {
            const textData: ChapterContent = { content: responseUnknown as VerseTextItem[] };
            if (textData.content && textData.content.length > 0) {
              return { type: 'text', data: textData };
            }
          }
          
          // Handle object response
          const responseData = responseUnknown as { data?: VerseTextItem[] | string | ChapterContent } & ChapterContent;
          
          // Check if response.data is a URL string
          if (responseData.data && typeof responseData.data === 'string' && (responseData.data.startsWith('http://') || responseData.data.startsWith('https://'))) {
            return { type: 'text', data: { path: responseData.data } };
          }
          
          // Check if response.data is an array
          if (responseData.data && Array.isArray(responseData.data)) {
            const dataArray = responseData.data as (VerseTextItem | ChapterContent)[];
            
            // Check if array items have verse_text
            if (dataArray.length > 0 && dataArray.some(v => (v as VerseTextItem).verse_text)) {
              return { type: 'text', data: { content: dataArray as VerseTextItem[] } };
            }
            
            // Check if array items have path property
            if (dataArray.length > 0) {
              const firstItem = dataArray[0] as ChapterContent | VerseTextItem;
              if (firstItem && 'path' in firstItem && firstItem.path) {
                const pathStr = String(firstItem.path);
                if (pathStr.includes('.usx') || pathStr.includes('.xml') || pathStr.includes('.txt') || pathStr.includes('/text/')) {
                  return { type: 'text', data: { path: firstItem.path, ...firstItem } as ChapterContent };
                }
              }
            }
          }
          
          // Fallback: extract from response
          let textData: ChapterContent | null = null;
          if (Array.isArray(responseData.data) && responseData.data.length > 0) {
            const firstItem = responseData.data[0] as ChapterContent | VerseTextItem;
            textData = firstItem as ChapterContent;
          } else {
            textData = (responseData.data as ChapterContent) || (responseUnknown as ChapterContent);
          }
          
          if (textData) {
            if (textData.path) {
              const pathStr = String(textData.path);
              if (pathStr.includes('.usx') || pathStr.includes('.xml') || pathStr.includes('.txt') || pathStr.includes('/text/')) {
                return { type: 'text', data: textData };
              }
            }
            if (
              (textData.content && Array.isArray(textData.content) && textData.content.length > 0) ||
              (textData as Record<string, unknown>).verses || 
              (textData as Record<string, unknown>).text ||
              textData.textUrl ||
              textData.url
            ) {
              return { type: 'text', data: textData };
            }
          }
          return { type: 'text', data: null };
        };

        // Helper function to process audio/video response
        const processMediaResponse = (response: ChapterContentResponse): ChapterContent | null => {
          const responseUnknown = response as unknown;
          const responseData = responseUnknown as { data?: ChapterContent[] | ChapterContent } & ChapterContent;
          
          let mediaData: ChapterContent | null = null;
          
          if (responseData.data && Array.isArray(responseData.data)) {
            if (responseData.data.length > 0) {
              mediaData = responseData.data[0] as ChapterContent;
            }
          } else if (responseData.data) {
            mediaData = responseData.data as ChapterContent;
          } else {
            mediaData = responseUnknown as ChapterContent;
          }
          
          return mediaData;
        };

        // Helper function to try multiple filesets until one succeeds
        const tryMultipleFilesets = async (
          filesetIds: string[],
          fetchFn: (id: string) => Promise<ChapterContentResponse>,
          processFn: (response: ChapterContentResponse) => { type: string; data: ChapterContent | null } | ChapterContent | null,
          type: string
        ): Promise<{ type: string; data: ChapterContent | null; error?: string }> => {
          if (filesetIds.length === 0) {
            return { type, data: null };
          }

          // Try each fileset in priority order
          for (const filesetId of filesetIds) {
            try {
              const response = await fetchFn(filesetId);
              const processed = processFn(response);
              
              if (processed) {
                if ('type' in processed) {
                  return processed as { type: string; data: ChapterContent | null };
                } else {
                  return { type, data: processed as ChapterContent };
                }
              }
            } catch (error) {
              const status = (error as { status?: number }).status;
              // If 404, try next fileset
              if (status === 404) {
                console.log(`${type} content not available for fileset ${filesetId}, trying next...`);
                continue;
              }
              // For other errors, return error
              console.error(`${type} content error for ${filesetId}:`, error);
              return { type, data: null, error: (error as Error).message || `Failed to fetch ${type} content` };
            }
          }
          
          // All filesets failed
          return { type, data: null };
        };

        // Fetch content in parallel (each will try multiple filesets)
        const promises: Promise<{ type: string; data: ChapterContent | null; error?: string }>[] = [];

        // Try text content with multiple filesets
        if (textFilesetIds.length > 0) {
          promises.push(
            tryMultipleFilesets(
              textFilesetIds,
              (id) => getTextContent(id, bookId, selectedChapter),
              processTextResponse,
              'text'
            )
          );
        }

        // Try audio content with multiple filesets
        if (audioFilesetIds.length > 0) {
          promises.push(
            tryMultipleFilesets(
              audioFilesetIds,
              (id) => getAudioVideoContent(id, bookId, selectedChapter),
              (response) => {
                const audioData = processMediaResponse(response);
                if (audioData && (audioData.path || audioData.audioUrl || (audioData.content && Array.isArray(audioData.content) && audioData.content.length > 0))) {
                  return audioData;
                }
                return null;
              },
              'audio'
            )
          );
        }

        // Try video content with multiple filesets
        if (videoFilesetIds.length > 0) {
          promises.push(
            tryMultipleFilesets(
              videoFilesetIds,
              (id) => getAudioVideoContent(id, bookId, selectedChapter),
              (response) => {
                const videoData = processMediaResponse(response);
                if (videoData && (videoData.path || videoData.videoUrl || (videoData.content && Array.isArray(videoData.content) && videoData.content.length > 0))) {
                  return videoData;
                }
                return null;
              },
              'video'
            )
          );
        }

        if (promises.length === 0) {
          toast({
            title: "Warning",
            description: "No filesets available for this Bible. Please check Bible configuration.",
            variant: "destructive",
          });
        }

        const results = await Promise.all(promises);

        console.log('All results:', results);

        let hasText = false;
        let hasAudio = false;
        let hasVideo = false;
        const errors: string[] = [];

        results.forEach(result => {
          if (result.error) {
            errors.push(`${result.type}: ${result.error}`);
          }
          if (result.type === 'text' && result.data) {
            // Only set text content if it actually has text content
            if (hasValidTextContent(result.data)) {
              setTextContent(result.data);
              hasText = true;
            }
          } else if (result.type === 'audio' && result.data) {
            // Only set audio content if it actually has audio content (path, audioUrl, or verseAudio)
            if (hasValidAudioContent(result.data)) {
              setAudioContent(result.data);
              hasAudio = true;
            }
          } else if (result.type === 'video' && result.data) {
            // Only set video content if it actually has video content
            if (hasValidVideoContent(result.data)) {
              setVideoContent(result.data);
              hasVideo = true;
            }
          }
        });

        // Show errors only if there are actual errors (not just 404s/missing content)
        // Only show toast if all requests failed AND there are real errors
        if (errors.length > 0 && !hasText && !hasAudio && !hasVideo) {
          // Filter out empty error messages
          const realErrors = errors.filter(e => e && e.trim().length > 0);
          if (realErrors.length > 0) {
            console.error('All content requests failed:', realErrors);
            toast({
              title: "Content Unavailable",
              description: `Failed to load content: ${realErrors.join(', ')}`,
              variant: "destructive",
            });
          } else {
            // Just log that content is not available (no toast for missing content)
            console.log('No content available for this chapter');
          }
        }

        // Set default tab based on available content
        // Check results directly instead of state variables
        const textResult = results.find(r => r.type === 'text' && r.data);
        const audioResult = results.find(r => r.type === 'audio' && r.data);
        const videoResult = results.find(r => r.type === 'video' && r.data);
        
        if (textResult?.data && hasValidTextContent(textResult.data)) {
          setActiveContentTab("text");
        } else if (audioResult?.data && hasValidAudioContent(audioResult.data)) {
          setActiveContentTab("audio");
        } else if (videoResult?.data && hasValidVideoContent(videoResult.data)) {
          setActiveContentTab("video");
        }

      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch chapter content",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchChapterContent();
  }, [bible, selectedBook, selectedChapter]);

  const handleChapterChange = (chapter: string | number) => {
    const chapterStr = typeof chapter === 'number' ? chapter.toString() : chapter;
    setSelectedChapter(chapterStr);
    // Update URL without navigation
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("chapter", chapterStr);
    navigate(`/bible-chapter?${newSearchParams.toString()}`, { replace: true });
  };

  const handlePreviousChapter = () => {
    if (!selectedBook) return;
    // Filter out intro chapters (handle both ChapterInfo objects and number arrays)
    const realChapters = selectedBook.chapters.filter(ch => {
      const chapterNum = typeof ch === 'object' ? ch.number : ch;
      return chapterNum !== 'intro' && chapterNum !== undefined;
    });
    const currentIndex = realChapters.findIndex(ch => {
      const chapterNum = typeof ch === 'object' ? ch.number : ch;
      return String(chapterNum) === selectedChapter;
    });
    if (currentIndex > 0) {
      const prevChapter = realChapters[currentIndex - 1];
      const chapterNum = typeof prevChapter === 'object' ? prevChapter.number : prevChapter;
      handleChapterChange(String(chapterNum));
    }
  };

  const handleNextChapter = () => {
    if (!selectedBook) return;
    // Filter out intro chapters (handle both ChapterInfo objects and number arrays)
    const realChapters = selectedBook.chapters.filter(ch => {
      const chapterNum = typeof ch === 'object' ? ch.number : ch;
      return chapterNum !== 'intro' && chapterNum !== undefined;
    });
    const currentIndex = realChapters.findIndex(ch => {
      const chapterNum = typeof ch === 'object' ? ch.number : ch;
      return String(chapterNum) === selectedChapter;
    });
    if (currentIndex < realChapters.length - 1) {
      const nextChapter = realChapters[currentIndex + 1];
      const chapterNum = typeof nextChapter === 'object' ? nextChapter.number : nextChapter;
      handleChapterChange(String(chapterNum));
    }
  };

  const handleBookChange = (book: Book) => {
    setSelectedBook(book);
    // Filter out intro chapters and get first real chapter (handle both ChapterInfo objects and number arrays)
    const firstChapter = book.chapters.find(ch => {
      const chapterNum = typeof ch === 'object' ? ch.number : ch;
      return chapterNum !== 'intro' && chapterNum !== undefined;
    });
    if (firstChapter) {
      const chapterNum = typeof firstChapter === 'object' ? firstChapter.number : firstChapter;
      handleChapterChange(String(chapterNum));
    }
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    const bookId = book.id || book.abbreviation || book.book_id || '';
    newSearchParams.set("bookId", bookId);
    if (firstChapter) {
      const chapterNum = typeof firstChapter === 'object' ? firstChapter.number : firstChapter;
      newSearchParams.set("chapter", String(chapterNum));
    }
    navigate(`/bible-chapter?${newSearchParams.toString()}`, { replace: true });
  };

  if (isLoadingBooks) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedBook || !bible) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Book not found</p>
          <Button onClick={() => navigate("/bible-management")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bible Management
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Filter out intro chapters for navigation (handle both ChapterInfo objects and number arrays)
  const realChapters = selectedBook.chapters ? selectedBook.chapters.filter(ch => {
    const chapterNum = typeof ch === 'object' ? ch.number : ch;
    return chapterNum !== 'intro' && chapterNum !== undefined;
  }) : [];
  const currentChapterIndex = realChapters.findIndex(ch => {
    const chapterNum = typeof ch === 'object' ? ch.number : ch;
    return String(chapterNum) === selectedChapter;
  });
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < realChapters.length - 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/bible-management")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bible.name}</h1>
              <p className="text-sm text-muted-foreground">
                {typeof bible.language === 'object' ? bible.language.name : bible.language}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Books and Chapters */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card border border-border p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookIcon className="w-5 h-5 text-accent" />
                Books
              </h2>
              
              {/* Book Selector */}
              <div className="mb-6">
                <select
                  value={selectedBook.id || selectedBook.abbreviation || selectedBook.book_id || ''}
                  onChange={(e) => {
                    const book = bibleBooks.find(b => 
                      b.id === e.target.value || 
                      b.abbreviation === e.target.value || 
                      b.book_id === e.target.value
                    );
                    if (book) handleBookChange(book);
                  }}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {bibleBooks.map((book) => {
                    const bookId = book.id || book.abbreviation || book.book_id || '';
                    return (
                      <option key={bookId} value={bookId}>
                        {book.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Book Info */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">{selectedBook.name}</div>
                {selectedBook.testament && selectedBook.book_group && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedBook.testament} • {selectedBook.book_group}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {selectedBook.id || selectedBook.abbreviation || selectedBook.book_id}
                </div>
              </div>

              {/* Chapters */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Chapters</h3>
                {selectedBook.chapters && selectedBook.chapters.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                    {selectedBook.chapters
                      .filter(ch => {
                        // Handle both ChapterInfo objects and number arrays
                        const chapterNum = typeof ch === 'object' ? ch.number : ch;
                        return chapterNum !== 'intro' && chapterNum !== undefined;
                      })
                      .map((chapter, index) => {
                        // Handle both ChapterInfo objects and number arrays
                        const chapterNum = typeof chapter === 'object' ? chapter.number : chapter;
                        const chapterId = typeof chapter === 'object' ? (chapter.id || chapter.number) : chapter;
                        const chapterStr = String(chapterNum);
                        
                        return (
                          <Button
                            key={chapterId || index}
                            variant={selectedChapter === chapterStr ? "default" : "outline"}
                            size="sm"
                            className="h-10"
                            onClick={() => handleChapterChange(chapterStr)}
                          >
                            {chapterNum}
                          </Button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No chapters available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              {/* Chapter Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedBook.name} Chapter {selectedChapter}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentChapterIndex >= 0 ? `Chapter ${currentChapterIndex + 1} of ${realChapters.length}` : `Chapter ${selectedChapter}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousChapter}
                    disabled={!hasPrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextChapter}
                    disabled={!hasNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Content Tabs */}
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <span className="ml-3">Loading content...</span>
                </div>
              ) : (
                <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" disabled={!isContentAvailable('text')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Text/PDF
                    </TabsTrigger>
                    <TabsTrigger value="audio" disabled={!isContentAvailable('audio')}>
                      <Headphones className="w-4 h-4 mr-2" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="video" disabled={!isContentAvailable('video')}>
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="mt-4">
                    {hasValidTextContent(textContent) ? (
                      <div className="space-y-4">
                        {/* Check if we have content array (verses) */}
                        {textContent?.content && Array.isArray(textContent.content) && textContent.content.length > 0 ? (
                          <div className="space-y-3 max-h-[600px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
                            {textContent.content.map((verse, index) => {
                              // Handle VerseTextItem format (verse_text, verse_start) or Verse format
                              const verseItem = verse as VerseTextItem | Verse;
                              const verseText = 'verse_text' in verseItem && verseItem.verse_text 
                                ? String(verseItem.verse_text)
                                : 'verseText' in verseItem && verseItem.verseText
                                ? String(verseItem.verseText)
                                : '';
                              const verseNumber = 'verse_start_alt' in verseItem && verseItem.verse_start_alt
                                ? String(verseItem.verse_start_alt)
                                : 'verse_start' in verseItem && verseItem.verse_start
                                ? String(verseItem.verse_start)
                                : 'verseNumber' in verseItem && verseItem.verseNumber
                                ? String(verseItem.verseNumber)
                                : String(index + 1);
                              const verseId: string = 'verseId' in verseItem && verseItem.verseId
                                ? String(verseItem.verseId)
                                : `verse-${index}-${verseNumber}`;
                              
                              return (
                                <div key={verseId} className="flex gap-3">
                                  <span className="font-bold text-accent min-w-[40px]">{verseNumber}</span>
                                  <span className="flex-1">{verseText}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (textContent?.path || textContent?.textUrl || textContent?.url) ? (
                          // Handle text file URL (e.g., .usx, .xml files)
                          <div className="p-4 border border-border rounded-lg space-y-4">
                            <div>
                              <p className="font-medium text-lg">
                                {textContent?.book_name || selectedBook.name} Chapter {selectedChapter}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Text file available
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  const textUrl = textContent.path || textContent.textUrl || textContent.url;
                                  if (textUrl) {
                                    window.open(textUrl, '_blank');
                                  }
                                }}
                                variant="default"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Open Text File
                              </Button>
                              <Button
                                onClick={async () => {
                                  const textUrl = textContent.path || textContent.textUrl || textContent.url;
                                  if (textUrl) {
                                    setIsLoadingText(true);
                                    try {
                                      const response = await fetch(textUrl);
                                      const text = await response.text();
                                      // Try to parse as XML/USX and extract readable text
                                      const parser = new DOMParser();
                                      const xmlDoc = parser.parseFromString(text, 'text/xml');
                                      
                                      // Extract all text nodes from XML
                                      const allText: string[] = [];
                                      const extractText = (node: Node) => {
                                        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                                          allText.push(node.textContent.trim());
                                        }
                                        node.childNodes.forEach(extractText);
                                      };
                                      extractText(xmlDoc.documentElement);
                                      
                                      // If we got text from XML, use it, otherwise use raw text
                                      const extractedText = allText.length > 0 
                                        ? allText.join(' ')
                                        : xmlDoc.documentElement.textContent || text;
                                      
                                      setParsedTextContent(extractedText);
                                    } catch (error) {
                                      console.error('Error parsing text:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to load text file",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setIsLoadingText(false);
                                    }
                                  }
                                }}
                                variant="outline"
                                disabled={isLoadingText}
                              >
                                {isLoadingText ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    View Text Content
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {/* Display parsed text content below buttons */}
                            {parsedTextContent && (
                              <div className="mt-4 p-4 bg-muted/30 rounded-lg max-h-[600px] overflow-y-auto">
                                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                                  {parsedTextContent}
                                </pre>
                              </div>
                            )}
                            
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground break-all">
                                {textContent.path || textContent.textUrl || textContent.url}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Text content format not supported</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Text/PDF content not available for this chapter</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="audio" className="mt-4">
                    {hasValidAudioContent(audioContent) ? (
                      <div className="space-y-4">
                        {/* Check for path property first (direct audio file) or audioUrl */}
                        {(audioContent?.path || audioContent?.audioUrl) && (
                          <div className="p-4 border border-border rounded-lg">
                            <div className="mb-3">
                              <p className="font-medium text-lg">
                                {audioContent?.book_name || selectedBook.name} Chapter {selectedChapter}
                              </p>
                              {audioContent?.duration && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Duration: {formatDuration(audioContent.duration)}
                                </p>
                              )}
                            </div>
                            <audio controls className="w-full">
                              <source src={audioContent.path || audioContent.audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        {/* Show verse-by-verse audio if available */}
                        {audioContent.content && Array.isArray(audioContent.content) && 
                         audioContent.content.some(v => {
                           const verse = v as Verse;
                           return verse.verseAudio;
                         }) && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">Verse-by-Verse Audio</h4>
                            {audioContent.content
                              .filter(verse => {
                                const v = verse as Verse;
                                return v.verseAudio;
                              })
                              .map((verse) => {
                                const v = verse as Verse;
                                return (
                                  <div key={v.verseId} className="p-3 border border-border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">Verse {v.verseNumber}</span>
                                      {v.verseStart !== undefined && v.verseEnd !== undefined && (
                                        <span className="text-xs text-muted-foreground">
                                          {formatDuration(v.verseStart)} - {formatDuration(v.verseEnd)}
                                        </span>
                                      )}
                                    </div>
                                    <audio controls className="w-full" preload="none">
                                      <source src={v.verseAudio} type="audio/mpeg" />
                                      Your browser does not support the audio element.
                                    </audio>
                                    {v.verseText && (
                                      <p className="text-sm text-muted-foreground mt-2">{v.verseText}</p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Headphones className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Audio content not available for this chapter</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="video" className="mt-4">
                    {hasValidVideoContent(videoContent) ? (
                      <div className="space-y-4">
                        {/* Check for path property first (direct video file) or videoUrl */}
                        {(videoContent?.path || videoContent?.videoUrl) && (
                          <div className="p-4 border border-border rounded-lg">
                            <div className="mb-3">
                              <p className="font-medium text-lg">
                                {videoContent?.book_name || selectedBook.name} Chapter {selectedChapter}
                              </p>
                              {videoContent?.duration && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Duration: {formatDuration(videoContent.duration)}
                                </p>
                              )}
                            </div>
                            <video controls className="w-full rounded-lg">
                              <source src={videoContent.path || videoContent.videoUrl} type="video/mp4" />
                              Your browser does not support the video element.
                            </video>
                          </div>
                        )}
                        {/* Show verse text if available */}
                        {videoContent.content && Array.isArray(videoContent.content) && videoContent.content.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">Chapter Text</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto p-3 bg-muted/30 rounded-lg">
                              {videoContent.content.map((verse, index) => {
                                const verseItem = verse as VerseTextItem | Verse;
                                const verseText = 'verse_text' in verseItem && verseItem.verse_text 
                                  ? String(verseItem.verse_text)
                                  : 'verseText' in verseItem && verseItem.verseText
                                  ? String(verseItem.verseText)
                                  : '';
                                const verseNumber = 'verse_start_alt' in verseItem && verseItem.verse_start_alt
                                  ? String(verseItem.verse_start_alt)
                                  : 'verse_start' in verseItem && verseItem.verse_start
                                  ? String(verseItem.verse_start)
                                  : 'verseNumber' in verseItem && verseItem.verseNumber
                                  ? String(verseItem.verseNumber)
                                  : String(index + 1);
                                const verseId: string = 'verseId' in verseItem && verseItem.verseId
                                  ? String(verseItem.verseId)
                                  : `verse-${index}-${verseNumber}`;
                                
                                return (
                                  <div key={verseId} className="text-sm">
                                    <span className="font-bold text-accent">{verseNumber}</span>{' '}
                                    <span>{verseText}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Video content not available for this chapter</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

