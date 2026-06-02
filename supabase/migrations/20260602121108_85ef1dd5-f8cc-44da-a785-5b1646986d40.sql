
-- Extend farm_projects
ALTER TABLE public.farm_projects
  ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS location_name text,
  ADD COLUMN IF NOT EXISTS gps_lat numeric,
  ADD COLUMN IF NOT EXISTS gps_lng numeric,
  ADD COLUMN IF NOT EXISTS objectives text,
  ADD COLUMN IF NOT EXISTS revenue numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Extend farm_tasks
ALTER TABLE public.farm_tasks
  ADD COLUMN IF NOT EXISTS phase_id uuid,
  ADD COLUMN IF NOT EXISTS subtask_of uuid,
  ADD COLUMN IF NOT EXISTS predecessor_task_id uuid,
  ADD COLUMN IF NOT EXISTS estimated_hours numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb;

-- Link existing modules to projects (optional)
ALTER TABLE public.inventory_issues ADD COLUMN IF NOT EXISTS project_id uuid;
ALTER TABLE public.requisitions ADD COLUMN IF NOT EXISTS project_id uuid;
ALTER TABLE public.asset_assignments ADD COLUMN IF NOT EXISTS project_id uuid;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS project_id uuid;

-- project_phases
CREATE TABLE IF NOT EXISTS public.project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  branch_id text,
  name text NOT NULL,
  sequence integer NOT NULL DEFAULT 1,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planning',
  progress_pct numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_phases TO anon, authenticated;
GRANT ALL ON public.project_phases TO service_role;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_phases" ON public.project_phases FOR ALL USING (true) WITH CHECK (true);

-- project_milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  phase_id uuid,
  branch_id text,
  title text NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  deliverables text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_milestones TO anon, authenticated;
GRANT ALL ON public.project_milestones TO service_role;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_milestones" ON public.project_milestones FOR ALL USING (true) WITH CHECK (true);

-- project_team_members
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  employee_id uuid,
  member_name text NOT NULL,
  role text,
  allocation_pct numeric NOT NULL DEFAULT 100,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_team_members TO anon, authenticated;
GRANT ALL ON public.project_team_members TO service_role;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_team_members" ON public.project_team_members FOR ALL USING (true) WITH CHECK (true);

-- project_resources
CREATE TABLE IF NOT EXISTS public.project_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  resource_name text NOT NULL,
  qty_planned numeric NOT NULL DEFAULT 0,
  qty_used numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  scheduled_from date,
  scheduled_to date,
  status text NOT NULL DEFAULT 'planned',
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_resources TO anon, authenticated;
GRANT ALL ON public.project_resources TO service_role;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_resources" ON public.project_resources FOR ALL USING (true) WITH CHECK (true);

-- project_risks
CREATE TABLE IF NOT EXISTS public.project_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  likelihood text NOT NULL DEFAULT 'medium',
  impact text NOT NULL DEFAULT 'medium',
  mitigation text,
  owner text,
  status text NOT NULL DEFAULT 'open',
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_risks TO anon, authenticated;
GRANT ALL ON public.project_risks TO service_role;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_risks" ON public.project_risks FOR ALL USING (true) WITH CHECK (true);

-- project_observations
CREATE TABLE IF NOT EXISTS public.project_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  note text NOT NULL,
  photo_url text,
  gps_lat numeric,
  gps_lng numeric,
  observed_at timestamptz NOT NULL DEFAULT now(),
  observer_name text,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_observations TO anon, authenticated;
GRANT ALL ON public.project_observations TO service_role;
ALTER TABLE public.project_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_observations" ON public.project_observations FOR ALL USING (true) WITH CHECK (true);

-- project_weather_events
CREATE TABLE IF NOT EXISTS public.project_weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  condition text NOT NULL,
  impact_description text,
  severity text NOT NULL DEFAULT 'low',
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_weather_events TO anon, authenticated;
GRANT ALL ON public.project_weather_events TO service_role;
ALTER TABLE public.project_weather_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_weather_events" ON public.project_weather_events FOR ALL USING (true) WITH CHECK (true);

-- project_documents
CREATE TABLE IF NOT EXISTS public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by text,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_documents TO anon, authenticated;
GRANT ALL ON public.project_documents TO service_role;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_documents" ON public.project_documents FOR ALL USING (true) WITH CHECK (true);

-- project_comments
CREATE TABLE IF NOT EXISTS public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  parent_id uuid,
  author_name text NOT NULL,
  body text NOT NULL,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_comments TO anon, authenticated;
GRANT ALL ON public.project_comments TO service_role;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_comments" ON public.project_comments FOR ALL USING (true) WITH CHECK (true);

-- project_activity_log
CREATE TABLE IF NOT EXISTS public.project_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  action text NOT NULL,
  actor text,
  meta jsonb DEFAULT '{}'::jsonb,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_activity_log TO anon, authenticated;
GRANT ALL ON public.project_activity_log TO service_role;
ALTER TABLE public.project_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_activity_log" ON public.project_activity_log FOR ALL USING (true) WITH CHECK (true);

-- project_notifications
CREATE TABLE IF NOT EXISTS public.project_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  branch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_notifications TO anon, authenticated;
GRANT ALL ON public.project_notifications TO service_role;
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_notifications" ON public.project_notifications FOR ALL USING (true) WITH CHECK (true);

-- project_expenses
CREATE TABLE IF NOT EXISTS public.project_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  posted_to_finance boolean NOT NULL DEFAULT false,
  gl_entry_ref text,
  branch_id text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_expenses TO anon, authenticated;
GRANT ALL ON public.project_expenses TO service_role;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_expenses" ON public.project_expenses FOR ALL USING (true) WITH CHECK (true);

-- project_closures
CREATE TABLE IF NOT EXISTS public.project_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE,
  performance_rating integer NOT NULL DEFAULT 0,
  yield_summary text,
  financial_summary jsonb DEFAULT '{}'::jsonb,
  lessons_learned text,
  closed_by text,
  closed_at timestamptz NOT NULL DEFAULT now(),
  branch_id text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_closures TO anon, authenticated;
GRANT ALL ON public.project_closures TO service_role;
ALTER TABLE public.project_closures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to project_closures" ON public.project_closures FOR ALL USING (true) WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON public.project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_project ON public.project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_project ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON public.project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_obs_project ON public.project_observations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_docs_project ON public.project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_project ON public.project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notif_project ON public.project_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_project ON public.project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_phase ON public.farm_tasks(phase_id);

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_project_phases_updated ON public.project_phases;
CREATE TRIGGER trg_project_phases_updated BEFORE UPDATE ON public.project_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_risks_updated ON public.project_risks;
CREATE TRIGGER trg_project_risks_updated BEFORE UPDATE ON public.project_risks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
