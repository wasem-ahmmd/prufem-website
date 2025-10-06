-- Cloudinary deletion jobs table
-- Run this SQL in Supabase SQL editor or CLI to create the table
CREATE TABLE IF NOT EXISTS public.cloudinary_delete_jobs (
  id BIGSERIAL PRIMARY KEY,
  public_id TEXT NOT NULL,
  product_id TEXT, -- optional reference to products.id for traceability
  image_urls TEXT[], -- optional: support legacy inserts that store all URLs
  status TEXT NOT NULL DEFAULT 'pending', -- pending | completed | failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If the table already existed without the expected columns, add them
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.cloudinary_delete_jobs
  ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Allow either public_id OR image_urls and enforce at least one
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.cloudinary_delete_jobs ALTER COLUMN public_id DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.cloudinary_delete_jobs
      ADD CONSTRAINT cloudinary_delete_jobs_require_target
      CHECK ((public_id IS NOT NULL AND char_length(public_id) > 0) OR (image_urls IS NOT NULL AND array_length(image_urls, 1) > 0));
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_cloudinary_delete_jobs_status_created
  ON public.cloudinary_delete_jobs (status, created_at);

-- Simple trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cloudinary_delete_jobs_updated ON public.cloudinary_delete_jobs;
CREATE TRIGGER trg_cloudinary_delete_jobs_updated
BEFORE UPDATE ON public.cloudinary_delete_jobs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();