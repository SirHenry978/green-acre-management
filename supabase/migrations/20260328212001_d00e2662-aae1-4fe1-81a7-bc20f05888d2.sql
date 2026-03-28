
-- Farm Projects table
CREATE TABLE public.farm_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  priority text NOT NULL DEFAULT 'medium',
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  spent numeric DEFAULT 0,
  manager_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to farm_projects" ON public.farm_projects FOR ALL TO public USING (true) WITH CHECK (true);

-- Farm Tasks table
CREATE TABLE public.farm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.farm_projects(id) ON DELETE CASCADE NOT NULL,
  parent_task_id uuid REFERENCES public.farm_tasks(id) ON DELETE CASCADE,
  branch_id text NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  start_date date,
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to farm_tasks" ON public.farm_tasks FOR ALL TO public USING (true) WITH CHECK (true);

-- Knowledge base articles table
CREATE TABLE public.agri_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_ai_generated boolean DEFAULT false,
  branch_id text,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.agri_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agri_articles" ON public.agri_articles FOR ALL TO public USING (true) WITH CHECK (true);
