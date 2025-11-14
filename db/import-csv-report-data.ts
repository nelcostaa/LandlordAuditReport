import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

interface CSVRow {
  question_no: string;
  red_score_example: string;
  orange_score_example: string;
  report_action: string;
}

async function importCSVReportData() {
  console.log('📥 IMPORTING CSV REPORT DATA\n');

  try {
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'data.csv');
    console.log(`📂 Reading CSV: ${csvPath}\n`);
    
    const fileContent = readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: false, // We'll manually map columns
      skip_empty_lines: true,
      relax_column_count: true, // Allow variable column counts
    });

    console.log(`📊 Total rows in CSV: ${records.length}\n`);

    // The actual data starts at row 17 (index 16)
    // Row 10 (index 9) has the field names
    const headerRow = records[9];
    
    console.log('📋 CSV Structure:');
    console.log(`   Column O (14): ${headerRow[14]} (question_no)`);
    console.log(`   Column V (21): ${headerRow[21]} (red_score_example)`);
    console.log(`   Column W (22): ${headerRow[22]} (orange_score_example)`);
    console.log(`   Column Y (24): ${headerRow[24]} (report_action)\n`);

    // Extract question data rows (starting from row 17, index 16)
    const dataRows = records.slice(16);
    
    console.log(`📝 Processing ${dataRows.length} questions...\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of dataRows) {
      const questionNo = row[14]?.trim(); // Column O - question_no
      
      if (!questionNo) {
        skipped++;
        continue;
      }

      const redExample = row[21]?.trim() || null; // Column V - red_score_example
      const orangeExample = row[22]?.trim() || null; // Column W - orange_score_example
      const reportAction = row[24]?.trim() || null; // Column Y - report_action

      try {
        // Update question in database
        const result = await sql`
          UPDATE question_templates 
          SET 
            red_score_example = ${redExample},
            orange_score_example = ${orangeExample},
            report_action = ${reportAction}
          WHERE question_number = ${questionNo}
        `;

        if (result.rowCount && result.rowCount > 0) {
          console.log(`   ✅ Q${questionNo}: Updated`);
          updated++;
        } else {
          console.log(`   ⚠️  Q${questionNo}: Not found in database`);
          skipped++;
        }
      } catch (error) {
        console.error(`   ❌ Q${questionNo}: Error updating -`, error);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Updated: ${updated} questions`);
    console.log(`   ⚠️  Skipped: ${skipped} questions`);
    console.log(`   ❌ Errors: ${errors} questions\n`);

    // Verify import
    console.log('🔍 Verification - Sample questions with report_action:');
    const verification = await sql`
      SELECT question_number, 
             SUBSTRING(report_action, 1, 50) as action_preview,
             CASE 
               WHEN red_score_example IS NOT NULL THEN 'Yes'
               ELSE 'No'
             END as has_red,
             CASE 
               WHEN orange_score_example IS NOT NULL THEN 'Yes'
               ELSE 'No'
             END as has_orange
      FROM question_templates 
      WHERE report_action IS NOT NULL
      ORDER BY question_number
      LIMIT 5;
    `;

    verification.rows.forEach(row => {
      console.log(`   Q${row.question_number}:`);
      console.log(`      Action: "${row.action_preview}..."`);
      console.log(`      Has Red: ${row.has_red} | Has Orange: ${row.has_orange}`);
    });

    console.log('\n✨ Import complete!\n');

  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  }
}

importCSVReportData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


