import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getPrayerRequests,
  getPrayerRequestStats,
  updatePrayerRequestStatus,
  updatePrayerRequest,
  deletePrayerRequest,
  getPrayerRequestById,
} from "@/services/prayerRequestsApi";
import type { PrayerRequest, UpdatePrayerRequestRequest } from "@/types/prayerRequests";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PrayerRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState({ totalRequests: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  // Form state for editing
  const [formData, setFormData] = useState<UpdatePrayerRequestRequest>({
    name: "",
    mobile_number: "",
    description: "",
    date: "",
    time: "",
  });

  const fetchData = useCallback(async (page: number = 1, search?: string, status?: string) => {
    setIsLoading(true);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        getPrayerRequestStats(),
        getPrayerRequests({
          page,
          limit: 10,
          search: search && search.trim() ? search : undefined,
          status: status && status !== 'all' ? (status as 'pending' | 'approved' | 'rejected') : undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      ]);
      
      setStats(statsRes.data);
      
      if (requestsRes?.data) {
        setRequests(requestsRes.data.prayerRequests || []);
        setPagination(requestsRes.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch prayer requests",
        variant: "destructive",
      });
      setRequests([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, "", statusFilter);
  }, [statusFilter, fetchData]);

  const handleSearch = () => {
    fetchData(1, searchTerm, statusFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchData(1, "", "all");
  };

  const handleView = async (request: PrayerRequest) => {
    try {
      const response = await getPrayerRequestById(request._id);
      setSelectedRequest(response.data.prayerRequest);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch prayer request details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setFormData({
      name: request.name || "",
      mobile_number: request.mobileNumber || "",
      description: request.description || "",
      date: request.requestDate ? request.requestDate.split('T')[0] : "",
      time: request.time || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRequest) return;

    try {
      await updatePrayerRequest(selectedRequest._id, formData);
      toast({
        title: "Success",
        description: "Prayer request updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchData(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update prayer request",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      await updatePrayerRequestStatus(selectedRequest._id, { status: newStatus });
      toast({
        title: "Success",
        description: `Prayer request ${newStatus} successfully`,
      });
      setIsStatusDialogOpen(false);
      fetchData(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update prayer request status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) return;

    try {
      await deletePrayerRequest(id);
      toast({
        title: "Success",
        description: "Prayer request deleted successfully",
      });
      fetchData(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete prayer request",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile_number: "",
      description: "",
      date: "",
      time: "",
    });
    setSelectedRequest(null);
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
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Prayer Requests</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Heart className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-100">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, church, or user..."
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading prayer requests data..." })}>
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
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">User</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Phone</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Church</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Request Date</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!requests || requests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No prayer requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{request.sno ?? '-'}</td>
                        <td className="p-4 text-muted-foreground">
                          {request.user?.name || 'N/A'}
                          {request.user?.email && (
                            <span className="block text-xs text-muted-foreground">{request.user.email}</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-foreground">{request.name || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.email || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.phone || request.mobileNumber || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.church || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status || 'pending')}`}>
                            {request.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {request.requestDate ? formatDate(request.requestDate) : 'N/A'}
                          {request.time && (
                            <span className="block text-xs text-muted-foreground">{request.time}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-accent hover:text-accent/80"
                              onClick={() => handleView(request)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEdit(request)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-yellow-600 hover:text-yellow-700"
                              onClick={() => handleStatusChange(request)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(request._id)}
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(pagination.page - 1, searchTerm, statusFilter)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(pagination.page + 1, searchTerm, statusFilter)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Request Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Prayer Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                {selectedRequest.user && (
                  <div>
                    <p className="text-sm text-muted-foreground">User</p>
                    <p className="font-medium">{selectedRequest.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.user.email}</p>
                    {selectedRequest.user.mobile && (
                      <p className="text-sm text-muted-foreground">{selectedRequest.user.mobile}</p>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRequest.phone || selectedRequest.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Church</p>
                  <p className="font-medium">{selectedRequest.church || 'N/A'}</p>
                </div>
                {selectedRequest.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedRequest.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {selectedRequest.requestDate ? formatDate(selectedRequest.requestDate) : 'N/A'}
                    {selectedRequest.time && ` at ${selectedRequest.time}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Request Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Prayer Request</DialogTitle>
              <DialogDescription>
                Update prayer request information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  placeholder="e.g., 1234567890"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    placeholder="e.g., 10:00 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter prayer request description..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}>Cancel</Button>
                <Button className="bg-accent hover:bg-accent/90" onClick={handleUpdate}>
                  Update Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Prayer Request Status</DialogTitle>
              <DialogDescription>
                Change the status of this prayer request
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
