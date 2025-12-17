import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, Plus, Video, Play, Clock, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession } from "@/services/auth";
import {
  getVideoStats,
  getAdminVideos,
  getVideos,
  createVideo,
  updateVideo,
  updateVideoStatus,
  deleteVideo,
  incrementVideoView,
} from "@/services/videoApi";
import type { Video, VideoStats, VideoCategory, VideoStatus, CreateVideoRequest, UpdateVideoRequest } from "@/types/video";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const VIDEO_CATEGORIES: VideoCategory[] = ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'];

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

export default function UserVideo() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<VideoStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const limit = 10;

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateVideoRequest>({
    title: '',
    category: 'Sermon',
    video_url: '',
    thumbnail_url: '',
    description: '',
    duration: '',
    status: 'draft',
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Sermon": return "bg-purple-100 text-purple-700";
      case "Worship": return "bg-pink-100 text-pink-700";
      case "Teaching": return "bg-blue-100 text-blue-700";
      case "Prayer": return "bg-green-100 text-green-700";
      case "Documentary": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setIsLoadingStats(true);
      const response = await getVideoStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch video stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isAdmin]);

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: isAdmin && selectedStatus !== 'all' ? selectedStatus : undefined,
      };

      const response = isAdmin
        ? await getAdminVideos(params)
        : await getVideos(params);

      if (response.success) {
        setVideos(response.data.videos);
        setTotalPages(response.data.pagination.pages);
        setTotalVideos(response.data.pagination.total);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch videos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, isAdmin, toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateVideo = async () => {
    try {
      if (!formData.title || !formData.category || !formData.video_url) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Title, Category, Video URL)",
          variant: "destructive",
        });
        return;
      }

      const response = await createVideo(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Video created successfully",
        });
        setIsAddOpen(false);
        setFormData({
          title: '',
          category: 'Sermon',
          video_url: '',
          thumbnail_url: '',
          description: '',
          duration: '',
          status: 'draft',
        });
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create video",
        variant: "destructive",
      });
    }
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo) return;
    try {
      const updateData: UpdateVideoRequest = {
        title: formData.title || undefined,
        category: formData.category || undefined,
        video_url: formData.video_url || undefined,
        thumbnail_url: formData.thumbnail_url || undefined,
        description: formData.description || undefined,
        duration: formData.duration || undefined,
      };

      const response = await updateVideo(editingVideo._id, updateData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Video updated successfully",
        });
        setIsEditOpen(false);
        setEditingVideo(null);
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const response = await deleteVideo(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Video deleted successfully",
        });
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (video: Video) => {
    try {
      const newStatus: VideoStatus = video.status === 'published' ? 'draft' : 'published';
      const response = await updateVideoStatus(video._id, { status: newStatus });
      if (response.success) {
        toast({
          title: "Success",
          description: `Video ${newStatus === 'published' ? 'published' : 'moved to draft'} successfully`,
        });
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update video status",
        variant: "destructive",
      });
    }
  };

  const handleViewVideo = async (video: Video) => {
    // Only allow viewing published videos for non-admin users
    if (!isAdmin && video.status !== 'published') {
      toast({
        title: "Access Denied",
        description: "This video is not available for viewing.",
        variant: "destructive",
      });
      return;
    }

    // Set selected video and open player
    setSelectedVideo(video);
    setIsPlayerOpen(true);

    // Increment view count if published and user is not admin
    if (video.status === 'published' && !isAdmin) {
      try {
        await incrementVideoView(video._id);
        // Update the video in the list
        setVideos(prevVideos =>
          prevVideos.map(v =>
            v._id === video._id ? { ...v, views: v.views + 1 } : v
          )
        );
        // Update stats if admin
        if (isAdmin && stats) {
          setStats({ ...stats, totalViews: stats.totalViews + 1 });
        }
      } catch (error) {
        console.error('Failed to increment view:', error);
      }
    }
  };

  const handleEditClick = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      category: video.category,
      video_url: video.videoUrl,
      thumbnail_url: video.thumbnailUrl || '',
      description: video.description || '',
      duration: video.duration || '',
      status: video.status,
    });
    setIsEditOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Video Management</h1>
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-accent" />
                    Upload New Video
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Video Title *</Label>
                    <Input
                      placeholder="e.g., Sunday Sermon - Faith in Action"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as VideoCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL *</Label>
                    <Input
                      placeholder="Enter video URL"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thumbnail URL</Label>
                    <Input
                      placeholder="Enter thumbnail URL"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter video description..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 45:30 or 1:45:30"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as VideoStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button className="bg-accent hover:bg-accent/90" onClick={handleCreateVideo}>
                      Upload Video
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards - Admin only */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.totalVideos ?? 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Play className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.published ?? 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.totalViews ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.drafts ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value as VideoCategory | 'all');
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VIDEO_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAdmin && (
                <Select value={selectedStatus} onValueChange={(value) => {
                  setSelectedStatus(value as VideoStatus | 'all');
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No videos found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-lg">S.No</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Title</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Category</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Duration</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Views</th>
                      <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Upload Date</th>
                      {isAdmin && (
                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                      )}
                      <th className={`text-left p-4 font-semibold text-sm uppercase tracking-wider ${isAdmin ? '' : 'rounded-tr-lg'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video, index) => (
                      <tr key={video._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{(currentPage - 1) * limit + index + 1}</td>
                        <td className="p-4 font-medium text-foreground">{video.title}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                            {video.category}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{video.duration || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{video.views.toLocaleString()}</td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(video.uploadDate), 'MMM dd, yyyy')}
                        </td>
                        {isAdmin && (
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${video.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {video.status}
                            </span>
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:text-accent/80"
                              onClick={() => handleViewVideo(video)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleEditClick(video)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleToggleStatus(video)}
                                  title={video.status === 'published' ? 'Move to Draft' : 'Publish'}
                                >
                                  {video.status === 'published' ? <Clock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteVideo(video._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalVideos)} of {totalVideos} videos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Dialog */}
        {isAdmin && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-accent" />
                  Edit Video
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Video Title</Label>
                  <Input
                    placeholder="e.g., Sunday Sermon - Faith in Action"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as VideoCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    placeholder="Enter video URL"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    placeholder="Enter thumbnail URL"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter video description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 45:30 or 1:45:30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsEditOpen(false);
                    setEditingVideo(null);
                  }}>Cancel</Button>
                  <Button className="bg-accent hover:bg-accent/90" onClick={handleUpdateVideo}>
                    Update Video
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Video Player Dialog */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="sm:max-w-[900px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-accent" />
                {selectedVideo?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4 py-4">
                {/* Video Player */}
                <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {isYouTubeUrl(selectedVideo.videoUrl) ? (
                    // YouTube embed
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.videoUrl) || ''}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Regular video player
                    <video
                      controls
                      className="w-full h-full"
                      poster={selectedVideo.thumbnailUrl}
                      onPlay={() => {
                        // Video started playing
                      }}
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      <source src={selectedVideo.videoUrl} type="video/webm" />
                      <source src={selectedVideo.videoUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>

                {/* Video Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedVideo.category)}`}>
                        {selectedVideo.category}
                      </span>
                    </div>
                    {selectedVideo.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedVideo.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{selectedVideo.views.toLocaleString()} views</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uploaded {format(new Date(selectedVideo.uploadDate), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  {selectedVideo.description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedVideo.description}</p>
                    </div>
                  )}

                  {selectedVideo.uploadedBy && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Uploaded by: <span className="font-medium text-foreground">{selectedVideo.uploadedBy.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
