import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Book, Loader2, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getBiblesByLanguage, 
  searchLanguages, 
  getBibleBooks,
} from "@/services/bibleApi";
import type { Bible, Language, Book } from "@/types/bible";

export default function BibleManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("urd");
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [isLoadingBibles, setIsLoadingBibles] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  
  // Bible Books Dialog
  const [selectedBible, setSelectedBible] = useState<Bible | null>(null);
  const [bibleBooks, setBibleBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isBooksDialogOpen, setIsBooksDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Fetch bibles when language changes
  useEffect(() => {
    if (selectedLanguage) {
      fetchBibles(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchBibles = async (languageCode: string) => {
    setIsLoadingBibles(true);
    try {
      const response = await getBiblesByLanguage(languageCode);
      setBibles(response.data);
      if (response.data.length === 0) {
        toast({
          title: "No bibles found",
          description: `No bibles available for language code: ${languageCode}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bibles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBibles(false);
    }
  };

  const handleLanguageSearch = async () => {
    if (!languageSearchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a language name or code to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLanguages(true);
    try {
      const response = await searchLanguages(languageSearchTerm);
      setLanguages(response.data);
      if (response.data.length === 0) {
        toast({
          title: "No languages found",
          description: `No languages found matching: ${languageSearchTerm}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search languages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const handleViewBible = async (bible: Bible) => {
    setSelectedBible(bible);
    setIsBooksDialogOpen(true);
    setIsLoadingBooks(true);
    
    try {
      const response = await getBibleBooks(bible.abbr);
      setBibleBooks(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bible books",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handleViewChapter = (book: Book, chapter: number) => {
    if (!selectedBible) return;
    
    // Navigate to the new chapter view page
    navigate(`/bible-chapter?bibleId=${selectedBible.abbr}&bookId=${book.book_id}&chapter=${chapter}&lang=${selectedLanguage}`);
  };

  const filteredVersions = bibles.filter(version =>
    version.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total chapters for a bible
  const getTotalChapters = (books: Book[]): number => {
    return books.reduce((total, book) => total + book.chapters.length, 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Bible Management</h1>
        </div>

        {/* Language Selection */}
        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Select Language</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Language Code (ISO)</Label>
                <Input
                  placeholder="e.g., eng, urd, spa"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchBibles(selectedLanguage)}
                />
              </div>
              <div className="space-y-2">
                <Label>Search Language</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={languageSearchTerm}
                    onChange={(e) => setLanguageSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLanguageSearch()}
                  />
                  <Button onClick={handleLanguageSearch} disabled={isLoadingLanguages}>
                    {isLoadingLanguages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select from Results</Label>
                {languages.length > 0 ? (
                  <Select onValueChange={(value) => {
                    const lang = languages.find(l => l.iso === value);
                    if (lang) {
                      setSelectedLanguage(lang.iso);
                      setLanguageSearchTerm("");
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.iso}>
                          {lang.name} ({lang.iso}) - {lang.bibles} bibles
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Search languages first..." disabled />
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => fetchBibles(selectedLanguage)} 
              disabled={isLoadingBibles || !selectedLanguage}
              className="w-full md:w-auto"
            >
              {isLoadingBibles ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Bibles...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Fetch Bibles
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, abbreviation, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading bible data..." })}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {isLoadingBibles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredVersions.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {bibles.length === 0 
                  ? "Select a language and fetch bibles to get started"
                  : "No bibles found matching your search"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-lg">S.No</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Version Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Abbreviation</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Language</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Date</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Filesets</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVersions.map((version, index) => {
                    const filesetCount = Object.values(version.filesets).flat().length;
                    return (
                      <tr key={version.abbr} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{index + 1}</td>
                        <td className="p-4 font-medium text-foreground">{version.name}</td>
                        <td className="p-4 text-muted-foreground font-mono">{version.abbr}</td>
                        <td className="p-4 text-muted-foreground">
                          <div>
                            <div>{version.language}</div>
                            <div className="text-xs text-muted-foreground">{version.autonym}</div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{version.date || "N/A"}</td>
                        <td className="p-4 text-muted-foreground">{filesetCount}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-accent hover:text-accent/80"
                              onClick={() => handleViewBible(version)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Books Dialog - Shows books and chapters */}
        <Dialog open={isBooksDialogOpen} onOpenChange={setIsBooksDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-accent" />
                {selectedBible?.name} - Books & Chapters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isLoadingBooks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : bibleBooks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No books available</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Books</div>
                      <div className="text-2xl font-bold">{bibleBooks.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Chapters</div>
                      <div className="text-2xl font-bold">{getTotalChapters(bibleBooks)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {bibleBooks.map((book) => (
                      <div key={book.book_id} className="border border-border rounded-lg overflow-hidden">
                        <div 
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedBook(book)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-lg">{book.name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {book.testament} • {book.book_group} • {book.chapters.length} chapters
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mt-1">
                                {book.book_id}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {selectedBook?.book_id === book.book_id && (
                          <div className="border-t border-border p-4 bg-muted/30">
                            <div className="text-sm font-medium mb-3">Chapters:</div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                              {book.chapters.map((chapter) => (
                                <Button
                                  key={chapter}
                                  variant="outline"
                                  size="sm"
                                  className="h-10"
                                  onClick={() => handleViewChapter(book, chapter)}
                                >
                                  {chapter}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
