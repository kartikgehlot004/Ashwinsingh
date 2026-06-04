/**
 * pdfHelper.ts
 * Utility to generate, view, and download PDFs dynamically or via base64 / external links in client-side React.
 */

/**
 * Converts a Base64 string into a raw PDF Blob.
 * Handles both plain Base64 and complete Data URLs.
 */
export function base64ToBlob(base64: string, contentType = 'application/pdf'): Blob {
  const cleanBase64 = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
  const sliceSize = 512;
  const byteCharacters = atob(cleanBase64.trim());
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

/**
 * Generates an elegant academic-style PDF dynamically in the browser.
 */
export function generateAcademicPdf(title: string, category: string, bodyText: string): Blob {
  const cleanTitle = title.replace(/[()]/g, '\\$&');
  const cleanCategory = category.replace(/[()]/g, '\\$&');
  
  // Format body text paragraphs for PDF literal streams
  const cleanBody = bodyText ? bodyText.substring(0, 1000).replace(/[()]/g, '\\$&') : "No clinical specifications attached.";
  
  // Slice text into manageable line widths for the PDF layout
  const sliceToLines = (text: string, maxChars = 75): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach(word => {
      if ((currentLine + " " + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? " " : "") + word;
      }
    });
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    return lines;
  };

  const bodyLines = sliceToLines(cleanBody);

  // Compile layout BT text lines
  let streamText = `BT\n/F1 16 Tf\n50 780 Td\n(DR. ASHWIN SINGH CHOUHAN - ACADEMIC PORTAL) Tj\n`;
  streamText += `/F1 11 Tf\n0 -30 Td\n(CLASSIFICATION: ${cleanCategory.toUpperCase()}) Tj\n`;
  streamText += `0 -25 Td\n(DOCUMENT IDENTIFIER: SHA-PHARMA-${Date.now().toString().slice(-6)}) Tj\n`;
  streamText += `0 -20 Td\n(DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}) Tj\n`;
  streamText += `0 -15 Td\n(------------------------------------------------------------------------------------------) Tj\n`;
  
  // Add title (multiline if needed)
  streamText += `\n/F2 13 Tf\n0 -30 Td\n(TITLE OF DOCUMENT:) Tj\n/F1 11 Tf\n`;
  const titleLines = sliceToLines(cleanTitle, 75);
  titleLines.forEach(line => {
    streamText += `0 -15 Td\n(${line}) Tj\n`;
  });

  streamText += `\n/F2 13 Tf\n0 -35 Td\n(CLINICAL STUDY ABSTRACT & OVERVIEW:) Tj\n/F1 10 Tf\n`;
  
  // Write body lines with simple PDF line breaks
  bodyLines.slice(0, 25).forEach(line => {
    streamText += `0 -15 Td\n(${line}) Tj\n`;
  });

  streamText += `\n/F1 9 Tf\n0 -40 Td\n(------------------------------------------------------------------------------------------) Tj\n`;
  streamText += `0 -20 Td\n(This document is a certified copy of the peer-reviewed clinical research file and lecture syllabus) Tj\n`;
  streamText += `0 -12 Td\n(archived in Dr. Ashwin Singh Chouhan's digital pharmacology and molecular nanotech suite.) Tj\n`;
  streamText += `ET`;

  const streamBytes = new TextEncoder().encode(streamText);
  const streamLength = streamBytes.length;

  const pdfHeader = `%PDF-1.4\n`;
  const pdfObjects = 
`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
`3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>\nendobj\n` +
`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n` +
`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n` +
`5 0 obj\n<< /Length ${streamLength} >>\nstream\n`;

  const pdfFooter = `\nendstream\nendobj\nxref\n0 7\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000121 00000 n \n0000000244 00000 n \n0000000373 00000 n \n0000000318 00000 n \ntrailer\n<< /Root 1 0 R /Size 7 >>\n%%EOF`;

  const headerBytes = new TextEncoder().encode(pdfHeader + pdfObjects);
  const footerBytes = new TextEncoder().encode(pdfFooter);

  const finalPdfBytes = new Uint8Array(headerBytes.length + streamBytes.length + footerBytes.length);
  finalPdfBytes.set(headerBytes, 0);
  finalPdfBytes.set(streamBytes, headerBytes.length);
  finalPdfBytes.set(footerBytes, headerBytes.length + streamBytes.length);

  return new Blob([finalPdfBytes], { type: 'application/pdf' });
}

/**
 * Triggers safe view in browser of the PDF.
 * If external link, opens standard window tab. If Base64 or None, generates valid Blob URL.
 */
export function viewPdf(title: string, category: string, bodyText: string, pdfUrl?: string): void {
  try {
    if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://') || pdfUrl.includes('drive.google.com') || pdfUrl.includes('dropbox.com'))) {
      // Valid external link
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } else if (pdfUrl && pdfUrl.startsWith('data:')) {
      // Extract specific content type if available, e.g. data:application/pdf;base64,...
      const match = pdfUrl.match(/^data:([^;]+);base64,/);
      const mimeType = match ? match[1] : 'application/pdf';
      const blob = base64ToBlob(pdfUrl, mimeType);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      // Dynamic fallback compilation
      const blob = generateAcademicPdf(title, category, bodyText);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }
  } catch (err) {
    console.error("PDF preview compilation failed: ", err);
    alert("Unable to open PDF. Attempting standard text preview.");
  }
}

/**
 * Triggers browser downloader for the PDF file.
 */
export function downloadPdf(title: string, category: string, bodyText: string, pdfUrl?: string, defaultFilename = 'study'): void {
  try {
    let downloadHref = '';
    let shouldRevoke = false;

    if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://') || pdfUrl.includes('drive.google.com') || pdfUrl.includes('dropbox.com'))) {
      // External links: direct download if target URL supports CORS, otherwise open in browser window
      downloadHref = pdfUrl;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      return;
    } else if (pdfUrl && pdfUrl.startsWith('data:')) {
      // Base64 direct URL - Convert to blob for cross-platform download anchor
      const match = pdfUrl.match(/^data:([^;]+);base64,/);
      const mimeType = match ? match[1] : 'application/pdf';
      const blob = base64ToBlob(pdfUrl, mimeType);
      downloadHref = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else {
      // Dynamic generation
      const blob = generateAcademicPdf(title, category, bodyText);
      downloadHref = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    const filename = `${defaultFilename.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_ashwin_pharma.pdf`;
    const link = document.createElement('a');
    link.href = downloadHref;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadHref), 100);
    }
  } catch (err) {
    console.error("PDF download trigger failed: ", err);
    alert("Unable to download PDF. Try clicking View PDF to view in browser.");
  }
}
