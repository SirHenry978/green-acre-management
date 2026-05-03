CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.accommodation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  room_id UUID,
  allocation_id UUID,
  request_type TEXT NOT NULL DEFAULT 'complaint',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to accommodation_requests"
ON public.accommodation_requests FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_accommodation_requests_updated_at
BEFORE UPDATE ON public.accommodation_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();