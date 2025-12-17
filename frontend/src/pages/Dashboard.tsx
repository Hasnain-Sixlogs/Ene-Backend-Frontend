import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Cross, BookOpen, Calendar, Eye, Pencil, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserViewModal } from "@/components/modals/UserViewModal";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getRegistrationChart,
  getSurveyResults,
  getRecentUsers,
  getTotalUsers,
} from "@/services/dashboardApi";
import type { RecentUser } from "@/types/dashboard";

interface Stat {
  icon: typeof Users;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; user: number }>>([]);
  const [faithStats, setFaithStats] = useState({ yes: 0, no: 0, notSure: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all dashboard data in parallel
        const [statsRes, chartRes, surveyRes, usersRes, totalUsersRes] = await Promise.all([
          getDashboardStats(),
          getRegistrationChart({ year: new Date().getFullYear() }),
          getSurveyResults(),
          getRecentUsers({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
          getTotalUsers(),
        ]);

        // Update stats
        const statsData = statsRes.data;
        setStats([
          { icon: Users, label: "Total Users", value: statsData.totalUsers.toString(), bgColor: "bg-blue-50", iconColor: "text-blue-500", borderColor: "border-blue-100" },
          { icon: Cross, label: "Total Prayers", value: statsData.totalPrayers.toString(), bgColor: "bg-emerald-50", iconColor: "text-emerald-500", borderColor: "border-emerald-100" },
          { icon: BookOpen, label: "Total Bibles", value: statsData.totalBibles.toString(), bgColor: "bg-amber-50", iconColor: "text-amber-500", borderColor: "border-amber-100" },
          { icon: Calendar, label: "Total Events", value: statsData.totalEvents.toString(), bgColor: "bg-violet-50", iconColor: "text-violet-500", borderColor: "border-violet-100" },
        ]);

        // Update chart data
        setChartData(chartRes.data.monthlyData.map(item => ({
          name: item.month,
          user: item.users,
        })));

        // Update survey results
        const surveyData = surveyRes.data;
        setFaithStats({
          yes: surveyData.totalYes,
          no: surveyData.totalNo,
          notSure: surveyData.totalNotSure,
        });

        // Update recent users
        setRecentUsers(usersRes.data.users);

        // Update total users
        setTotalUsers(totalUsersRes.data.totalUsers);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleView = (user: RecentUser) => {
    setSelectedUser(user);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (user: RecentUser) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Title */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-card rounded-2xl p-6 border-2 ${stat.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm animate-fade-up stagger-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
                <p className="text-3xl font-bold text-foreground mt-1">{totalUsers}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground font-medium">User</span>
                </div>
                
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="user" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pastor" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Faith Stats */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm animate-fade-up stagger-3">
            <h3 className="text-sm font-semibold text-muted-foreground mb-6">
              Do You Know Jesus Christ as your Lord and Savior?
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-3xl font-bold text-foreground">{faithStats.yes}</span>
                <span className="text-sm text-emerald-600 font-semibold">Total Yes</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100">
                <span className="text-3xl font-bold text-foreground">{faithStats.no}</span>
                <span className="text-sm text-red-600 font-semibold">Total No</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-3xl font-bold text-foreground">{faithStats.notSure}</span>
                <span className="text-sm text-amber-600 font-semibold">Total Not Sure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-up stagger-4">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Recent users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider rounded-tl-lg">S.No.</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">Image</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">Mobile Number</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider">City</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold uppercase tracking-wider rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="py-4 px-6 text-sm text-blue-600 font-semibold">{user.sno}</td>
                      <td className="py-4 px-6">
                        <Avatar className="w-12 h-12 border-2 border-slate-100">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="py-4 px-6 text-sm text-blue-600 font-semibold">{user.name}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-foreground font-medium">{user.mobileNumber}</td>
                      <td className="py-4 px-6 text-sm text-foreground max-w-xs truncate">{user.location}</td>
                      <td className="py-4 px-6 text-sm text-blue-600 font-semibold">{user.city}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleView(user)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="text-xs font-medium">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserViewModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
    </DashboardLayout>
  );
}
