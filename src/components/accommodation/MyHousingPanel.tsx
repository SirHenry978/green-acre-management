import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building, ClipboardList, LogIn, LogOut, Plus } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { useAccommodation } from '@/hooks/useAccommodation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { RequestsPanel } from './RequestsPanel';

interface Props {
  acc: ReturnType<typeof useAccommodation>;
  employees: Employee[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  occupied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  vacated: 'bg-muted text-muted-foreground',
};

export const MyHousingPanel = ({ acc, employees }: Props) => {
  const { user } = useAuth();
  const myApps = acc.applications.filter(a => a.employee_id === user?.id);
  const myAllocs = acc.allocations.filter(a => a.employee_id === user?.id);
  const activeAlloc = myAllocs.find(a => a.status === 'reserved' || a.status === 'occupied');
  const myRoom = activeAlloc ? acc.rooms.find(r => r.id === activeAlloc.room_id) : undefined;
  const myHouse = myRoom ? acc.houses.find(h => h.id === myRoom.house_id) : undefined;
  const availableRooms = acc.rooms.filter(r => r.status === 'available');

  const [showApply, setShowApply] = useState(false);
  const [confirm, setConfirm] = useState<null | 'in' | 'out'>(null);
  const [form, setForm] = useState({
    room_id: '',
    desired_start_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const room = acc.rooms.find(r => r.id === form.room_id);
    const ok = await acc.createApplication({
      employee_id: user.id,
      room_id: form.room_id,
      application_date: new Date().toISOString().split('T')[0],
      desired_start_date: form.desired_start_date,
      reason: form.reason,
      branch_id: room?.branch_id || null,
    } as any);
    if (ok) {
      setShowApply(false);
      setForm({ room_id: '', desired_start_date: new Date().toISOString().split('T')[0], reason: '' });
    }
  };

  const doCheckIn = async () => {
    if (!activeAlloc) return toast.error('No active allocation');
    if (activeAlloc.status === 'occupied') return toast.info('Already checked in');
    await acc.checkIn(activeAlloc, user?.name || 'self', 'good', 'Self check-in');
  };
  const doCheckOut = async () => {
    if (!activeAlloc) return toast.error('No active allocation');
    if (activeAlloc.status !== 'occupied') return toast.info('Not checked in');
    await acc.checkOut(activeAlloc, user?.name || 'self', 'good', '', 0);
  };

  return (
    <div className="space-y-6">
      {/* Current housing summary */}
      <div className="card-farm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5"><Building className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="font-semibold text-lg">My Current Housing</h3>
              {activeAlloc ? (
                <p className="text-sm text-muted-foreground">
                  {myHouse?.name} — Room {myRoom?.room_number} ·{' '}
                  <Badge className={statusColors[activeAlloc.status]}>{activeAlloc.status}</Badge>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No active housing assignment</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowApply(true)} disabled={availableRooms.length === 0 || !!activeAlloc}>
              <Plus className="h-4 w-4 mr-2" />Apply for Room
            </Button>
            <Button variant="outline" onClick={() => {
              if (!activeAlloc) return toast.error('No active allocation');
              if (activeAlloc.status === 'occupied') return toast.info('Already checked in');
              setConfirm('in');
            }} disabled={!activeAlloc || activeAlloc.status === 'occupied'}>
              <LogIn className="h-4 w-4 mr-2" />Check In
            </Button>
            <Button variant="outline" onClick={() => {
              if (!activeAlloc) return toast.error('No active allocation');
              if (activeAlloc.status !== 'occupied') return toast.info('Not checked in');
              setConfirm('out');
            }} disabled={!activeAlloc || activeAlloc.status !== 'occupied'}>
              <LogOut className="h-4 w-4 mr-2" />Check Out
            </Button>
          </div>
        </div>
      </div>

      {/* My applications */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2"><ClipboardList className="h-4 w-4" />My Applications</h4>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Requested Room</th>
              <th className="px-3 py-2 text-left">Start</th>
              <th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {myApps.map(a => {
                const r = acc.rooms.find(x => x.id === a.room_id);
                const h = r ? acc.houses.find(x => x.id === r.house_id) : null;
                return (
                  <tr key={a.id}>
                    <td className="px-3 py-2">{a.application_date}</td>
                    <td className="px-3 py-2">{h?.name} / {r?.room_number}</td>
                    <td className="px-3 py-2">{a.desired_start_date || '-'}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{a.reason || '-'}</td>
                    <td className="px-3 py-2 text-center"><Badge className={statusColors[a.status]}>{a.status}</Badge></td>
                  </tr>
                );
              })}
              {myApps.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No applications yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* My allocations history */}
      <div>
        <h4 className="font-semibold mb-2">My Allocations</h4>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Room</th>
              <th className="px-3 py-2 text-left">Start</th>
              <th className="px-3 py-2 text-left">End</th>
              <th className="px-3 py-2 text-right">Monthly Charge</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {myAllocs.map(a => {
                const r = acc.rooms.find(x => x.id === a.room_id);
                const h = r ? acc.houses.find(x => x.id === r.house_id) : null;
                return (
                  <tr key={a.id}>
                    <td className="px-3 py-2">{h?.name} / {r?.room_number}</td>
                    <td className="px-3 py-2">{a.start_date}</td>
                    <td className="px-3 py-2">{a.end_date || '-'}</td>
                    <td className="px-3 py-2 text-right">{a.monthly_charge.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center"><Badge className={statusColors[a.status]}>{a.status}</Badge></td>
                  </tr>
                );
              })}
              {myAllocs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No allocations yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* My requests */}
      <RequestsPanel
        requests={acc.requests}
        allocations={acc.allocations}
        rooms={acc.rooms}
        houses={acc.houses}
        employees={employees}
        acc={acc}
        staffMode
      />

      {/* Apply dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for a Room</DialogTitle></DialogHeader>
          <form onSubmit={apply} className="space-y-3">
            <div><label className="text-sm font-medium">Available Room *</label>
              <select required className="input-farm" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                <option value="">Select an available room</option>
                {availableRooms.map(r => {
                  const h = acc.houses.find(x => x.id === r.house_id);
                  return <option key={r.id} value={r.id}>{h?.name} / {r.room_number} — {r.monthly_charge.toLocaleString()}/mo</option>;
                })}
              </select></div>
            <div><label className="text-sm font-medium">Desired Start Date</label>
              <Input type="date" value={form.desired_start_date} onChange={e => setForm({ ...form, desired_start_date: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Reason</label>
              <Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Why this room?" /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'in' ? 'Confirm check-in' : 'Confirm check-out'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'in'
                ? `Mark ${myHouse?.name ?? ''} room ${myRoom?.room_number ?? ''} as occupied?`
                : `Vacate ${myHouse?.name ?? ''} room ${myRoom?.room_number ?? ''}? This will release the room.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirm === 'in') await doCheckIn();
                else if (confirm === 'out') await doCheckOut();
                setConfirm(null);
              }}
            >
              {confirm === 'in' ? 'Check in' : 'Check out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};