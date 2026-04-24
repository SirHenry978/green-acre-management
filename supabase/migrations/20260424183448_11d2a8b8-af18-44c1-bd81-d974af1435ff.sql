
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS pay_type text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS daily_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hourly_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS piece_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS piece_unit text DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS overtime_multiplier numeric NOT NULL DEFAULT 1.5;

ALTER TABLE public.payroll_runs
  ADD COLUMN IF NOT EXISTS default_payment_method text DEFAULT 'bank';

ALTER TABLE public.payroll_items
  ADD COLUMN IF NOT EXISTS pay_type text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS days_worked numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_worked numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity_produced numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_pay numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS harvest_bonus numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS food_allowance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_earnings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loan_deduction numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS absence_penalty numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_deductions numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payslip_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.employee_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  principal_amount numeric NOT NULL DEFAULT 0,
  monthly_installment numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  reason text,
  status text NOT NULL DEFAULT 'active',
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to employee_loans" ON public.employee_loans FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.employee_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  bonus_type text NOT NULL DEFAULT 'harvest',
  amount numeric NOT NULL DEFAULT 0,
  bonus_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  applied_to_payroll_id uuid,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to employee_bonuses" ON public.employee_bonuses FOR ALL USING (true) WITH CHECK (true);
