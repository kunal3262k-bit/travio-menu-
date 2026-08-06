"use client";

import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRPrintClient({
  restaurant,
  tables,
  baseUrl,
}: {
  restaurant: any;
  tables: any[];
  baseUrl: string;
}) {
  // Auto-trigger print as soon as the page mounts and renders
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ margin: 0, padding: "16px", background: "white" }}>
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { margin: 0; }
        }
      `}</style>

      <div style={{
        display: "grid",
        gridTemplateColumns: tables.length === 1 ? "1fr" : "repeat(3, 1fr)",
        gap: "16px",
        maxWidth: tables.length === 1 ? "320px" : "100%",
        margin: tables.length === 1 ? "40px auto" : "0",
      }}>
        {tables.map(table => {
          const tableUrl = `${baseUrl}/${restaurant.slug}/t/${table.number}`;
          return (
            <div
              key={table.id}
              style={{
                border: "2px solid black",
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: "white",
                pageBreakInside: "avoid",
                breakInside: "avoid",
                height: "380px",
              }}
            >
              <QRCodeSVG value={tableUrl} size={180} />
              <h3 style={{ fontWeight: 900, fontSize: "20px", marginTop: "16px", marginBottom: "4px" }}>
                {restaurant.name}
              </h3>
              <p style={{ fontWeight: 700, fontSize: "18px", color: "#333", margin: 0 }}>
                Table {table.number}
              </p>
              {table.label && (
                <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{table.label}</p>
              )}
              <p style={{ fontSize: "10px", color: "#aaa", marginTop: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Powered by SwiftTab
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
