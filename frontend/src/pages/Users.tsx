import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, RotateCcw, Download, Eye, Pencil, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserViewModal } from "@/components/modals/UserViewModal";
import { toast } from "@/hooks/use-toast";
import { getUsers, updateUser } from "@/services/usersApi";
import type { User } from "@/types/users";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page,
        limit: 10,
        search: search || searchQuery || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(1, searchQuery);
  };

  const handleReset = () => {
    setSearchQuery("");
    fetchUsers(1);
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Exporting users data to Excel...",
    });
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser._id, {
        name: userData.name,
        email: userData.email,
        location: {
          address: userData.location,
          city: userData.city,
        },
      });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsModalOpen(false);
      fetchUsers(pagination.page, searchQuery);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64 pr-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="success"
              size="icon"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="destructive"
              size="icon"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
              <span className="w-6 h-6 bg-accent rounded flex items-center justify-center text-accent-foreground text-xs font-bold">
                XL
              </span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card animate-fade-up stagger-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider rounded-tl-lg">S.No.</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">Image</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">Mobile Number</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider">City</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold uppercase tracking-wider rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="data-table-row hover:bg-muted/30 transition-colors animate-fade-up"
                    >
                      <td className="py-4 px-4 text-sm text-primary font-medium">{user.sno}</td>
                      <td className="py-4 px-4">
                        <Avatar className="w-14 h-14 border-2 border-muted">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="py-4 px-4 text-sm text-primary font-medium">{user.name}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-4 text-sm text-foreground">{user.mobileNumber}</td>
                      <td className="py-4 px-4 text-sm text-foreground max-w-xs">
                        <span className="line-clamp-2">{user.location}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-primary font-medium">{user.city}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleView(user)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">View</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-xs">Edit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page - 1, searchQuery)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page + 1, searchQuery)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserViewModal
        user={selectedUser ? {
          _id: selectedUser._id,
          sno: selectedUser.sno,
          name: selectedUser.name,
          email: selectedUser.email,
          mobileNumber: selectedUser.mobileNumber,
          location: selectedUser.location,
          city: selectedUser.city,
          image: selectedUser.image,
        } : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSave={handleSaveUser}
      />
    </DashboardLayout>
  );
}
