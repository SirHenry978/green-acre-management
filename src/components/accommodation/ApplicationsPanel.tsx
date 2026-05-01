import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Plus, ClipboardList } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { AccApplication, AccHouse, AccRoom, useAccommodation } from '@/hooks/useAccommodation';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  applications: AccApplication[];
  rooms: AccRoom[];
  houses: AccHouse[];
  employees: Employee[];
  acc: ReturnType<typeof useAccommodation>;
}

export const ApplicationsPanel = ({ applications, rooms, houses, employees, acc }: Props) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [rejecting, setRejecting] = useState<AccApplication | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [form, setForm] = useState({
    employee_id: '', room_id: '', desired_start_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === form.room_id);
    const ok = await acc.createApplication({
      employee_id: form.employee_id,
      room_id: form.room_id,
      application_date: new Date().toISOString().split('T')[0],
      desired_start_date: form.desired_start_date,
      reason: form.reason,
      branch_id: room?.branch_id || null,
    } as any);
    if (ok) setShow(false);
  };

  const approve = async (a: AccApplication) => {
    const room = rooms.find(r => r.id === a.room_id);
    if (!room) return;
    await acc.approveApplication(a, user?.name || 'Admin', room.monthly_charge);
  };

  const submitReject = async () => {
    if (!rejecting) return;
    await acc.rejectApplication(rejecting.id, user?.name || 'Admin', rejectNotes);
    setRejecting(null);
    setRejectNotes('');
  };

  const availableRooms = rooms.filter(r => r.status === 'available');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5" />Room Applications</h3>
        <Button onClick={() => setShow(true)} disabled={availableRooms.length === 0}>
          <Plus className="h-4 w-4 mr-2" />New Application
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Employee</th>
            <th className="px-3 py-2 text-left">Requested Room</th>
            <th className="px-3 py-2 text-left">Start Date</th>
            <th className="px-3 py-2 text-left">Reason</th>
            <th className="px-3 py-2 text-center">Status</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {applications.map(a => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">{a.application_date}</td>
                <td className="px-3 py-2">{empName(a.employee_id)}</td>
                <td className="px-3 py-2">{roomLabel(a.room_id)}</td>
                <td className="px-3 py-2">{a.desired_start_date || '-'}</td>
                <td className="px-3 py-2 max-w-xs truncate">{a.reason || '-'}</td>
                <td className="px-3 py-2 text-center"><Badge className={statusColors[a.status] || ''}>{a.status}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {a.status === 'pending' && (
                    <div className="flex gap-1 justify-center">
                      <Button variant="ghost" size="sm" onClick={() => approve(a)} title="Approve">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRejecting(a)} title="Reject">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {applications.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No applications yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Room Application</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><label className="text-sm font-medium">Employee *</label>
              <select required className="input-farm" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                <option value="">Select employee</option>
                {employees.filter(e => e.status === 'active').map(e =>
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.position || 'Staff'}</option>
                )}
              </select></div>
            <div><label className="text-sm font-medium">Available Room *</label>
              <select required className="input-farm" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                <option value="">Select room</option>
                {availableRooms.map(r => {
                  const h = houses.find(x => x.id === r.house_id);
                  return <option key={r.id} value={r.id}>{h?.name} / {r.room_number} — {r.monthly_charge.toLocaleString()}/mo</option>;
                })}
              </select></div>
            <div><label className="text-sm font-medium">Desired Start Date</label>
              <Input type="date" value={form.desired_start_date} onChange={e => setForm({ ...form, desired_start_date: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Reason</label>
              <Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Why this room?" /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejecting} onOpenChange={o => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Reject application for {rejecting && empName(rejecting.employee_id)}?</p>
            <div><label className="text-sm font-medium">Reason</label>
              <Input value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Reason for rejection" /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
              <Button variant="destructive" onClick={submitReject}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
