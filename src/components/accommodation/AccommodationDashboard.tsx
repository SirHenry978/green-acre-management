import { useMemo } from 'react';
import { Home, BedDouble, CheckCircle2, ClipboardList, AlertTriangle, LogIn } from 'lucide-react';
import { AccAllocation, AccApplication, AccCheckin, AccHouse, AccRoom } from '@/hooks/useAccommodation';

interface Props {
  houses: AccHouse[];
  rooms: AccRoom[];
  applications: AccApplication[];
  allocations: AccAllocation[];
  checkins: AccCheckin[];
}

const Card = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}><Icon className="h-5 w-5" /></div>
    </div>
  </div>
);

export const AccommodationDashboard = ({ houses, rooms, applications, allocations, checkins }: Props) => {
  const stats = useMemo(() => ({
    houses: houses.length,
    rooms: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    pending: applications.filter(a => a.status === 'pending').length,
    activeAllocs: allocations.filter(a => a.status === 'occupied' || a.status === 'reserved').length,
    checkInsToday: checkins.filter(c => c.event_date === new Date().toISOString().split('T')[0]).length,
  }), [houses, rooms, applications, allocations, checkins]);

  const occupancyRate = stats.rooms > 0 ? Math.round((stats.occupied / stats.rooms) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card icon={Home} label="Houses" value={stats.houses} color="bg-primary/10 text-primary" />
        <Card icon={BedDouble} label="Total Rooms" value={stats.rooms} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        <Card icon={CheckCircle2} label="Available" value={stats.available} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
        <Card icon={LogIn} label="Occupied" value={stats.occupied} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
        <Card icon={ClipboardList} label="Pending Apps" value={stats.pending} color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <Card icon={AlertTriangle} label="Maintenance" value={stats.maintenance} color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Occupancy Rate</h3>
          <span className="text-2xl font-bold">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="bg-primary h-3 transition-all" style={{ width: `${occupancyRate}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
          <div><span className="text-muted-foreground">Reserved:</span> <strong>{stats.reserved}</strong></div>
          <div><span className="text-muted-foreground">Active allocations:</span> <strong>{stats.activeAllocs}</strong></div>
          <div><span className="text-muted-foreground">Check-ins today:</span> <strong>{stats.checkInsToday}</strong></div>
          <div><span className="text-muted-foreground">Vacancy:</span> <strong>{stats.available + stats.reserved}</strong></div>
        </div>
      </div>
    </div>
  );
};
