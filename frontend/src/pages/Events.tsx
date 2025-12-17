import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, Plus, Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEvents,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getEventById,
} from "@/services/eventsApi";
import type { Event, CreateEventRequest, UpdateEventRequest } from "@/types/events";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  // Form state
  const [formData, setFormData] = useState<CreateEventRequest>({
    event_name: "",
    description: "",
    event_type: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    virtual_link_or_location: "",
  });

  const fetchEvents = useCallback(async (page: number = 1, search?: string, status?: string, eventType?: string) => {
    setIsLoading(true);
    try {
      const response = await getEvents({
        page,
        limit: 10,
        status: status && status !== 'all' ? (status as 'pending' | 'approved' | 'rejected') : undefined,
        event_type: eventType && eventType !== 'all' ? eventType : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (response?.data) {
        let filteredEvents = response.data.events || [];
        
        // Client-side search filtering
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.event_name?.toLowerCase().includes(searchLower) ||
            event.description?.toLowerCase().includes(searchLower) ||
            event.virtual_link_or_location?.toLowerCase().includes(searchLower) ||
            event.user_id?.name?.toLowerCase().includes(searchLower)
          );
        }
        
        setEvents(filteredEvents);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch events",
        variant: "destructive",
      });
      setEvents([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(1, searchTerm, statusFilter, eventTypeFilter);
  }, [statusFilter, eventTypeFilter, fetchEvents]);

  const handleSearch = () => {
    fetchEvents(1, searchTerm, statusFilter, eventTypeFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setEventTypeFilter("all");
    fetchEvents(1, "", "all", "all");
  };

  const handleCreate = async () => {
    if (!formData.event_name.trim()) {
      toast({
        title: "Error",
        description: "Event name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEvent(formData);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsAddOpen(false);
      resetForm();
      fetchEvents(pagination.page, searchTerm, statusFilter, eventTypeFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !formData.event_name.trim()) {
      toast({
        title: "Error",
        description: "Event name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEvent(selectedEvent._id, formData);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      setIsEditOpen(false);
      resetForm();
      fetchEvents(pagination.page, searchTerm, statusFilter, eventTypeFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleView = async (event: Event) => {
    try {
      const response = await getEventById(event._id);
      setSelectedEvent(response.data.event);
      setIsViewOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch event details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      event_name: event.event_name || "",
      description: event.description || "",
      event_type: event.event_type || "",
      start_date: event.start_date ? event.start_date.split('T')[0] : "",
      start_time: event.start_time || "",
      end_date: event.end_date ? event.end_date.split('T')[0] : "",
      end_time: event.end_time || "",
      virtual_link_or_location: event.virtual_link_or_location || "",
    });
    setIsEditOpen(true);
  };

  const handleStatusChange = (event: Event) => {
    setSelectedEvent(event);
    setNewStatus(event.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedEvent) return;

    try {
      await updateEventStatus(selectedEvent._id, { status: newStatus });
      toast({
        title: "Success",
        description: `Event ${newStatus} successfully`,
      });
      setIsStatusDialogOpen(false);
      fetchEvents(pagination.page, searchTerm, statusFilter, eventTypeFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents(pagination.page, searchTerm, statusFilter, eventTypeFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      event_name: "",
      description: "",
      event_type: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      virtual_link_or_location: "",
    });
    setSelectedEvent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Events Management</h1>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Create New Event
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Event Name *</Label>
                  <Input
                    placeholder="e.g., Sunday Worship Service"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Input
                    placeholder="e.g., worship, prayer, etc."
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      placeholder="e.g., 10:00 AM"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      placeholder="e.g., 12:00 PM"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location / Virtual Link</Label>
                  <Input
                    placeholder="e.g., Main Sanctuary or https://zoom.us/j/123456789"
                    value={formData.virtual_link_or_location}
                    onChange={(e) => setFormData({ ...formData, virtual_link_or_location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter event description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}>Cancel</Button>
                  <Button className="bg-accent hover:bg-accent/90" onClick={handleCreate}>
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{pagination.total || events.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Events</p>
                <p className="text-2xl font-bold text-foreground">{approvedEvents}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Events</p>
                <p className="text-2xl font-bold text-foreground">{pendingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="worship">Worship</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="bible-study">Bible Study</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading events data..." })}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tl-lg">S.No</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Event Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Type</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Date</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Time</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Location</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Created By</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!events || events.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event, index) => (
                      <tr key={event._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{((pagination.page - 1) * pagination.limit) + index + 1}</td>
                        <td className="p-4 font-medium text-foreground">{event.event_name}</td>
                        <td className="p-4 text-muted-foreground">{event.event_type || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(event.start_date)}</td>
                        <td className="p-4 text-muted-foreground">{formatTime(event.start_time)}</td>
                        <td className="p-4 text-muted-foreground max-w-xs">
                          <span className="line-clamp-1">{event.virtual_link_or_location || 'N/A'}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{event.user_id?.name || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:text-accent/80"
                              onClick={() => handleView(event)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-700"
                              onClick={() => handleStatusChange(event)}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(event._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {!isLoading && pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchEvents(pagination.page - 1, searchTerm, statusFilter, eventTypeFilter)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchEvents(pagination.page + 1, searchTerm, statusFilter, eventTypeFilter)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Event Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event Name</p>
                  <p className="font-medium">{selectedEvent.event_name}</p>
                </div>
                {selectedEvent.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedEvent.description}</p>
                  </div>
                )}
                {selectedEvent.event_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Event Type</p>
                    <p className="font-medium">{selectedEvent.event_type}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(selectedEvent.start_date)}</p>
                  </div>
                  {selectedEvent.start_time && (
                    <div>
                      <p className="text-sm text-muted-foreground">Start Time</p>
                      <p className="font-medium">{selectedEvent.start_time}</p>
                    </div>
                  )}
                </div>
                {(selectedEvent.end_date || selectedEvent.end_time) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvent.end_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{formatDate(selectedEvent.end_date)}</p>
                      </div>
                    )}
                    {selectedEvent.end_time && (
                      <div>
                        <p className="text-sm text-muted-foreground">End Time</p>
                        <p className="font-medium">{selectedEvent.end_time}</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedEvent.virtual_link_or_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location / Virtual Link</p>
                    <p className="font-medium break-all">{selectedEvent.virtual_link_or_location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>
                {selectedEvent.user_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{selectedEvent.user_id.name} ({selectedEvent.user_id.email})</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input
                  placeholder="e.g., Sunday Worship Service"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Input
                  placeholder="e.g., worship, prayer, etc."
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    placeholder="e.g., 10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    placeholder="e.g., 12:00 PM"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location / Virtual Link</Label>
                <Input
                  placeholder="e.g., Main Sanctuary or https://zoom.us/j/123456789"
                  value={formData.virtual_link_or_location}
                  onChange={(e) => setFormData({ ...formData, virtual_link_or_location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter event description..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  resetForm();
                }}>Cancel</Button>
                <Button className="bg-accent hover:bg-accent/90" onClick={handleUpdate}>
                  Update Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Event Status</DialogTitle>
              <DialogDescription>
                Change the status of this event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newStatus} onValueChange={(value: 'pending' | 'approved' | 'rejected') => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
