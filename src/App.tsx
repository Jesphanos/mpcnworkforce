import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RealtimeNotificationsProvider } from "@/components/providers/RealtimeNotificationsProvider";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
import FinanceHR from "./pages/FinanceHR";
import Investments from "./pages/Investments";
import InvestorProfile from "./pages/InvestorProfile";
import Trading from "./pages/Trading";
import Tasks from "./pages/Tasks";
import TeamDashboard from "./pages/TeamDashboard";
import ActivityHistory from "./pages/ActivityHistory";
import Settings from "./pages/Settings";
import Governance from "./pages/Governance";
import Department from "./pages/Department";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import WorkerProfile from "./pages/WorkerProfile";
import Learn from "./pages/Learn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RealtimeNotificationsProvider>
              <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["user_admin", "general_overseer"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["employee", "team_lead", "report_admin", "general_overseer"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance-hr"
              element={
                <ProtectedRoute allowedRoles={["finance_hr_admin", "general_overseer"]}>
                  <FinanceHR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedRoute allowedRoles={["investment_admin", "general_overseer"]} allowInvestors>
                  <Investments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investor-profile"
              element={
                <ProtectedRoute>
                  <InvestorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading"
              element={
                <ProtectedRoute>
                  <Trading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={["team_lead", "report_admin", "general_overseer"]}>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute allowedRoles={["team_lead", "report_admin", "general_overseer"]}>
                  <TeamDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivityHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["general_overseer"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
              <Route
                path="/governance"
                element={
                  <ProtectedRoute allowedRoles={["report_admin", "user_admin", "general_overseer"]}>
                    <Governance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/department"
                element={
                  <ProtectedRoute allowedRoles={["department_head", "user_admin", "general_overseer"]}>
                    <Department />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/:userId"
                element={
                  <ProtectedRoute allowedRoles={["team_lead", "report_admin", "user_admin", "general_overseer"]}>
                    <WorkerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn"
                element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                }
              />
              <Route path="/access-denied" element={<AccessDenied />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RealtimeNotificationsProvider>
        </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;