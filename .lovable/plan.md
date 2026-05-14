
# Requisition Management Module — Phase 1

Built inside FarmIQ, reusing existing Branches, Employees, Suppliers, Warehouses, GL Accounts, and Inventory. Farm departments replace school departments. New tables get strict RLS; existing tables are left alone.

## 1. Database (new tables, all with strict RLS)

```text
app_role (enum)            super_admin, branch_manager, finance_officer,
                           procurement_officer, store_manager, hod, staff, auditor
user_roles                 user_id, role, branch_id  (canonical role store)
                           + has_role(uuid, app_role) security-definer fn

requisitions               id, req_number, branch_id, department, requester_id,
                           title, justification, priority, is_emergency, required_by,
                           budget_gl_account_id, suggested_supplier_id,
                           estimated_total, currency, status (draft|submitted|under_review|
                           pending_approval|approved|rejected|returned|procurement|
                           ordered|delivered|received|closed|cancelled),
                           current_step, workflow_id, parent_req_id (clone/recurring),
                           recurrence_rule, created_at, updated_at

requisition_items          requisition_id, item_name, category, qty, unit, unit_price,
                           total, notes

approval_workflows         id, branch_id, name, applies_to (department/amount rules JSON),
                           is_active

approval_workflow_steps    workflow_id, step_order, approver_role, approver_user_id?,
                           min_amount, max_amount, sla_hours

approval_logs              requisition_id, step_order, approver_id, action
                           (approve|reject|return|escalate|delegate|comment),
                           comment, signature_hash, acted_at, delegated_to

req_budgets                branch_id, gl_account_id, fiscal_year, allocated,
                           committed, spent  (computed view + maintained by triggers)

req_quotations             requisition_id, supplier_id, quoted_total, lead_time_days,
                           valid_until, notes, attachment_path, is_selected

purchase_orders            id, po_number, requisition_id, supplier_id, branch_id,
                           subtotal, tax, total, payment_terms, delivery_terms,
                           status (draft|approved|sent|partial|received|closed|cancelled),
                           issued_by, issued_at

purchase_order_items       po_id, item_name, qty, unit, unit_price, total, qty_received

goods_received_notes       id, grn_number, po_id, warehouse_id, branch_id,
                           received_by, received_date, status, notes

grn_items                  grn_id, po_item_id, qty_received, condition

req_attachments            requisition_id|po_id|grn_id, file_path, mime, uploaded_by
                           → Storage bucket `requisitions` (private)

req_notifications          user_id, kind, title, body, link, ref_id, is_read

req_audit_logs             actor_id, entity_type, entity_id, action, diff JSONB, ip
```

RLS pattern (every table):
- super_admin: full access
- auditor: read-only everywhere
- others: scoped to their `branch_id` from `user_roles`
- requesters: read/write own drafts; read own submitted requisitions
- approvers: read/act on requisitions where current step matches their role/branch
- finance_officer: budget rows + approve at finance step
- procurement_officer: PO + quotations
- store_manager: GRN + warehouse receipt

Triggers:
- auto req_number / po_number / grn_number per branch+year
- on approval at final step → status=approved, commit budget
- on PO close → spent += total, committed -= total
- on GRN insert → update inventory_receipts, deduct stock as needed
- on any insert/update/delete to core tables → write req_audit_logs

## 2. Frontend (under `/requisitions`)

```text
src/pages/Requisitions.tsx            tabbed shell (role-aware tabs)
src/components/requisitions/
  RequisitionDashboard.tsx            KPIs, charts (recharts), bottlenecks
  MyRequisitions.tsx                  list + filters; create/edit/clone
  RequisitionForm.tsx                 multi-step wizard; multi-item; attachments
  ApprovalsInbox.tsx                  pending for current user; approve/reject/return
                                      /escalate/delegate with comments + signature
  RequisitionDetail.tsx               header, items, timeline, quotations, PO, GRN,
                                      attachments, audit trail
  BudgetsPanel.tsx                    allocate/track per GL+fiscal year (finance/admin)
  WorkflowBuilder.tsx                 configure chains per branch/dept/amount (admin)
  QuotationsPanel.tsx                 add quotes, compare, select winner
  PurchaseOrders.tsx                  generate from approved req, send, print
  GoodsReceived.tsx                   GRN against PO, partial receipts
  SuppliersPicker.tsx                 reuses existing suppliers
  Reports.tsx                         spending, turnaround, top items, supplier perf;
                                      export CSV/Excel/PDF
  NotificationsBell.tsx               in-app notifications popover (header)

src/hooks/
  useRequisitions.ts                  CRUD + status transitions, branch-scoped
  useApprovals.ts                     inbox + actions
  useBudgets.ts
  usePurchaseOrders.ts
  useGRN.ts
  useReqNotifications.ts              realtime via supabase channel
  useUserRoles.ts                     reads user_roles, exposes hasRole/canAct helpers
```

Wiring:
- Add route `/requisitions` in `src/App.tsx`
- Add sidebar item (gated by any requisition-related role)
- All list queries use `useCurrentBranchId` (super_admin sees all when no branch chosen)
- Realtime subscription on `req_notifications` for the bell

## 3. RBAC

- Seed `user_roles` for existing demo accounts (super_admin → super_admin, branch_manager → branch_manager, others → staff). Admin UI in `Users` page to assign roles per branch.
- All UI actions gated by `hasRole()`; RLS enforces it server-side.

## 4. Budgets & Finance integration

- Budgets bound to existing `gl_accounts` (expense type) per fiscal year.
- Submission validates `allocated - committed - spent >= estimated_total`; blocks otherwise unless emergency + super_admin override (logged).
- Approval commits budget; PO close → spent. Posts a `gl_entries` row on PO close (debit expense GL, credit "Accounts Payable" GL — auto-created if missing).

## 5. Inventory integration

- GRN posts to existing `inventory_receipts` (status=approved) and updates warehouse stock.
- Pre-PO stock check against `inventory_receipts` aggregate; warns on duplicates.

## 6. Notifications (in-app only)

- Triggers create `req_notifications` rows on: submission, approval needed, approve/reject/return, budget exceeded, PO sent, GRN received, SLA overdue.
- Bell in header shows unread count, popover with realtime updates.

## 7. Audit trail

- Generic trigger writes to `req_audit_logs` for requisitions, approvals, POs, GRNs, budgets, quotations, workflows.
- Auditor role can view full log; admin UI on detail pages shows entity-scoped entries.

## 8. Reports & exports

- Recharts dashboards; CSV/Excel via existing `xlsx`-style util pattern; PDF via `jspdf` (already used elsewhere — confirmed in payroll exports).

## 9. Out of scope (deferred)

Email/SMS/push channels, 2FA, OCR scanning, AI fraud detection, supplier self-service portal, tender/bidding portal, multi-currency, contract management.

## 10. Migration & rollout order

1. Migration: enums, `user_roles` + `has_role`, all requisition tables, RLS, triggers, sequences, storage bucket `requisitions`.
2. Seed demo roles + a default approval workflow per branch + sample budgets.
3. Hooks + pages + sidebar + route.
4. Notifications bell in header.
5. Manual smoke test: create → submit → approve chain → PO → GRN → inventory updated → GL posted → reports populated.

After approval I'll start with the migration call and then build the UI in the same turn.
