import jsPDF from 'jspdf';

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportHistoryItemPdf(item) {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = 170;
  let y = 20;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(item.input_brief?.productName || 'Copy Iklan', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(120);
  doc.text(
    `${item.input_brief?.platform || ''} · ${item.input_brief?.tone || ''} · ${new Date(item.generated_at).toLocaleDateString('id-ID')}`,
    margin, y
  );
  y += 10;
  doc.setTextColor(0);

  (item.output_results || []).forEach((text, i) => {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Variasi ${i + 1}`, margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    y = addWrappedText(doc, text, margin, y, maxWidth, 5.5);
    y += 8;

    if (y > 270) { doc.addPage(); y = 20; }
  });

  const filename = `copy-iklan-${(item.input_brief?.productName || 'export').toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
}

export function exportAllHistoryPdf(items) {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = 170;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('History Copy Iklan — AdCopy', margin, y);
  y += 12;

  items.forEach((item, idx) => {
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`${idx + 1}. ${item.input_brief?.productName || 'Tanpa nama'}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(120);
    doc.text(
      `${item.input_brief?.platform || ''} · ${item.input_brief?.tone || ''} · ${new Date(item.generated_at).toLocaleDateString('id-ID')}`,
      margin, y
    );
    y += 8;
    doc.setTextColor(0);

    (item.output_results || []).forEach((text) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      y = addWrappedText(doc, `• ${text}`, margin, y, maxWidth, 5);
      y += 5;
    });

    y += 8;
  });

  doc.save('history-copy-iklan-adcopy.pdf');
}