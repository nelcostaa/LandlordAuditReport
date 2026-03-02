// TEMPORARY DEBUG ENDPOINT - DELETE AFTER FIXING
// Tests React-PDF renderToBuffer with real data to identify the exact error
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { ReportDocument } from '@/components/pdf/ReportDocument';
import { transformAuditToReportData, formatReportDate } from '@/lib/pdf/formatters';
import { calculateAuditScores } from '@/lib/scoring';

// Minimal test doc - just text, no data
const MinimalDoc = () =>
  React.createElement(Document, {},
    React.createElement(Page, { size: 'A4' },
      React.createElement(View, {},
        React.createElement(Text, {}, 'Hello World - Minimal Test')
      )
    )
  );

export async function GET(request: Request) {
  const url = new URL(request.url);
  const step = url.searchParams.get('step') || '1';
  const token = url.searchParams.get('token');

  try {
    // STEP 1: Test if renderToBuffer works at all
    if (step === '1') {
      console.log('[DEBUG] Step 1: Testing minimal renderToBuffer...');
      const buf = await renderToBuffer(React.createElement(MinimalDoc) as any);
      return NextResponse.json({
        step: 1,
        success: true,
        message: 'renderToBuffer works with minimal doc',
        pdfSize: buf.length,
      });
    }

    // STEP 2: Test with real data but inspect data shape
    if (step === '2' && token) {
      console.log('[DEBUG] Step 2: Inspecting data shape...');
      const auditResult = await sql`SELECT * FROM audits WHERE token = ${token}`;
      if (auditResult.rows.length === 0) {
        return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
      }
      const audit = auditResult.rows[0] as any;

      const responsesResult = await sql`
        SELECT id, audit_id, question_id, answer_value, comment, created_at
        FROM form_responses WHERE audit_id = ${audit.id} ORDER BY question_id
      `;
      const responses = responsesResult.rows as any[];

      let questions: any[] = [];
      try {
        const { getQuestionsForTier } = await import('@/lib/questions-db');
        questions = await getQuestionsForTier(audit.risk_audit_tier);
      } catch (e) {
        const { getQuestionsByTier } = await import('@/lib/questions');
        questions = getQuestionsByTier(audit.risk_audit_tier);
      }

      const scores = calculateAuditScores(responses, questions);
      const reportData = transformAuditToReportData(audit, responses, questions, scores);

      // Inspect every field for non-primitives
      const inspect = (obj: any, path: string = ''): string[] => {
        const issues: string[] = [];
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          const fullPath = path ? `${path}.${key}` : key;
          if (val === null || val === undefined) continue;
          if (typeof val === 'object' && val.$$typeof) {
            issues.push(`REACT ELEMENT at ${fullPath}: keys=${Object.keys(val).join(',')}`);
          } else if (val instanceof Date) {
            issues.push(`DATE at ${fullPath}: ${val.toISOString()}`);
          } else if (Array.isArray(val)) {
            val.forEach((item, i) => {
              if (typeof item === 'object' && item !== null) {
                issues.push(...inspect(item, `${fullPath}[${i}]`));
              }
            });
          } else if (typeof val === 'object') {
            issues.push(...inspect(val, fullPath));
          }
        }
        return issues;
      };

      const dataIssues = inspect(reportData);

      return NextResponse.json({
        step: 2,
        auditId: audit.id,
        questionCount: questions.length,
        responseCount: responses.length,
        reportDataKeys: Object.keys(reportData),
        redCount: reportData.questionResponses.red.length,
        orangeCount: reportData.questionResponses.orange.length,
        greenCount: reportData.questionResponses.green.length,
        dataIssues,
        sampleQuestion: reportData.questionResponses.red[0] || reportData.questionResponses.orange[0] || reportData.questionResponses.green[0],
      });
    }

    // STEP 3: Try full render
    if (step === '3' && token) {
      console.log('[DEBUG] Step 3: Full renderToBuffer with real data...');
      const auditResult = await sql`SELECT * FROM audits WHERE token = ${token}`;
      const audit = auditResult.rows[0] as any;

      const responsesResult = await sql`
        SELECT id, audit_id, question_id, answer_value, comment, created_at
        FROM form_responses WHERE audit_id = ${audit.id} ORDER BY question_id
      `;
      const responses = responsesResult.rows as any[];

      let questions: any[] = [];
      try {
        const { getQuestionsForTier } = await import('@/lib/questions-db');
        questions = await getQuestionsForTier(audit.risk_audit_tier);
      } catch (e) {
        const { getQuestionsByTier } = await import('@/lib/questions');
        questions = getQuestionsByTier(audit.risk_audit_tier);
      }

      const scores = calculateAuditScores(responses, questions);
      const reportData = transformAuditToReportData(audit, responses, questions, scores);

      const pdfBuffer = await renderToBuffer(
        React.createElement(ReportDocument, { data: reportData }) as any
      );

      return NextResponse.json({
        step: 3,
        success: true,
        pdfSize: pdfBuffer.length,
      });
    }

    return NextResponse.json({
      usage: {
        step1: '/api/debug-pdf?step=1',
        step2: '/api/debug-pdf?step=2&token=YOUR_TOKEN',
        step3: '/api/debug-pdf?step=3&token=YOUR_TOKEN',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      step,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 10),
    }, { status: 500 });
  }
}
