import { useState } from 'react';
import { useInventoryIssues } from '@/hooks/useInventoryTransactions';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  completed: 'bg-primary/10 text-primary',
};

const IssueItems = () => {
  const { issues, isLoading, createIssue, updateIssueStatus } = useInventoryIssues();
  const { warehouses } = useWarehouses();
  const branchId = useCurrentBranchId();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: '', category: 'general', quantity: 1, unit: 'units',
    recipient_name: '', from_warehouse_id: '', to_warehouse_id: '', purpose: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !user) return;
    const refNum = `ISS-${Date.now().toString(36).toUpperCase()}`;
    createIssue.mutate({
      ...form,
      branch_id: branchId,
      issuer_name: user.name,
      reference_number: refNum,
      from_warehouse_id: form.from_warehouse_id || null,
      to_warehouse_id: form.to_warehouse_id || null,
    });
    setIsOpen(false);
    setForm({ item_name: '', category: 'general', quantity: 1, unit: 'units', recipient_name: '', from_warehouse_id: '', to_warehouse_id: '', purpose: '', notes: '' });
  };

  const canApprove = user?.role === 'super_admin' || user?.role === 'branch_manager';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Issue Items</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Issue</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Issue Inventory Item</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input className="input-farm" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="input-farm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['general', 'seeds', 'fertilizers', 'chemicals', 'feed', 'machinery', 'tools'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" className="input-farm" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} min={1} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input className="input-farm" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name</label>
                <input className="input-farm" value={form.recipient_name} onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">From Warehouse</label>
                  <select className="input-farm" value={form.from_warehouse_id} onChange={e => setForm(f => ({ ...f, from_warehouse_id: e.target.value }))}>
                    <option value="">— Select —</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Warehouse</label>
                  <select className="input-farm" value={form.to_warehouse_id} onChange={e => setForm(f => ({ ...f, to_warehouse_id: e.target.value }))}>
                    <option value="">— Select —</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <input className="input-farm" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="input-farm min-h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Submit for Approval</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Issuer</th>
                  <th>Recipient</th>
                  <th>Date</th>
                  <th>Status</th>
                  {canApprove && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr><td colSpan={canApprove ? 8 : 7} className="text-center text-muted-foreground py-6">No issue records yet</td></tr>
                ) : issues.map((i: any) => (
                  <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                    <td className="font-mono text-xs">{i.reference_number || '—'}</td>
                    <td className="font-medium">{i.item_name}</td>
                    <td>{i.quantity} {i.unit}</td>
                    <td>{i.issuer_name}</td>
                    <td>{i.recipient_name}</td>
                    <td className="text-muted-foreground">{i.issue_date}</td>
                    <td><Badge className={cn('capitalize', statusColors[i.status])}>{i.status}</Badge></td>
                    {canApprove && (
                      <td>
                        {i.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => updateIssueStatus.mutate({ id: i.id, status: 'approved', approved_by: user?.name })} className="p-1 rounded hover:bg-success/20 text-success"><Check className="h-4 w-4" /></button>
                            <button onClick={() => updateIssueStatus.mutate({ id: i.id, status: 'rejected', approved_by: user?.name })} className="p-1 rounded hover:bg-destructive/20 text-destructive"><X className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueItems;
