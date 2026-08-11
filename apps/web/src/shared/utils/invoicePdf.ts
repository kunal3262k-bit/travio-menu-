/**
 * Server-side invoice PDF builder (pdfkit). Pure — takes authoritative DB
 * rows and returns a PDF Buffer. Never trusts browser-rendered totals.
 *
 * NOTE: pdfkit's standard fonts are Latin-1, so the Indian Rupee symbol is
 * rendered as "Rs." to avoid a font-embedding dependency.
 */
import PDFDocument from "pdfkit";

export type InvoicePdfOrder = {
  id: string;
  invoiceNumber: number | null;
  orderNumber: number;
  dailyOrderNumber: number;
  sessionType: string;
  tableId: string | null;
  table?: { number: number } | null;
  carOrderType?: string | null;
  carBrand?: string | null;
  carColor?: string | null;
  carLicensePlate?: string | null;
  customerName?: string | null;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  subtotalPaise: number;
  taxPaise: number;
  totalPaise: number;
  createdAt: Date;
  items: Array<{
    id: string;
    nameSnapshot: string;
    pricePaise: number;
    quantity: number;
    instructions?: string | null;
  }>;
};

export type InvoicePdfRestaurant = {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
};

const CURRENCY = "Rs.";

function money(paise: number): string {
  return `${CURRENCY} ${(paise / 100).toFixed(2)}`;
}

function formatDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Builds the invoice PDF buffer from authoritative order + restaurant rows.
 * When the restaurant has a configured logo URL it is fetched and embedded
 * (best-effort — a missing/unreachable logo is skipped, never fatal).
 */
export async function buildInvoicePdf(input: {
  order: InvoicePdfOrder;
  restaurant: InvoicePdfRestaurant;
}): Promise<Buffer> {
  const { order, restaurant } = input;
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  // Branding header.
  try {
    if (restaurant.logoUrl) {
      const res = await fetch(restaurant.logoUrl, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const logo = Buffer.from(await res.arrayBuffer());
        try {
          doc.image(logo, 48, 40, { width: 60 });
        } catch {
          // Unsupported image format — skip gracefully.
        }
      }
    }
  } catch {
    // Logo unreachable — invoice still renders.
  }

  doc.font("Helvetica-Bold").fontSize(18).fillColor("#111111").text("SwiftTab", 48, 40, { align: "right" });
  doc.font("Helvetica").fontSize(10).fillColor("#555555")
    .text(restaurant.name, { align: "right" });
  if (restaurant.address) doc.text(restaurant.address, { align: "right" });
  if (restaurant.phone) doc.text(`Phone: ${restaurant.phone}`, { align: "right" });
  if (restaurant.gstNumber) doc.text(`GSTIN: ${restaurant.gstNumber}`, { align: "right" });

  doc.moveDown(1.2);
  doc.moveTo(48, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor("#dddddd").stroke();

  // Invoice meta block.
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text(`INVOICE #${order.invoiceNumber ?? order.orderNumber}`);
  doc.font("Helvetica").fontSize(10).fillColor("#444444");
  doc.text(`Invoice date: ${formatDate(order.createdAt)}`);
  doc.text(`Order #${order.dailyOrderNumber ?? order.orderNumber} (system #${order.orderNumber})`);

  const identity =
    order.sessionType === "CAR"
      ? `${order.carOrderType === "TAKEAWAY" ? "Takeaway" : "Eat in Car"}${order.carColor ? ` · ${order.carColor}` : ""}${order.carBrand ? ` ${order.carBrand}` : ""}${order.carLicensePlate ? ` · ${order.carLicensePlate}` : ""}`
      : order.table
      ? `Table ${order.table.number}`
      : "Table order";
  doc.text(`Order type: ${identity}`);
  if (order.customerName) doc.text(`Customer: ${order.customerName}`);

  doc.moveDown(1);
  doc.moveTo(48, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor("#dddddd").stroke();
  doc.moveDown(0.5);

  // Items table.
  const startY = doc.y;
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111");
  const col = { item: 60, qty: 350, unit: 430, line: 505 };
  doc.text("Item", col.item, startY);
  doc.text("Qty", col.qty, startY, { width: 40, align: "right" });
  doc.text("Unit Price", col.unit, startY, { width: 70, align: "right" });
  doc.text("Amount", col.line, startY, { width: 70, align: "right" });
  doc.moveDown(0.6);
  const headerY = doc.y;
  doc.moveTo(48, headerY).lineTo(545, headerY).lineWidth(0.8).strokeColor("#cccccc").stroke();

  doc.font("Helvetica").fontSize(10).fillColor("#333333");
  for (const item of order.items) {
    const rowY = doc.y;
    doc.text(item.nameSnapshot, col.item, rowY, { width: 280 });
    doc.text(String(item.quantity), col.qty, rowY, { width: 40, align: "right" });
    doc.text(money(item.pricePaise), col.unit, rowY, { width: 70, align: "right" });
    doc.text(money(item.pricePaise * item.quantity), col.line, rowY, { width: 70, align: "right" });
    if (item.instructions) {
      doc.font("Helvetica-Oblique").fontSize(8).fillColor("#777777")
        .text(`Note: ${item.instructions}`, col.item, doc.y + 2);
      doc.font("Helvetica").fontSize(10).fillColor("#333333");
    }
    doc.moveDown(0.7);
  }

  doc.moveDown(1);
  doc.font("Helvetica").fontSize(10).fillColor("#333333");
  doc.text("Subtotal", col.unit, doc.y, { width: 70, align: "right" });
  doc.text(money(order.subtotalPaise), col.line, doc.y - 12, { width: 70, align: "right" });
  doc.moveDown(0.4);
  if (order.taxPaise > 0) {
    doc.text("GST", col.unit, doc.y, { width: 70, align: "right" });
    doc.text(money(order.taxPaise), col.line, doc.y - 12, { width: 70, align: "right" });
    doc.moveDown(0.4);
  }
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111");
  doc.text("Grand Total", col.unit, doc.y, { width: 70, align: "right" });
  doc.text(money(order.totalPaise), col.line, doc.y - 14, { width: 70, align: "right" });
  doc.moveDown(0.4);

  doc.font("Helvetica").fontSize(9).fillColor("#555555");
  doc.text(`Payment method: ${order.paymentMethod ?? "—"}`, 48, doc.y);
  doc.text(`Payment status: ${order.paymentStatus}`, 48, doc.y);
  doc.text(`Order status: ${order.status}`, 48, doc.y);

  // Thank-you footer.
  doc.moveDown(2.5);
  doc.moveTo(48, doc.y).lineTo(545, doc.y).lineWidth(0.8).strokeColor("#cccccc").stroke();
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111").text("Thank you for dining with us!", { align: "center" });
  doc.font("Helvetica").fontSize(9).fillColor("#777777").text("SwiftTab · QR ordering, realtime kitchen & seamless billing", { align: "center" });

  doc.end();
  return done;
}
