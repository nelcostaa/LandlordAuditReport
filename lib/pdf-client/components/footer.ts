// Page Footer Component
import jsPDF from 'jspdf';
import { LAYOUT, COLORS, setFillColorHex, setTextColorHex } from '../styles';
import { drawTrafficLight } from './trafficLight';
import { BRAND_LOGO_BASE64 } from './logoBase64';

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

  // Right Side: Vertical Traffic Lights Strip
  const stripW = 10;
  const stripH = 18;
  const endX = pageWidth - 15 - stripW;
  
  // Background for the strip (dark grey border)
  setFillColorHex(doc, '#4a4a4a');
  doc.rect(endX, footerY + 2, stripW, stripH, 'F');

  // Lights
  const lightSize = 2.4;
  const cx = endX + stripW / 2;
  drawTrafficLight(doc, cx, footerY + 5.5, 'red', lightSize);
  drawTrafficLight(doc, cx, footerY + 5.5 + 5.5, 'orange', lightSize);
  drawTrafficLight(doc, cx, footerY + 5.5 + 11, 'green', lightSize);
}

