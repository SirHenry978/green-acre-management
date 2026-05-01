import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, BedDouble, Package } from 'lucide-react';
import { AccHouse, AccRoom, useAccommodation } from '@/hooks/useAccommodation';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  occupied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  maintenance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface Props {
  houses: AccHouse[];
  rooms: AccRoom[];
  acc: ReturnType<typeof useAccommodation>;
}

export const RoomsManager = ({ houses, rooms, acc }: Props) => {
  const branchId = useCurrentBranchId() || 'default';
  const [houseFilter, setHouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<AccRoom | null>(null);
  const [showAssets, setShowAssets] = useState<AccRoom | null>(null);

  const [form, setForm] = useState({
    house_id: '', room_number: '', capacity: 1, room_type: 'single',
    monthly_charge: 0, condition_status: 'good', status: 'available',
    notes: '', branch_id: branchId,
  });

  const filtered = useMemo(() => rooms.filter(r =>
    (!houseFilter || r.house_id === houseFilter) &&
    (!statusFilter || r.status === statusFilter)
  ), [rooms, houseFilter, statusFilter]);

  const open = (r?: AccRoom) => {
    setEditing(r || null);
    setForm(r ? {
      house_id: r.house_id, room_number: r.room_number, capacity: r.capacity,
      room_type: r.room_type, monthly_charge: r.monthly_charge,
      condition_status: r.condition_status, status: r.status,
      notes: r.notes || '', branch_id: r.branch_id,
    } : {
      house_id: houses[0]?.id || '', room_number: '', capacity: 1, room_type: 'single',
      monthly_charge: 0, condition_status: 'good', status: 'available',
      notes: '', branch_id: branchId,
    });
    setShow(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await acc.updateRoom(editing.id, form) : await acc.createRoom(form as any);
    if (ok) setShow(false);
  };

  const houseName = (id: string) => houses.find(h => h.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2"><BedDouble className="h-5 w-5" />Rooms</h3>
        <Button onClick={() => open()} disabled={houses.length === 0}>
          <Plus className="h-4 w-4 mr-2" />Add Room
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="input-farm w-48" value={houseFilter} onChange={e => setHouseFilter(e.target.value)}>
          <option value="">All Houses</option>
          {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select className="input-farm w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-3 py-2 text-left">Room #</th>
            <th className="px-3 py-2 text-left">House</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-right">Capacity</th>
            <th className="px-3 py-2 text-right">Monthly Charge</th>
            <th className="px-3 py-2 text-center">Condition</th>
            <th className="px-3 py-2 text-center">Status</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{r.room_number}</td>
                <td className="px-3 py-2">{houseName(r.house_id)}</td>
                <td className="px-3 py-2"><Badge variant="outline">{r.room_type}</Badge></td>
                <td className="px-3 py-2 text-right">{r.capacity}</td>
                <td className="px-3 py-2 text-right">{r.monthly_charge.toLocaleString()}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline">{r.condition_status}</Badge></td>
                <td className="px-3 py-2 text-center"><Badge className={statusColors[r.status] || ''}>{r.status}</Badge></td>
                <td className="px-3 py-2 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowAssets(r)} title="Assets"><Package className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => open(r)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => confirm('Delete room?') && acc.deleteRoom(r.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No rooms match filters</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-sm font-medium">House *</label>
                <select required className="input-farm" value={form.house_id} onChange={e => setForm({ ...form, house_id: e.target.value })}>
                  <option value="">Select house</option>
                  {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select></div>
              <div><label className="text-sm font-medium">Room # *</label>
                <Input required value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Capacity</label>
                <Input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} /></div>
              <div><label className="text-sm font-medium">Type</label>
                <select className="input-farm" value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="shared">Shared</option>
                </select></div>
              <div><label className="text-sm font-medium">Monthly Charge</label>
                <Input type="number" value={form.monthly_charge} onChange={e => setForm({ ...form, monthly_charge: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="text-sm font-medium">Condition</label>
                <select className="input-farm" value={form.condition_status} onChange={e => setForm({ ...form, condition_status: e.target.value })}>
                  <option value="good">Good</option>
                  <option value="needs_repair">Needs Repair</option>
                  <option value="damaged">Damaged</option>
                </select></div>
              <div><label className="text-sm font-medium">Status</label>
                <select className="input-farm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select></div>
              <div className="col-span-2"><label className="text-sm font-medium">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Room Assets dialog */}
      <Dialog open={!!showAssets} onOpenChange={o => !o && setShowAssets(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Assets — {showAssets?.room_number}</DialogTitle></DialogHeader>
          {showAssets && <RoomAssetsPanel room={showAssets} acc={acc} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RoomAssetsPanel = ({ room, acc }: { room: AccRoom; acc: ReturnType<typeof useAccommodation> }) => {
  const [form, setForm] = useState({ asset_name: '', asset_type: 'furniture', quantity: 1, condition: 'good', inventory_item_ref: '', notes: '' });
  const items = acc.getAssetsForRoom(room.id);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await acc.createAsset({ ...form, room_id: room.id } as any);
    if (ok) setForm({ asset_name: '', asset_type: 'furniture', quantity: 1, condition: 'good', inventory_item_ref: '', notes: '' });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="grid grid-cols-2 gap-2">
        <Input placeholder="Asset name (e.g. Bed)" required value={form.asset_name} onChange={e => setForm({ ...form, asset_name: e.target.value })} />
        <select className="input-farm" value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}>
          <option value="furniture">Furniture</option>
          <option value="appliance">Appliance</option>
          <option value="fixture">Fixture</option>
          <option value="other">Other</option>
        </select>
        <Input type="number" min={1} placeholder="Qty" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
        <select className="input-farm" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
          <option value="good">Good</option>
          <option value="needs_repair">Needs Repair</option>
          <option value="damaged">Damaged</option>
        </select>
        <Input placeholder="Inventory ref (optional)" value={form.inventory_item_ref} onChange={e => setForm({ ...form, inventory_item_ref: e.target.value })} />
        <Button type="submit"><Plus className="h-4 w-4 mr-1" />Add Asset</Button>
      </form>

      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          <th className="px-2 py-2 text-left">Asset</th>
          <th className="px-2 py-2 text-left">Type</th>
          <th className="px-2 py-2 text-right">Qty</th>
          <th className="px-2 py-2 text-center">Condition</th>
          <th className="px-2 py-2"></th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {items.map(a => (
            <tr key={a.id}>
              <td className="px-2 py-1.5">{a.asset_name}{a.inventory_item_ref && <span className="text-xs text-muted-foreground ml-1">({a.inventory_item_ref})</span>}</td>
              <td className="px-2 py-1.5">{a.asset_type}</td>
              <td className="px-2 py-1.5 text-right">{a.quantity}</td>
              <td className="px-2 py-1.5 text-center">
                <select className="input-farm h-7 text-xs" value={a.condition} onChange={e => acc.updateAsset(a.id, { condition: e.target.value })}>
                  <option value="good">Good</option>
                  <option value="needs_repair">Needs Repair</option>
                  <option value="damaged">Damaged</option>
                </select>
              </td>
              <td className="px-2 py-1.5">
                <Button variant="ghost" size="sm" onClick={() => acc.deleteAsset(a.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No assets linked</td></tr>}
        </tbody>
      </table>
    </div>
  );
};
