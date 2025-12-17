import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Download, RotateCcw, Eye, Edit, Trash2, Church as ChurchIcon, MapPin, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  getChurches,
  getChurchStats,
  getChurchById,
  updateChurch,
  deleteChurch,
} from "@/services/churchesApi";
import type { Church, UpdateChurchRequest } from "@/types/churches";

export default function ChurchManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [churches, setChurches] = useState<Church[]>([]);
  const [stats, setStats] = useState({ totalChurches: 0, totalMembers: 0, activeChurches: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<UpdateChurchRequest>({
    name: "",
    location: {
      address: "",
      city: "",
    },
    church_status: 1,
    is_availability: 1,
    approve_status: 2,
  });

  const fetchData = useCallback(async (page: number = 1, search?: string, status?: string) => {
    setIsLoading(true);
    try {
      const [statsRes, churchesRes] = await Promise.all([
        getChurchStats(),
        getChurches({
          page,
          limit: 10,
          search: search && search.trim() ? search : undefined,
          status: status && status !== 'all' ? (status as 'active' | 'inactive') : undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      ]);
      
      setStats(statsRes.data);
      
      if (churchesRes?.data) {
        setChurches(churchesRes.data.churches || []);
        setPagination(churchesRes.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error fetching church data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch church data",
        variant: "destructive",
      });
      setChurches([]);
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

  const handleView = async (church: Church) => {
    try {
      const response = await getChurchById(church._id);
      setSelectedChurch(response.data.church);
      setIsViewOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch church details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (church: Church) => {
    setSelectedChurch(church);
    setFormData({
      name: church.churchName || "",
      location: {
        address: church.address || "",
        city: church.city || "",
        coordinates: church.coordinates,
      },
      church_status: church.churchStatus,
      is_availability: church.isAvailability,
      approve_status: church.approveStatus,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedChurch) return;

    try {
      await updateChurch(selectedChurch._id, formData);
      toast({
        title: "Success",
        description: "Church updated successfully",
      });
      setIsEditOpen(false);
      resetForm();
      fetchData(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update church",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this church? This action cannot be undone.")) return;

    try {
      await deleteChurch(id);
      toast({
        title: "Success",
        description: "Church deleted successfully",
      });
      fetchData(pagination.page, searchTerm, statusFilter);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete church",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: {
        address: "",
        city: "",
      },
      church_status: 1,
      is_availability: 1,
      approve_status: 2,
    });
    setSelectedChurch(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (church: Church) => {
    if (church.churchStatus === 1 && church.isAvailability === 1) {
      return "Active";
    }
    return "Inactive";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Church Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ChurchIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Churches</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalChurches}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Churches</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeChurches}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, pastor, or location..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Downloading church data..." })}>
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
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Church Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">User Name</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Location</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Members</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Phone</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 font-semibold text-sm uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!churches || churches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No churches found
                      </td>
                    </tr>
                  ) : (
                    churches.map((church, index) => (
                      <tr key={church._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-muted-foreground">{church.sno || ((pagination.page - 1) * pagination.limit) + index + 1}</td>
                        <td className="p-4 font-medium text-foreground">{church.churchName}</td>
                        <td className="p-4 text-muted-foreground">{church?.user_id?.name}</td>
                        <td className="p-4 text-muted-foreground max-w-xs">
                          <span className="line-clamp-1">{church.location}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{church.members || 0}</td>
                        <td className="p-4 text-muted-foreground">{church.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getStatusText(church))}`}>
                            {getStatusText(church)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:text-accent/80"
                              onClick={() => handleView(church)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEdit(church)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(church._id)}
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} churches
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

        {/* View Church Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Church Details</DialogTitle>
            </DialogHeader>
            {selectedChurch && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Church Name</p>
                  <p className="font-medium">{selectedChurch.churchName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Name</p>
                  <p className="font-medium">{selectedChurch?.user_id?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedChurch.location}</p>
                </div>
                {selectedChurch.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedChurch.address}</p>
                  </div>
                )}
                {selectedChurch.city && (
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{selectedChurch.city}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{selectedChurch.members || 0}</p>
                </div>
                {selectedChurch.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedChurch.phone}</p>
                  </div>
                )}
                {selectedChurch.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedChurch.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getStatusText(selectedChurch))}`}>
                    {getStatusText(selectedChurch)}
                  </span>
                </div>
                {selectedChurch.churchData?.user_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{selectedChurch.churchData.user_id.name} ({selectedChurch.churchData.user_id.email})</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Church Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Church</DialogTitle>
              <DialogDescription>
                Update church information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Church Name</Label>
                <Input
                  placeholder="e.g., Grace Community Church"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="e.g., 123 Church St"
                  value={formData.location?.address || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="e.g., New York"
                  value={formData.location?.city || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Church Status</Label>
                <Select
                  value={formData.church_status?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, church_status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={formData.is_availability?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, is_availability: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Available</SelectItem>
                    <SelectItem value="0">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Approval Status</Label>
                <Select
                  value={formData.approve_status?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, approve_status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Rejected</SelectItem>
                    <SelectItem value="2">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  resetForm();
                }}>Cancel</Button>
                <Button className="bg-accent hover:bg-accent/90" onClick={handleUpdate}>
                  Update Church
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
