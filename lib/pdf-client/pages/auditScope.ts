// Audit Scope Page (Simplified - only scope description and bullet points, no tables)
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Generate Audit Scope Page (Simplified version per James feedback)
 * Contains ONLY: Title, description, and 3 bullet points
 * Removed: methodology text, totals box, assessment components table
 */
export async function auditScope(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Audit Scope', startX, yPos);
  yPos += 20;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  doc.text('This audit examined the following areas:', startX, yPos);
  yPos += 10;
  
  // Bullet points
  const bulletPoints = [
    {
      title: 'Documentation Systems:',
      text: 'Safety certificates, tenancy agreements, council licensing, financial records, maintenance logs, and tenant communications.',
    },
    {
      title: 'Communication Protocols:',
      text: 'Written record systems, complaint handling procedures, notice protocols, response time tracking, and tenant accessibility.',
    },
    {
      title: 'Evidence Collection:',
      text: 'Photographic evidence, inspection procedures, witness statements, timestamping protocols, and secure storage systems.',
    },
  ];
  
  bulletPoints.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${item.title}`, startX + 5, yPos);
    
    doc.setFont('helvetica', 'normal');
    const itemText = doc.splitTextToSize(item.text, contentWidth - 20);
    doc.text(itemText, startX + 10, yPos + 5);
    yPos += itemText.length * 4 + 8;
  });
  
  addPageFooter(doc);
}

