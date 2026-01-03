import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { MemberPerformance, TeamGroup } from "@/hooks/useOverseerData";

const roleLabels: Record<string, string> = {
  employee: "Employee",
  team_lead: "Team Lead",
  report_admin: "Report Admin",
  finance_hr_admin: "Finance/HR Admin",
  investment_admin: "Investment Admin",
  user_admin: "User Admin",
  general_overseer: "General Overseer",
};

interface ExportFilters {
  role?: string;
  platform?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

function getFilterSummary(filters: ExportFilters): string {
  const parts: string[] = [];
  if (filters.role) parts.push(`Role: ${roleLabels[filters.role] || filters.role}`);
  if (filters.platform) parts.push(`Platform: ${filters.platform}`);
  if (filters.status) parts.push(`Status: ${filters.status}`);
  if (filters.dateFrom) parts.push(`From: ${filters.dateFrom}`);
  if (filters.dateTo) parts.push(`To: ${filters.dateTo}`);
  return parts.length > 0 ? parts.join(" | ") : "All data (no filters applied)";
}

export function exportMembersToCSV(
  members: MemberPerformance[],
  filters: ExportFilters
) {
  const headers = [
    "Member",
    "Role",
    "Platforms",
    "Total Tasks",
    "Approved Tasks",
    "Pending Tasks",
    "Rejected Tasks",
    "Total Reports",
    "Approved Reports",
    "Pending Reports",
    "Rejected Reports",
    "Total Hours",
    "Total Earnings",
    "Approval Rate",
  ];

  const rows = members.map((m) => {
    const totalItems = m.total_tasks + m.total_reports;
    const approvedItems = m.approved_tasks + m.approved_reports;
    const pendingItems = m.pending_tasks + m.pending_reports;
    const decidedItems = totalItems - pendingItems;
    const approvalRate = decidedItems > 0 ? ((approvedItems / decidedItems) * 100).toFixed(1) : "N/A";

    return [
      m.full_name || "Unknown",
      roleLabels[m.role] || m.role,
      m.platforms.join("; "),
      m.total_tasks.toString(),
      m.approved_tasks.toString(),
      m.pending_tasks.toString(),
      m.rejected_tasks.toString(),
      m.total_reports.toString(),
      m.approved_reports.toString(),
      m.pending_reports.toString(),
      m.rejected_reports.toString(),
      m.total_hours.toFixed(1),
      `$${m.total_earnings.toFixed(2)}`,
      `${approvalRate}%`,
    ];
  });

  // Calculate totals
  const totals = members.reduce(
    (acc, m) => ({
      tasks: acc.tasks + m.total_tasks,
      approvedTasks: acc.approvedTasks + m.approved_tasks,
      reports: acc.reports + m.total_reports,
      approvedReports: acc.approvedReports + m.approved_reports,
      hours: acc.hours + m.total_hours,
      earnings: acc.earnings + m.total_earnings,
    }),
    { tasks: 0, approvedTasks: 0, reports: 0, approvedReports: 0, hours: 0, earnings: 0 }
  );

  rows.push([
    "TOTAL",
    "",
    "",
    totals.tasks.toString(),
    totals.approvedTasks.toString(),
    "",
    "",
    totals.reports.toString(),
    totals.approvedReports.toString(),
    "",
    "",
    totals.hours.toFixed(1),
    `$${totals.earnings.toFixed(2)}`,
    "",
  ]);

  const csvContent = [
    "Team Performance Report",
    `Generated: ${new Date().toLocaleString()}`,
    `Filters: ${getFilterSummary(filters)}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `team-performance-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("CSV exported successfully");
}

export function exportMembersToPDF(
  members: MemberPerformance[],
  filters: ExportFilters
) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(18);
  doc.text("Team Performance Report", 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.text(`Filters: ${getFilterSummary(filters)}`, 14, 38);

  // Summary stats
  const totals = members.reduce(
    (acc, m) => ({
      members: acc.members + 1,
      tasks: acc.tasks + m.total_tasks,
      approvedTasks: acc.approvedTasks + m.approved_tasks,
      reports: acc.reports + m.total_reports,
      approvedReports: acc.approvedReports + m.approved_reports,
      hours: acc.hours + m.total_hours,
      earnings: acc.earnings + m.total_earnings,
    }),
    { members: 0, tasks: 0, approvedTasks: 0, reports: 0, approvedReports: 0, hours: 0, earnings: 0 }
  );

  doc.setFontSize(10);
  doc.text(`Total Members: ${totals.members}`, 14, 48);
  doc.text(`Total Tasks: ${totals.tasks} (${totals.approvedTasks} approved)`, 14, 54);
  doc.text(`Total Reports: ${totals.reports} (${totals.approvedReports} approved)`, 100, 54);
  doc.text(`Total Hours: ${totals.hours.toFixed(1)}`, 14, 60);
  doc.text(`Total Earnings: $${totals.earnings.toFixed(2)}`, 100, 60);

  // Table data
  const tableData = members.map((m) => {
    const totalItems = m.total_tasks + m.total_reports;
    const approvedItems = m.approved_tasks + m.approved_reports;
    const pendingItems = m.pending_tasks + m.pending_reports;
    const decidedItems = totalItems - pendingItems;
    const approvalRate = decidedItems > 0 ? ((approvedItems / decidedItems) * 100).toFixed(0) : "N/A";

    return [
      m.full_name || "Unknown",
      roleLabels[m.role] || m.role,
      m.platforms.slice(0, 2).join(", ") + (m.platforms.length > 2 ? "..." : ""),
      `${m.approved_tasks}/${m.total_tasks}`,
      `${m.approved_reports}/${m.total_reports}`,
      `${m.total_hours.toFixed(1)}h`,
      `$${m.total_earnings.toFixed(2)}`,
      `${approvalRate}%`,
    ];
  });

  // Add totals row
  tableData.push([
    "TOTAL",
    "",
    "",
    `${totals.approvedTasks}/${totals.tasks}`,
    `${totals.approvedReports}/${totals.reports}`,
    `${totals.hours.toFixed(1)}h`,
    `$${totals.earnings.toFixed(2)}`,
    "",
  ]);

  autoTable(doc, {
    startY: 68,
    head: [["Member", "Role", "Platforms", "Tasks (Appr/Total)", "Reports (Appr/Total)", "Hours", "Earnings", "Approval %"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  doc.save(`team-performance-${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success("PDF exported successfully");
}

export function exportTeamsToCSV(
  teams: TeamGroup[],
  filters: ExportFilters
) {
  const headers = [
    "Team/Role",
    "Members",
    "Total Tasks",
    "Total Reports",
    "Total Hours",
    "Total Earnings",
    "Approval Rate",
  ];

  const rows: string[][] = [];

  teams.forEach((team) => {
    // Team summary row
    rows.push([
      roleLabels[team.role] || team.role,
      team.total_members.toString(),
      team.total_tasks.toString(),
      team.total_reports.toString(),
      team.total_hours.toFixed(1),
      `$${team.total_earnings.toFixed(2)}`,
      `${team.approval_rate.toFixed(1)}%`,
    ]);

    // Member rows (indented)
    team.members.forEach((m) => {
      const totalItems = m.total_tasks + m.total_reports;
      const approvedItems = m.approved_tasks + m.approved_reports;
      const pendingItems = m.pending_tasks + m.pending_reports;
      const decidedItems = totalItems - pendingItems;
      const approvalRate = decidedItems > 0 ? ((approvedItems / decidedItems) * 100).toFixed(1) : "N/A";

      rows.push([
        `  → ${m.full_name || "Unknown"}`,
        "",
        m.total_tasks.toString(),
        m.total_reports.toString(),
        m.total_hours.toFixed(1),
        `$${m.total_earnings.toFixed(2)}`,
        `${approvalRate}%`,
      ]);
    });

    rows.push(["", "", "", "", "", "", ""]); // Empty row between teams
  });

  const csvContent = [
    "Teams Overview Report",
    `Generated: ${new Date().toLocaleString()}`,
    `Filters: ${getFilterSummary(filters)}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `teams-overview-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("CSV exported successfully");
}

export function exportTeamsToPDF(
  teams: TeamGroup[],
  filters: ExportFilters
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Teams Overview Report", 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.text(`Filters: ${getFilterSummary(filters)}`, 14, 38);

  // Overall summary
  const overallTotals = teams.reduce(
    (acc, t) => ({
      teams: acc.teams + 1,
      members: acc.members + t.total_members,
      tasks: acc.tasks + t.total_tasks,
      reports: acc.reports + t.total_reports,
      hours: acc.hours + t.total_hours,
      earnings: acc.earnings + t.total_earnings,
    }),
    { teams: 0, members: 0, tasks: 0, reports: 0, hours: 0, earnings: 0 }
  );

  doc.text(`Total Teams: ${overallTotals.teams}`, 14, 48);
  doc.text(`Total Members: ${overallTotals.members}`, 70, 48);
  doc.text(`Total Earnings: $${overallTotals.earnings.toFixed(2)}`, 130, 48);

  // Teams table
  const tableData = teams.map((team) => [
    roleLabels[team.role] || team.role,
    team.total_members.toString(),
    team.total_tasks.toString(),
    team.total_reports.toString(),
    `${team.total_hours.toFixed(1)}h`,
    `$${team.total_earnings.toFixed(2)}`,
    `${team.approval_rate.toFixed(1)}%`,
  ]);

  // Add totals row
  tableData.push([
    "TOTAL",
    overallTotals.members.toString(),
    overallTotals.tasks.toString(),
    overallTotals.reports.toString(),
    `${overallTotals.hours.toFixed(1)}h`,
    `$${overallTotals.earnings.toFixed(2)}`,
    "",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["Team/Role", "Members", "Tasks", "Reports", "Hours", "Earnings", "Approval %"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  doc.save(`teams-overview-${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success("PDF exported successfully");
}
