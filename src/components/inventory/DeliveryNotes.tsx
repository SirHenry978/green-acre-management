import { useState } from 'react';
import { useDeliveryNotes } from '@/hooks/useInventoryTransactions';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineItem {
  name: string;
  quantity: number;
  unit: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  confirmed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const DeliveryNotes = () => {
  const { deliveryNotes, isLoading, createDeliveryNote, updateDeliveryNoteStatus } = useDeliveryNotes();
  const { warehouses } = useWarehouses();
  const branchId = useCurrentBranchId();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ supplier: '', warehouse_id: '', notes: '' });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ name: '', quantity: 1, unit: 'units' }]);

  const addLine = () => setLineItems(l => [...l, { name: '', quantity: 1, unit: 'units' }]);
  const removeLine = (i: number) => setLineItems(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, value: any) => {
    setLineItems(l => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !user) return;
    const noteNum = `DN-${Date.now().toString(36).toUpperCase()}`;
    const totalQty = lineItems.reduce((s, l) => s + l.quantity, 0);
    createDeliveryNote.mutate({
      branch_id: branchId,
      note_number: noteNum,
      supplier: form.supplier,
      warehouse_id: form.warehouse_id || null,
      items: lineItems,
      total_quantity: totalQty,
      received_by: user.name,
      notes: form.notes,
    });
    setIsOpen(false);
    setForm({ supplier: '', warehouse_id: '', notes: '' });
    setLineItems([{ name: '', quantity: 1, unit: 'units' }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Delivery Notes</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Delivery Note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Delivery Note</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <input className="input-farm" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warehouse</label>
                  <select className="input-farm" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}>
                    <option value="">— Select —</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Line Items</label>
                  <Button type="button" size="sm" variant="outline" onClick={addLine}>+ Add Line</Button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input placeholder="Item name" className="input-farm" value={item.name} onChange={e => updateLine(i, 'name', e.target.value)} required />
                      </div>
                      <div className="w-20">
                        <input type="number" placeholder="Qty" className="input-farm" value={item.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} min={1} required />
                      </div>
                      <div className="w-20">
                        <input placeholder="Unit" className="input-farm" value={item.unit} onChange={e => updateLine(i, 'unit', e.target.value)} />
                      </div>
                      {lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="input-farm min-h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create Note</Button>
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
                  <th>Note #</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Received By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryNotes.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-6"><FileText className="h-6 w-6 mx-auto mb-1 opacity-50" />No delivery notes yet</td></tr>
                ) : deliveryNotes.map((d: any) => {
                  const items = Array.isArray(d.items) ? d.items : [];
                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="font-mono text-xs">{d.note_number}</td>
                      <td className="font-medium">{d.supplier}</td>
                      <td className="text-sm text-muted-foreground">{items.length} item(s)</td>
                      <td>{d.total_quantity}</td>
                      <td>{d.received_by || '—'}</td>
                      <td className="text-muted-foreground">{d.delivery_date}</td>
                      <td><Badge className={cn('capitalize', statusColors[d.status])}>{d.status}</Badge></td>
                      <td>
                        {d.status === 'draft' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => updateDeliveryNoteStatus.mutate({ id: d.id, status: 'confirmed' })}>Confirm</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateDeliveryNoteStatus.mutate({ id: d.id, status: 'cancelled' })}>Cancel</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNotes;
