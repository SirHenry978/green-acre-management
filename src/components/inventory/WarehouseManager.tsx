import { useState } from 'react';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Warehouse, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const WarehouseManager = () => {
  const { warehouses, isLoading, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const branchId = useCurrentBranchId();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location_description: '', warehouse_type: 'main', capacity: 0 });

  const resetForm = () => {
    setForm({ name: '', location_description: '', warehouse_type: 'main', capacity: 0 });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    if (editingId) {
      updateWarehouse.mutate({ id: editingId, ...form });
    } else {
      createWarehouse.mutate({ ...form, branch_id: branchId });
    }
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (w: any) => {
    setForm({ name: w.name, location_description: w.location_description || '', warehouse_type: w.warehouse_type, capacity: w.capacity || 0 });
    setEditingId(w.id);
    setIsOpen(true);
  };

  const typeColors: Record<string, string> = {
    main: 'bg-primary/10 text-primary',
    sub: 'bg-warning/10 text-warning',
    'cold-storage': 'bg-accent/20 text-accent-foreground',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Warehouses / Locations</h3>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Warehouse</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Warehouse</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="input-farm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location Description</label>
                <input className="input-farm" value={form.location_description} onChange={e => setForm(f => ({ ...f, location_description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="input-farm" value={form.warehouse_type} onChange={e => setForm(f => ({ ...f, warehouse_type: e.target.value }))}>
                    <option value="main">Main Warehouse</option>
                    <option value="sub">Sub Store</option>
                    <option value="cold-storage">Cold Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input type="number" className="input-farm" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" className="flex-1">{editingId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading warehouses...</p>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Warehouse className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No warehouses yet. Add your first warehouse location.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w: any) => (
            <div key={w.id} className="card-farm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{w.name}</h4>
                  {w.location_description && <p className="text-sm text-muted-foreground">{w.location_description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(w)} className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteWarehouse.mutate(w.id)} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge className={cn('capitalize', typeColors[w.warehouse_type] || 'bg-muted')}>{w.warehouse_type}</Badge>
                <Badge className={cn(w.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>{w.status}</Badge>
                {w.capacity > 0 && <span className="text-xs text-muted-foreground">Cap: {w.capacity}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehouseManager;
