'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuditReportPage() {
  const params = useParams();
  const token = params?.token as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/audits/${token}/report`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate report');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadReport();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Report Unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              If you believe this is an error, please contact us for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Landlord Risk Audit Report
          </h1>
          {isLoading && (
            <span className="text-sm text-gray-500 animate-pulse">
              Generating your report...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download="landlord-audit-report.pdf"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium transition-colors"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>

      {/* PDF Viewer / Loading */}
      <div className="flex-1 relative bg-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium text-lg">
                Generating your audit report
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This may take a few seconds...
              </p>
            </div>
          </div>
        )}

        {pdfUrl && (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Audit Report PDF"
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-center text-sm text-gray-500">
        <p>
          This report was generated from your Landlord Risk Audit questionnaire
          responses. Please download and keep a copy for your records.
        </p>
      </div>
    </div>
  );
}
