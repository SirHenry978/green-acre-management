
-- GL Account Types enum
CREATE TYPE public.gl_account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- GL Accounts table
CREATE TABLE public.gl_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type gl_account_type NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GL Sub-Accounts table
CREATE TABLE public.gl_sub_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_account_id UUID NOT NULL REFERENCES public.gl_accounts(id) ON DELETE CASCADE,
  sub_account_code TEXT NOT NULL UNIQUE,
  sub_account_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GL Entries/Transactions table
CREATE TABLE public.gl_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gl_account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
  gl_sub_account_id UUID REFERENCES public.gl_sub_accounts(id),
  description TEXT NOT NULL,
  debit NUMERIC NOT NULL DEFAULT 0,
  credit NUMERIC NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  reference_number TEXT,
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_sub_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_entries ENABLE ROW LEVEL SECURITY;

-- Open access policies (matching existing pattern)
CREATE POLICY "Allow all access to gl_accounts" ON public.gl_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gl_sub_accounts" ON public.gl_sub_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gl_entries" ON public.gl_entries FOR ALL USING (true) WITH CHECK (true);
