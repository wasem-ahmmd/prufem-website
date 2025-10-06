-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id text NOT NULL,
  inspired_by text NULL,
  description_html text NULL,
  sku text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  stock_status text NOT NULL CHECK (stock_status IN ('in_stock','out_of_stock','on_demand')),
  price numeric(10,2) NULL CHECK (price IS NULL OR price >= 0),
  sale_price numeric(10,2) NULL CHECK (sale_price IS NULL OR sale_price >= 0),
  discount numeric(10,2) NULL CHECK (discount IS NULL OR discount >= 0),
  image_urls text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_image_count CHECK (array_length(image_urls, 1) = 2),
  CONSTRAINT products_sku_unique UNIQUE (sku),
  CONSTRAINT products_sale_not_exceed_price CHECK (
    sale_price IS NULL OR price IS NULL OR sale_price <= price
  )
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to manage products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_select_auth'
  ) THEN
    CREATE POLICY products_select_auth ON public.products
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_insert_auth'
  ) THEN
    CREATE POLICY products_insert_auth ON public.products
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_update_auth'
  ) THEN
    CREATE POLICY products_update_auth ON public.products
      FOR UPDATE TO authenticated
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_delete_auth'
  ) THEN
    CREATE POLICY products_delete_auth ON public.products
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END$$;