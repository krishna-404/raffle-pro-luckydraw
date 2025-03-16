'use client';

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { QrCode } from './actions';

// Constants for PDF generation - using mm for better precision with jsPDF
const QR_CODE_SIZE_MM = 25; // 2.5cm = 25mm
const PAPER_SIZE_MM = 30; // 3cm = 30mm
const MARGIN_MM = (PAPER_SIZE_MM - QR_CODE_SIZE_MM) / 2; // Margin on each side

/**
 * Generates a PDF with QR codes
 * 
 * Potential issues and fixes:
 * 1. jsPDF initialization - Using standard A4 format first, then custom page size
 * 2. QR code data URL generation - Ensuring proper error handling and validation
 * 3. PDF image insertion - Verifying correct positioning and dimensions
 */
export async function generateQrCodePdf(qrCodes: QrCode[], baseUrl: string): Promise<Blob> {
  if (!qrCodes || qrCodes.length === 0) {
    throw new Error('No QR codes provided for PDF generation');
  }

  try {
    // ISSUE #1 FIX: Create a standard A4 PDF first, then set custom page size
    // This is more reliable across different PDF.js implementations
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Remove the first page and add our custom sized page
    doc.deletePage(1);
    doc.addPage([PAPER_SIZE_MM, PAPER_SIZE_MM]);
    
    let successCount = 0;
    let currentPage = 0;
    
    // Process each QR code
    for (let i = 0; i < qrCodes.length; i++) {
      const qrCode = qrCodes[i];
      
      if (!qrCode) {
        continue;
      }
      
      if (!qrCode.id) {
        continue;
      }
      
      try {
        // For all QR codes after the first one, add a new page
        if (i > 0) {
          doc.addPage([PAPER_SIZE_MM, PAPER_SIZE_MM]);
          currentPage++;
        }
        
        // Generate QR code URL using the id field
        const qrCodeUrl = `${baseUrl}/giveaway/qr-code?code=${qrCode.id}`;
        
        // ISSUE #2 FIX: Use more reliable QR code generation options
        // and validate the data URL before adding to PDF
        const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
          errorCorrectionLevel: 'H', // High error correction
          type: 'image/png',
          width: 300, // Reduced size for better compatibility
          margin: 0,
          color: {
            dark: '#000000', // Black dots
            light: '#FFFFFF'  // White background
          }
        });
        
        // Validate the data URL
        if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
          throw new Error('Invalid QR code data URL generated');
        }
        
        try {
          // Add QR code to PDF with explicit dimensions
          doc.addImage({
            imageData: dataUrl,
            format: 'PNG',
            x: MARGIN_MM,
            y: MARGIN_MM,
            width: QR_CODE_SIZE_MM,
            height: QR_CODE_SIZE_MM
          });
        } catch (imageError) {
          // Fallback method for adding image
          doc.addImage(
            dataUrl,
            'PNG',
            MARGIN_MM,
            MARGIN_MM,
            QR_CODE_SIZE_MM,
            QR_CODE_SIZE_MM
          );
        }
        
        // Add a border around the QR code
        doc.setDrawColor(200, 200, 200); // Light gray
        doc.setLineWidth(0.1);
        doc.rect(
          MARGIN_MM,
          MARGIN_MM,
          QR_CODE_SIZE_MM,
          QR_CODE_SIZE_MM
        );
        
        successCount++;
      } catch (error) {
        // If there's an error, add an error message to the page
        doc.setFontSize(8);
        doc.setTextColor(255, 0, 0); // Red
        doc.text(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          PAPER_SIZE_MM / 2,
          PAPER_SIZE_MM / 2,
          { align: 'center' }
        );
      }
    }
    
    // If no QR codes were successfully generated, add an error message to the first page
    if (successCount === 0) {
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'No QR codes could be generated', 
        PAPER_SIZE_MM / 2,
        PAPER_SIZE_MM / 2,
        { align: 'center' }
      );
    }
    
    // Return the PDF as a blob
    return doc.output('blob');
  } catch (error) {
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 