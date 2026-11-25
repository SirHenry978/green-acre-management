-- Read-only regression tests for the selected legacy Cloud security fixes.
-- Run through the database read-query tool after applying the migration.
-- Every row must return passed = true; these tests do not inspect business data.
WITH targets(table_name) AS (
  VALUES
    ('accommodation_allocations'),
    ('accommodation_applications'),
    ('accommodation_checkins'),
    ('accommodation_houses'),
    ('accommodation_requests'),
    ('accommodation_room_assets'),
    ('accommodation_rooms'),
    ('agri_articles'),
    ('asset_assignments'),
    ('asset_audit_logs'),
    ('asset_categories'),
    ('asset_depreciation_entries'),
    ('asset_disposals'),
    ('asset_maintenance'),
    ('asset_notifications'),
    ('asset_vendors'),
    ('assets'),
    ('canteen_audit_logs'),
    ('canteen_inventory_requests'),
    ('canteen_meals'),
    ('canteen_reviews'),
    ('canteen_staff'),
    ('credit_notes'),
    ('delivery_notes'),
    ('employee_bonuses'),
    ('employee_loans'),
    ('employees'),
    ('farm_projects'),
    ('farm_tasks'),
    ('gl_accounts'),
    ('gl_entries'),
    ('gl_sub_accounts'),
    ('goods_received_notes'),
    ('grn_items'),
    ('inventory_issues'),
    ('inventory_receipts'),
    ('inventory_transfers'),
    ('leave_balances'),
    ('leave_requests'),
    ('leave_types'),
    ('livestock'),
    ('livestock_categories'),
    ('livestock_health_records'),
    ('livestock_shelters'),
    ('livestock_transfers'),
    ('payroll_items'),
    ('payroll_runs'),
    ('project_activity_log'),
    ('project_closures'),
    ('project_comments'),
    ('project_documents'),
    ('project_expenses'),
    ('project_milestones'),
    ('project_notifications'),
    ('project_observations'),
    ('project_phases'),
    ('project_resources'),
    ('project_risks'),
    ('project_team_members'),
    ('project_weather_events'),
    ('purchase_order_items'),
    ('purchase_orders'),
    ('req_approval_logs'),
    ('req_approval_workflows'),
    ('req_attachments'),
    ('req_audit_logs'),
    ('req_budgets'),
    ('req_notifications'),
    ('req_quotations'),
    ('req_workflow_steps'),
    ('requisition_items'),
    ('requisitions'),
    ('warehouses')
), relations AS (
  SELECT t.table_name, c.oid, c.relrowsecurity
  FROM targets t
  LEFT JOIN pg_namespace n ON n.nspname = 'public'
  LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = t.table_name
)
SELECT 'All 73 selected tables still exist with row security enabled' AS test,
  count(oid) = 73 AND bool_and(relrowsecurity) AS passed FROM relations
UNION ALL
SELECT 'Anonymous clients have no privileges on selected tables',
  bool_and(NOT has_table_privilege('anon', oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')) FROM relations
UNION ALL
SELECT 'Signed-in Cloud clients have no privileges on selected tables',
  bool_and(NOT has_table_privilege('authenticated', oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')) FROM relations
UNION ALL
SELECT 'Selected tables have no remaining permissive client policies',
  NOT EXISTS (SELECT 1 FROM pg_policies p JOIN targets t ON p.tablename = t.table_name WHERE p.schemaname = 'public')
UNION ALL
SELECT 'Trusted service retains record access',
  bool_and(has_table_privilege('service_role', oid, 'SELECT')
    AND has_table_privilege('service_role', oid, 'INSERT')
    AND has_table_privilege('service_role', oid, 'UPDATE')
    AND has_table_privilege('service_role', oid, 'DELETE')) FROM relations
UNION ALL
SELECT 'Client roles cannot bypass row security',
  count(*) = 2 AND bool_and(NOT rolbypassrls AND NOT rolsuper)
  FROM pg_roles WHERE rolname IN ('anon', 'authenticated')
UNION ALL
SELECT 'Exactly the five selected document policies are absent',
  NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname IN ('Project docs delete', 'Project docs read', 'Project docs update', 'Project docs insert', 'Public access requisitions bucket'))
UNION ALL
SELECT 'Remaining document storage policies do not grant client access',
  NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND (COALESCE(qual, '') LIKE '%project-documents%' OR COALESCE(with_check, '') LIKE '%project-documents%'
      OR COALESCE(qual, '') LIKE '%requisitions%' OR COALESCE(with_check, '') LIKE '%requisitions%'))
UNION ALL
SELECT 'Project and requisition document buckets remain private',
  count(*) = 2 AND bool_and(NOT public) FROM storage.buckets WHERE id IN ('project-documents', 'requisitions')
UNION ALL
SELECT 'Unselected avatar policies remain unchanged',
  count(*) = 4 AND bool_and(COALESCE(qual, with_check) LIKE '%avatars%')
  FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname IN ('Anyone can view avatars', 'Users can delete own avatar', 'Users can update own avatar', 'Users can upload own avatar')
UNION ALL
SELECT 'Unselected profile and license policies remain unchanged',
  count(*) = 6 FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'licenses');
