import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function cleanAllUsersAndAudits() {
  console.log('🧹 CLEANING ALL USERS AND AUDITS\n');
  console.log('⚠️  WARNING: This will delete ALL users and their audits!\n');

  try {
    // 1. Count existing records
    console.log('📊 Current database state:');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const auditCount = await sql`SELECT COUNT(*) as count FROM audits`;
    const responsesCount = await sql`SELECT COUNT(*) as count FROM form_responses`;
    const scoresCount = await sql`SELECT COUNT(*) as count FROM scores`;
    const notesCount = await sql`SELECT COUNT(*) as count FROM notes`;

    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Audits: ${auditCount.rows[0].count}`);
    console.log(`   - Form Responses: ${responsesCount.rows[0].count}`);
    console.log(`   - Scores: ${scoresCount.rows[0].count}`);
    console.log(`   - Notes: ${notesCount.rows[0].count}\n`);

    // 2. Delete all data in correct order (respecting foreign keys)
    console.log('🗑️  Deleting all records...\n');

    // Delete child records first
    console.log('   Deleting form_responses...');
    const deletedResponses = await sql`DELETE FROM form_responses`;
    console.log(`   ✅ Deleted ${deletedResponses.rowCount} form_responses\n`);

    console.log('   Deleting scores...');
    const deletedScores = await sql`DELETE FROM scores`;
    console.log(`   ✅ Deleted ${deletedScores.rowCount} scores\n`);

    console.log('   Deleting notes...');
    const deletedNotes = await sql`DELETE FROM notes`;
    console.log(`   ✅ Deleted ${deletedNotes.rowCount} notes\n`);

    // Delete audits (parent of above)
    console.log('   Deleting audits...');
    const deletedAudits = await sql`DELETE FROM audits`;
    console.log(`   ✅ Deleted ${deletedAudits.rowCount} audits\n`);

    // Delete users (parent of audits)
    console.log('   Deleting users...');
    const deletedUsers = await sql`DELETE FROM users`;
    console.log(`   ✅ Deleted ${deletedUsers.rowCount} users\n`);

    // 3. Verify cleanup
    console.log('✅ CLEANUP COMPLETE!\n');
    console.log('📊 Final database state:');
    const finalUserCount = await sql`SELECT COUNT(*) as count FROM users`;
    const finalAuditCount = await sql`SELECT COUNT(*) as count FROM audits`;
    const finalResponsesCount = await sql`SELECT COUNT(*) as count FROM form_responses`;
    const finalScoresCount = await sql`SELECT COUNT(*) as count FROM scores`;
    const finalNotesCount = await sql`SELECT COUNT(*) as count FROM notes`;

    console.log(`   - Users: ${finalUserCount.rows[0].count}`);
    console.log(`   - Audits: ${finalAuditCount.rows[0].count}`);
    console.log(`   - Form Responses: ${finalResponsesCount.rows[0].count}`);
    console.log(`   - Scores: ${finalScoresCount.rows[0].count}`);
    console.log(`   - Notes: ${finalNotesCount.rows[0].count}\n`);

    console.log('✨ Database is now clean and ready for fresh testing!\n');
    console.log('📝 Note: Question templates remain intact for creating new audits.\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanAllUsersAndAudits()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

