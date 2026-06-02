# Farm Projects → Full Project Lifecycle Module

Transform the existing Farm Projects page into a comprehensive **Project Management Hub** covering planning → execution → monitoring → closure, deeply integrated with the existing FarmIQ modules.

## Scope

### 1. Planning
- **Project setup**: objectives, scope, location (GPS lat/lng), priority, type (crop/livestock/infrastructure/research), responsible manager, team members, start/end dates, budget per category.
- **Phases & Milestones**: break a project into ordered phases with target dates and completion %; milestones with deliverables.
- **Dependencies**: tasks can depend on other tasks (predecessor relationships) for sequencing.

### 2. Execution
- **Tasks & Subtasks**: extend existing kanban — add subtasks, checklists, effort estimates, actual hours, attachments.
- **Resource Assignment**: assign employees (from `employees`), equipment/assets (from `assets`), and inventory items required.
- **Procurement & Inventory**: link project requisitions (`requisitions` table) and inventory issues (`inventory_issues`) so consumption is tracked per project; auto-deduct from project budget.
- **Machinery & Labor Scheduling**: simple calendar showing which assets/employees are booked per project per day.

### 3. Monitoring
- **Real-time Dashboard**: progress %, budget vs spent, tasks on/off track, milestone status, upcoming deadlines, overdue items.
- **Risks Register**: log risks with likelihood/impact/mitigation/owner/status.
- **Field Observations**: timestamped notes with optional photo upload + GPS coordinates (mobile-friendly capture form).
- **Weather Impact Log**: link to existing Weather module — record events that impacted the project.
- **Documents**: file uploads (contracts, permits, reports) stored in a new `project-documents` bucket.
- **Comments & Activity Feed**: per-project threaded comments + automatic activity log.
- **Notifications**: deadline-approaching / overdue / milestone-completed alerts.

### 4. Crop & Livestock Activities
- Link projects to `livestock` records (e.g., a "Dairy Expansion" project lists associated livestock).
- Link projects to crops (use existing `farm_tasks` tagged with crop type) for crop production tracking.

### 5. Finance Integration
- All project expenses post to `gl_entries` with `reference_type='project'` and `reference_id=project.id`.
- Budget categories (labor, materials, equipment, services) with per-category tracking.
- P&L per project: revenue from livestock transfers/invoices tagged to project, minus expenses.

### 6. Reporting & Analytics
- **Reports tab**: project status, budget variance, resource utilization, milestone burn-up, risk heatmap, yield/output vs target.
- CSV export per report.
- Visual charts (Recharts): budget vs actual line, task status pie, milestone gantt-style timeline.

### 7. Closure
- **Closure workflow**: mark project complete → triggers a closure form capturing performance rating, yield/output achieved, financial summary (auto-pulled), lessons learned, post-mortem notes.
- **Archive**: closed projects move to an Archive tab with read-only view; data preserved for historical reporting.

## Database Changes (one migration)

New tables (all with branch_id, RLS = allow-all per project convention):

- `project_phases` — project_id, name, sequence, start_date, end_date, status, progress_pct
- `project_milestones` — project_id, phase_id?, title, due_date, status, deliverables
- `project_team_members` — project_id, employee_id, role, allocation_pct
- `project_resources` — project_id, resource_type (asset|inventory), resource_id, qty_planned, qty_used, scheduled_from, scheduled_to
- `project_risks` — project_id, title, description, likelihood, impact, mitigation, owner, status
- `project_observations` — project_id, note, photo_url, gps_lat, gps_lng, observed_at, observer_name
- `project_weather_events` — project_id, event_date, condition, impact_description, severity
- `project_documents` — project_id, file_name, file_url, file_type, uploaded_by
- `project_comments` — project_id, parent_id?, author_name, body
- `project_activity_log` — project_id, action, actor, meta(jsonb)
- `project_notifications` — project_id, kind, title, body, is_read
- `project_expenses` — project_id, category, description, amount, date, posted_to_finance, gl_entry_ref
- `project_closures` — project_id, performance_rating, yield_summary, financial_summary, lessons_learned, closed_by, closed_at

Extend `farm_tasks`:
- add `phase_id uuid`, `subtask_of uuid`, `predecessor_task_id uuid`, `estimated_hours numeric`, `actual_hours numeric`, `checklist jsonb`

Extend `farm_projects`:
- add `project_type text`, `location_name text`, `gps_lat numeric`, `gps_lng numeric`, `objectives text`, `revenue numeric`, `archived boolean default false`

New storage bucket: `project-documents` (private).

## Frontend Architecture

Refactor `src/pages/FarmProjects.tsx` from one mega-file into a focused page + module components:

```
src/components/projects/
  ProjectDashboard.tsx        — KPI cards + charts
  ProjectsList.tsx            — existing grid (kept)
  ProjectDetail.tsx           — tabbed detail view per project
    tabs:
      Overview, Phases, Tasks (existing kanban), Team, Resources,
      Procurement, Risks, Observations, Documents, Comments,
      Finance, Reports, Closure
  PhasesManager.tsx
  MilestonesList.tsx
  TeamAssignment.tsx
  ResourceScheduler.tsx       — simple week grid
  RisksRegister.tsx
  ObservationsLog.tsx         — with photo upload + geolocation API
  DocumentsPanel.tsx
  CommentsThread.tsx
  ProjectReports.tsx
  ClosureForm.tsx
src/hooks/
  useProjects.ts              — central queries/mutations for everything above
```

Routing: keep `/farm-projects` for list; add `/farm-projects/:id` for detail.

## Integration Touchpoints

- **Inventory**: `inventory_issues` gains optional `project_id` (column add). When issuing items, optionally pick a project → cost rolls into project_expenses.
- **Requisitions**: add `project_id` column; project detail shows linked requisitions.
- **Assets**: asset assignments can target a project (assignee_name = project name; new optional `project_id` column).
- **Livestock**: `livestock` gains optional `project_id`; transfers tagged to project count as project revenue.
- **HR**: team_members reference `employees.id` for staff assignment.
- **Finance**: every `project_expenses` row posts a GL entry; reports pull from `gl_entries WHERE reference_type='project'`.

## Out of Scope (for this pass)

- Native mobile app — field data collection is built as a mobile-responsive web form using the browser Geolocation API + file input camera capture. (Capacitor packaging can come later.)
- Real-time multi-user comment subscriptions — comments will refetch on send; realtime can be enabled later by adding the table to `supabase_realtime` publication.
- Email/SMS notifications — in-app notifications only for now.

## Delivery Order

1. Migration (schema + extensions + storage bucket).
2. `useProjects.ts` hook with all queries/mutations.
3. New `ProjectDetail` page + tab components.
4. Integration wiring (inventory issue, requisition, asset assignment optional project picker).
5. Reports & closure flow.
6. QA pass on mobile viewport for observations capture.
