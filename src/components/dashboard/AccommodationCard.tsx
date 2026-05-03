import { useNavigate } from 'react-router-dom';
import { Building, ClipboardList, Users, LogIn, LogOut } from 'lucide-react';
import { useAccommodation } from '@/hooks/useAccommodation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AccommodationCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allocations, applications, rooms, checkIn, checkOut } = useAccommodation();

  const myAlloc = allocations.find(
    (a) => a.employee_id === user?.id && (a.status === 'reserved' || a.status === 'occupied'),
  );
  const myApps = applications.filter((a) => a.employee_id === user?.id);
  const myRoom = myAlloc ? rooms.find((r) => r.id === myAlloc.room_id) : undefined;

  const go = (hash: string) => navigate(`/accommodation#${hash}`);

  const handleCheckIn = async () => {
    if (!myAlloc) return toast.error('No active allocation to check into');
    if (myAlloc.status === 'occupied') return toast.info('You are already checked in');
    await checkIn(myAlloc, user?.name ?? 'self', 'good', 'Self check-in from dashboard');
  };

  const handleCheckOut = async () => {
    if (!myAlloc) return toast.error('No active allocation to check out from');
    if (myAlloc.status !== 'occupied') return toast.info('You are not currently checked in');
    await checkOut(myAlloc, user?.name ?? 'self', 'good', '', 0);
  };

  return (
    <div className="card-farm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">My Accommodation</h3>
            <p className="text-sm text-muted-foreground">
              {myAlloc
                ? `Room ${myRoom?.room_number ?? ''} · ${myAlloc.status}`
                : myApps.length > 0
                  ? `${myApps.length} application(s) on file`
                  : 'No active housing assignment'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <button
          onClick={() => go('applications')}
          className="flex flex-col items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/50 transition"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Apply for Room</span>
          <span className="text-xs text-muted-foreground">Submit a new request</span>
        </button>
        <button
          onClick={() => go('allocations')}
          className="flex flex-col items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/50 transition"
        >
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">My Allocation</span>
          <span className="text-xs text-muted-foreground">View room details</span>
        </button>
        <button
          onClick={handleCheckIn}
          disabled={!myAlloc || myAlloc.status === 'occupied'}
          className="flex flex-col items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">Check-in</span>
          <span className="text-xs text-muted-foreground">
            {myAlloc?.status === 'occupied' ? 'Already checked in' : 'Move into room'}
          </span>
        </button>
        <button
          onClick={handleCheckOut}
          disabled={!myAlloc || myAlloc.status !== 'occupied'}
          className="flex flex-col items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left hover:bg-muted/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">Check-out</span>
          <span className="text-xs text-muted-foreground">
            {myAlloc?.status === 'occupied' ? 'Vacate room' : 'Not checked in'}
          </span>
        </button>
      </div>
    </div>
  );
};
