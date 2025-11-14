import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function renameScoresCategory() {
  console.log('🔄 RENAMING scores.category TO scores.scores_category\n');

  try {
    // Check if column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'scores' 
      AND column_name IN ('category', 'scores_category')
      ORDER BY column_name;
    `;

    const existingColumns = checkColumn.rows.map(r => r.column_name);
    console.log('📊 Current columns:', existingColumns);

    // If 'category' exists and 'scores_category' doesn't, rename it
    if (existingColumns.includes('category') && !existingColumns.includes('scores_category')) {
      console.log('\n✅ Renaming column: category → scores_category');
      
      // Rename the column
      await sql`ALTER TABLE scores RENAME COLUMN category TO scores_category;`;
      
      console.log('✅ Column renamed successfully!');
    } else if (existingColumns.includes('scores_category')) {
      console.log('\n⚠️  Column already renamed (scores_category exists)');
    } else {
      console.log('\n⚠️  Column "category" not found - table might not exist yet');
    }

    // Update index if it exists
    console.log('\n📊 Updating index...');
    try {
      // Drop old index if it exists
      await sql`DROP INDEX IF EXISTS idx_scores_category;`;
      // Create new index
      await sql`CREATE INDEX IF NOT EXISTS idx_scores_category ON scores(scores_category);`;
      console.log('✅ Index updated successfully!');
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  Index did not exist, creating new one...');
        await sql`CREATE INDEX IF NOT EXISTS idx_scores_category ON scores(scores_category);`;
        console.log('✅ Index created!');
      } else {
        throw error;
      }
    }

    // Verify final state
    const finalCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'scores' 
      AND column_name = 'scores_category';
    `;

    if (finalCheck.rows.length > 0) {
      console.log('\n✅ Verification:');
      finalCheck.rows.forEach(row => {
        console.log(`   ✅ ${row.column_name} (${row.data_type})`);
      });
    }

    console.log('\n✨ Migration complete!\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

renameScoresCategory()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

