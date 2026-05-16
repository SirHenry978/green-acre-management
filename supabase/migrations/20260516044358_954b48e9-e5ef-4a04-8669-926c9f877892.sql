
-- Sequence for asset codes
CREATE SEQUENCE IF NOT EXISTS public.asset_seq START 1;

-- Categories
CREATE TABLE public.asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  default_useful_life_years integer NOT NULL DEFAULT 5,
  default_salvage_rate numeric NOT NULL DEFAULT 0.1,
  depreciation_method text NOT NULL DEFAULT 'straight_line',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vendors (asset specific)
CREATE TABLE public.asset_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  contact_person text,
  phone text,
  email text,
  address text,
  services_offered text,
  rating numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Assets (master)
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code text NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid,
  asset_type text NOT NULL DEFAULT 'equipment', -- equipment, machinery, vehicle, livestock, building, land, furniture, it
  status text NOT NULL DEFAULT 'operational',   -- operational, maintenance, idle, disposed, retired
  condition text NOT NULL DEFAULT 'good',
  branch_id text,
  location text,
  serial_number text,
  model text,
  manufacturer text,
  purchase_date date,
  purchase_cost numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  salvage_value numeric NOT NULL DEFAULT 0,
  useful_life_years integer NOT NULL DEFAULT 5,
  depreciation_method text NOT NULL DEFAULT 'straight_line',
  accumulated_depreciation numeric NOT NULL DEFAULT 0,
  last_depreciated_at date,
  warranty_expires_on date,
  vendor_id uuid,
  supplier_id text,
  gl_account_id uuid,
  livestock_id uuid,
  image_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.gen_asset_code()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.asset_code IS NULL OR NEW.asset_code = '' THEN
    NEW.asset_code := 'AST-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.asset_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gen_asset_code BEFORE INSERT ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.gen_asset_code();

CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_asset_categories_updated BEFORE UPDATE ON public.asset_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_asset_vendors_updated BEFORE UPDATE ON public.asset_vendors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assignments
CREATE TABLE public.asset_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  assignee_name text NOT NULL,
  assignee_employee_id uuid,
  department text,
  branch_id text,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  returned_date date,
  condition_out text DEFAULT 'good',
  condition_in text,
  status text NOT NULL DEFAULT 'assigned', -- assigned, returned, lost
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Maintenance
CREATE TABLE public.asset_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  maintenance_type text NOT NULL DEFAULT 'preventive',
  scheduled_date date,
  performed_date date,
  performed_by text,
  vendor_id uuid,
  cost numeric NOT NULL DEFAULT 0,
  downtime_hours numeric DEFAULT 0,
  next_due_date date,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  description text,
  notes text,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_asset_maint_updated BEFORE UPDATE ON public.asset_maintenance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Depreciation entries
CREATE TABLE public.asset_depreciation_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_value numeric NOT NULL DEFAULT 0,
  depreciation_amount numeric NOT NULL DEFAULT 0,
  closing_value numeric NOT NULL DEFAULT 0,
  posted_to_finance boolean NOT NULL DEFAULT false,
  gl_entry_ref text,
  notes text,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Disposals
CREATE TABLE public.asset_disposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  disposal_date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'sale', -- sale, scrap, donation, transfer, write_off
  buyer text,
  sale_price numeric NOT NULL DEFAULT 0,
  book_value numeric NOT NULL DEFAULT 0,
  gain_loss numeric NOT NULL DEFAULT 0,
  approval_status text NOT NULL DEFAULT 'pending',
  approved_by text,
  reason text,
  posted_to_finance boolean NOT NULL DEFAULT false,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.asset_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, -- maintenance_due, warranty_expiring, depreciation_posted, disposal_approved
  title text NOT NULL,
  body text,
  link text,
  ref_id uuid,
  user_role text,
  user_name text,
  is_read boolean NOT NULL DEFAULT false,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit logs
CREATE TABLE public.asset_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- asset, assignment, maintenance, disposal
  entity_id uuid,
  action text NOT NULL,
  actor_name text,
  actor_role text,
  diff jsonb,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS (permissive to match project)
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_depreciation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to asset_categories" ON public.asset_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_vendors" ON public.asset_vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_assignments" ON public.asset_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_maintenance" ON public.asset_maintenance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_depreciation_entries" ON public.asset_depreciation_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_disposals" ON public.asset_disposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_notifications" ON public.asset_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to asset_audit_logs" ON public.asset_audit_logs FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_assets_branch ON public.assets(branch_id);
CREATE INDEX idx_assets_category ON public.assets(category_id);
CREATE INDEX idx_assets_livestock ON public.assets(livestock_id);
CREATE INDEX idx_asset_maint_asset ON public.asset_maintenance(asset_id);
CREATE INDEX idx_asset_assign_asset ON public.asset_assignments(asset_id);
CREATE INDEX idx_asset_depr_asset ON public.asset_depreciation_entries(asset_id);
