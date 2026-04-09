
-- Warehouses table
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location_description TEXT,
  warehouse_type TEXT NOT NULL DEFAULT 'main',
  capacity INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to warehouses" ON public.warehouses FOR ALL USING (true) WITH CHECK (true);

-- Inventory Issues table
CREATE TABLE public.inventory_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  issuer_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  from_warehouse_id UUID REFERENCES public.warehouses(id),
  to_warehouse_id UUID REFERENCES public.warehouses(id),
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to inventory_issues" ON public.inventory_issues FOR ALL USING (true) WITH CHECK (true);

-- Inventory Receipts table
CREATE TABLE public.inventory_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  received_by TEXT NOT NULL,
  supplier_source TEXT,
  warehouse_id UUID REFERENCES public.warehouses(id),
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to inventory_receipts" ON public.inventory_receipts FOR ALL USING (true) WITH CHECK (true);

-- Delivery Notes table
CREATE TABLE public.delivery_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  note_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_quantity NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  received_by TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to delivery_notes" ON public.delivery_notes FOR ALL USING (true) WITH CHECK (true);

-- Credit Notes table
CREATE TABLE public.credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  note_number TEXT NOT NULL,
  reason TEXT NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_quantity NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  issued_by TEXT,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to credit_notes" ON public.credit_notes FOR ALL USING (true) WITH CHECK (true);
