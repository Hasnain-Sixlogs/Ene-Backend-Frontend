import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getPastorRequests,
  updatePastorRequestStatus,
  deletePastorRequest,
} from "@/services/pastorRequestsApi";
import type { PastorRequest } from "@/types/pastorRequests";
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

export default function PastorRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requests, setRequests] = useState<PastorRequest[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PastorRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchRequests = useCallback(async (page: number = 1, search?: string, status?: string) => {
    setIsLoading(true);
    try {
      const response = await getPastorRequests({
        page,
        limit: 10,
        search: search !== undefined ? search : undefined,
        status: status && status !== 'all' ? (status as 'pending' | 'approved' | 'rejected') : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (response?.data) {
        setRequests(response.data.requests || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching pastor requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch pastor requests",
        variant: "destructive",
      });
      // Set empty state on error to prevent blank page
      setRequests([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(1, searchTerm, statusFilter);
  }, [statusFilter, fetchRequests]);


  const handleSearch = () => {
    fetchRequests(1, searchTerm, statusFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchRequests(1, "", "all");
  };

  const handleView = (request: PastorRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleStatusChange = (request: PastorRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      await updatePastorRequestStatus(selectedRequest._id, { status: newStatus });
      toast({
        title: "Success",
        description: `Request ${newStatus} successfully`,
      });
      setIsStatusDialogOpen(false);
      fetchRequests(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await deletePastorRequest(id);
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
      fetchRequests(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl font-bold text-foreground">Pastor Requests</h1>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or church..."
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
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading pastor requests data..." })}>
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
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No pastor requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id || Math.random()} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{request.sno ?? '-'}</td>
                        <td className="p-4 font-medium text-foreground">{request.name || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.email || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.phone || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{request.church || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status || 'pending')}`}>
                            {request.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{request.requestDate ? formatDate(request.requestDate) : 'N/A'}</td>
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
                    onClick={() => fetchRequests(pagination.page - 1, searchTerm)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRequests(pagination.page + 1, searchTerm)}
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
              <DialogTitle>Pastor Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
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
                  <p className="font-medium">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Church</p>
                  <p className="font-medium">{selectedRequest.church}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.requestDate)}</p>
                </div>
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
                Change the status of this pastor request
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
