-- Business records and uploads are served by the Django API.
-- Retire only the client policies named in the selected security findings.
DROP POLICY IF EXISTS "Allow all access to accommodation_allocations" ON public.accommodation_allocations;
DROP POLICY IF EXISTS "Allow all access to accommodation_applications" ON public.accommodation_applications;
DROP POLICY IF EXISTS "Allow all access to accommodation_checkins" ON public.accommodation_checkins;
DROP POLICY IF EXISTS "Allow all access to accommodation_houses" ON public.accommodation_houses;
DROP POLICY IF EXISTS "Allow all access to accommodation_requests" ON public.accommodation_requests;
DROP POLICY IF EXISTS "Allow all access to accommodation_room_assets" ON public.accommodation_room_assets;
DROP POLICY IF EXISTS "Allow all access to accommodation_rooms" ON public.accommodation_rooms;
DROP POLICY IF EXISTS "Allow all access to agri_articles" ON public.agri_articles;
DROP POLICY IF EXISTS "Allow all access to asset_assignments" ON public.asset_assignments;
DROP POLICY IF EXISTS "Allow all access to asset_audit_logs" ON public.asset_audit_logs;
DROP POLICY IF EXISTS "Allow all access to asset_categories" ON public.asset_categories;
DROP POLICY IF EXISTS "Allow all access to asset_depreciation_entries" ON public.asset_depreciation_entries;
DROP POLICY IF EXISTS "Allow all access to asset_disposals" ON public.asset_disposals;
DROP POLICY IF EXISTS "Allow all access to asset_maintenance" ON public.asset_maintenance;
DROP POLICY IF EXISTS "Allow all access to asset_notifications" ON public.asset_notifications;
DROP POLICY IF EXISTS "Allow all access to asset_vendors" ON public.asset_vendors;
DROP POLICY IF EXISTS "Allow all access to assets" ON public.assets;
DROP POLICY IF EXISTS "auth all canteen_audit" ON public.canteen_audit_logs;
DROP POLICY IF EXISTS "auth all canteen_inv_req" ON public.canteen_inventory_requests;
DROP POLICY IF EXISTS "auth all canteen_meals" ON public.canteen_meals;
DROP POLICY IF EXISTS "auth all canteen_reviews" ON public.canteen_reviews;
DROP POLICY IF EXISTS "auth all canteen_staff" ON public.canteen_staff;
DROP POLICY IF EXISTS "Allow all access to credit_notes" ON public.credit_notes;
DROP POLICY IF EXISTS "Allow all access to delivery_notes" ON public.delivery_notes;
DROP POLICY IF EXISTS "Allow all access to employee_bonuses" ON public.employee_bonuses;
DROP POLICY IF EXISTS "Allow all access to employee_loans" ON public.employee_loans;
DROP POLICY IF EXISTS "Allow all access to employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all access to farm_projects" ON public.farm_projects;
DROP POLICY IF EXISTS "Allow all access to farm_tasks" ON public.farm_tasks;
DROP POLICY IF EXISTS "Allow all access to gl_accounts" ON public.gl_accounts;
DROP POLICY IF EXISTS "Allow all access to gl_entries" ON public.gl_entries;
DROP POLICY IF EXISTS "Allow all access to gl_sub_accounts" ON public.gl_sub_accounts;
DROP POLICY IF EXISTS "Allow all access to goods_received_notes" ON public.goods_received_notes;
DROP POLICY IF EXISTS "Allow all access to grn_items" ON public.grn_items;
DROP POLICY IF EXISTS "Allow all access to inventory_issues" ON public.inventory_issues;
DROP POLICY IF EXISTS "Allow all access to inventory_receipts" ON public.inventory_receipts;
DROP POLICY IF EXISTS "Allow all access to inventory_transfers" ON public.inventory_transfers;
DROP POLICY IF EXISTS "Allow all access to leave_balances" ON public.leave_balances;
DROP POLICY IF EXISTS "Allow all access to leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow all access to leave_types" ON public.leave_types;
DROP POLICY IF EXISTS "Allow all access to livestock" ON public.livestock;
DROP POLICY IF EXISTS "Allow all access to livestock_categories" ON public.livestock_categories;
DROP POLICY IF EXISTS "Allow all access to livestock_health_records" ON public.livestock_health_records;
DROP POLICY IF EXISTS "Allow all access to livestock_shelters" ON public.livestock_shelters;
DROP POLICY IF EXISTS "Allow all access to livestock_transfers" ON public.livestock_transfers;
DROP POLICY IF EXISTS "Allow all access to payroll_items" ON public.payroll_items;
DROP POLICY IF EXISTS "Allow all access to payroll_runs" ON public.payroll_runs;
DROP POLICY IF EXISTS "Allow all access to project_activity_log" ON public.project_activity_log;
DROP POLICY IF EXISTS "Allow all access to project_closures" ON public.project_closures;
DROP POLICY IF EXISTS "Allow all access to project_comments" ON public.project_comments;
DROP POLICY IF EXISTS "Allow all access to project_documents" ON public.project_documents;
DROP POLICY IF EXISTS "Allow all access to project_expenses" ON public.project_expenses;
DROP POLICY IF EXISTS "Allow all access to project_milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Allow all access to project_notifications" ON public.project_notifications;
DROP POLICY IF EXISTS "Allow all access to project_observations" ON public.project_observations;
DROP POLICY IF EXISTS "Allow all access to project_phases" ON public.project_phases;
DROP POLICY IF EXISTS "Allow all access to project_resources" ON public.project_resources;
DROP POLICY IF EXISTS "Allow all access to project_risks" ON public.project_risks;
DROP POLICY IF EXISTS "Allow all access to project_team_members" ON public.project_team_members;
DROP POLICY IF EXISTS "Allow all access to project_weather_events" ON public.project_weather_events;
DROP POLICY IF EXISTS "Allow all access to purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow all access to purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow all access to req_approval_logs" ON public.req_approval_logs;
DROP POLICY IF EXISTS "Allow all access to req_approval_workflows" ON public.req_approval_workflows;
DROP POLICY IF EXISTS "Allow all access to req_attachments" ON public.req_attachments;
DROP POLICY IF EXISTS "Allow all access to req_audit_logs" ON public.req_audit_logs;
DROP POLICY IF EXISTS "Allow all access to req_budgets" ON public.req_budgets;
DROP POLICY IF EXISTS "Allow all access to req_notifications" ON public.req_notifications;
DROP POLICY IF EXISTS "Allow all access to req_quotations" ON public.req_quotations;
DROP POLICY IF EXISTS "Allow all access to req_workflow_steps" ON public.req_workflow_steps;
DROP POLICY IF EXISTS "Allow all access to requisition_items" ON public.requisition_items;
DROP POLICY IF EXISTS "Allow all access to requisitions" ON public.requisitions;
DROP POLICY IF EXISTS "Allow all access to warehouses" ON public.warehouses;

REVOKE ALL ON TABLE
  public.accommodation_allocations, public.accommodation_applications,
  public.accommodation_checkins, public.accommodation_houses,
  public.accommodation_requests, public.accommodation_room_assets,
  public.accommodation_rooms, public.agri_articles, public.asset_assignments,
  public.asset_audit_logs, public.asset_categories, public.asset_depreciation_entries,
  public.asset_disposals, public.asset_maintenance, public.asset_notifications,
  public.asset_vendors, public.assets, public.canteen_audit_logs,
  public.canteen_inventory_requests, public.canteen_meals, public.canteen_reviews,
  public.canteen_staff, public.credit_notes, public.delivery_notes,
  public.employee_bonuses, public.employee_loans, public.employees,
  public.farm_projects, public.farm_tasks, public.gl_accounts, public.gl_entries,
  public.gl_sub_accounts, public.goods_received_notes, public.grn_items,
  public.inventory_issues, public.inventory_receipts, public.inventory_transfers,
  public.leave_balances, public.leave_requests, public.leave_types,
  public.livestock, public.livestock_categories, public.livestock_health_records,
  public.livestock_shelters, public.livestock_transfers, public.payroll_items,
  public.payroll_runs, public.project_activity_log, public.project_closures,
  public.project_comments, public.project_documents, public.project_expenses,
  public.project_milestones, public.project_notifications, public.project_observations,
  public.project_phases, public.project_resources, public.project_risks,
  public.project_team_members, public.project_weather_events,
  public.purchase_order_items, public.purchase_orders, public.req_approval_logs,
  public.req_approval_workflows, public.req_attachments, public.req_audit_logs,
  public.req_budgets, public.req_notifications, public.req_quotations,
  public.req_workflow_steps, public.requisition_items, public.requisitions,
  public.warehouses
FROM anon, authenticated;

DROP POLICY IF EXISTS "Project docs delete" ON storage.objects;
DROP POLICY IF EXISTS "Project docs read" ON storage.objects;
DROP POLICY IF EXISTS "Public access requisitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Project docs update" ON storage.objects;
DROP POLICY IF EXISTS "Project docs insert" ON storage.objects;