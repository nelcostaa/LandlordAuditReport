import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function addReportActionColumns() {
  console.log('🔧 ADDING REPORT ACTION COLUMNS TO QUESTIONS TABLE\n');

  try {
    // Add 3 critical columns for report generation
    console.log('📝 Adding columns:');
    console.log('   - red_score_example (TEXT)');
    console.log('   - orange_score_example (TEXT)');
    console.log('   - report_action (TEXT)\n');

    await sql`
      ALTER TABLE question_templates 
      ADD COLUMN IF NOT EXISTS red_score_example TEXT,
      ADD COLUMN IF NOT EXISTS orange_score_example TEXT,
      ADD COLUMN IF NOT EXISTS report_action TEXT;
    `;

    console.log('✅ Columns added successfully!\n');

    // Verify columns exist
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'question_templates' 
      AND column_name IN ('red_score_example', 'orange_score_example', 'report_action')
      ORDER BY column_name;
    `;

    console.log('📊 Verification:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.column_name} (${row.data_type})`);
    });

    console.log('\n✨ Migration complete!\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

addReportActionColumns()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


