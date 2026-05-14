
-- =========================================================
-- REQUISITION MANAGEMENT MODULE - Phase 1
-- =========================================================

-- 1. Core requisitions
CREATE TABLE IF NOT EXISTS public.requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  req_number text NOT NULL UNIQUE,
  branch_id text,
  department text,
  requester_id uuid,
  requester_name text NOT NULL,
  title text NOT NULL,
  justification text,
  priority text NOT NULL DEFAULT 'medium',
  is_emergency boolean NOT NULL DEFAULT false,
  required_by date,
  budget_gl_account_id uuid,
  suggested_supplier text,
  estimated_total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft',
  current_step int NOT NULL DEFAULT 0,
  workflow_id uuid,
  parent_req_id uuid,
  recurrence_rule text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requisition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL,
  item_name text NOT NULL,
  category text DEFAULT 'general',
  qty numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'units',
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Approval workflows
CREATE TABLE IF NOT EXISTS public.req_approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id text,
  name text NOT NULL,
  department text,
  min_amount numeric DEFAULT 0,
  max_amount numeric,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  step_order int NOT NULL,
  step_name text NOT NULL,
  approver_role text NOT NULL,
  sla_hours int DEFAULT 48,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_approval_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL,
  step_order int NOT NULL,
  step_name text,
  approver_role text,
  approver_name text,
  action text NOT NULL,
  comment text,
  delegated_to text,
  acted_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Budgets
CREATE TABLE IF NOT EXISTS public.req_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id text,
  department text,
  gl_account_id uuid,
  fiscal_year int NOT NULL,
  allocated numeric NOT NULL DEFAULT 0,
  committed numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Quotations
CREATE TABLE IF NOT EXISTS public.req_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL,
  supplier_name text NOT NULL,
  supplier_contact text,
  quoted_total numeric NOT NULL DEFAULT 0,
  lead_time_days int DEFAULT 7,
  valid_until date,
  notes text,
  attachment_path text,
  is_selected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text NOT NULL UNIQUE,
  requisition_id uuid,
  branch_id text,
  supplier_name text NOT NULL,
  supplier_contact text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_terms text,
  delivery_terms text,
  expected_delivery date,
  status text NOT NULL DEFAULT 'draft',
  issued_by text,
  issued_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL,
  item_name text NOT NULL,
  qty numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'units',
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  qty_received numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Goods Received Notes
CREATE TABLE IF NOT EXISTS public.goods_received_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number text NOT NULL UNIQUE,
  po_id uuid NOT NULL,
  warehouse_id uuid,
  branch_id text,
  received_by text,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'received',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grn_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id uuid NOT NULL,
  po_item_id uuid NOT NULL,
  item_name text NOT NULL,
  qty_received numeric NOT NULL DEFAULT 0,
  condition text DEFAULT 'good',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.req_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role text,
  user_name text,
  branch_id text,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  ref_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Audit log
CREATE TABLE IF NOT EXISTS public.req_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name text,
  actor_role text,
  branch_id text,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Attachments
CREATE TABLE IF NOT EXISTS public.req_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_req_branch ON public.requisitions(branch_id);
CREATE INDEX IF NOT EXISTS idx_req_status ON public.requisitions(status);
CREATE INDEX IF NOT EXISTS idx_req_items_req ON public.requisition_items(requisition_id);
CREATE INDEX IF NOT EXISTS idx_wf_steps_wf ON public.req_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_logs_req ON public.req_approval_logs(requisition_id);
CREATE INDEX IF NOT EXISTS idx_quote_req ON public.req_quotations(requisition_id);
CREATE INDEX IF NOT EXISTS idx_po_req ON public.purchase_orders(requisition_id);
CREATE INDEX IF NOT EXISTS idx_poi_po ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_grn_po ON public.goods_received_notes(po_id);
CREATE INDEX IF NOT EXISTS idx_grni_grn ON public.grn_items(grn_id);

-- Enable RLS + permissive policies (matches rest of project)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'requisitions','requisition_items','req_approval_workflows','req_workflow_steps',
    'req_approval_logs','req_budgets','req_quotations','purchase_orders',
    'purchase_order_items','goods_received_notes','grn_items','req_notifications',
    'req_audit_logs','req_attachments'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access to %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Allow all access to %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- updated_at triggers
CREATE TRIGGER req_set_updated_at BEFORE UPDATE ON public.requisitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER po_set_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER budgets_set_updated_at BEFORE UPDATE ON public.req_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sequence-based number generation
CREATE SEQUENCE IF NOT EXISTS public.req_seq;
CREATE SEQUENCE IF NOT EXISTS public.po_seq;
CREATE SEQUENCE IF NOT EXISTS public.grn_seq;

CREATE OR REPLACE FUNCTION public.gen_req_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.req_number IS NULL OR NEW.req_number = '' THEN
    NEW.req_number := 'REQ-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.req_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.gen_po_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := 'PO-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.po_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.gen_grn_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.grn_number IS NULL OR NEW.grn_number = '' THEN
    NEW.grn_number := 'GRN-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.grn_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_req_number BEFORE INSERT ON public.requisitions
  FOR EACH ROW EXECUTE FUNCTION public.gen_req_number();
CREATE TRIGGER trg_po_number BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.gen_po_number();
CREATE TRIGGER trg_grn_number BEFORE INSERT ON public.goods_received_notes
  FOR EACH ROW EXECUTE FUNCTION public.gen_grn_number();

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('requisitions', 'requisitions', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access requisitions bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'requisitions') WITH CHECK (bucket_id = 'requisitions');
