
-- MEALS CHART
CREATE TABLE public.canteen_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  day_of_week TEXT,
  meal_time TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  calories INTEGER,
  ingredients TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  branch_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canteen_meals TO authenticated;
GRANT ALL ON public.canteen_meals TO service_role;
ALTER TABLE public.canteen_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all canteen_meals" ON public.canteen_meals FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER trg_canteen_meals_upd BEFORE UPDATE ON public.canteen_meals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CANTEEN STAFF
CREATE TABLE public.canteen_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'chef',
  shift TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  branch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canteen_staff TO authenticated;
GRANT ALL ON public.canteen_staff TO service_role;
ALTER TABLE public.canteen_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all canteen_staff" ON public.canteen_staff FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER trg_canteen_staff_upd BEFORE UPDATE ON public.canteen_staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVENTORY REQUESTS
CREATE TABLE public.canteen_inventory_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT,
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT,
  warehouse_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID,
  fulfilled_by UUID,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  branch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canteen_inventory_requests TO authenticated;
GRANT ALL ON public.canteen_inventory_requests TO service_role;
ALTER TABLE public.canteen_inventory_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all canteen_inv_req" ON public.canteen_inventory_requests FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER trg_canteen_inv_req_upd BEFORE UPDATE ON public.canteen_inventory_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REVIEWS
CREATE TABLE public.canteen_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID,
  meal_name TEXT,
  reviewer_id UUID,
  reviewer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  branch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canteen_reviews TO authenticated;
GRANT ALL ON public.canteen_reviews TO service_role;
ALTER TABLE public.canteen_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all canteen_reviews" ON public.canteen_reviews FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER trg_canteen_reviews_upd BEFORE UPDATE ON public.canteen_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDIT LOGS
CREATE TABLE public.canteen_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  performed_by UUID,
  performed_by_name TEXT,
  details JSONB,
  branch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canteen_audit_logs TO authenticated;
GRANT ALL ON public.canteen_audit_logs TO service_role;
ALTER TABLE public.canteen_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all canteen_audit" ON public.canteen_audit_logs FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
