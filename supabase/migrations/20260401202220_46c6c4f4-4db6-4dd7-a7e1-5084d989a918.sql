
-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  tax_number TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  employment_date DATE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  housing_allowance NUMERIC NOT NULL DEFAULT 0,
  transport_allowance NUMERIC NOT NULL DEFAULT 0,
  tax_deduction_rate NUMERIC NOT NULL DEFAULT 0,
  pension_deduction_rate NUMERIC NOT NULL DEFAULT 0,
  medical_aid_deduction NUMERIC NOT NULL DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  branch_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to employees"
  ON public.employees FOR ALL
  USING (true) WITH CHECK (true);

-- Create payroll_runs table
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  total_gross NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  total_net NUMERIC NOT NULL DEFAULT 0,
  gl_account_id UUID REFERENCES public.gl_accounts(id),
  gl_sub_account_id UUID REFERENCES public.gl_sub_accounts(id),
  branch_id TEXT,
  processed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to payroll_runs"
  ON public.payroll_runs FOR ALL
  USING (true) WITH CHECK (true);

-- Create payroll_items table
CREATE TABLE public.payroll_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  housing_allowance NUMERIC NOT NULL DEFAULT 0,
  transport_allowance NUMERIC NOT NULL DEFAULT 0,
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  tax_deduction NUMERIC NOT NULL DEFAULT 0,
  pension_deduction NUMERIC NOT NULL DEFAULT 0,
  medical_aid_deduction NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to payroll_items"
  ON public.payroll_items FOR ALL
  USING (true) WITH CHECK (true);
