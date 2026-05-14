import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

export interface Requisition {
  id: string;
  req_number: string;
  branch_id: string | null;
  department: string | null;
  requester_id: string | null;
  requester_name: string;
  title: string;
  justification: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_emergency: boolean;
  required_by: string | null;
  budget_gl_account_id: string | null;
  suggested_supplier: string | null;
  estimated_total: number;
  currency: string;
  status: string;
  current_step: number;
  workflow_id: string | null;
  parent_req_id: string | null;
  recurrence_rule: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequisitionItem {
  id: string;
  requisition_id: string;
  item_name: string;
  category: string;
  qty: number;
  unit: string;
  unit_price: number;
  total: number;
  notes: string | null;
}

export interface ApprovalWorkflow {
  id: string;
  branch_id: string | null;
  name: string;
  department: string | null;
  min_amount: number | null;
  max_amount: number | null;
  is_active: boolean;
  is_default: boolean;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  approver_role: string;
  sla_hours: number;
}

export interface ApprovalLog {
  id: string;
  requisition_id: string;
  step_order: number;
  step_name: string | null;
  approver_role: string | null;
  approver_name: string | null;
  action: string;
  comment: string | null;
  delegated_to: string | null;
  acted_at: string;
}

export interface ReqBudget {
  id: string;
  branch_id: string | null;
  department: string | null;
  gl_account_id: string | null;
  fiscal_year: number;
  allocated: number;
  committed: number;
  spent: number;
  notes: string | null;
}

export interface Quotation {
  id: string;
  requisition_id: string;
  supplier_name: string;
  supplier_contact: string | null;
  quoted_total: number;
  lead_time_days: number | null;
  valid_until: string | null;
  notes: string | null;
  is_selected: boolean;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  requisition_id: string | null;
  branch_id: string | null;
  supplier_name: string;
  supplier_contact: string | null;
  subtotal: number;
  tax: number;
  total: number;
  payment_terms: string | null;
  delivery_terms: string | null;
  expected_delivery: string | null;
  status: string;
  issued_by: string | null;
  issued_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface POItem {
  id: string;
  po_id: string;
  item_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total: number;
  qty_received: number;
}

export interface GRN {
  id: string;
  grn_number: string;
  po_id: string;
  warehouse_id: string | null;
  branch_id: string | null;
  received_by: string | null;
  received_date: string;
  status: string;
  notes: string | null;
}

export interface ReqNotification {
  id: string;
  user_role: string | null;
  user_name: string | null;
  branch_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  ref_id: string | null;
  is_read: boolean;
  created_at: string;
}

const sb = supabase as any;

export const useRequisitions = () => {
  const branchId = useCurrentBranchId();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [budgets, setBudgets] = useState<ReqBudget[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [grns, setGRNs] = useState<GRN[]>([]);
  const [notifications, setNotifications] = useState<ReqNotification[]>([]);

  const fetchAll = useCallback(async () => {
    const wb = (q: any) => (branchId ? q.eq('branch_id', branchId) : q);
    const [r, w, b, p, n] = await Promise.all([
      wb(sb.from('requisitions').select('*').order('created_at', { ascending: false })),
      wb(sb.from('req_approval_workflows').select('*').order('created_at', { ascending: false })),
      wb(sb.from('req_budgets').select('*').order('fiscal_year', { ascending: false })),
      wb(sb.from('purchase_orders').select('*').order('created_at', { ascending: false })),
      wb(sb.from('req_notifications').select('*').order('created_at', { ascending: false }).limit(50)),
    ]);
    setRequisitions(r.data || []);
    setWorkflows(w.data || []);
    setBudgets(b.data || []);
    setPOs(p.data || []);
    setNotifications(n.data || []);

    const reqIds = (r.data || []).map((x: any) => x.id);
    const wfIds = (w.data || []).map((x: any) => x.id);
    const poIds = (p.data || []).map((x: any) => x.id);

    const [it, st, lg, qt, pi, gr] = await Promise.all([
      reqIds.length ? sb.from('requisition_items').select('*').in('requisition_id', reqIds) : { data: [] },
      wfIds.length ? sb.from('req_workflow_steps').select('*').in('workflow_id', wfIds).order('step_order') : { data: [] },
      reqIds.length ? sb.from('req_approval_logs').select('*').in('requisition_id', reqIds).order('acted_at', { ascending: false }) : { data: [] },
      reqIds.length ? sb.from('req_quotations').select('*').in('requisition_id', reqIds) : { data: [] },
      poIds.length ? sb.from('purchase_order_items').select('*').in('po_id', poIds) : { data: [] },
      poIds.length ? sb.from('goods_received_notes').select('*').in('po_id', poIds).order('received_date', { ascending: false }) : { data: [] },
    ]);
    setItems(it.data || []);
    setSteps(st.data || []);
    setLogs(lg.data || []);
    setQuotations(qt.data || []);
    setPOItems(pi.data || []);
    setGRNs(gr.data || []);
  }, [branchId]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchAll(); setLoading(false); })();
  }, [fetchAll]);

  // ---------- Helpers ----------
  const getItemsFor = (reqId: string) => items.filter(i => i.requisition_id === reqId);
  const getLogsFor = (reqId: string) => logs.filter(l => l.requisition_id === reqId);
  const getStepsFor = (wfId: string) => steps.filter(s => s.workflow_id === wfId).sort((a, b) => a.step_order - b.step_order);
  const getQuotesFor = (reqId: string) => quotations.filter(q => q.requisition_id === reqId);
  const getPOItemsFor = (poId: string) => poItems.filter(i => i.po_id === poId);
  const getGRNsFor = (poId: string) => grns.filter(g => g.po_id === poId);

  const pickWorkflow = (req: Pick<Requisition, 'estimated_total' | 'department' | 'branch_id'>): ApprovalWorkflow | undefined => {
    const candidates = workflows.filter(w => w.is_active &&
      (!w.branch_id || !req.branch_id || w.branch_id === req.branch_id) &&
      (!w.department || w.department === req.department) &&
      (w.min_amount == null || req.estimated_total >= (w.min_amount || 0)) &&
      (w.max_amount == null || req.estimated_total <= (w.max_amount || Infinity)));
    return candidates.find(w => w.is_default) || candidates[0];
  };

  // ---------- Mutations ----------
  const createRequisition = async (
    req: Omit<Requisition, 'id' | 'req_number' | 'created_at' | 'updated_at' | 'current_step' | 'workflow_id'>,
    lines: Omit<RequisitionItem, 'id' | 'requisition_id'>[],
  ) => {
    const { data, error } = await sb.from('requisitions').insert({
      ...req,
      current_step: 0,
      workflow_id: null,
    }).select().single();
    if (error) { toast.error('Failed: ' + error.message); return null; }
    if (lines.length) {
      const payload = lines.map(l => ({ ...l, requisition_id: data.id, total: Number(l.qty) * Number(l.unit_price) }));
      await sb.from('requisition_items').insert(payload);
    }
    await sb.from('req_audit_logs').insert({
      actor_name: req.requester_name, entity_type: 'requisition', entity_id: data.id, action: 'create', branch_id: req.branch_id,
    });
    toast.success(`Created ${data.req_number}`);
    await fetchAll();
    return data as Requisition;
  };

  const updateRequisition = async (id: string, u: Partial<Requisition>) => {
    const { error } = await sb.from('requisitions').update(u).eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    await fetchAll();
    return true;
  };

  const deleteRequisition = async (id: string) => {
    await sb.from('requisition_items').delete().eq('requisition_id', id);
    await sb.from('req_quotations').delete().eq('requisition_id', id);
    await sb.from('req_approval_logs').delete().eq('requisition_id', id);
    const { error } = await sb.from('requisitions').delete().eq('id', id);
    if (error) { toast.error('Failed: ' + error.message); return false; }
    toast.success('Requisition deleted'); await fetchAll(); return true;
  };

  const submitRequisition = async (req: Requisition, actor: string) => {
    const wf = pickWorkflow(req);
    if (!wf) { toast.error('No approval workflow configured. Create one first.'); return false; }
    const wfSteps = getStepsFor(wf.id);
    if (!wfSteps.length) { toast.error('Workflow has no steps configured.'); return false; }

    // Optional budget validation
    if (req.budget_gl_account_id) {
      const fy = new Date().getFullYear();
      const b = budgets.find(x => x.gl_account_id === req.budget_gl_account_id && x.fiscal_year === fy);
      if (b) {
        const available = Number(b.allocated) - Number(b.committed) - Number(b.spent);
        if (available < req.estimated_total && !req.is_emergency) {
          toast.error('Insufficient budget', { description: `Available ${available.toFixed(2)} < requested ${req.estimated_total.toFixed(2)}` });
          return false;
        }
      }
    }

    await sb.from('requisitions').update({
      status: 'pending_approval', workflow_id: wf.id, current_step: 1,
    }).eq('id', req.id);
    await sb.from('req_approval_logs').insert({
      requisition_id: req.id, step_order: 0, step_name: 'Submitted', approver_name: actor, action: 'submit',
    });
    await sb.from('req_notifications').insert({
      user_role: wfSteps[0].approver_role, branch_id: req.branch_id,
      kind: 'approval_request', title: `Approval needed: ${req.req_number}`,
      body: `${req.title} — ${req.estimated_total.toFixed(2)}`, link: '/requisitions', ref_id: req.id,
    });
    toast.success('Submitted for approval'); await fetchAll(); return true;
  };

  const actOnApproval = async (
    req: Requisition, action: 'approve' | 'reject' | 'return' | 'comment',
    actorName: string, actorRole: string, comment: string,
  ) => {
    const wfSteps = req.workflow_id ? getStepsFor(req.workflow_id) : [];
    const currentStep = wfSteps.find(s => s.step_order === req.current_step);
    await sb.from('req_approval_logs').insert({
      requisition_id: req.id, step_order: req.current_step,
      step_name: currentStep?.step_name, approver_role: actorRole, approver_name: actorName,
      action, comment,
    });

    if (action === 'comment') { await fetchAll(); return true; }

    if (action === 'reject') {
      await sb.from('requisitions').update({ status: 'rejected' }).eq('id', req.id);
      await sb.from('req_notifications').insert({
        user_name: req.requester_name, branch_id: req.branch_id,
        kind: 'rejected', title: `Rejected: ${req.req_number}`, body: comment, link: '/requisitions', ref_id: req.id,
      });
      toast.success('Requisition rejected'); await fetchAll(); return true;
    }

    if (action === 'return') {
      await sb.from('requisitions').update({ status: 'returned', current_step: 0 }).eq('id', req.id);
      await sb.from('req_notifications').insert({
        user_name: req.requester_name, branch_id: req.branch_id,
        kind: 'returned', title: `Returned: ${req.req_number}`, body: comment, link: '/requisitions', ref_id: req.id,
      });
      toast.success('Returned for correction'); await fetchAll(); return true;
    }

    // approve
    const nextStep = wfSteps.find(s => s.step_order === req.current_step + 1);
    if (nextStep) {
      await sb.from('requisitions').update({ current_step: req.current_step + 1, status: 'pending_approval' }).eq('id', req.id);
      await sb.from('req_notifications').insert({
        user_role: nextStep.approver_role, branch_id: req.branch_id,
        kind: 'approval_request', title: `Approval needed: ${req.req_number}`,
        body: `${req.title} — Step ${nextStep.step_order}: ${nextStep.step_name}`,
        link: '/requisitions', ref_id: req.id,
      });
    } else {
      // Final approval — commit budget
      await sb.from('requisitions').update({ status: 'approved', current_step: req.current_step + 1 }).eq('id', req.id);
      if (req.budget_gl_account_id) {
        const fy = new Date().getFullYear();
        const b = budgets.find(x => x.gl_account_id === req.budget_gl_account_id && x.fiscal_year === fy);
        if (b) {
          await sb.from('req_budgets').update({ committed: Number(b.committed) + Number(req.estimated_total) }).eq('id', b.id);
        }
      }
      await sb.from('req_notifications').insert({
        user_name: req.requester_name, branch_id: req.branch_id,
        kind: 'approved', title: `Approved: ${req.req_number}`,
        body: 'Ready for procurement.', link: '/requisitions', ref_id: req.id,
      });
    }
    toast.success('Approved'); await fetchAll(); return true;
  };

  const cloneRequisition = async (req: Requisition, actor: string) => {
    const lines = getItemsFor(req.id).map(({ id, requisition_id, ...rest }) => rest);
    return createRequisition({
      branch_id: req.branch_id, department: req.department, requester_id: null, requester_name: actor,
      title: req.title + ' (copy)', justification: req.justification, priority: req.priority,
      is_emergency: req.is_emergency, required_by: null, budget_gl_account_id: req.budget_gl_account_id,
      suggested_supplier: req.suggested_supplier, estimated_total: req.estimated_total,
      currency: req.currency, status: 'draft', parent_req_id: req.id, recurrence_rule: null, notes: req.notes,
    }, lines);
  };

  // ---------- Workflows ----------
  const createWorkflow = async (wf: Omit<ApprovalWorkflow, 'id'>, wfSteps: Omit<WorkflowStep, 'id' | 'workflow_id'>[]) => {
    const { data, error } = await sb.from('req_approval_workflows').insert(wf).select().single();
    if (error) { toast.error('Failed: ' + error.message); return false; }
    if (wfSteps.length) {
      await sb.from('req_workflow_steps').insert(wfSteps.map(s => ({ ...s, workflow_id: data.id })));
    }
    toast.success('Workflow created'); await fetchAll(); return true;
  };

  const deleteWorkflow = async (id: string) => {
    await sb.from('req_workflow_steps').delete().eq('workflow_id', id);
    await sb.from('req_approval_workflows').delete().eq('id', id);
    toast.success('Workflow deleted'); await fetchAll(); return true;
  };

  // ---------- Budgets ----------
  const upsertBudget = async (b: Omit<ReqBudget, 'id' | 'committed' | 'spent'> & { id?: string }) => {
    if (b.id) {
      await sb.from('req_budgets').update(b).eq('id', b.id);
    } else {
      await sb.from('req_budgets').insert(b);
    }
    toast.success('Budget saved'); await fetchAll(); return true;
  };

  const deleteBudget = async (id: string) => {
    await sb.from('req_budgets').delete().eq('id', id);
    toast.success('Budget deleted'); await fetchAll(); return true;
  };

  // ---------- Quotations ----------
  const addQuotation = async (q: Omit<Quotation, 'id' | 'is_selected'>) => {
    await sb.from('req_quotations').insert({ ...q, is_selected: false });
    toast.success('Quotation added'); await fetchAll(); return true;
  };

  const selectQuotation = async (reqId: string, quoteId: string) => {
    await sb.from('req_quotations').update({ is_selected: false }).eq('requisition_id', reqId);
    await sb.from('req_quotations').update({ is_selected: true }).eq('id', quoteId);
    toast.success('Supplier selected'); await fetchAll(); return true;
  };

  const deleteQuotation = async (id: string) => {
    await sb.from('req_quotations').delete().eq('id', id);
    await fetchAll(); return true;
  };

  // ---------- Purchase Orders ----------
  const createPOFromRequisition = async (req: Requisition, supplierName: string, supplierContact: string, tax: number, paymentTerms: string, deliveryTerms: string, expectedDelivery: string | null, actor: string) => {
    const lines = getItemsFor(req.id);
    const subtotal = lines.reduce((s, l) => s + Number(l.total), 0);
    const total = subtotal + Number(tax || 0);
    const { data, error } = await sb.from('purchase_orders').insert({
      requisition_id: req.id, branch_id: req.branch_id, supplier_name: supplierName,
      supplier_contact: supplierContact, subtotal, tax, total,
      payment_terms: paymentTerms, delivery_terms: deliveryTerms, expected_delivery: expectedDelivery,
      status: 'draft', issued_by: actor,
    }).select().single();
    if (error) { toast.error('Failed: ' + error.message); return null; }
    if (lines.length) {
      await sb.from('purchase_order_items').insert(lines.map(l => ({
        po_id: data.id, item_name: l.item_name, qty: l.qty, unit: l.unit, unit_price: l.unit_price, total: l.total,
      })));
    }
    await sb.from('requisitions').update({ status: 'procurement' }).eq('id', req.id);
    toast.success(`PO ${data.po_number} created`); await fetchAll(); return data;
  };

  const sendPO = async (po: PurchaseOrder, actor: string) => {
    await sb.from('purchase_orders').update({ status: 'sent', issued_at: new Date().toISOString(), issued_by: actor }).eq('id', po.id);
    if (po.requisition_id) await sb.from('requisitions').update({ status: 'ordered' }).eq('id', po.requisition_id);
    toast.success(`PO ${po.po_number} sent`); await fetchAll(); return true;
  };

  const cancelPO = async (po: PurchaseOrder) => {
    await sb.from('purchase_orders').update({ status: 'cancelled' }).eq('id', po.id);
    toast.success('PO cancelled'); await fetchAll(); return true;
  };

  // ---------- GRN ----------
  const createGRN = async (po: PurchaseOrder, lines: { po_item_id: string; item_name: string; qty_received: number; condition: string; }[], warehouseId: string | null, receivedBy: string, notes: string) => {
    const { data, error } = await sb.from('goods_received_notes').insert({
      po_id: po.id, warehouse_id: warehouseId, branch_id: po.branch_id,
      received_by: receivedBy, status: 'received', notes,
    }).select().single();
    if (error) { toast.error('Failed: ' + error.message); return false; }
    await sb.from('grn_items').insert(lines.map(l => ({ ...l, grn_id: data.id })));
    // Update qty received on PO items
    for (const l of lines) {
      const cur = poItems.find(p => p.id === l.po_item_id);
      if (cur) {
        await sb.from('purchase_order_items').update({ qty_received: Number(cur.qty_received) + Number(l.qty_received) }).eq('id', cur.id);
      }
    }
    // Recalc PO status
    const updatedItems = poItems.filter(p => p.po_id === po.id).map(p => {
      const inc = lines.find(l => l.po_item_id === p.id)?.qty_received || 0;
      return { ...p, qty_received: Number(p.qty_received) + Number(inc) };
    });
    const allReceived = updatedItems.every(p => p.qty_received >= p.qty);
    const anyReceived = updatedItems.some(p => p.qty_received > 0);
    const newStatus = allReceived ? 'received' : (anyReceived ? 'partial' : po.status);
    await sb.from('purchase_orders').update({ status: newStatus }).eq('id', po.id);
    if (allReceived && po.requisition_id) {
      await sb.from('requisitions').update({ status: 'received' }).eq('id', po.requisition_id);
    }
    // Inventory integration: post receipts
    for (const l of lines) {
      if (l.qty_received > 0) {
        await sb.from('inventory_receipts').insert({
          branch_id: po.branch_id, item_name: l.item_name, category: 'general',
          quantity: l.qty_received, unit: 'units', received_by: receivedBy,
          warehouse_id: warehouseId, status: 'approved',
          supplier_source: po.supplier_name, reference_number: data.grn_number, notes: 'Auto from GRN',
        });
      }
    }
    toast.success(`GRN ${data.grn_number} recorded`); await fetchAll(); return true;
  };

  // ---------- Notifications ----------
  const markNotificationRead = async (id: string) => {
    await sb.from('req_notifications').update({ is_read: true }).eq('id', id);
    await fetchAll(); return true;
  };

  return {
    loading, requisitions, items, workflows, steps, logs, budgets, quotations, pos, poItems, grns, notifications,
    getItemsFor, getLogsFor, getStepsFor, getQuotesFor, getPOItemsFor, getGRNsFor, pickWorkflow,
    createRequisition, updateRequisition, deleteRequisition, submitRequisition, actOnApproval, cloneRequisition,
    createWorkflow, deleteWorkflow,
    upsertBudget, deleteBudget,
    addQuotation, selectQuotation, deleteQuotation,
    createPOFromRequisition, sendPO, cancelPO,
    createGRN, markNotificationRead,
    refetch: fetchAll,
  };
};