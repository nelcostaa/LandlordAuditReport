import { sql } from "@vercel/postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function migratePaymentColumns() {
  console.log("Starting payment columns migration...");

  try {
    // Add payment-related columns to audits table
    console.log("Adding payment_intent_id column...");
    await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255)`;

    console.log("Adding payment_status column...");
    await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT NULL`;

    console.log("Adding payment_amount column...");
    await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_amount INTEGER`;

    console.log("Adding service_type column...");
    await sql`ALTER TABLE audits ADD COLUMN IF NOT EXISTS service_type VARCHAR(50)`;

    // Make auditor_id nullable for self-service audits
    console.log("Making auditor_id nullable...");
    await sql`ALTER TABLE audits ALTER COLUMN auditor_id DROP NOT NULL`;

    // Create index for payment lookups
    console.log("Creating payment_intent index...");
    await sql`CREATE INDEX IF NOT EXISTS idx_audits_payment_intent ON audits(payment_intent_id)`;

    console.log("✅ Payment columns migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migratePaymentColumns();
