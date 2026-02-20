const fs = require('fs');
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('No .env.local found or readable');
}
const nodemailer = require('nodemailer');

async function testEmail() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || 'Landlord Audit <no-reply@landlordaudit.com>';

  console.log('Testing SMTP Configuration:');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Secure: ${secure}`);
  console.log(`User: ${user ? 'SET' : 'MISSING'}`);
  console.log(`Pass: ${pass ? 'SET' : 'MISSING'}`);
  
  if (!host || !user || !pass) {
    console.error('Missing configuration block inside the script environment. Be sure to export these before running.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    console.log('Verifying SMTP connection...');
    const result = await transporter.verify();
    console.log('Verify Result:', result ? 'SUCCESS' : 'FAILED');
    console.log('SMTP Connection is ready.');
  } catch (error) {
    console.error('SMTP Connection Failed:');
    console.error(error);
    process.exit(1);
  }
}

testEmail();
