-- Add comment column to form_responses table
-- This allows landlords to add their own comments when answering each question

ALTER TABLE form_responses
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add helpful description
COMMENT ON COLUMN form_responses.comment IS 'Optional comment from landlord when answering the question. Displayed in the PDF report.';

