import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import SetNewPassword from "./pages/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import PrayerRequests from "./pages/PrayerRequests";
import BibleManagement from "./pages/BibleManagement";
import BibleChapterView from "./pages/BibleChapterView";
import ChurchManagement from "./pages/ChurchManagement";
import Events from "./pages/Events";
import FollowUp from "./pages/FollowUp";
import UserVideo from "./pages/UserVideo";
import UserChat from "./pages/UserChat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/set-new-password" element={<SetNewPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/prayer-request" element={<ProtectedRoute><PrayerRequests /></ProtectedRoute>} />
            <Route path="/bible-management" element={<ProtectedRoute><BibleManagement /></ProtectedRoute>} />
            <Route path="/bible-chapter" element={<ProtectedRoute><BibleChapterView /></ProtectedRoute>} />
            <Route path="/church-management" element={<ProtectedRoute><ChurchManagement /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/follow-up" element={<ProtectedRoute><FollowUp /></ProtectedRoute>} />
            <Route path="/user-video" element={<ProtectedRoute><UserVideo /></ProtectedRoute>} />
            <Route path="/user-chat" element={<ProtectedRoute><UserChat /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
