const fs = require('fs');

async function testUpload() {
  const FormData = globalThis.FormData;
  const formData = new FormData();
  
  // Create a minimal valid PDF file
  const pdfBytes = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n' +
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
    '5 0 obj << /Length 44 >> stream\nBT /F1 24 Tf 100 700 Td (Test PDF Menu: 1. Pizza 200) Tj ET\nendstream\nendobj\n' +
    'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000223 00000 n \n0000000311 00000 n \n' +
    'trailer << /Size 6 /Root 1 0 R >>\n' +
    'startxref\n406\n%%EOF',
    'ascii'
  );
  
  formData.append('image', new Blob([pdfBytes], { type: 'application/pdf' }), 'menu.pdf');

  try {
    const res = await fetch('http://localhost:3000/api/menu/import', {
      method: 'POST',
      body: formData,
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch(e) {
    console.error(e);
  }
}

testUpload();
