"use client";

import { useEffect } from "react";

export interface ThermalReceiptProps {
  restaurant: {
    name: string;
    gstNumber?: string | null;
    address?: string | null;
    phone?: string | null;
  };
  order: {
    id?: string;
    orderNumber: number | string;
    dailyOrderNumber?: number | string | null;
    invoiceNumber?: number | string | null;
    printCount?: number;
    lastPrintedAt?: Date | string | null;
    isReprint?: boolean;
    sessionType?: string;
    tableNumber?: number | string | null;
    carBrand?: string | null;
    carColor?: string | null;
    carLicensePlate?: string | null;
    customerName?: string | null;
    createdAt?: Date | string;
    paymentMethod?: string;
    paymentStatus?: string;
    subtotalPaise?: number;
    taxPaise?: number;
    totalPaise: number;
    items: Array<{
      id?: string;
      nameSnapshot?: string;
      name?: string;
      quantity: number;
      pricePaise: number;
    }>;
  };
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function ThermalReceiptPrint({ restaurant, order, onClose, autoPrint = true }: ThermalReceiptProps) {
  useEffect(() => {
    if (autoPrint) {
      const handleAfterPrint = () => {
        if (onClose) onClose();
      };
      window.addEventListener("afterprint", handleAfterPrint);
      const timer = setTimeout(() => {
        window.print();
      }, 150);

      return () => {
        window.removeEventListener("afterprint", handleAfterPrint);
        clearTimeout(timer);
      };
    }
  }, [autoPrint, onClose]);

  const items = order.items || [];
  const subtotalPaise = order.subtotalPaise ?? Math.round(order.totalPaise / 1.05);
  const totalTaxPaise = order.taxPaise ?? (order.totalPaise - subtotalPaise);
  
  // Tax breakdown: Split 5% GST into CGST (2.5%) and SGST (2.5%)
  const cgstPaise = Math.floor(totalTaxPaise / 2);
  const sgstPaise = totalTaxPaise - cgstPaise;

  const isDuplicate = order.isReprint || (order.printCount !== undefined && order.printCount > 1) || order.paymentStatus === "PAID";
  const invNo = order.invoiceNumber ? `INV-${order.invoiceNumber}` : null;

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

  const locationLabel = order.sessionType === "CAR"
    ? `🚗 ${order.carColor || ""} ${order.carBrand || ""} (${order.carLicensePlate || "Drive-In"})`
    : (order.tableNumber ? `Table ${order.tableNumber}` : "Dine-In");

  return (
    <>
      {/* Screen Modal Preview */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-lg text-slate-900">🖨️ Thermal Bill Preview</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-lg">✕</button>
          </div>

          <div className="border border-dashed border-gray-400 p-4 font-mono text-xs text-black bg-white rounded shadow-inner space-y-3 max-h-[60vh] overflow-y-auto">
            {/* DUPLICATE REPRINT BANNER */}
            {isDuplicate && (
              <div className="bg-red-100 border border-red-400 text-red-900 font-extrabold text-center py-1.5 px-2 rounded text-[11px] space-y-0.5">
                <p>*** DUPLICATE COPY / REPRINT ***</p>
                {order.printCount && order.printCount > 1 && (
                  <p className="text-[9px] font-normal">Print Count: #{order.printCount}</p>
                )}
              </div>
            )}

            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="font-black text-base uppercase text-slate-900">{restaurant.name}</h2>
              {restaurant.address && <p className="text-[10px] text-gray-600">{restaurant.address}</p>}
              {restaurant.phone && <p className="text-[10px] text-gray-600">Ph: {restaurant.phone}</p>}
              {restaurant.gstNumber ? (
                <p className="font-bold text-[11px] pt-1 text-slate-800">GSTIN: {restaurant.gstNumber}</p>
              ) : (
                <p className="text-[10px] text-gray-500 italic">GSTIN: Unregistered</p>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Meta */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>{invNo ? `GST Tax Inv #: ${invNo}` : "Status: Unpaid"}</span>
                <span>Order: #{order.dailyOrderNumber || order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span suppressHydrationWarning>Date: {formattedDate}</span>
              </div>
              <div className="flex justify-between font-bold pt-0.5">
                <span>{locationLabel}</span>
                {order.customerName && <span>Cust: {order.customerName}</span>}
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Itemized Table */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>AMT</span>
              </div>
              {items.length === 0 ? (
                <p className="text-gray-400 italic text-[10px] text-center py-1">No items listed</p>
              ) : (
                items.map((item, i) => {
                  const name = item.nameSnapshot || item.name || "Item";
                  const lineTotal = (item.pricePaise * item.quantity) / 100;
                  const unitPrice = item.pricePaise / 100;
                  return (
                    <div key={i} className="flex justify-between items-start pt-1">
                      <span className="max-w-[120px] truncate">{name}</span>
                      <span>{item.quantity} x {unitPrice.toFixed(0)}</span>
                      <span className="font-bold">₹{lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Tax & Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{(subtotalPaise / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (2.5%):</span>
                <span>₹{(cgstPaise / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (2.5%):</span>
                <span>₹{(sgstPaise / 100).toFixed(2)}</span>
              </div>
              <div className="border-b border-dashed border-gray-400 my-1"></div>
              <div className="flex justify-between text-sm font-black pt-1">
                <span>GRAND TOTAL:</span>
                <span>₹{(order.totalPaise / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Payment & Footer */}
            <div className="text-center space-y-1 text-[10px]">
              <p className="font-bold uppercase">
                Payment: {order.paymentMethod || "UNPAID"} ({order.paymentStatus || "PENDING"})
              </p>
              <p className="pt-2 font-bold uppercase">*** THANK YOU! VISIT AGAIN ***</p>
              <div className="flex items-center justify-center gap-1.5 pt-1.5 opacity-80">
                <img src="/logo-icon.png" alt="SwiftTab" className="h-3.5 object-contain" />
                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Powered by SwiftTab</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              🖨️ Print Thermal Bill
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Thermal Printer Area (Visible only in @media print) */}
      <div className="hidden print:block print-container font-mono text-[11px] text-black bg-white w-[80mm] max-w-[80mm] mx-auto p-2">
        {isDuplicate && (
          <div className="text-center font-bold border-b border-t border-black py-0.5 mb-1 text-[11px]">
            *** DUPLICATE COPY / REPRINT ***
          </div>
        )}
        <div className="text-center space-y-1">
          <img src="/logo-full.png" alt="SwiftTab" className="h-6 mx-auto mb-1 object-contain" />
          <h2 className="font-black text-sm uppercase">{restaurant.name}</h2>
          {restaurant.address && <p className="text-[10px]">{restaurant.address}</p>}
          {restaurant.phone && <p className="text-[10px]">Ph: {restaurant.phone}</p>}
          {restaurant.gstNumber ? (
            <p className="font-bold text-[11px]">GSTIN: {restaurant.gstNumber}</p>
          ) : (
            <p className="text-[10px]">GSTIN: Unregistered</p>
          )}
        </div>

        <p className="text-center my-1">--------------------------------</p>

        <div className="space-y-0.5 text-[11px]">
          <div className="flex justify-between font-bold">
            <span>{invNo ? `GST Inv #: ${invNo}` : "Status: Unpaid"}</span>
            <span>Order: #{order.dailyOrderNumber || order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span suppressHydrationWarning>Date: {formattedDate}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>{locationLabel}</span>
            {order.customerName && <span>Cust: {order.customerName}</span>}
          </div>
        </div>

        <p className="text-center my-1">--------------------------------</p>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between font-bold border-b border-black pb-0.5">
            <span>ITEM</span>
            <span>QTYxPRICE</span>
            <span>AMT</span>
          </div>
          {items.map((item, i) => {
            const name = item.nameSnapshot || item.name || "Item";
            const lineTotal = (item.pricePaise * item.quantity) / 100;
            const unitPrice = item.pricePaise / 100;
            return (
              <div key={i} className="flex justify-between items-start">
                <span className="max-w-[120px] truncate">{name}</span>
                <span>{item.quantity}x{unitPrice.toFixed(0)}</span>
                <span className="font-bold">₹{lineTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <p className="text-center my-1">--------------------------------</p>

        <div className="space-y-0.5 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{(subtotalPaise / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST (2.5%):</span>
            <span>₹{(cgstPaise / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (2.5%):</span>
            <span>₹{(sgstPaise / 100).toFixed(2)}</span>
          </div>
          <p className="text-center my-0.5">--------------------------------</p>
          <div className="flex justify-between text-xs font-black">
            <span>GRAND TOTAL:</span>
            <span>₹{(order.totalPaise / 100).toFixed(2)}</span>
          </div>
        </div>

        <p className="text-center my-1">--------------------------------</p>

        <div className="text-center space-y-1 text-[10px]">
          <p className="font-bold uppercase">
            PAYMENT: {order.paymentMethod || "UNPAID"} ({order.paymentStatus || "PENDING"})
          </p>
          <p className="pt-1 font-bold uppercase">*** THANK YOU! VISIT AGAIN ***</p>
          <p className="text-[9px] font-bold">Powered by SwiftTab POS</p>
        </div>
      </div>
    </>
  );
}
