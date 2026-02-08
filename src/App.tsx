import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RealtimeNotificationsProvider } from "@/components/providers/RealtimeNotificationsProvider";
import { AnnouncerProvider } from "@/components/ui/announcer";
import { PageSkeleton } from "@/components/ui/page-skeleton";

// Eagerly loaded pages (critical path)
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";

// Lazy loaded pages (code splitting for performance)
const Profile = lazy(() => import("./pages/Profile"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Reports = lazy(() => import("./pages/Reports"));
const FinanceHR = lazy(() => import("./pages/FinanceHR"));
const Investments = lazy(() => import("./pages/Investments"));
const InvestorProfile = lazy(() => import("./pages/InvestorProfile"));
const Trading = lazy(() => import("./pages/Trading"));
const Tasks = lazy(() => import("./pages/Tasks"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const ActivityHistory = lazy(() => import("./pages/ActivityHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const Governance = lazy(() => import("./pages/Governance"));
const Department = lazy(() => import("./pages/Department"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const Learn = lazy(() => import("./pages/Learn"));
const Messages = lazy(() => import("./pages/Messages"));

const queryClient = new QueryClient();

// Wrapper for lazy-loaded pages
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  );
}

import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnnouncerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
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
                        <LazyPage><Profile /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={["user_admin", "general_overseer"]}>
                        <LazyPage><UserManagement /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={["employee", "team_lead", "report_admin", "general_overseer"]}>
                        <LazyPage><Reports /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance-hr"
                    element={
                      <ProtectedRoute allowedRoles={["finance_hr_admin", "general_overseer"]}>
                        <LazyPage><FinanceHR /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/investments"
                    element={
                      <ProtectedRoute allowedRoles={["investment_admin", "general_overseer"]} allowInvestors>
                        <LazyPage><Investments /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/investor-profile"
                    element={
                      <ProtectedRoute>
                        <LazyPage><InvestorProfile /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trading"
                    element={
                      <ProtectedRoute>
                        <LazyPage><Trading /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <ProtectedRoute allowedRoles={["team_lead", "report_admin", "general_overseer"]}>
                        <LazyPage><Tasks /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute allowedRoles={["team_lead", "report_admin", "general_overseer"]}>
                        <LazyPage><TeamDashboard /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <LazyPage><ActivityHistory /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["general_overseer"]}>
                        <LazyPage><Settings /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/governance"
                    element={
                      <ProtectedRoute allowedRoles={["report_admin", "user_admin", "general_overseer"]}>
                        <LazyPage><Governance /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/department"
                    element={
                      <ProtectedRoute allowedRoles={["department_head", "user_admin", "general_overseer"]}>
                        <LazyPage><Department /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/worker/:userId"
                    element={
                      <ProtectedRoute allowedRoles={["team_lead", "report_admin", "user_admin", "general_overseer"]}>
                        <LazyPage><WorkerProfile /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/learn"
                    element={
                      <ProtectedRoute>
                        <LazyPage><Learn /></LazyPage>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <LazyPage><Messages /></LazyPage>
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
      </AnnouncerProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;