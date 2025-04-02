-- Add missing columns to content_history table
ALTER TABLE content_history 
ADD COLUMN IF NOT EXISTS content_type TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Make output_format nullable or provide a default value
ALTER TABLE content_history
ALTER COLUMN output_format DROP NOT NULL;

-- Add image_url column to store associated generated image URL
ALTER TABLE content_history
ADD COLUMN IF NOT EXISTS image_url TEXT;
