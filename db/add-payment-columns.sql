-- Migration: Add payment tracking columns to audits table
-- This allows tracking Stripe payment information for self-service audits

-- Add payment-related columns to audits table
ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT NULL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS payment_amount INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS service_type VARCHAR(50);

-- Make auditor_id nullable for self-service audits (no auditor assigned initially)
ALTER TABLE audits ALTER COLUMN auditor_id DROP NOT NULL;

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_audits_payment_intent ON audits(payment_intent_id);

-- Add constraint for payment_status values
-- Note: This uses a CHECK constraint instead of enum for flexibility
ALTER TABLE audits DROP CONSTRAINT IF EXISTS check_payment_status;
ALTER TABLE audits ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'failed', 'refunded'));
