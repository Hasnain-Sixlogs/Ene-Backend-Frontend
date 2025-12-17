import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, UserPlus, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getFollowUpStats,
  getFollowUpRequests,
  createFollowUpRequest,
  updateFollowUpRequest,
  updateFollowUpRequestStatus,
  deleteFollowUpRequest,
} from "@/services/followUpApi";
import type { FollowUpRequest } from "@/types/followUp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FollowUp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [requests, setRequests] = useState<FollowUpRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FollowUpRequest | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  useEffect(() => {
    fetchData(1);
  }, [statusFilter, typeFilter]);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        getFollowUpStats(),
        getFollowUpRequests({
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: statusFilter ? (statusFilter as 'pending' | 'in_progress' | 'completed') : undefined,
          type: typeFilter ? (typeFilter as any) : undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      ]);
      setStats(statsRes.data);
      setRequests(requestsRes.data.requests);
      setPagination(requestsRes.data.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch follow-up data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    fetchData(1);
  };

  const handleView = (request: FollowUpRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (request: FollowUpRequest) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (request: FollowUpRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      await updateFollowUpRequestStatus(selectedRequest._id, { status: newStatus });
      toast({
        title: "Success",
        description: `Status updated to ${newStatus.replace('_', ' ')}`,
      });
      setIsStatusDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this follow-up request?")) return;

    try {
      await deleteFollowUpRequest(id);
      toast({
        title: "Success",
        description: "Follow-up request deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      await createFollowUpRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.type || 'Other',
        assigned_to: formData.assignedTo,
        due_date: formData.dueDate,
        description: formData.description,
      });
      toast({
        title: "Success",
        description: "Follow-up request created successfully",
      });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress":
      case "in progress": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "New Visitor": return "bg-purple-100 text-purple-700";
      case "Prayer Request": return "bg-pink-100 text-pink-700";
      case "Counseling": return "bg-orange-100 text-orange-700";
      case "Membership": return "bg-cyan-100 text-cyan-700";
      case "Baptism": return "bg-indigo-100 text-indigo-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Follow-Up Management</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Follow-Up
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Follow-Up Request</DialogTitle>
              </DialogHeader>
              <CreateFollowUpForm onSubmit={handleCreate} onCancel={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <UserPlus className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or type..."
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
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="New Visitor">New Visitor</SelectItem>
                <SelectItem value="Prayer Request">Prayer Request</SelectItem>
                <SelectItem value="Counseling">Counseling</SelectItem>
                <SelectItem value="Membership">Membership</SelectItem>
                <SelectItem value="Baptism">Baptism</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
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
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading follow-up data..." })}>
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
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Contact</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Type</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Assigned To</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Due Date</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No follow-up requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{request.sno}</td>
                        <td className="p-4 font-medium text-foreground">{request.name}</td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-muted-foreground">{request.email}</p>
                            <p className="text-muted-foreground">{request.phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{request.assignedTo}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(request.dueDate)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
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
                    onClick={() => fetchData(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(pagination.page + 1)}
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
              <DialogTitle>Follow-Up Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedRequest.type)}`}>
                    {selectedRequest.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{selectedRequest.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>
                {selectedRequest.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedRequest.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>
                Change the status of this follow-up request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newStatus} onValueChange={(value: 'pending' | 'in_progress' | 'completed') => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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

// Create Follow-Up Form Component
function CreateFollowUpForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Other' as const,
    assignedTo: '',
    dueDate: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New Visitor">New Visitor</SelectItem>
              <SelectItem value="Prayer Request">Prayer Request</SelectItem>
              <SelectItem value="Counseling">Counseling</SelectItem>
              <SelectItem value="Membership">Membership</SelectItem>
              <SelectItem value="Baptism">Baptism</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assigned To</Label>
        <Input
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Request
        </Button>
      </div>
    </form>
  );
}
