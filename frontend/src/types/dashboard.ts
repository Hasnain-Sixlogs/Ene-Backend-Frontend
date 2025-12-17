// Dashboard API Response Types

export interface DashboardStats {
  totalUsers: number;
  totalPrayers: number;
  totalBibles: number;
  totalEvents: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export interface MonthlyData {
  month: string;
  users: number;
  prayers: number;
}

export interface RegistrationChartData {
  year: number;
  monthlyData: MonthlyData[];
}

export interface RegistrationChartResponse {
  success: boolean;
  message: string;
  data: RegistrationChartData;
}

export interface SurveyResults {
  totalYes: number;
  totalNo: number;
  totalNotSure: number;
  total: number;
}

export interface SurveyResultsResponse {
  success: boolean;
  message: string;
  data: SurveyResults;
}

export interface RecentUser {
  sno: number;
  _id: string;
  image: string | null;
  name: string;
  email: string;
  mobileNumber: string;
  location: string;
  city: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface RecentUsersData {
  users: RecentUser[];
  pagination: Pagination;
}

export interface RecentUsersResponse {
  success: boolean;
  message: string;
  data: RecentUsersData;
}

export interface TotalUsersData {
  totalUsers: number;
}

export interface TotalUsersResponse {
  success: boolean;
  message: string;
  data: TotalUsersData;
}

export interface RecentUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegistrationChartParams {
  year?: number;
}

