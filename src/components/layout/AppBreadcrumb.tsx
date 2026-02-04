import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "My Profile",
  users: "User Management",
  reports: "Reports",
  "finance-hr": "Finance & HR",
  investments: "Investments",
  "investor-profile": "Investor Profile",
  trading: "Trading Terminal",
  tasks: "Tasks",
  team: "Team Dashboard",
  activity: "Activity History",
  settings: "Settings",
  governance: "Governance",
  department: "Department",
  worker: "Worker Profile",
  learn: "MPCN Learn",
  "access-denied": "Access Denied",
};

export function AppBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    
    // Handle dynamic segments (UUIDs)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    const label = isUuid ? "Details" : (routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));

    return { path, label, isLast, segment };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
