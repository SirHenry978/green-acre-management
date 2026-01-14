import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { attendance, users, branches } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  present: 'bg-success/10 text-success',
  absent: 'bg-destructive/10 text-destructive',
  late: 'bg-warning/10 text-warning',
  'half-day': 'bg-accent/20 text-accent-foreground',
};

const statusIcons: Record<string, React.ElementType> = {
  present: CheckCircle,
  absent: XCircle,
  late: AlertCircle,
  'half-day': Clock,
};

const Attendance = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredAttendance = attendance.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesStatus;
  });

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  // Calculate stats
  const todayRecords = attendance.filter(a => a.date === '2024-01-12');
  const presentCount = todayRecords.filter(a => a.status === 'present').length;
  const absentCount = todayRecords.filter(a => a.status === 'absent').length;
  const lateCount = todayRecords.filter(a => a.status === 'late').length;
  const totalStaff = users.filter(u => u.role !== 'super_admin' && u.role !== 'branch_manager').length;
  const attendanceRate = totalStaff > 0 ? ((presentCount + lateCount) / totalStaff * 100).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track staff attendance and import biometric reports
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Import Biometric
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold font-display">{presentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-destructive/10 p-3">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold font-display">{absentCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-warning/10 p-3">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Today</p>
                <p className="text-2xl font-bold font-display">{lateCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-3">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold font-display">{attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-farm w-auto"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterStatus === 'all' ? 'All Status' : filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('present')}>Present</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('absent')}>Absent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('late')}>Late</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('half-day')}>Half Day</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Attendance Table */}
        <div className="card-farm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => {
                  const StatusIcon = statusIcons[record.status];
                  return (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="font-medium">{record.staffName}</td>
                      <td className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td>
                        {record.checkIn ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {record.checkIn}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td>
                        {record.checkOut ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {record.checkOut}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-muted-foreground">{getBranchName(record.branchId)}</td>
                      <td>
                        <Badge className={cn("gap-1", statusColors[record.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {record.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mark Attendance Section */}
        <div className="card-farm p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Quick Mark Attendance</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {users.filter(u => u.role !== 'super_admin' && u.role !== 'branch_manager').slice(0, 4).map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{staff.role.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
