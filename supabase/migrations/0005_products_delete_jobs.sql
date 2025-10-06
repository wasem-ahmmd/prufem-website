-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Queue table for Cloudinary image deletions when products are removed directly from DB
CREATE TABLE IF NOT EXISTS public.cloudinary_delete_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_urls text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cloudinary_delete_jobs_created_at ON public.cloudinary_delete_jobs (created_at ASC);

-- Trigger function to enqueue delete jobs after product row deletion
CREATE OR REPLACE FUNCTION public.enqueue_cloudinary_delete_job()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.cloudinary_delete_jobs (product_id, image_urls)
  VALUES (OLD.id, OLD.image_urls);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on products table
DROP TRIGGER IF EXISTS products_after_delete_enqueue ON public.products;
CREATE TRIGGER products_after_delete_enqueue
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enqueue_cloudinary_delete_job();