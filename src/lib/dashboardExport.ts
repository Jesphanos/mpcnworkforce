import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { format } from "date-fns";

interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  pendingReviews: number;
  teamMembers: number;
}

interface TrendDataPoint {
  date: string;
  tasks: number;
  reports: number;
}

interface PlatformData {
  name: string;
  tasks: number;
  reports: number;
  total: number;
}

interface DashboardExportData {
  stats: DashboardStats;
  trends: TrendDataPoint[];
  platforms: PlatformData[];
  dateRange?: { from?: Date; to?: Date };
}

function getDateRangeSummary(dateRange?: { from?: Date; to?: Date }): string {
  if (!dateRange?.from && !dateRange?.to) return "All time";
  const parts: string[] = [];
  if (dateRange.from) parts.push(`From: ${format(dateRange.from, "MMM d, yyyy")}`);
  if (dateRange.to) parts.push(`To: ${format(dateRange.to, "MMM d, yyyy")}`);
  return parts.join(" | ");
}

export function exportDashboardToCSV(data: DashboardExportData) {
  const { stats, trends, platforms, dateRange } = data;

  const csvSections: string[] = [
    "Dashboard Report",
    `Generated: ${new Date().toLocaleString()}`,
    `Date Range: ${getDateRangeSummary(dateRange)}`,
    "",
    "=== Summary Statistics ===",
    "Metric,Value",
    `Active Tasks,${stats.activeTasks}`,
    `Completed Tasks,${stats.completedTasks}`,
    `Pending Reviews,${stats.pendingReviews}`,
    `Team Members,${stats.teamMembers}`,
    "",
    "=== Activity Trends ===",
    "Date,Tasks,Reports,Total",
    ...trends.map((t) => `"${t.date}",${t.tasks},${t.reports},${t.tasks + t.reports}`),
    "",
    "=== Platform Distribution ===",
    "Platform,Tasks,Reports,Total",
    ...platforms.map((p) => `"${p.name}",${p.tasks},${p.reports},${p.total}`),
  ];

  const csvContent = csvSections.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Dashboard exported to CSV");
}

export function exportDashboardToPDF(data: DashboardExportData) {
  const { stats, trends, platforms, dateRange } = data;
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Dashboard Report", 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.text(`Date Range: ${getDateRangeSummary(dateRange)}`, 14, 38);

  // Summary Statistics Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Summary Statistics", 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [["Metric", "Value"]],
    body: [
      ["Active Tasks", stats.activeTasks.toString()],
      ["Completed Tasks", stats.completedTasks.toString()],
      ["Pending Reviews", stats.pendingReviews.toString()],
      ["Team Members", stats.teamMembers.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Platform Distribution Section
  const platformStartY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text("Platform Distribution", 14, platformStartY);

  if (platforms.length > 0) {
    autoTable(doc, {
      startY: platformStartY + 4,
      head: [["Platform", "Tasks", "Reports", "Total"]],
      body: platforms.map((p) => [p.name, p.tasks.toString(), p.reports.toString(), p.total.toString()]),
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("No platform data available", 14, platformStartY + 8);
  }

  // Activity Trends Section (on new page if needed)
  const trendsStartY = platforms.length > 0 ? (doc as any).lastAutoTable.finalY + 12 : platformStartY + 16;
  
  if (trendsStartY > 250) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Activity Trends", 14, 22);
    
    if (trends.length > 0) {
      autoTable(doc, {
        startY: 26,
        head: [["Date", "Tasks", "Reports", "Total"]],
        body: trends.map((t) => [t.date, t.tasks.toString(), t.reports.toString(), (t.tasks + t.reports).toString()]),
        theme: "striped",
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 14, right: 14 },
      });
    }
  } else {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Activity Trends", 14, trendsStartY);

    if (trends.length > 0) {
      autoTable(doc, {
        startY: trendsStartY + 4,
        head: [["Date", "Tasks", "Reports", "Total"]],
        body: trends.map((t) => [t.date, t.tasks.toString(), t.reports.toString(), (t.tasks + t.reports).toString()]),
        theme: "striped",
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 14, right: 14 },
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("No trend data available", 14, trendsStartY + 8);
    }
  }

  doc.save(`dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success("Dashboard exported to PDF");
}
