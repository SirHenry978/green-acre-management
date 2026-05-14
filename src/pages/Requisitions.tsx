import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRequisitions, Requisition, RequisitionItem, PurchaseOrder } from '@/hooks/useRequisitions';
import { useGLAccounts } from '@/hooks/useGLAccounts';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Send, Check, X, RotateCcw, Copy, ShoppingCart, PackageCheck, FileText, ClipboardList, GitBranch, Wallet, Inbox, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-500/15 text-blue-600',
  pending_approval: 'bg-amber-500/15 text-amber-600',
  approved: 'bg-emerald-500/15 text-emerald-600',
  rejected: 'bg-destructive/15 text-destructive',
  returned: 'bg-orange-500/15 text-orange-600',
  procurement: 'bg-indigo-500/15 text-indigo-600',
  ordered: 'bg-purple-500/15 text-purple-600',
  received: 'bg-teal-500/15 text-teal-600',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/15 text-blue-600',
  high: 'bg-amber-500/15 text-amber-600',
  urgent: 'bg-destructive/15 text-destructive',
};

// Permissions per role (UI-level)
const can = (role: string | undefined) => ({
  create: true,
  approve: ['super_admin', 'branch_manager', 'accountant'].includes(role || ''),
  procurement: ['super_admin', 'branch_manager', 'inventory_staff'].includes(role || ''),
  receive: ['super_admin', 'branch_manager', 'inventory_staff'].includes(role || ''),
  budgets: ['super_admin', 'branch_manager', 'accountant'].includes(role || ''),
  workflows: ['super_admin', 'branch_manager'].includes(role || ''),
  delete: ['super_admin', 'branch_manager'].includes(role || ''),
});

const Requisitions = () => {
  const { user, branch } = useAuth();
  const r = useRequisitions();
  const { accounts } = useGLAccounts();
  const { warehouses } = useWarehouses();
  const perms = can(user?.role);
  const [activeTab, setActiveTab] = useState('inbox');

  // ----- Stats -----
  const stats = useMemo(() => {
    const total = r.requisitions.length;
    const pending = r.requisitions.filter(x => x.status === 'pending_approval').length;
    const approved = r.requisitions.filter(x => x.status === 'approved').length;
    const totalSpend = r.pos.reduce((s, p) => s + Number(p.total), 0);
    return { total, pending, approved, totalSpend };
  }, [r.requisitions, r.pos]);

  const myInbox = useMemo(() => {
    if (!perms.approve) return [];
    return r.requisitions.filter(req => req.status === 'pending_approval');
  }, [r.requisitions, perms.approve]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Requisition Management</h1>
            <p className="text-sm text-muted-foreground">
              {branch ? `${branch.name} branch` : 'All branches'} · {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Requisitions" value={stats.total} icon={<ClipboardList className="h-4 w-4" />} />
          <KpiCard label="Pending Approval" value={stats.pending} icon={<Inbox className="h-4 w-4" />} accent="amber" />
          <KpiCard label="Approved" value={stats.approved} icon={<Check className="h-4 w-4" />} accent="emerald" />
          <KpiCard label="PO Spend" value={`$${stats.totalSpend.toFixed(2)}`} icon={<ShoppingCart className="h-4 w-4" />} accent="indigo" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="inline-flex">
              <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-2" />My Inbox</TabsTrigger>
              <TabsTrigger value="requisitions"><ClipboardList className="h-4 w-4 mr-2" />Requisitions</TabsTrigger>
              {perms.procurement && <TabsTrigger value="pos"><ShoppingCart className="h-4 w-4 mr-2" />Purchase Orders</TabsTrigger>}
              {perms.receive && <TabsTrigger value="grn"><PackageCheck className="h-4 w-4 mr-2" />Goods Received</TabsTrigger>}
              {perms.budgets && <TabsTrigger value="budgets"><Wallet className="h-4 w-4 mr-2" />Budgets</TabsTrigger>}
              {perms.workflows && <TabsTrigger value="workflows"><GitBranch className="h-4 w-4 mr-2" />Workflows</TabsTrigger>}
              <TabsTrigger value="reports"><BarChart3 className="h-4 w-4 mr-2" />Reports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inbox" className="mt-4">
            <ApprovalsInbox r={r} myInbox={myInbox} actor={user?.name || ''} role={user?.role || ''} canApprove={perms.approve} />
          </TabsContent>

          <TabsContent value="requisitions" className="mt-4">
            <RequisitionsTab r={r} accounts={accounts} actor={user?.name || ''} branchId={branch?.id || user?.branchId} canDelete={perms.delete} />
          </TabsContent>

          {perms.procurement && (
            <TabsContent value="pos" className="mt-4">
              <PurchaseOrdersTab r={r} actor={user?.name || ''} />
            </TabsContent>
          )}

          {perms.receive && (
            <TabsContent value="grn" className="mt-4">
              <GRNTab r={r} warehouses={warehouses as any[]} actor={user?.name || ''} />
            </TabsContent>
          )}

          {perms.budgets && (
            <TabsContent value="budgets" className="mt-4">
              <BudgetsTab r={r} accounts={accounts} branchId={branch?.id || user?.branchId} />
            </TabsContent>
          )}

          {perms.workflows && (
            <TabsContent value="workflows" className="mt-4">
              <WorkflowsTab r={r} branchId={branch?.id || user?.branchId} />
            </TabsContent>
          )}

          <TabsContent value="reports" className="mt-4">
            <ReportsTab r={r} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// ====================== Sub-components ======================

const KpiCard = ({ label, value, icon, accent }: { label: string; value: any; icon: React.ReactNode; accent?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${accent || 'primary'}-500/10`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant="secondary" className={STATUS_COLORS[status] || ''}>{status.replace('_', ' ')}</Badge>
);

// ----- Requisitions Tab -----
const RequisitionsTab = ({ r, accounts, actor, branchId, canDelete }: any) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Requisition | null>(null);
  const [detail, setDetail] = useState<Requisition | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Requisitions</CardTitle>
          <CardDescription>Create, edit, submit, and track requisitions.</CardDescription>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />New Requisition</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {r.requisitions.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No requisitions yet.</TableCell></TableRow>
              ) : r.requisitions.map((req: Requisition) => (
                <TableRow key={req.id} className="cursor-pointer" onClick={() => setDetail(req)}>
                  <TableCell className="font-mono text-xs">{req.req_number}</TableCell>
                  <TableCell className="font-medium">{req.title}{req.is_emergency && <Badge variant="destructive" className="ml-2">Emergency</Badge>}</TableCell>
                  <TableCell>{req.department || '—'}</TableCell>
                  <TableCell>{req.requester_name}</TableCell>
                  <TableCell className="text-right">${Number(req.estimated_total).toFixed(2)}</TableCell>
                  <TableCell><Badge className={PRIORITY_COLORS[req.priority]}>{req.priority}</Badge></TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {req.status === 'draft' && (
                        <Button size="sm" variant="default" onClick={() => r.submitRequisition(req, actor)}>
                          <Send className="h-3 w-3 mr-1" />Submit
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => r.cloneRequisition(req, actor)}><Copy className="h-3 w-3" /></Button>
                      {canDelete && (
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete this requisition?')) r.deleteRequisition(req.id); }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <RequisitionFormDialog
        open={open} onOpenChange={setOpen} editing={editing} r={r} accounts={accounts} actor={actor} branchId={branchId}
      />
      <RequisitionDetailDialog open={!!detail} onOpenChange={() => setDetail(null)} req={detail} r={r} actor={actor} />
    </Card>
  );
};

const RequisitionFormDialog = ({ open, onOpenChange, editing, r, accounts, actor, branchId }: any) => {
  const [form, setForm] = useState({
    title: '', department: '', justification: '', priority: 'medium' as const,
    is_emergency: false, required_by: '', budget_gl_account_id: '', suggested_supplier: '',
    currency: 'USD', notes: '',
  });
  const [lines, setLines] = useState<Array<{ item_name: string; category: string; qty: number; unit: string; unit_price: number; notes: string; total: number }>>([
    { item_name: '', category: 'general', qty: 1, unit: 'units', unit_price: 0, notes: '', total: 0 },
  ]);

  const total = lines.reduce((s, l) => s + Number(l.qty) * Number(l.unit_price), 0);

  const addLine = () => setLines([...lines, { item_name: '', category: 'general', qty: 1, unit: 'units', unit_price: 0, notes: '', total: 0 }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, k: string, v: any) => setLines(lines.map((l, idx) => idx === i ? { ...l, [k]: v, total: k === 'qty' ? Number(v) * l.unit_price : k === 'unit_price' ? l.qty * Number(v) : l.total } : l));

  const submit = async (asDraft: boolean) => {
    if (!form.title.trim()) return;
    const validLines = lines.filter(l => l.item_name.trim());
    if (!validLines.length) return;
    await r.createRequisition({
      branch_id: branchId, department: form.department || null, requester_id: null, requester_name: actor,
      title: form.title, justification: form.justification || null, priority: form.priority,
      is_emergency: form.is_emergency, required_by: form.required_by || null,
      budget_gl_account_id: form.budget_gl_account_id || null, suggested_supplier: form.suggested_supplier || null,
      estimated_total: total, currency: form.currency, status: asDraft ? 'draft' : 'pending_approval',
      parent_req_id: null, recurrence_rule: null, notes: form.notes || null,
    }, validLines.map(l => ({ item_name: l.item_name, category: l.category, qty: l.qty, unit: l.unit, unit_price: l.unit_price, notes: l.notes || null, total: l.qty * l.unit_price })));
    onOpenChange(false);
    setForm({ title: '', department: '', justification: '', priority: 'medium', is_emergency: false, required_by: '', budget_gl_account_id: '', suggested_supplier: '', currency: 'USD', notes: '' });
    setLines([{ item_name: '', category: 'general', qty: 1, unit: 'units', unit_price: 0, notes: '', total: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Requisition</DialogTitle>
          <DialogDescription>Fill in the details and add line items.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
          <div><Label>Required by</Label><Input type="date" value={form.required_by} onChange={e => setForm({ ...form, required_by: e.target.value })} /></div>
          <div><Label>Priority</Label>
            <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Budget GL Account</Label>
            <Select value={form.budget_gl_account_id} onValueChange={v => setForm({ ...form, budget_gl_account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select GL account" /></SelectTrigger>
              <SelectContent>
                {accounts.filter((a: any) => a.account_type === 'expense').map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>{a.account_code} — {a.account_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Suggested Supplier</Label><Input value={form.suggested_supplier} onChange={e => setForm({ ...form, suggested_supplier: e.target.value })} /></div>
          <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_emergency} onCheckedChange={v => setForm({ ...form, is_emergency: v })} /><Label>Emergency requisition</Label></div>
          <div className="md:col-span-2"><Label>Justification</Label><Textarea value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })} rows={2} /></div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Line Items</h4>
            <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 mr-1" />Add line</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead><TableHead>Total</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell><Input value={l.item_name} onChange={e => updateLine(i, 'item_name', e.target.value)} /></TableCell>
                    <TableCell className="w-20"><Input type="number" value={l.qty} onChange={e => updateLine(i, 'qty', Number(e.target.value))} /></TableCell>
                    <TableCell className="w-24"><Input value={l.unit} onChange={e => updateLine(i, 'unit', e.target.value)} /></TableCell>
                    <TableCell className="w-28"><Input type="number" value={l.unit_price} onChange={e => updateLine(i, 'unit_price', Number(e.target.value))} /></TableCell>
                    <TableCell className="w-24 text-right">${(l.qty * l.unit_price).toFixed(2)}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-right mt-2 font-bold">Estimated Total: ${total.toFixed(2)}</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => submit(true)}>Save as Draft</Button>
          <Button onClick={() => submit(false)}><Send className="h-4 w-4 mr-2" />Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RequisitionDetailDialog = ({ open, onOpenChange, req, r, actor }: any) => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quote, setQuote] = useState({ supplier_name: '', supplier_contact: '', quoted_total: 0, lead_time_days: 7, notes: '' });
  if (!req) return null;
  const items = r.getItemsFor(req.id);
  const logs = r.getLogsFor(req.id);
  const quotes = r.getQuotesFor(req.id);
  const wfSteps = req.workflow_id ? r.getStepsFor(req.workflow_id) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{req.req_number} <StatusBadge status={req.status} /></DialogTitle>
          <DialogDescription>{req.title}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div><Label className="text-xs">Requester</Label><div>{req.requester_name}</div></div>
          <div><Label className="text-xs">Department</Label><div>{req.department || '—'}</div></div>
          <div><Label className="text-xs">Required by</Label><div>{req.required_by || '—'}</div></div>
          <div><Label className="text-xs">Priority</Label><div><Badge className={PRIORITY_COLORS[req.priority]}>{req.priority}</Badge></div></div>
          <div><Label className="text-xs">Estimated</Label><div className="font-bold">${Number(req.estimated_total).toFixed(2)}</div></div>
          <div><Label className="text-xs">Emergency</Label><div>{req.is_emergency ? 'Yes' : 'No'}</div></div>
        </div>
        {req.justification && <div className="text-sm bg-muted p-3 rounded"><strong>Justification:</strong> {req.justification}</div>}

        <div>
          <h4 className="font-semibold text-sm mb-2">Items</h4>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Unit Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((it: RequisitionItem) => (
                <TableRow key={it.id}><TableCell>{it.item_name}</TableCell><TableCell>{it.qty} {it.unit}</TableCell><TableCell>${Number(it.unit_price).toFixed(2)}</TableCell><TableCell className="text-right">${Number(it.total).toFixed(2)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {wfSteps.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Approval Progress</h4>
            <div className="flex flex-wrap gap-2">
              {wfSteps.map((s: any) => {
                const isDone = req.current_step > s.step_order;
                const isCurrent = req.current_step === s.step_order;
                return (
                  <div key={s.id} className={`px-3 py-1.5 rounded-full text-xs border ${isDone ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : isCurrent ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
                    {s.step_order}. {s.step_name} ({s.approver_role})
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Quotations</h4>
            <Button size="sm" variant="outline" onClick={() => setQuoteOpen(true)}><Plus className="h-3 w-3 mr-1" />Add quote</Button>
          </div>
          {quotes.length === 0 ? <p className="text-xs text-muted-foreground">No quotations yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Total</TableHead><TableHead>Lead time</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {quotes.map((q: any) => (
                  <TableRow key={q.id} className={q.is_selected ? 'bg-emerald-500/5' : ''}>
                    <TableCell>{q.supplier_name}{q.is_selected && <Badge className="ml-2">Selected</Badge>}</TableCell>
                    <TableCell>${Number(q.quoted_total).toFixed(2)}</TableCell>
                    <TableCell>{q.lead_time_days} days</TableCell>
                    <TableCell className="text-right">
                      {!q.is_selected && <Button size="sm" variant="outline" onClick={() => r.selectQuotation(req.id, q.id)}>Select</Button>}
                      <Button size="sm" variant="ghost" onClick={() => r.deleteQuotation(q.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">Activity / Audit</h4>
          {logs.length === 0 ? <p className="text-xs text-muted-foreground">No activity yet.</p> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logs.map((l: any) => (
                <div key={l.id} className="text-xs border-l-2 border-primary pl-3 py-1">
                  <div className="font-semibold">{l.action.toUpperCase()} · {l.step_name || `Step ${l.step_order}`} · {l.approver_name || '—'}</div>
                  {l.comment && <div className="text-muted-foreground">{l.comment}</div>}
                  <div className="text-muted-foreground/70">{new Date(l.acted_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add quote inline */}
        {quoteOpen && (
          <div className="border rounded p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Supplier</Label><Input value={quote.supplier_name} onChange={e => setQuote({ ...quote, supplier_name: e.target.value })} /></div>
              <div><Label className="text-xs">Contact</Label><Input value={quote.supplier_contact} onChange={e => setQuote({ ...quote, supplier_contact: e.target.value })} /></div>
              <div><Label className="text-xs">Total</Label><Input type="number" value={quote.quoted_total} onChange={e => setQuote({ ...quote, quoted_total: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Lead time (days)</Label><Input type="number" value={quote.lead_time_days} onChange={e => setQuote({ ...quote, lead_time_days: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label className="text-xs">Notes</Label><Input value={quote.notes} onChange={e => setQuote({ ...quote, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setQuoteOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={async () => { if (!quote.supplier_name) return; await r.addQuotation({ requisition_id: req.id, supplier_name: quote.supplier_name, supplier_contact: quote.supplier_contact, quoted_total: quote.quoted_total, lead_time_days: quote.lead_time_days, valid_until: null, notes: quote.notes, attachment_path: null } as any); setQuote({ supplier_name: '', supplier_contact: '', quoted_total: 0, lead_time_days: 7, notes: '' }); setQuoteOpen(false); }}>Save</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ----- Approvals Inbox -----
const ApprovalsInbox = ({ r, myInbox, actor, role, canApprove }: any) => {
  const [comment, setComment] = useState('');
  const [target, setTarget] = useState<Requisition | null>(null);

  if (!canApprove) {
    return (
      <Card><CardContent className="p-8 text-center text-muted-foreground">You don't have approval permissions for this branch.</CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Pending Approvals</CardTitle><CardDescription>Approve, reject, return, or comment on requisitions awaiting your decision.</CardDescription></CardHeader>
      <CardContent>
        {myInbox.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Inbox is empty.</div>
        ) : (
          <div className="space-y-2">
            {myInbox.map((req: Requisition) => {
              const wfSteps = req.workflow_id ? r.getStepsFor(req.workflow_id) : [];
              const cur = wfSteps.find((s: any) => s.step_order === req.current_step);
              return (
                <div key={req.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-semibold">{req.req_number} · {req.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {req.requester_name} · {req.department || '—'} · ${Number(req.estimated_total).toFixed(2)}
                        {cur && ` · Step ${cur.step_order}: ${cur.step_name} (${cur.approver_role})`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => { setTarget(req); }}>Review</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={!!target} onOpenChange={() => { setTarget(null); setComment(''); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Review {target?.req_number}</DialogTitle><DialogDescription>{target?.title}</DialogDescription></DialogHeader>
            <div className="text-sm space-y-2">
              <div><strong>Estimated:</strong> ${Number(target?.estimated_total || 0).toFixed(2)}</div>
              <div><strong>Justification:</strong> {target?.justification || '—'}</div>
              <div>
                <Label>Comment</Label>
                <Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={async () => { if (target) { await r.actOnApproval(target, 'return', actor, role, comment); setTarget(null); setComment(''); } }}><RotateCcw className="h-4 w-4 mr-2" />Return</Button>
              <Button variant="destructive" onClick={async () => { if (target) { await r.actOnApproval(target, 'reject', actor, role, comment); setTarget(null); setComment(''); } }}><X className="h-4 w-4 mr-2" />Reject</Button>
              <Button onClick={async () => { if (target) { await r.actOnApproval(target, 'approve', actor, role, comment); setTarget(null); setComment(''); } }}><Check className="h-4 w-4 mr-2" />Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// ----- Purchase Orders Tab -----
const PurchaseOrdersTab = ({ r, actor }: any) => {
  const approved = r.requisitions.filter((x: Requisition) => x.status === 'approved' || x.status === 'procurement');
  const [target, setTarget] = useState<Requisition | null>(null);
  const [poForm, setPOForm] = useState({ supplier_name: '', supplier_contact: '', tax: 0, payment_terms: 'Net 30', delivery_terms: 'FOB', expected_delivery: '' });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Approved Requisitions Ready for PO</CardTitle></CardHeader>
        <CardContent>
          {approved.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Title</TableHead><TableHead>Total</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {approved.map((req: Requisition) => {
                  const hasPO = r.pos.some((p: PurchaseOrder) => p.requisition_id === req.id);
                  const selectedQuote = r.getQuotesFor(req.id).find((q: any) => q.is_selected);
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.req_number}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>${Number(req.estimated_total).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {hasPO ? <Badge variant="secondary">PO created</Badge> : (
                          <Button size="sm" onClick={() => { setTarget(req); setPOForm({ ...poForm, supplier_name: selectedQuote?.supplier_name || req.suggested_supplier || '', supplier_contact: selectedQuote?.supplier_contact || '' }); }}>Create PO</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {r.pos.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No POs yet.</TableCell></TableRow> :
                r.pos.map((po: PurchaseOrder) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.po_number}</TableCell>
                    <TableCell>{po.supplier_name}</TableCell>
                    <TableCell>${Number(po.total).toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={po.status} /></TableCell>
                    <TableCell className="text-right">
                      {po.status === 'draft' && <Button size="sm" onClick={() => r.sendPO(po, actor)}><Send className="h-3 w-3 mr-1" />Send</Button>}
                      {!['received', 'cancelled', 'closed'].includes(po.status) && <Button size="sm" variant="ghost" onClick={() => r.cancelPO(po)}>Cancel</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={() => setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle><DialogDescription>For {target?.req_number} — {target?.title}</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Supplier *</Label><Input value={poForm.supplier_name} onChange={e => setPOForm({ ...poForm, supplier_name: e.target.value })} /></div>
            <div className="col-span-2"><Label>Supplier contact</Label><Input value={poForm.supplier_contact} onChange={e => setPOForm({ ...poForm, supplier_contact: e.target.value })} /></div>
            <div><Label>Tax</Label><Input type="number" value={poForm.tax} onChange={e => setPOForm({ ...poForm, tax: Number(e.target.value) })} /></div>
            <div><Label>Expected delivery</Label><Input type="date" value={poForm.expected_delivery} onChange={e => setPOForm({ ...poForm, expected_delivery: e.target.value })} /></div>
            <div><Label>Payment terms</Label><Input value={poForm.payment_terms} onChange={e => setPOForm({ ...poForm, payment_terms: e.target.value })} /></div>
            <div><Label>Delivery terms</Label><Input value={poForm.delivery_terms} onChange={e => setPOForm({ ...poForm, delivery_terms: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={async () => { if (target && poForm.supplier_name) { await r.createPOFromRequisition(target, poForm.supplier_name, poForm.supplier_contact, poForm.tax, poForm.payment_terms, poForm.delivery_terms, poForm.expected_delivery || null, actor); setTarget(null); } }}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ----- GRN Tab -----
const GRNTab = ({ r, warehouses, actor }: any) => {
  const openPOs = r.pos.filter((p: PurchaseOrder) => ['sent', 'partial'].includes(p.status));
  const [target, setTarget] = useState<PurchaseOrder | null>(null);
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [linesState, setLinesState] = useState<Record<string, { qty: number; condition: string }>>({});

  const openModal = (po: PurchaseOrder) => {
    setTarget(po);
    const items = r.getPOItemsFor(po.id);
    const init: any = {};
    items.forEach((it: any) => { init[it.id] = { qty: Math.max(Number(it.qty) - Number(it.qty_received), 0), condition: 'good' }; });
    setLinesState(init);
  };

  const submit = async () => {
    if (!target) return;
    const items = r.getPOItemsFor(target.id);
    const lines = items.filter((it: any) => (linesState[it.id]?.qty || 0) > 0).map((it: any) => ({
      po_item_id: it.id, item_name: it.item_name, qty_received: linesState[it.id].qty, condition: linesState[it.id].condition,
    }));
    if (!lines.length) return;
    await r.createGRN(target, lines, warehouseId || null, actor, notes);
    setTarget(null); setWarehouseId(''); setNotes('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Open Purchase Orders</CardTitle><CardDescription>Receive goods and post to inventory.</CardDescription></CardHeader>
        <CardContent>
          {openPOs.length === 0 ? <p className="text-sm text-muted-foreground">No POs awaiting receipt.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {openPOs.map((po: PurchaseOrder) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.po_number}</TableCell>
                    <TableCell>{po.supplier_name}</TableCell>
                    <TableCell><StatusBadge status={po.status} /></TableCell>
                    <TableCell className="text-right"><Button size="sm" onClick={() => openModal(po)}>Receive</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Goods Received Notes</CardTitle></CardHeader>
        <CardContent>
          {r.grns.length === 0 ? <p className="text-sm text-muted-foreground">No GRNs yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>GRN #</TableHead><TableHead>PO</TableHead><TableHead>Date</TableHead><TableHead>Received by</TableHead></TableRow></TableHeader>
              <TableBody>
                {r.grns.map((g: any) => {
                  const po = r.pos.find((p: any) => p.id === g.po_id);
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="font-mono text-xs">{g.grn_number}</TableCell>
                      <TableCell className="font-mono text-xs">{po?.po_number || '—'}</TableCell>
                      <TableCell>{g.received_date}</TableCell>
                      <TableCell>{g.received_by}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={() => setTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Receive Goods — {target?.po_number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Ordered</TableHead><TableHead>Already received</TableHead><TableHead>Receive now</TableHead><TableHead>Condition</TableHead></TableRow></TableHeader>
              <TableBody>
                {target && r.getPOItemsFor(target.id).map((it: any) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.qty} {it.unit}</TableCell>
                    <TableCell>{it.qty_received}</TableCell>
                    <TableCell className="w-24"><Input type="number" value={linesState[it.id]?.qty || 0} onChange={e => setLinesState({ ...linesState, [it.id]: { ...linesState[it.id], qty: Number(e.target.value) } })} /></TableCell>
                    <TableCell className="w-32">
                      <Select value={linesState[it.id]?.condition || 'good'} onValueChange={v => setLinesState({ ...linesState, [it.id]: { ...linesState[it.id], condition: v } })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem><SelectItem value="damaged">Damaged</SelectItem><SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter><Button onClick={submit}>Record GRN</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ----- Budgets Tab -----
const BudgetsTab = ({ r, accounts, branchId }: any) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ department: '', gl_account_id: '', fiscal_year: new Date().getFullYear(), allocated: 0, notes: '' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Budgets</CardTitle><CardDescription>Allocated, committed and spent per GL account & fiscal year.</CardDescription></div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Add budget</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Year</TableHead><TableHead>GL Account</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Allocated</TableHead><TableHead className="text-right">Committed</TableHead><TableHead className="text-right">Spent</TableHead><TableHead className="text-right">Available</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {r.budgets.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No budgets defined.</TableCell></TableRow> :
            r.budgets.map((b: any) => {
              const acc = accounts.find((a: any) => a.id === b.gl_account_id);
              const avail = Number(b.allocated) - Number(b.committed) - Number(b.spent);
              return (
                <TableRow key={b.id}>
                  <TableCell>{b.fiscal_year}</TableCell>
                  <TableCell className="text-xs">{acc ? `${acc.account_code} — ${acc.account_name}` : '—'}</TableCell>
                  <TableCell>{b.department || '—'}</TableCell>
                  <TableCell className="text-right">${Number(b.allocated).toFixed(2)}</TableCell>
                  <TableCell className="text-right text-amber-600">${Number(b.committed).toFixed(2)}</TableCell>
                  <TableCell className="text-right text-blue-600">${Number(b.spent).toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-bold ${avail < 0 ? 'text-destructive' : 'text-emerald-600'}`}>${avail.toFixed(2)}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => r.deleteBudget(b.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Budget</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fiscal year</Label><Input type="number" value={form.fiscal_year} onChange={e => setForm({ ...form, fiscal_year: Number(e.target.value) })} /></div>
            <div><Label>Allocated</Label><Input type="number" value={form.allocated} onChange={e => setForm({ ...form, allocated: Number(e.target.value) })} /></div>
            <div className="col-span-2"><Label>GL Account</Label>
              <Select value={form.gl_account_id} onValueChange={v => setForm({ ...form, gl_account_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select GL account" /></SelectTrigger>
                <SelectContent>
                  {accounts.filter((a: any) => a.account_type === 'expense').map((a: any) => <SelectItem key={a.id} value={a.id}>{a.account_code} — {a.account_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Department (optional)</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
            <div className="col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={async () => { if (!form.gl_account_id) return; await r.upsertBudget({ branch_id: branchId, department: form.department || null, gl_account_id: form.gl_account_id, fiscal_year: form.fiscal_year, allocated: form.allocated, notes: form.notes || null } as any); setOpen(false); setForm({ department: '', gl_account_id: '', fiscal_year: new Date().getFullYear(), allocated: 0, notes: '' }); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ----- Workflows Tab -----
const WorkflowsTab = ({ r, branchId }: any) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', min_amount: 0, max_amount: '', is_default: true });
  const [steps, setSteps] = useState<Array<{ step_order: number; step_name: string; approver_role: string; sla_hours: number }>>([
    { step_order: 1, step_name: 'Department Head', approver_role: 'branch_manager', sla_hours: 24 },
    { step_order: 2, step_name: 'Finance Review', approver_role: 'accountant', sla_hours: 48 },
  ]);

  const addStep = () => setSteps([...steps, { step_order: steps.length + 1, step_name: '', approver_role: 'branch_manager', sla_hours: 24 }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step_order: idx + 1 })));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Approval Workflows</CardTitle><CardDescription>Configure multi-level approval chains.</CardDescription></div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />New Workflow</Button>
      </CardHeader>
      <CardContent>
        {r.workflows.length === 0 ? <p className="text-sm text-muted-foreground">No workflows yet. Create one before submitting requisitions.</p> :
          <div className="space-y-3">
            {r.workflows.map((wf: any) => {
              const wfSteps = r.getStepsFor(wf.id);
              return (
                <div key={wf.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between flex-wrap">
                    <div>
                      <div className="font-semibold">{wf.name} {wf.is_default && <Badge>default</Badge>}</div>
                      <div className="text-xs text-muted-foreground">
                        {wf.department || 'all departments'} · ${wf.min_amount || 0} – {wf.max_amount ? `$${wf.max_amount}` : '∞'}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => r.deleteWorkflow(wf.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {wfSteps.map((s: any) => (
                      <div key={s.id} className="text-xs px-2 py-1 rounded bg-muted">
                        {s.step_order}. {s.step_name} <span className="text-muted-foreground">({s.approver_role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Approval Workflow</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Department (optional)</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
            <div><Label>Min amount</Label><Input type="number" value={form.min_amount} onChange={e => setForm({ ...form, min_amount: Number(e.target.value) })} /></div>
            <div><Label>Max amount (blank = no limit)</Label><Input type="number" value={form.max_amount} onChange={e => setForm({ ...form, max_amount: e.target.value })} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_default} onCheckedChange={v => setForm({ ...form, is_default: v })} /><Label>Default for branch</Label></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold">Steps</h4><Button size="sm" variant="outline" onClick={addStep}><Plus className="h-3 w-3 mr-1" />Add step</Button></div>
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Approver Role</TableHead><TableHead>SLA hrs</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {steps.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.step_order}</TableCell>
                    <TableCell><Input value={s.step_name} onChange={e => setSteps(steps.map((x, idx) => idx === i ? { ...x, step_name: e.target.value } : x))} /></TableCell>
                    <TableCell>
                      <Select value={s.approver_role} onValueChange={v => setSteps(steps.map((x, idx) => idx === i ? { ...x, approver_role: v } : x))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branch_manager">Branch Manager</SelectItem>
                          <SelectItem value="accountant">Accountant / Finance</SelectItem>
                          <SelectItem value="inventory_staff">Procurement / Inventory</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="w-20"><Input type="number" value={s.sla_hours} onChange={e => setSteps(steps.map((x, idx) => idx === i ? { ...x, sla_hours: Number(e.target.value) } : x))} /></TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => removeStep(i)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              if (!form.name || !steps.length) return;
              await r.createWorkflow({
                branch_id: branchId, name: form.name, department: form.department || null,
                min_amount: form.min_amount, max_amount: form.max_amount ? Number(form.max_amount) : null,
                is_active: true, is_default: form.is_default,
              }, steps);
              setOpen(false); setForm({ name: '', department: '', min_amount: 0, max_amount: '', is_default: true });
            }}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ----- Reports Tab -----
const ReportsTab = ({ r }: any) => {
  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    r.requisitions.forEach((req: Requisition) => { m[req.status] = (m[req.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [r.requisitions]);

  const byDept = useMemo(() => {
    const m: Record<string, number> = {};
    r.requisitions.forEach((req: Requisition) => {
      const d = req.department || 'Unspecified';
      m[d] = (m[d] || 0) + Number(req.estimated_total);
    });
    return Object.entries(m).map(([name, total]) => ({ name, total }));
  }, [r.requisitions]);

  const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#14b8a6', '#f97316'];

  const exportCSV = () => {
    const rows = [['Number', 'Title', 'Department', 'Requester', 'Estimated', 'Status', 'Created']];
    r.requisitions.forEach((req: Requisition) => {
      rows.push([req.req_number, req.title, req.department || '', req.requester_name, String(req.estimated_total), req.status, req.created_at]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `requisitions-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCSV}><FileText className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Requisitions by Status</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {byStatus.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Spend by Department</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byDept}>
                <XAxis dataKey="name" /><YAxis />
                <Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Requisitions;