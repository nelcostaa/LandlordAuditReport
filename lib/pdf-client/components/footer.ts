// Page Footer Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setFillColorHex, setTextColorHex } from '../styles';
import { BRAND_LOGO_BASE64, TRAFFIC_LIGHT_BASE64 } from './logoBase64';

/**
 * Add custom full-width olive page footer
 */
export function addPageFooter(doc: jsPDF): void {
  const { pageWidth, pageHeight } = LAYOUT;
  
  const footerHeight = 22;
  const footerY = pageHeight - footerHeight;

  // Draw full-width olive background
  setFillColorHex(doc, COLORS.footerOlive || '#6b7654');
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');

  // Left Side: Brand Logo (Actual PNG Image)
  const startX = 15;
  const logoHeight = 14; 
  // Dimensions 756x225 -> width is ~3.36 x height
  const logoWidth = logoHeight * (756 / 225); 
  doc.addImage(BRAND_LOGO_BASE64, 'PNG', startX, footerY + 4, logoWidth, logoHeight);

  // Right Side: Graphic Traffic Lights Strip Embed
  const stripW = 10;
  // Maintaining aspect ratio of a standard vertical block 
  // Let's use the aspect ratio roughly matching a standard 3-light stack
  const stripH = 18;
  const endX = pageWidth - 15 - stripW;
  
  doc.addImage(TRAFFIC_LIGHT_BASE64, 'PNG', endX, footerY + 2, stripW, stripH);
}

