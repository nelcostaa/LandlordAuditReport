// Comprehensive HTML Report Template for Puppeteer PDF generation
// Multi-page report with cover, category scores, detailed responses, recommendations

import { ReportData, QuestionResponseData, ServiceRecommendation } from '@/lib/pdf/formatters';
import { CategoryScore, RecommendedAction } from '@/lib/scoring';

interface ComprehensiveReportInput {
  reportData: ReportData;
  reportId: string;
  reportDate: string;
  recommendedActions: RecommendedAction[];
}

function getScoreColor(score: number): string {
  if (score >= 7.5) return '#10b981';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

function getScoreBg(score: number): string {
  if (score >= 7.5) return '#ecfdf5';
  if (score >= 4) return '#fffbeb';
  return '#fef2f2';
}

function getScoreBorder(score: number): string {
  if (score >= 7.5) return '#10b981';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

function getRiskLabel(score: number): string {
  if (score >= 7.5) return 'Low Risk';
  if (score >= 4) return 'Medium Risk';
  return 'High Risk';
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}

function getPriorityBg(priority: string): string {
  switch (priority) {
    case 'critical': return '#fef2f2';
    case 'high': return '#fff7ed';
    case 'medium': return '#fffbeb';
    case 'low': return '#ecfdf5';
    default: return '#f9fafb';
  }
}

function renderQuestionRow(q: QuestionResponseData, index: number): string {
  const scoreColor = getScoreColor(q.score);
  const scoreBg = getScoreBg(q.score);
  const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';

  // Extract reason text and action from score_examples based on score level
  const scoreLevel = q.score >= 7.5 ? 'high' : q.score >= 4 ? 'medium' : 'low';
  const matchingExample = q.score_examples?.find(e => e.score_level === scoreLevel);
  const reasonText = matchingExample?.reason_text || '';
  const reportAction = matchingExample?.report_action || '';

  let actionHtml = '';
  if (reportAction) {
    actionHtml = `<div style="font-size: 9pt; color: #6b7280; margin-top: 4px; font-style: italic;">Action: ${reportAction}</div>`;
  }

  let commentHtml = '';
  if (q.comment) {
    commentHtml = `<div style="font-size: 9pt; color: #4b5563; margin-top: 4px; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">Note: ${q.comment}</div>`;
  }

  return `
    <tr style="background: ${rowBg}; border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 12px; font-size: 10pt; color: #374151; vertical-align: top; width: 50%;">
        ${q.questionText}
        ${actionHtml}
        ${commentHtml}
      </td>
      <td style="padding: 10px 12px; font-size: 10pt; color: #374151; vertical-align: top; width: 20%;">
        ${q.answer}
      </td>
      <td style="padding: 10px 12px; text-align: center; vertical-align: top; width: 10%;">
        <span style="display: inline-block; background: ${scoreBg}; color: ${scoreColor}; font-weight: bold; padding: 2px 10px; border-radius: 12px; font-size: 10pt; border: 1px solid ${scoreColor};">
          ${q.score.toFixed(1)}
        </span>
      </td>
      <td style="padding: 10px 12px; font-size: 9pt; color: #6b7280; vertical-align: top; width: 20%;">
        ${reasonText}
      </td>
    </tr>
  `;
}

function renderCategoryScoreCard(name: string, catScore: CategoryScore): string {
  const scoreColor = getScoreColor(catScore.score);
  const scoreBg = getScoreBg(catScore.score);
  const riskLabel = getRiskLabel(catScore.score);
  
  return `
    <div style="flex: 1; background: white; border: 2px solid ${scoreColor}; border-radius: 8px; padding: 20px; text-align: center;">
      <div style="font-size: 11pt; font-weight: bold; color: #374151; margin-bottom: 12px;">${name}</div>
      <div style="font-size: 36pt; font-weight: bold; color: ${scoreColor};">${catScore.score.toFixed(1)}</div>
      <div style="font-size: 10pt; margin-top: 8px;">
        <span style="background: ${scoreBg}; color: ${scoreColor}; padding: 4px 12px; border-radius: 12px; font-weight: 600;">${riskLabel}</span>
      </div>
      <div style="font-size: 9pt; color: #9ca3af; margin-top: 8px;">${catScore.percentage}% compliance</div>
    </div>
  `;
}

function renderActionItem(action: RecommendedAction, index: number): string {
  const priorityColor = getPriorityColor(action.priority);
  const priorityBg = getPriorityBg(action.priority);
  
  return `
    <div style="background: ${priorityBg}; border-left: 4px solid ${priorityColor}; padding: 12px 16px; margin-bottom: 10px; border-radius: 0 6px 6px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10pt; font-weight: bold; color: ${priorityColor}; text-transform: uppercase;">${action.priority}</span>
        <span style="font-size: 9pt; color: #6b7280;">${action.timeframe}</span>
      </div>
      <div style="font-size: 10pt; font-weight: 600; color: #1f2937; margin-bottom: 4px;">${action.questionText}</div>
      <div style="font-size: 9pt; color: #4b5563;">${action.recommendation}</div>
    </div>
  `;
}

export function generateComprehensiveReportHTML(input: ComprehensiveReportInput): string {
  const { reportData, reportId, reportDate, recommendedActions } = input;
  const tierNumber = reportData.riskTier.split('_')[1];
  const overallColor = getScoreColor(reportData.overallScore);
  const overallRisk = getRiskLabel(reportData.overallScore);

  // Build question response tables
  const redQuestions = reportData.questionResponses.red || [];
  const orangeQuestions = reportData.questionResponses.orange || [];
  const greenQuestions = reportData.questionResponses.green || [];
  const allQuestions = [...redQuestions, ...orangeQuestions, ...greenQuestions];

  // Category scores
  const docScore = reportData.categoryScores.documentation;
  const commScore = reportData.categoryScores.communication;
  const evidScore = reportData.categoryScores.evidenceGathering;

  // Sorted actions by priority
  const criticalActions = recommendedActions.filter(a => a.priority === 'critical');
  const highActions = recommendedActions.filter(a => a.priority === 'high');
  const mediumActions = recommendedActions.filter(a => a.priority === 'medium');
  const lowActions = recommendedActions.filter(a => a.priority === 'low');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1f2937;
          background: white;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm 18mm;
          background: white;
          page-break-after: always;
        }

        .page:last-child { page-break-after: auto; }

        .header-bar {
          background: linear-gradient(135deg, #064e3b, #10b981);
          padding: 30px 35px;
          border-radius: 8px;
          margin-bottom: 25px;
          color: white;
        }

        .header-title {
          font-size: 28pt;
          font-weight: bold;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 13pt;
          opacity: 0.9;
          margin-top: 4px;
        }

        h2 {
          font-size: 16pt;
          color: #064e3b;
          border-bottom: 2px solid #10b981;
          padding-bottom: 8px;
          margin: 25px 0 15px 0;
        }

        h3 {
          font-size: 13pt;
          color: #374151;
          margin: 18px 0 10px 0;
        }

        .section-intro {
          font-size: 10pt;
          color: #6b7280;
          margin-bottom: 15px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10pt;
        }

        table th {
          background: #064e3b;
          color: white;
          padding: 10px 12px;
          text-align: left;
          font-size: 9pt;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer {
          text-align: center;
          font-size: 8pt;
          color: #9ca3af;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
        }

        @media print {
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
        }
      </style>
    </head>
    <body>

      <!-- ====================== PAGE 1: COVER + EXECUTIVE SUMMARY ====================== -->
      <div class="page">
        <div class="header-bar">
          <div class="header-title">LANDLORD RISK AUDIT</div>
          <div class="header-subtitle">Compliance Assessment Report</div>
        </div>

        <!-- Metadata Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px;">
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Report ID</div>
            <div style="font-size: 11pt; font-weight: bold;">${reportId}</div>
          </div>
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Report Date</div>
            <div style="font-size: 11pt; font-weight: bold;">${reportDate}</div>
          </div>
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Property Address</div>
            <div style="font-size: 11pt; font-weight: bold;">${reportData.propertyAddress}</div>
          </div>
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Landlord</div>
            <div style="font-size: 11pt; font-weight: bold;">${reportData.landlordName}</div>
          </div>
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Auditor</div>
            <div style="font-size: 11pt; font-weight: bold;">${reportData.auditorName || 'Landlord Audit Team'}</div>
          </div>
          <div style="background: #f9fafb; padding: 14px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #6b7280; margin-bottom: 2px;">Risk Audit Tier</div>
            <div style="font-size: 11pt; font-weight: bold;">Tier ${tierNumber}</div>
          </div>
        </div>

        <!-- Overall Score Hero -->
        <div style="background: ${getScoreBg(reportData.overallScore)}; border: 2px solid ${overallColor}; border-radius: 10px; padding: 30px; text-align: center; margin-bottom: 25px;">
          <div style="font-size: 13pt; font-weight: bold; color: #374151; margin-bottom: 10px;">Overall Compliance Score</div>
          <div style="font-size: 56pt; font-weight: bold; color: ${overallColor}; line-height: 1;">${reportData.overallScore.toFixed(1)}</div>
          <div style="font-size: 10pt; color: #6b7280; margin-top: 5px;">out of 10.0</div>
          <div style="margin-top: 12px;">
            <span style="background: ${overallColor}; color: white; padding: 6px 20px; border-radius: 20px; font-size: 11pt; font-weight: 600;">${overallRisk}</span>
          </div>
        </div>

        <!-- Category Scores -->
        <h2>Category Breakdown</h2>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          ${renderCategoryScoreCard('Documentation', docScore)}
          ${renderCategoryScoreCard('Communication', commScore)}
          ${renderCategoryScoreCard('Evidence Gathering', evidScore)}
        </div>

        <!-- Summary Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 20px;">
          <div style="text-align: center; background: #f9fafb; padding: 12px; border-radius: 6px;">
            <div style="font-size: 22pt; font-weight: bold; color: #374151;">${allQuestions.length}</div>
            <div style="font-size: 9pt; color: #6b7280;">Questions Assessed</div>
          </div>
          <div style="text-align: center; background: #fef2f2; padding: 12px; border-radius: 6px;">
            <div style="font-size: 22pt; font-weight: bold; color: #ef4444;">${redQuestions.length}</div>
            <div style="font-size: 9pt; color: #6b7280;">High Risk Areas</div>
          </div>
          <div style="text-align: center; background: #fffbeb; padding: 12px; border-radius: 6px;">
            <div style="font-size: 22pt; font-weight: bold; color: #f59e0b;">${orangeQuestions.length}</div>
            <div style="font-size: 9pt; color: #6b7280;">Medium Risk Areas</div>
          </div>
          <div style="text-align: center; background: #ecfdf5; padding: 12px; border-radius: 6px;">
            <div style="font-size: 22pt; font-weight: bold; color: #10b981;">${greenQuestions.length}</div>
            <div style="font-size: 9pt; color: #6b7280;">Compliant Areas</div>
          </div>
        </div>

        <div class="footer">
          ${reportId} | ${reportData.propertyAddress} | Page 1 | Confidential
        </div>
      </div>

      <!-- ====================== PAGE 2+: RECOMMENDED ACTIONS ====================== -->
      ${recommendedActions.length > 0 ? `
      <div class="page">
        <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; color: white;">
          <div style="font-size: 16pt; font-weight: bold;">Recommended Actions</div>
          <div style="font-size: 10pt; opacity: 0.9;">${recommendedActions.length} items requiring attention</div>
        </div>

        ${criticalActions.length > 0 ? `
          <h3 style="color: #ef4444;">Critical - Immediate Action Required (${criticalActions.length})</h3>
          ${criticalActions.map((a, i) => renderActionItem(a, i)).join('')}
        ` : ''}

        ${highActions.length > 0 ? `
          <h3 style="color: #f97316;">High Priority - Within 30 Days (${highActions.length})</h3>
          ${highActions.map((a, i) => renderActionItem(a, i)).join('')}
        ` : ''}

        ${mediumActions.length > 0 ? `
          <h3 style="color: #f59e0b;">Medium Priority - Within 90 Days (${mediumActions.length})</h3>
          ${mediumActions.map((a, i) => renderActionItem(a, i)).join('')}
        ` : ''}

        ${lowActions.length > 0 ? `
          <h3 style="color: #10b981;">Low Priority - Ongoing Improvement (${lowActions.length})</h3>
          ${lowActions.map((a, i) => renderActionItem(a, i)).join('')}
        ` : ''}

        <div class="footer">
          ${reportId} | ${reportData.propertyAddress} | Recommended Actions | Confidential
        </div>
      </div>
      ` : ''}

      <!-- ====================== PAGE 3+: HIGH RISK RESPONSES ====================== -->
      ${redQuestions.length > 0 ? `
      <div class="page">
        <div style="background: linear-gradient(135deg, #991b1b, #ef4444); padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; color: white;">
          <div style="font-size: 16pt; font-weight: bold;">High Risk Areas</div>
          <div style="font-size: 10pt; opacity: 0.9;">${redQuestions.length} areas scoring below 4.0 - require immediate attention</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="background: #991b1b;">Question</th>
              <th style="background: #991b1b;">Response</th>
              <th style="background: #991b1b; text-align: center;">Score</th>
              <th style="background: #991b1b;">Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${redQuestions.map((q, i) => renderQuestionRow(q, i)).join('')}
          </tbody>
        </table>

        <div class="footer">
          ${reportId} | ${reportData.propertyAddress} | High Risk Areas | Confidential
        </div>
      </div>
      ` : ''}

      <!-- ====================== PAGE 4+: MEDIUM RISK RESPONSES ====================== -->
      ${orangeQuestions.length > 0 ? `
      <div class="page">
        <div style="background: linear-gradient(135deg, #92400e, #f59e0b); padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; color: white;">
          <div style="font-size: 16pt; font-weight: bold;">Medium Risk Areas</div>
          <div style="font-size: 10pt; opacity: 0.9;">${orangeQuestions.length} areas scoring 4.0-7.4 - improvement recommended</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="background: #92400e;">Question</th>
              <th style="background: #92400e;">Response</th>
              <th style="background: #92400e; text-align: center;">Score</th>
              <th style="background: #92400e;">Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${orangeQuestions.map((q, i) => renderQuestionRow(q, i)).join('')}
          </tbody>
        </table>

        <div class="footer">
          ${reportId} | ${reportData.propertyAddress} | Medium Risk Areas | Confidential
        </div>
      </div>
      ` : ''}

      <!-- ====================== PAGE 5+: COMPLIANT AREAS ====================== -->
      ${greenQuestions.length > 0 ? `
      <div class="page">
        <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; color: white;">
          <div style="font-size: 16pt; font-weight: bold;">Compliant Areas</div>
          <div style="font-size: 10pt; opacity: 0.9;">${greenQuestions.length} areas scoring 7.5+ - meeting or exceeding standards</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Response</th>
              <th style="text-align: center;">Score</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${greenQuestions.map((q, i) => renderQuestionRow(q, i)).join('')}
          </tbody>
        </table>

        <div class="footer">
          ${reportId} | ${reportData.propertyAddress} | Compliant Areas | Confidential
        </div>
      </div>
      ` : ''}

      <!-- ====================== LAST PAGE: DISCLAIMER + SERVICES ====================== -->
      <div class="page">
        ${reportData.suggestedServices.length > 0 ? `
          <div style="background: linear-gradient(135deg, #064e3b, #10b981); padding: 15px 25px; border-radius: 8px; margin-bottom: 20px; color: white;">
            <div style="font-size: 16pt; font-weight: bold;">Suggested Services</div>
            <div style="font-size: 10pt; opacity: 0.9;">Based on your assessment, the following services may help improve compliance</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Low Scoring Area</th>
                <th>Suggested Service</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.suggestedServices.map((s, i) => `
                <tr style="background: ${i % 2 === 0 ? '#fff' : '#f9fafb'}; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 12px;">${s.lowScoringArea}</td>
                  <td style="padding: 10px 12px; font-weight: 600;">${s.suggestedService}</td>
                  <td style="padding: 10px 12px;">${s.tier || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <h2 style="margin-top: 30px;">Disclaimer</h2>
        <div style="font-size: 9pt; color: #6b7280; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin-bottom: 8px;">
            This Landlord Risk Audit report has been prepared based on the information provided in the self-assessment questionnaire. 
            It is intended to provide an indication of compliance levels and potential risk areas, but it should not be relied upon as formal legal advice.
          </p>
          <p style="margin-bottom: 8px;">
            The scores and recommendations in this report are generated algorithmically based on the questionnaire responses. 
            They reflect the information provided at the time of completion and may not capture all relevant factors.
          </p>
          <p style="margin-bottom: 8px;">
            Landlords are advised to seek professional legal and regulatory advice regarding their specific obligations and circumstances. 
            Compliance requirements may vary by jurisdiction and property type.
          </p>
          <p>
            Copyright Landlord Safeguarding Ltd. All rights reserved. This report is confidential and intended solely for the named recipient.
          </p>
        </div>

        <div class="footer" style="margin-top: 40px;">
          ${reportId} | ${reportData.propertyAddress} | Generated ${reportDate} | Confidential<br>
          Copyright Landlord Safeguarding Ltd.
        </div>
      </div>

    </body>
    </html>
  `;
}
