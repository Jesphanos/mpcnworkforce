import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type AppRole = "employee" | "trader" | "team_lead" | "department_head" | "report_admin" | "finance_hr_admin" | "investment_admin" | "user_admin" | "general_overseer";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  allowInvestors?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, allowInvestors }: ProtectedRouteProps) {
  const { user, profile, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRoleAccess = allowedRoles.some(role => hasRole(role));
    const isInvestorWithAccess = allowInvestors && profile?.is_investor;
    
    if (!hasRoleAccess && !isInvestorWithAccess) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
}