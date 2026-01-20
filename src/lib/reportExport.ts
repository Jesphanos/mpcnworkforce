import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { format } from "date-fns";
import { WorkReport } from "@/hooks/useWorkReports";

interface ExportOptions {
  title?: string;
  includeCharts?: boolean;
  dateRange?: { from?: Date; to?: Date };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getDateRangeSummary(dateRange?: { from?: Date; to?: Date }): string {
  if (!dateRange?.from && !dateRange?.to) return "All time";
  const parts: string[] = [];
  if (dateRange.from) parts.push(`From: ${format(dateRange.from, "MMM d, yyyy")}`);
  if (dateRange.to) parts.push(`To: ${format(dateRange.to, "MMM d, yyyy")}`);
  return parts.join(" | ");
}

export function exportReportsToCSV(reports: WorkReport[], options: ExportOptions = {}) {
  const { title = "Work Reports", dateRange } = options;
  
  const totalHours = reports.reduce((acc, r) => acc + Number(r.hours_worked), 0);
  const totalEarnings = reports.reduce((acc, r) => acc + Number(r.earnings), 0);
  
  const csvRows = [
    title,
    `Generated: ${format(new Date(), "PPpp")}`,
    `Date Range: ${getDateRangeSummary(dateRange)}`,
    `Total Reports: ${reports.length}`,
    `Total Hours: ${totalHours.toFixed(1)}`,
    `Total Earnings: ${formatCurrency(totalEarnings)}`,
    "",
    "Date,Platform,Description,Hours,Rate,Earnings,Status",
    ...reports.map(r => 
      `"${format(new Date(r.work_date), "MMM d, yyyy")}","${r.platform}","${(r.description || "").replace(/"/g, '""')}",${r.hours_worked},${formatCurrency(Number(r.current_rate))},${formatCurrency(Number(r.earnings))},"${r.status}"`
    ),
  ];
  
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `work-reports-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Reports exported to CSV");
}

export function exportReportsToPDF(reports: WorkReport[], options: ExportOptions = {}) {
  const { title = "Work Reports", dateRange } = options;
  const doc = new jsPDF();
  
  const totalHours = reports.reduce((acc, r) => acc + Number(r.hours_worked), 0);
  const totalEarnings = reports.reduce((acc, r) => acc + Number(r.earnings), 0);
  const approvedCount = reports.filter(r => r.status === "approved").length;
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 32);
  doc.text(`Date Range: ${getDateRangeSummary(dateRange)}`, 14, 38);
  
  // Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, 182, 24, 2, 2, "F");
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Reports: ${reports.length}`, 20, 54);
  doc.text(`Hours: ${totalHours.toFixed(1)}h`, 60, 54);
  doc.text(`Earnings: ${formatCurrency(totalEarnings)}`, 100, 54);
  doc.text(`Approved: ${approvedCount}`, 160, 54);
  
  // Reports Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Report Details", 14, 78);
  
  autoTable(doc, {
    startY: 82,
    head: [["Date", "Platform", "Hours", "Rate", "Earnings", "Status"]],
    body: reports.map(r => [
      format(new Date(r.work_date), "MMM d, yyyy"),
      r.platform,
      `${r.hours_worked}h`,
      formatCurrency(Number(r.current_rate)),
      formatCurrency(Number(r.earnings)),
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
    ]),
    theme: "striped",
    headStyles: { 
      fillColor: [59, 130, 246],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `MPCN Workforce - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }
  
  doc.save(`work-reports-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  toast.success("Reports exported to PDF");
}

export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName = "Data"
) {
  // Convert data to CSV format for Excel compatibility
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    ),
  ];
  
  const csvContent = csvRows.join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success(`${sheetName} exported successfully`);
}
