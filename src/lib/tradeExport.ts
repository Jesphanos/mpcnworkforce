import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { format } from "date-fns";

interface Trade {
  id: string;
  instrument: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  pnl_amount: number | null;
  pnl_percentage: number | null;
  r_multiple: number | null;
  status: string;
  entry_time: string;
  exit_time: string | null;
  market: string;
  trade_rationale: string | null;
}

interface TradeJournalExportOptions {
  traderId?: string;
  dateRange?: { from?: Date; to?: Date };
  title?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercentage(value: number | null): string {
  if (value === null) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatRMultiple(value: number | null): string {
  if (value === null) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

export function exportTradeJournalToCSV(trades: Trade[], options: TradeJournalExportOptions = {}) {
  const { title = "Trade Journal", dateRange } = options;
  
  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl_amount || 0), 0);
  const winCount = trades.filter(t => (t.pnl_amount || 0) > 0).length;
  const lossCount = trades.filter(t => (t.pnl_amount || 0) < 0).length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
  
  const csvRows = [
    title,
    `Generated: ${format(new Date(), "PPpp")}`,
    `Period: ${dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Start"} - ${dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Now"}`,
    "",
    "=== Performance Summary ===",
    `Total Trades: ${trades.length}`,
    `Total P/L: ${formatCurrency(totalPnL)}`,
    `Win Rate: ${winRate.toFixed(1)}%`,
    `Wins: ${winCount} | Losses: ${lossCount}`,
    "",
    "=== Trade Details ===",
    "Date,Time,Instrument,Market,Direction,Entry,Exit,Size,P/L ($),P/L (%),R-Multiple,Status,Rationale",
    ...trades.map(t => [
      format(new Date(t.entry_time), "yyyy-MM-dd"),
      format(new Date(t.entry_time), "HH:mm"),
      t.instrument,
      t.market,
      t.direction.toUpperCase(),
      t.entry_price.toFixed(4),
      t.exit_price?.toFixed(4) || "-",
      t.position_size.toString(),
      t.pnl_amount ? formatCurrency(t.pnl_amount) : "-",
      formatPercentage(t.pnl_percentage),
      formatRMultiple(t.r_multiple),
      t.status,
      `"${(t.trade_rationale || "").replace(/"/g, '""')}"`,
    ].join(",")),
  ];
  
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `trade-journal-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Trade journal exported to CSV");
}

export function exportTradeJournalToPDF(trades: Trade[], options: TradeJournalExportOptions = {}) {
  const { title = "Trade Journal", dateRange } = options;
  const doc = new jsPDF({ orientation: "landscape" });
  
  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl_amount || 0), 0);
  const winCount = trades.filter(t => (t.pnl_amount || 0) > 0).length;
  const lossCount = trades.filter(t => (t.pnl_amount || 0) < 0).length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
  const avgR = trades.length > 0 
    ? trades.reduce((acc, t) => acc + (t.r_multiple || 0), 0) / trades.length 
    : 0;
  
  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 18);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 26);
  doc.text(
    `Period: ${dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Start"} - ${dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Now"}`,
    14,
    32
  );
  
  // Performance Summary Cards
  const cardY = 38;
  const cardWidth = 65;
  const cardHeight = 20;
  const cardSpacing = 5;
  
  // Card 1: Total P/L
  doc.setFillColor(totalPnL >= 0 ? 34 : 239, totalPnL >= 0 ? 197 : 68, totalPnL >= 0 ? 94 : 68);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.text("Total P/L", 18, cardY + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(totalPnL), 18, cardY + 15);
  
  // Card 2: Win Rate
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(14 + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Win Rate", 18 + cardWidth + cardSpacing, cardY + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${winRate.toFixed(1)}%`, 18 + cardWidth + cardSpacing, cardY + 15);
  
  // Card 3: Trades
  doc.setFillColor(168, 85, 247);
  doc.roundedRect(14 + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Trades (W/L)", 18 + (cardWidth + cardSpacing) * 2, cardY + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${trades.length} (${winCount}/${lossCount})`, 18 + (cardWidth + cardSpacing) * 2, cardY + 15);
  
  // Card 4: Avg R
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(14 + (cardWidth + cardSpacing) * 3, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Avg R-Multiple", 18 + (cardWidth + cardSpacing) * 3, cardY + 6);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatRMultiple(avgR), 18 + (cardWidth + cardSpacing) * 3, cardY + 15);
  
  // Trade Table
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Trade Log", 14, 68);
  
  autoTable(doc, {
    startY: 72,
    head: [["Date", "Instrument", "Market", "Dir", "Entry", "Exit", "Size", "P/L", "R", "Status"]],
    body: trades.map(t => [
      format(new Date(t.entry_time), "MMM d"),
      t.instrument,
      t.market,
      t.direction.toUpperCase(),
      t.entry_price.toFixed(4),
      t.exit_price?.toFixed(4) || "-",
      t.position_size.toString(),
      t.pnl_amount ? formatCurrency(t.pnl_amount) : "-",
      formatRMultiple(t.r_multiple),
      t.status,
    ]),
    theme: "striped",
    headStyles: { 
      fillColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Color P/L column
      if (data.column.index === 7 && data.section === "body") {
        const value = trades[data.row.index]?.pnl_amount || 0;
        data.cell.styles.textColor = value >= 0 ? [34, 197, 94] : [239, 68, 68];
        data.cell.styles.fontStyle = "bold";
      }
      // Color Direction column
      if (data.column.index === 3 && data.section === "body") {
        const direction = trades[data.row.index]?.direction;
        data.cell.styles.textColor = direction === "long" ? [34, 197, 94] : [239, 68, 68];
      }
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
      `MPCN Trading - Confidential | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" }
    );
  }
  
  doc.save(`trade-journal-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  toast.success("Trade journal exported to PDF");
}
