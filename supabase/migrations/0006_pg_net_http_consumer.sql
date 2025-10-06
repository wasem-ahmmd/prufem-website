-- Enable pg_net to make HTTP calls from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Optional: set a base URL for your Next.js server (adjust if deployed)
-- In local dev, Supabase Postgres can often reach host via http://host.docker.internal:3001
-- If your Postgres cannot reach localhost, set to your public domain instead.
DO $$
BEGIN
  BEGIN
    PERFORM set_config('cloudinary.consumer_base_url', 'http://localhost:3001', true);
  EXCEPTION WHEN OTHERS THEN
    -- ignore if set_config not allowed in this context
    NULL;
  END;
END$$;

-- Update trigger function to enqueue job and kick the HTTP consumer
CREATE OR REPLACE FUNCTION public.enqueue_cloudinary_delete_job()
RETURNS trigger AS $$
DECLARE
  _job_id bigint;
  _base_url text := current_setting('cloudinary.consumer_base_url', true);
BEGIN
  INSERT INTO public.cloudinary_delete_jobs (product_id, image_urls)
  VALUES (OLD.id, OLD.image_urls);

  IF _base_url IS NOT NULL AND length(_base_url) > 0 THEN
    -- Fire-and-forget: ask Next.js API to process queued jobs
    SELECT net.http_get(
      url := _base_url || '/api/admin/cloudinary/consume-delete-jobs?limit=25',
      headers := '{"x-db-trigger":"products_after_delete"}'
    ) INTO _job_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists (will use updated function)
DROP TRIGGER IF EXISTS products_after_delete_enqueue ON public.products;
CREATE TRIGGER products_after_delete_enqueue
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enqueue_cloudinary_delete_job();