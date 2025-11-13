// PDF Generation using Puppeteer (Vercel compatible)
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Generate PDF from HTML using Puppeteer
 * Works reliably in Vercel serverless environment
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const startTime = Date.now();
  console.log('[Puppeteer] Launching browser...');
  console.log('[Puppeteer] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    CHROMIUM_REMOTE_EXEC_PATH: process.env.CHROMIUM_REMOTE_EXEC_PATH ? 'SET' : 'NOT SET',
    CHROMIUM_REMOTE_EXEC_PATH_VALUE: process.env.CHROMIUM_REMOTE_EXEC_PATH || 'undefined',
  });
  
  let browser;
  
  try {
    // CRITICAL: Explicitly set environment variable if not present
    // This ensures Chromium downloads from GitHub instead of looking locally
    if (!process.env.CHROMIUM_REMOTE_EXEC_PATH) {
      console.warn('[Puppeteer] CHROMIUM_REMOTE_EXEC_PATH not set, setting default...');
      process.env.CHROMIUM_REMOTE_EXEC_PATH = 'https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br';
    }
    
    // Get Chromium executable path
    // Uses CHROMIUM_REMOTE_EXEC_PATH env var in Vercel to download binary
    console.log('[Puppeteer] Calling chromium.executablePath()...');
    const executablePath = await chromium.executablePath();
    
    console.log('[Puppeteer] Chromium path:', executablePath);
    console.log('[Puppeteer] Remote exec path:', process.env.CHROMIUM_REMOTE_EXEC_PATH || 'not set');
    
    // Launch browser with Chromium optimized for serverless
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: true,
    });
    
    console.log(`[Puppeteer] Browser launched in ${Date.now() - startTime}ms`);
    
    const page = await browser.newPage();
    
    // Set content
    console.log('[Puppeteer] Setting HTML content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log('[Puppeteer] Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    await browser.close();
    
    const totalTime = Date.now() - startTime;
    const sizeKB = Math.round(pdf.length / 1024);
    console.log(`[Puppeteer] ✅ PDF generated in ${totalTime}ms (${sizeKB} KB)`);
    
    return Buffer.from(pdf);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('[Puppeteer] Error generating PDF:', error);
    throw error;
  }
}

