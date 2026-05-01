import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import { AccHouse, AccRoom, useAccommodation } from '@/hooks/useAccommodation';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';

interface Props {
  houses: AccHouse[];
  rooms: AccRoom[];
  acc: ReturnType<typeof useAccommodation>;
}

export const HousesManager = ({ houses, rooms, acc }: Props) => {
  const branchId = useCurrentBranchId() || 'default';
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<AccHouse | null>(null);
  const [form, setForm] = useState({
    house_code: '', name: '', branch_id: branchId, location: '',
    house_type: 'family', total_rooms: 0, notes: '', status: 'active',
  });

  const open = (h?: AccHouse) => {
    setEditing(h || null);
    setForm(h ? {
      house_code: h.house_code, name: h.name, branch_id: h.branch_id,
      location: h.location || '', house_type: h.house_type,
      total_rooms: h.total_rooms, notes: h.notes || '', status: h.status,
    } : {
      house_code: '', name: '', branch_id: branchId, location: '',
      house_type: 'family', total_rooms: 0, notes: '', status: 'active',
    });
    setShow(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing
      ? await acc.updateHouse(editing.id, form)
      : await acc.createHouse(form as any);
    if (ok) setShow(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Home className="h-5 w-5" />Houses</h3>
        <Button onClick={() => open()}><Plus className="h-4 w-4 mr-2" />Add House</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {houses.map(h => {
          const houseRooms = rooms.filter(r => r.house_id === h.id);
          const occ = houseRooms.filter(r => r.status === 'occupied').length;
          return (
            <div key={h.id} className="rounded-xl border border-border p-4 bg-card hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{h.house_code}</p>
                  <h4 className="font-semibold">{h.name}</h4>
                  <p className="text-xs text-muted-foreground">{h.location}</p>
                </div>
                <Badge variant="outline">{h.house_type}</Badge>
              </div>
              <div className="mt-3 flex gap-3 text-xs">
                <span><strong>{houseRooms.length}</strong> rooms</span>
                <span className="text-green-600"><strong>{occ}</strong> occupied</span>
                <span className="text-muted-foreground"><strong>{houseRooms.length - occ}</strong> available</span>
              </div>
              <div className="mt-3 flex gap-1 justify-end">
                <Button variant="ghost" size="sm" onClick={() => open(h)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => confirm('Delete house and all its rooms?') && acc.deleteHouse(h.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
        {houses.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No houses yet. Add one to start.</p>}
      </div>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit House' : 'Add House'}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">House Code *</label>
                <Input required value={form.house_code} onChange={e => setForm({ ...form, house_code: e.target.value })} placeholder="H-001" /></div>
              <div><label className="text-sm font-medium">Name *</label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Type</label>
                <select className="input-farm" value={form.house_type} onChange={e => setForm({ ...form, house_type: e.target.value })}>
                  <option value="family">Family House</option>
                  <option value="single_quarters">Single Quarters</option>
                  <option value="dormitory">Dormitory</option>
                  <option value="manager">Manager Residence</option>
                </select></div>
              <div><label className="text-sm font-medium">Total Rooms</label>
                <Input type="number" value={form.total_rooms} onChange={e => setForm({ ...form, total_rooms: parseInt(e.target.value) || 0 })} /></div>
              <div className="col-span-2"><label className="text-sm font-medium">Location</label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Block / Section" /></div>
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
    </div>
  );
};
