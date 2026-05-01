-- Staff Accommodation Module

-- Houses
CREATE TABLE public.accommodation_houses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_code TEXT NOT NULL,
  name TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  location TEXT,
  house_type TEXT NOT NULL DEFAULT 'family',
  total_rooms INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_houses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_houses" ON public.accommodation_houses FOR ALL USING (true) WITH CHECK (true);

-- Rooms
CREATE TABLE public.accommodation_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES public.accommodation_houses(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  room_type TEXT NOT NULL DEFAULT 'single',
  monthly_charge NUMERIC NOT NULL DEFAULT 0,
  condition_status TEXT NOT NULL DEFAULT 'good',
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  branch_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_rooms" ON public.accommodation_rooms FOR ALL USING (true) WITH CHECK (true);

-- Room assets (linked to inventory/assets module)
CREATE TABLE public.accommodation_room_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.accommodation_rooms(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'furniture',
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'good',
  inventory_item_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_room_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_room_assets" ON public.accommodation_room_assets FOR ALL USING (true) WITH CHECK (true);

-- Room applications
CREATE TABLE public.accommodation_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.accommodation_rooms(id) ON DELETE CASCADE,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  desired_start_date DATE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_applications" ON public.accommodation_applications FOR ALL USING (true) WITH CHECK (true);

-- Allocations
CREATE TABLE public.accommodation_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.accommodation_rooms(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.accommodation_applications(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  monthly_charge NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'reserved',
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_allocations" ON public.accommodation_allocations FOR ALL USING (true) WITH CHECK (true);

-- Check-ins / Check-outs
CREATE TABLE public.accommodation_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES public.accommodation_allocations(id) ON DELETE CASCADE,
  room_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspected_by TEXT,
  condition_status TEXT,
  damages_noted TEXT,
  damage_charge NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to accommodation_checkins" ON public.accommodation_checkins FOR ALL USING (true) WITH CHECK (true);

-- Add accommodation deduction column to payroll_items
ALTER TABLE public.payroll_items ADD COLUMN IF NOT EXISTS accommodation_deduction NUMERIC NOT NULL DEFAULT 0;

-- updated_at trigger function reuse
CREATE TRIGGER update_acc_houses_updated_at BEFORE UPDATE ON public.accommodation_houses FOR EACH ROW EXECUTE FUNCTION public.update_license_updated_at();
CREATE TRIGGER update_acc_rooms_updated_at BEFORE UPDATE ON public.accommodation_rooms FOR EACH ROW EXECUTE FUNCTION public.update_license_updated_at();
CREATE TRIGGER update_acc_room_assets_updated_at BEFORE UPDATE ON public.accommodation_room_assets FOR EACH ROW EXECUTE FUNCTION public.update_license_updated_at();
CREATE TRIGGER update_acc_applications_updated_at BEFORE UPDATE ON public.accommodation_applications FOR EACH ROW EXECUTE FUNCTION public.update_license_updated_at();
CREATE TRIGGER update_acc_allocations_updated_at BEFORE UPDATE ON public.accommodation_allocations FOR EACH ROW EXECUTE FUNCTION public.update_license_updated_at();

CREATE INDEX idx_acc_rooms_house ON public.accommodation_rooms(house_id);
CREATE INDEX idx_acc_room_assets_room ON public.accommodation_room_assets(room_id);
CREATE INDEX idx_acc_applications_employee ON public.accommodation_applications(employee_id);
CREATE INDEX idx_acc_allocations_employee ON public.accommodation_allocations(employee_id);
CREATE INDEX idx_acc_allocations_room ON public.accommodation_allocations(room_id);
CREATE INDEX idx_acc_checkins_allocation ON public.accommodation_checkins(allocation_id);