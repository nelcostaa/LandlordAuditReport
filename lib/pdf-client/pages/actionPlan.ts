// Action Plan Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex, formatScore } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

/**
 * Generate Action Plan Page
 */
export async function actionPlan(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Suggestions for Improvement', startX, yPos);
  yPos += 20;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const descText = 'This action plan provides a prioritized timeline for addressing findings identified in this audit. Actions are categorized by urgency and legal risk, with immediate actions requiring attention within 7 days to avoid legal exposure.';
  const wrapped = doc.splitTextToSize(descText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 20;
  
  // Categorize actions by priority/timeline (only 2 sections per James feedback)
  const immediateActions: string[] = [];
  const shortTermActions: string[] = [];
  
  // Critical findings (score 1-3) = Immediate (0-7 days)
  data.questionResponses.red.forEach(q => {
    immediateActions.push(`${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`);
  });
  
  // Orange findings (score 4-6) = Short-term (1-4 weeks)
  data.questionResponses.orange.forEach(q => {
    shortTermActions.push(`${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`);
  });
  
  // IMMEDIATE ACTIONS
  if (immediateActions.length > 0) {
    yPos = addNewPageIfNeeded(doc, yPos, 30);
    
    // Timeline header
    const headerY = yPos;
    setFillColorHex(doc, COLORS.paleBlue);
    doc.rect(startX, headerY, contentWidth, 12, 'F');
    
    setDrawColorHex(doc, COLORS.blue);
    doc.setLineWidth(0.5);
    doc.line(startX, headerY, startX + contentWidth, headerY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.red);
    doc.text('⚠ CRITICAL - IMMEDIATE ACTIONS (0-7 Days)', startX + 8, headerY + 8);
    yPos += 12;
    
    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.red);
    doc.text('Critical compliance issues exposing you to immediate fines or prosecution.', startX + 8, yPos + 5);
    yPos += 10;
    
    // Action items
    immediateActions.forEach((action, idx) => {
      const actionHeight = 15;
      yPos = addNewPageIfNeeded(doc, yPos, actionHeight);
      
      setDrawColorHex(doc, COLORS.lightGray);
      doc.setLineWidth(0.1);
      doc.line(startX, yPos, startX + contentWidth, yPos);
      
      // Priority badge
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.red);
      doc.text('CRITICAL', startX + 8, yPos + 8);
      
      // Action text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      const actionWrapped = doc.splitTextToSize(action, contentWidth - 80);
      doc.text(actionWrapped, startX + 80, yPos + 8);
      
      yPos += Math.max(actionHeight, actionWrapped.length * 4 + 6);
    });
    
    yPos += 15;
  }
  
  // SHORT-TERM ACTIONS
  if (shortTermActions.length > 0) {
    yPos = addNewPageIfNeeded(doc, yPos, 30);
    
    const headerY = yPos;
    setFillColorHex(doc, COLORS.paleBlue);
    doc.rect(startX, headerY, contentWidth, 12, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, COLORS.orange);
    doc.text('SHORT-TERM ACTIONS (1-4 Weeks)', startX + 8, headerY + 8);
    yPos += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Areas needing improvement to meet compliance standards.', startX + 8, yPos + 5);
    yPos += 10;
    
    shortTermActions.forEach((action, idx) => {
      const actionHeight = 15;
      yPos = addNewPageIfNeeded(doc, yPos, actionHeight);
      
      setDrawColorHex(doc, COLORS.lightGray);
      doc.setLineWidth(0.1);
      doc.line(startX, yPos, startX + contentWidth, yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setTextColorHex(doc, COLORS.orange);
      doc.text('HIGH', startX + 8, yPos + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColorHex(doc, COLORS.black);
      const actionWrapped = doc.splitTextToSize(action, contentWidth - 80);
      doc.text(actionWrapped, startX + 80, yPos + 8);
      
      yPos += Math.max(actionHeight, actionWrapped.length * 4 + 6);
    });
    
    yPos += 15;
  }
  
  // REMOVED PER JAMES FEEDBACK: MEDIUM-TERM ACTIONS section
  // James said: "don't split them" - keep only 2 sections (Critical + Short-term)
  // Previously had a 3rd section that was splitting orange scores
  
  addPageFooter(doc);
}

