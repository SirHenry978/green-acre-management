
-- Livestock categories (cattle, goats, chicken, etc.)
CREATE TABLE public.livestock_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Livestock shelters (barns, pens, coops per branch)
CREATE TABLE public.livestock_shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  shelter_type text NOT NULL,
  capacity int NOT NULL DEFAULT 0,
  branch_id text NOT NULL,
  location_description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Livestock (individual animals or batches)
CREATE TABLE public.livestock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_number text UNIQUE NOT NULL,
  name text,
  category_id uuid REFERENCES public.livestock_categories(id) NOT NULL,
  breed text NOT NULL,
  color text,
  gender text NOT NULL,
  date_of_birth date,
  age_on_capture text,
  weight numeric,
  shelter_id uuid REFERENCES public.livestock_shelters(id),
  branch_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  health_status text NOT NULL DEFAULT 'healthy',
  notes text,
  acquired_date date DEFAULT CURRENT_DATE,
  acquired_from text,
  purchase_price numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Livestock health records
CREATE TABLE public.livestock_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id uuid REFERENCES public.livestock(id) ON DELETE CASCADE NOT NULL,
  record_type text NOT NULL,
  description text NOT NULL,
  vet_name text,
  diagnosis text,
  treatment text,
  medication text,
  cost numeric DEFAULT 0,
  next_due_date date,
  branch_id text NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Livestock transfers (between branches or sold)
CREATE TABLE public.livestock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id uuid REFERENCES public.livestock(id),
  reference_number text NOT NULL,
  transfer_type text NOT NULL,
  from_branch_id text,
  to_branch_id text,
  customer_id text,
  reason text,
  transfer_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric DEFAULT 0,
  total_value numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory transfers (linking inventory to livestock)
CREATE TABLE public.inventory_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_name text NOT NULL,
  category text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  branch_id text NOT NULL,
  livestock_id uuid REFERENCES public.livestock(id),
  purpose text,
  transfer_date date NOT NULL DEFAULT CURRENT_DATE,
  transferred_by text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS with permissive policies (app-level branch filtering since auth is dummy-based)
ALTER TABLE public.livestock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to livestock_categories" ON public.livestock_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to livestock_shelters" ON public.livestock_shelters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to livestock" ON public.livestock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to livestock_health_records" ON public.livestock_health_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to livestock_transfers" ON public.livestock_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to inventory_transfers" ON public.inventory_transfers FOR ALL USING (true) WITH CHECK (true);

-- Seed livestock categories
INSERT INTO public.livestock_categories (name, description) VALUES
  ('Cattle', 'Beef and dairy cattle'),
  ('Goats', 'Dairy and meat goats'),
  ('Chicken', 'Broilers and layers'),
  ('Sheep', 'Wool and meat sheep'),
  ('Pigs', 'Pork production'),
  ('Horses', 'Work and breeding horses'),
  ('Rabbits', 'Meat and breeding rabbits');
