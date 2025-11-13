import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import MinimalTestDocument from '../components/pdf/MinimalTestDocument';
import fs from 'fs';
import path from 'path';

async function testMinimalPDF() {
  console.log('🧪 Testing Minimal PDF Document...\n');
  
  try {
    const testData = {
      propertyAddress: '123 Test Street',
      landlordName: 'Test Landlord',
      overallScore: 7.5,
    };
    
    console.log('📄 Rendering minimal PDF...');
    const startTime = Date.now();
    
    const pdfBuffer = await renderToBuffer(
      React.createElement(MinimalTestDocument, testData) as any
    );
    
    const renderTime = Date.now() - startTime;
    const sizeKB = Math.round(pdfBuffer.length / 1024);
    
    console.log(`✅ PDF rendered in ${renderTime}ms (${sizeKB} KB)\n`);
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'test-minimal.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`💾 Saved to: ${outputPath}\n`);
    
    console.log('✅ Minimal PDF test PASSED');
    process.exit(0);
  } catch (error) {
    console.error('❌ Minimal PDF test FAILED:', error);
    process.exit(1);
  }
}

testMinimalPDF();

