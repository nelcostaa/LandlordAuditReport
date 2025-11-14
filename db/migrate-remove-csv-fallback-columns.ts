import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function removeCsvFallbackColumns() {
  console.log('🗑️  REMOVING CSV FALLBACK COLUMNS FROM question_templates\n');
  console.log('These columns are no longer needed because we now use');
  console.log('question_score_examples table with reason_text and report_action');
  console.log('for each score level (low, medium, high).\n');

  try {
    // Check if columns exist
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'question_templates' 
      AND column_name IN ('red_score_example', 'orange_score_example', 'report_action')
      ORDER BY column_name;
    `;

    if (checkColumns.rows.length === 0) {
      console.log('✅ Columns already removed or never existed.\n');
      return;
    }

    console.log('📊 Columns to remove:');
    checkColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });
    console.log();

    // Drop columns if they exist
    console.log('🗑️  Dropping columns...');
    
    await sql`ALTER TABLE question_templates DROP COLUMN IF EXISTS red_score_example;`;
    console.log('   ✅ Dropped red_score_example');
    
    await sql`ALTER TABLE question_templates DROP COLUMN IF EXISTS orange_score_example;`;
    console.log('   ✅ Dropped orange_score_example');
    
    await sql`ALTER TABLE question_templates DROP COLUMN IF EXISTS report_action;`;
    console.log('   ✅ Dropped report_action');

    // Verify columns are removed
    const verify = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'question_templates' 
      AND column_name IN ('red_score_example', 'orange_score_example', 'report_action');
    `;

    if (verify.rows.length === 0) {
      console.log('\n✅ All columns successfully removed!\n');
    } else {
      console.log('\n⚠️  Warning: Some columns still exist:', verify.rows.map(r => r.column_name));
    }

    console.log('✨ Migration complete!\n');
    console.log('📝 Next steps:');
    console.log('   - All data should now come from question_score_examples table');
    console.log('   - Update code to remove references to these CSV columns');
    console.log('   - Ensure all questions have score_examples configured in Edit Questions\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

removeCsvFallbackColumns()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

