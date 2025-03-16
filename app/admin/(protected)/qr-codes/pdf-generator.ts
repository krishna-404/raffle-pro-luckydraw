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
  console.log('=== PDF GENERATION DEBUG LOG ===');
  console.log(`Input: ${qrCodes.length} QR codes, baseUrl: ${baseUrl}`);
  
  if (!qrCodes || qrCodes.length === 0) {
    console.error('ERROR: No QR codes provided for PDF generation');
    throw new Error('No QR codes provided for PDF generation');
  }

  // Log the first few QR codes for debugging
  console.log('First 3 QR codes sample:');
  qrCodes.slice(0, 3).forEach((qr, i) => {
    console.log(`QR #${i}: id=${qr.id?.substring(0, 8) || 'MISSING'}...`);
  });
  
  try {
    console.log('Creating PDF document...');
    
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
    
    console.log(`PDF created with page size: ${PAPER_SIZE_MM}mm x ${PAPER_SIZE_MM}mm`);
    console.log(`QR code size: ${QR_CODE_SIZE_MM}mm x ${QR_CODE_SIZE_MM}mm with margin: ${MARGIN_MM}mm`);
    
    let successCount = 0;
    let currentPage = 0;
    
    // Process each QR code
    for (let i = 0; i < qrCodes.length; i++) {
      const qrCode = qrCodes[i];
      
      console.log(`\nProcessing QR code ${i+1}/${qrCodes.length}...`);
      
      if (!qrCode) {
        console.error(`ERROR: QR code at index ${i} is undefined or null`);
        continue;
      }
      
      if (!qrCode.id) {
        console.error(`ERROR: QR code at index ${i} has no id value, skipping`);
        continue;
      }
      
      try {
        // For all QR codes after the first one, add a new page
        if (i > 0) {
          console.log(`Adding new page for QR code ${i+1}`);
          doc.addPage([PAPER_SIZE_MM, PAPER_SIZE_MM]);
          currentPage++;
        }
        
        // Generate QR code URL using the id field
        const qrCodeUrl = `${baseUrl}/giveaway/qr-code?code=${qrCode.id}`;
        console.log(`Generated URL for QR code: ${qrCodeUrl}`);
        
        console.log('Generating QR code data URL...');
        
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
        
        console.log(`QR code data URL generated, length: ${dataUrl.length} chars`);
        console.log(`Data URL starts with: ${dataUrl.substring(0, 30)}...`);
        
        // ISSUE #3 FIX: Use more reliable image insertion method
        // with explicit dimensions and positioning
        console.log(`Adding QR code image to PDF at position (${MARGIN_MM}, ${MARGIN_MM})`);
        
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
          
          console.log('Successfully added image to PDF');
        } catch (imageError) {
          console.error('Error adding image to PDF:', imageError);
          
          // Fallback method for adding image
          console.log('Trying fallback method for adding image...');
          doc.addImage(
            dataUrl,
            'PNG',
            MARGIN_MM,
            MARGIN_MM,
            QR_CODE_SIZE_MM,
            QR_CODE_SIZE_MM
          );
        }
        
        console.log('Adding border around QR code');
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
        console.log(`SUCCESS: Added QR code ${i+1}/${qrCodes.length} on page ${currentPage+1}`);
      } catch (error) {
        console.error(`ERROR processing QR code at index ${i}:`, error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // If there's an error, add an error message to the page
        console.log('Adding error message to page');
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
    
    console.log(`\nPDF generation summary: ${successCount} successful QR codes out of ${qrCodes.length} total`);
    
    // If no QR codes were successfully generated, add an error message to the first page
    if (successCount === 0) {
      console.error('ERROR: No QR codes were successfully generated');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'No QR codes could be generated', 
        PAPER_SIZE_MM / 2,
        PAPER_SIZE_MM / 2,
        { align: 'center' }
      );
    }
    
    console.log(`PDF has ${doc.getNumberOfPages()} total pages`);
    console.log('Generating PDF blob...');
    
    // Return the PDF as a blob
    const blob = doc.output('blob');
    console.log(`PDF blob generated, size: ${blob.size} bytes`);
    console.log('=== END PDF GENERATION DEBUG LOG ===');
    return blob;
  } catch (error) {
    console.error('CRITICAL ERROR in PDF generation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== END PDF GENERATION DEBUG LOG (WITH ERROR) ===');
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 