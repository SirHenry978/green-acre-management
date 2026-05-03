import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquareWarning, Plus, CheckCircle2, Wrench, Trash2 } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { AccAllocation, AccRequest, AccRoom, AccHouse, useAccommodation } from '@/hooks/useAccommodation';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  requests: AccRequest[];
  allocations: AccAllocation[];
  rooms: AccRoom[];
  houses: AccHouse[];
  employees: Employee[];
  acc: ReturnType<typeof useAccommodation>;
  /** When true, only the current user's own requests are shown (staff view). */
  staffMode?: boolean;
}

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const RequestsPanel = ({ requests, allocations, rooms, houses, employees, acc, staffMode }: Props) => {
  const { user } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [responding, setResponding] = useState<AccRequest | null>(null);
  const [respForm, setRespForm] = useState({ response: '', status: 'in_progress' });
  const [form, setForm] = useState({
    request_type: 'complaint',
    title: '',
    description: '',
    priority: 'medium',
  });

  const visible = useMemo(
    () => (staffMode ? requests.filter(r => r.employee_id === user?.id) : requests),
    [requests, staffMode, user?.id],
  );

  const empName = (id: string) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : 'Unknown';
  };
  const roomLabel = (id: string | null) => {
    if (!id) return '-';
    const r = rooms.find(x => x.id === id);
    if (!r) return '—';
    const h = houses.find(x => x.id === r.house_id);
    return `${h?.name || ''} / ${r.room_number}`;
  };

  const myAlloc = allocations.find(
    a => a.employee_id === user?.id && (a.status === 'reserved' || a.status === 'occupied'),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const ok = await acc.createRequest({
      employee_id: user.id,
      room_id: myAlloc?.room_id ?? null,
      allocation_id: myAlloc?.id ?? null,
      branch_id: myAlloc?.branch_id ?? null,
      ...form,
    } as any);
    if (ok) {
      setShowNew(false);
      setForm({ request_type: 'complaint', title: '', description: '', priority: 'medium' });
    }
  };

  const submitResponse = async () => {
    if (!responding) return;
    await acc.respondRequest(responding.id, respForm.response, respForm.status, user?.name || 'Admin');
    setResponding(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5" />
          {staffMode ? 'My Requests & Complaints' : 'Staff Requests & Complaints'}
        </h3>
        {staffMode && (
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" />New Request
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-3 py-2 text-left">Date</th>
            {!staffMode && <th className="px-3 py-2 text-left">Employee</th>}
            <th className="px-3 py-2 text-left">Room</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Title</th>
            <th className="px-3 py-2 text-center">Priority</th>
            <th className="px-3 py-2 text-center">Status</th>
            <th className="px-3 py-2 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {visible.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 align-top">
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                {!staffMode && <td className="px-3 py-2">{empName(r.employee_id)}</td>}
                <td className="px-3 py-2">{roomLabel(r.room_id)}</td>
                <td className="px-3 py-2 capitalize">{r.request_type.replace('_', ' ')}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{r.description}</div>
                  {r.admin_response && (
                    <div className="text-xs mt-1 p-1.5 rounded bg-muted/50">
                      <span className="font-medium">Admin:</span> {r.admin_response}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-center"><Badge className={priorityColors[r.priority]}>{r.priority}</Badge></td>
                <td className="px-3 py-2 text-center"><Badge className={statusColors[r.status]}>{r.status.replace('_', ' ')}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {!staffMode && r.status !== 'resolved' && r.status !== 'rejected' && (
                    <Button variant="ghost" size="sm" onClick={() => { setResponding(r); setRespForm({ response: r.admin_response || '', status: 'in_progress' }); }} title="Respond">
                      <Wrench className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  {!staffMode && (
                    <Button variant="ghost" size="sm" onClick={() => acc.deleteRequest(r.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  {staffMode && r.status === 'open' && (
                    <Button variant="ghost" size="sm" onClick={() => acc.deleteRequest(r.id)} title="Withdraw">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={staffMode ? 7 : 8} className="px-4 py-8 text-center text-muted-foreground">No requests yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Request / Complaint</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><label className="text-sm font-medium">Type *</label>
              <select required className="input-farm" value={form.request_type} onChange={e => setForm({ ...form, request_type: e.target.value })}>
                <option value="complaint">Complaint</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="transfer">Room Transfer</option>
                <option value="other">Other</option>
              </select></div>
            <div><label className="text-sm font-medium">Priority *</label>
              <select required className="input-farm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select></div>
            <div><label className="text-sm font-medium">Title *</label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Short summary" /></div>
            <div><label className="text-sm font-medium">Description *</label>
              <Textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail" /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!responding} onOpenChange={o => !o && setResponding(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Respond to Request</DialogTitle></DialogHeader>
          {responding && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3 bg-muted/30">
                <div className="text-sm font-medium">{responding.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{responding.description}</div>
              </div>
              <div><label className="text-sm font-medium">Status</label>
                <select className="input-farm" value={respForm.status} onChange={e => setRespForm({ ...respForm, status: e.target.value })}>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select></div>
              <div><label className="text-sm font-medium">Admin Response</label>
                <Textarea rows={4} value={respForm.response} onChange={e => setRespForm({ ...respForm, response: e.target.value })} placeholder="Action taken / response to staff" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResponding(null)}>Cancel</Button>
                <Button onClick={submitResponse}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />Send Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};