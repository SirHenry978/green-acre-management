
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  default_days INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to leave_types"
ON public.leave_types FOR ALL
USING (true) WITH CHECK (true);

INSERT INTO public.leave_types (name, default_days, is_paid, description) VALUES
  ('Annual Leave', 21, true, 'Standard annual leave allocation'),
  ('Sick Leave', 10, true, 'Sick leave allocation'),
  ('Family Leave', 3, true, 'Family responsibility leave'),
  ('Unpaid Leave', 0, false, 'Unpaid leave - deducted from salary');
