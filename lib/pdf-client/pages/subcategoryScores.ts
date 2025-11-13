// Subcategory Scores Page with Horizontal Bar Charts
import jsPDF from 'jspdf';
import { ReportData, SubcategoryScore } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, hexToRgb } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Draw a horizontal bar chart for a subcategory
 */
function drawHorizontalBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  score: number,
  color: 'red' | 'orange' | 'green'
): number {
  const barHeight = 6;
  const maxBarWidth = width - 40; // Reserve space for score label
  const barWidth = (score / 10) * maxBarWidth;
  
  // Bar color (set directly with RGB)
  const barColor = COLORS[color];
  const [r, g, b] = hexToRgb(barColor);
  doc.setFillColor(r, g, b);
  doc.roundedRect(x, y, barWidth, barHeight, 1, 1, 'F');
  
  // Bar outline
  const [rGray, gGray, bGray] = hexToRgb(COLORS.lightGray);
  doc.setDrawColor(rGray, gGray, bGray);
  doc.setLineWidth(0.1);
  doc.roundedRect(x, y, maxBarWidth, barHeight, 1, 1, 'S');
  
  // Score label at the end of bar
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const [rBlack, gBlack, bBlack] = hexToRgb(COLORS.black);
  doc.setTextColor(rBlack, gBlack, bBlack);
  doc.text(score.toFixed(1), x + maxBarWidth + 3, y + 4.5);
  
  // Subcategory name on the left (already set text color above)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  return y + barHeight + 6; // Return next Y position
}

/**
 * Generate Subcategory Scores Page with Bar Charts
 */
export async function subcategoryScores(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Subcategory Scores', startX, yPos);
  yPos += 15;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const descText = 'Each score represents an average of all responses for the questions within that subcategory. The minimum score is 1, the maximum 10. Any that are red require your immediate attention (see Recommended Actions section below).';
  const wrapped = doc.splitTextToSize(descText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Main title for grouped charts
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.blue);
  doc.text('Landlord Legal Audit - Performance by Category', startX, yPos);
  yPos += 15;
  
  // Group subcategories by category
  const categories = [
    { name: 'Documentation', subcats: data.subcategoryScores.filter(s => s.category === 'Documentation') },
    { name: 'Landlord-Tenant Communication', subcats: data.subcategoryScores.filter(s => s.category === 'Landlord-Tenant Communication') },
    { name: 'Evidence Gathering Systems and Procedures', subcats: data.subcategoryScores.filter(s => s.category === 'Evidence Gathering Systems and Procedures') },
  ];
  
  categories.forEach((category, catIdx) => {
    if (category.subcats.length === 0) return;
    
    // Category header
    yPos = addNewPageIfNeeded(doc, yPos, 15 + (category.subcats.length * 12));
    
    doc.setFontSize(FONTS.h3.size);
    doc.setFont('helvetica', FONTS.h3.style);
    setTextColorHex(doc, COLORS.darkGray);
    doc.text(category.name, startX, yPos);
    yPos += 10;
    
    // Draw bars for each subcategory
    category.subcats.forEach((subcat, idx) => {
      // Subcategory name
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      const subcatName = subcat.name.length > 50 ? subcat.name.substring(0, 47) + '...' : subcat.name;
      doc.text(subcatName, startX + 5, yPos);
      yPos += 5;
      
      // Bar chart
      yPos = drawHorizontalBar(
        startX + 5,
        yPos,
        contentWidth - 10,
        subcat.score,
        subcat.color,
        subcat.name
      );
    });
    
    yPos += 10; // Space between categories
  });
  
  addPageFooter(doc);
}

