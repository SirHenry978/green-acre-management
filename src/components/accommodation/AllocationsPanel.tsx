import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, LogOut } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { AccAllocation, AccHouse, AccRoom, useAccommodation } from '@/hooks/useAccommodation';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  allocations: AccAllocation[];
  rooms: AccRoom[];
  houses: AccHouse[];
  employees: Employee[];
  acc: ReturnType<typeof useAccommodation>;
}

const statusColors: Record<string, string> = {
  reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  occupied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  vacated: 'bg-muted text-muted-foreground',
};

export const AllocationsPanel = ({ allocations, rooms, houses, employees, acc }: Props) => {
  const { user } = useAuth();
  const [action, setAction] = useState<{ type: 'in' | 'out'; alloc: AccAllocation } | null>(null);
  const [form, setForm] = useState({ condition: 'good', notes: '', damages: '', damageCharge: 0 });

  const empName = (id: string) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : 'Unknown';
  };
  const roomLabel = (id: string) => {
    const r = rooms.find(x => x.id === id);
    if (!r) return '—';
    const h = houses.find(x => x.id === r.house_id);
    return `${h?.name || ''} / ${r.room_number}`;
  };

  const open = (type: 'in' | 'out', alloc: AccAllocation) => {
    setAction({ type, alloc });
    setForm({ condition: 'good', notes: '', damages: '', damageCharge: 0 });
  };

  const submit = async () => {
    if (!action) return;
    if (action.type === 'in') {
      await acc.checkIn(action.alloc, user?.name || 'Admin', form.condition, form.notes);
    } else {
      await acc.checkOut(action.alloc, user?.name || 'Admin', form.condition, form.damages, form.damageCharge);
    }
    setAction(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Allocations & Check-in/out</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-3 py-2 text-left">Employee</th>
            <th className="px-3 py-2 text-left">Room</th>
            <th className="px-3 py-2 text-left">Start</th>
            <th className="px-3 py-2 text-left">End</th>
            <th className="px-3 py-2 text-right">Monthly Charge</th>
            <th className="px-3 py-2 text-center">Status</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {allocations.map(a => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">{empName(a.employee_id)}</td>
                <td className="px-3 py-2">{roomLabel(a.room_id)}</td>
                <td className="px-3 py-2">{a.start_date}</td>
                <td className="px-3 py-2">{a.end_date || '-'}</td>
                <td className="px-3 py-2 text-right">{a.monthly_charge.toLocaleString()}</td>
                <td className="px-3 py-2 text-center"><Badge className={statusColors[a.status] || ''}>{a.status}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {a.status === 'reserved' && (
                    <Button variant="ghost" size="sm" onClick={() => open('in', a)} title="Check In">
                      <LogIn className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {a.status === 'occupied' && (
                    <Button variant="ghost" size="sm" onClick={() => open('out', a)} title="Check Out">
                      <LogOut className="h-4 w-4 text-blue-600" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {allocations.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No allocations yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!action} onOpenChange={o => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{action?.type === 'in' ? 'Check In' : 'Check Out'} — Inspection</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Room Condition</label>
              <select className="input-farm" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                <option value="good">Good</option>
                <option value="needs_repair">Needs Repair</option>
                <option value="damaged">Damaged</option>
              </select></div>
            {action?.type === 'out' && (
              <>
                <div><label className="text-sm font-medium">Damages Noted</label>
                  <Input value={form.damages} onChange={e => setForm({ ...form, damages: e.target.value })} placeholder="Describe damages" /></div>
                <div><label className="text-sm font-medium">Damage Charge</label>
                  <Input type="number" value={form.damageCharge} onChange={e => setForm({ ...form, damageCharge: parseFloat(e.target.value) || 0 })} /></div>
              </>
            )}
            <div><label className="text-sm font-medium">Notes</label>
              <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
              <Button onClick={submit}>{action?.type === 'in' ? 'Check In' : 'Check Out'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
