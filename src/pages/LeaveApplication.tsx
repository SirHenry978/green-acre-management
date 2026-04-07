import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeaveTypes, LeaveType } from '@/hooks/useLeaveTypes';
import { toast } from 'sonner';
import {
  CalendarDays,
  Palmtree,
  Stethoscope,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  family_leave_total: number;
  family_leave_used: number;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: string;
  is_paid: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

const LeaveApplication = () => {
  const { employees } = useEmployees();
  const { leaveTypes } = useLeaveTypes();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const year = new Date().getFullYear();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [balRes, reqRes] = await Promise.all([
      supabase.from('leave_balances').select('*').eq('year', year).order('employee_id'),
      supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
    ]);
    setBalances((balRes.data as unknown as LeaveBalance[]) || []);
    setRequests((reqRes.data as unknown as LeaveRequest[]) || []);
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const daysCount = calculateDays(startDate, endDate);

  const handleSubmit = async () => {
    if (!selectedEmployee || !startDate || !endDate || daysCount < 1) {
      toast.error('Please fill in all required fields');
      return;
    }

    const balance = balances.find(b => b.employee_id === selectedEmployee);
    let isPaid = true;
    if (balance) {
      if (leaveType === 'annual' && balance.annual_leave_used + daysCount > balance.annual_leave_total) isPaid = false;
      if (leaveType === 'sick' && balance.sick_leave_used + daysCount > balance.sick_leave_total) isPaid = false;
      if (leaveType === 'family' && balance.family_leave_used + daysCount > balance.family_leave_total) isPaid = false;
    }
    if (leaveType === 'unpaid') isPaid = false;

    const { error } = await supabase.from('leave_requests').insert({
      employee_id: selectedEmployee,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days_count: daysCount,
      reason: reason || null,
      status: 'pending',
      is_paid: isPaid,
    } as any);

    if (error) {
      toast.error('Failed to submit: ' + error.message);
      return;
    }

    toast.success(isPaid ? 'Leave request submitted successfully' : 'Leave request submitted (will be unpaid — exceeds allocation)');
    setDialogOpen(false);
    setSelectedEmployee('');
    setLeaveType('annual');
    setStartDate('');
    setEndDate('');
    setReason('');
    fetchData();
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
    approved: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, label: 'Approved' },
    pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'Pending' },
    rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, label: 'Rejected' },
  };

  const iconMap: Record<string, typeof Palmtree> = {
    annual: Palmtree,
    sick: Stethoscope,
    family: Home,
  };

  const colorMap: Record<string, { text: string; bg: string }> = {
    annual: { text: 'text-primary', bg: 'bg-primary/10' },
    sick: { text: 'text-warning', bg: 'bg-warning/10' },
    family: { text: 'text-accent', bg: 'bg-accent/10' },
  };

  // Aggregate totals
  const totalAllocated = balances.reduce((s, b) => s + b.annual_leave_total + b.sick_leave_total + b.family_leave_total, 0);
  const totalUsed = balances.reduce((s, b) => s + b.annual_leave_used + b.sick_leave_used + b.family_leave_used, 0);
  const totalRemaining = totalAllocated - totalUsed;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const activeLeaveTypes = leaveTypes.filter(lt => lt.is_active);

  // For the selected employee in the apply dialog, show their balance
  const selectedBalance = balances.find(b => b.employee_id === selectedEmployee);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-primary" />
              Leave Application
            </h1>
            <p className="text-muted-foreground mt-1">
              Apply for leave and track your request status
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Leave Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.filter(e => e.status === 'active').map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show balance for selected employee */}
                {selectedBalance && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Available Balance ({year})</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary">{selectedBalance.annual_leave_total - selectedBalance.annual_leave_used}</p>
                        <p className="text-[10px] text-muted-foreground">Annual</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-warning">{selectedBalance.sick_leave_total - selectedBalance.sick_leave_used}</p>
                        <p className="text-[10px] text-muted-foreground">Sick</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-accent">{selectedBalance.family_leave_total - selectedBalance.family_leave_used}</p>
                        <p className="text-[10px] text-muted-foreground">Family</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {activeLeaveTypes.map(lt => (
                        <SelectItem key={lt.id} value={lt.name.toLowerCase().split(' ')[0]}>
                          {lt.name} ({lt.default_days} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                  </div>
                </div>

                {daysCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{daysCount} working day(s)</Badge>
                    {selectedBalance && leaveType === 'annual' && selectedBalance.annual_leave_used + daysCount > selectedBalance.annual_leave_total && (
                      <Badge variant="destructive" className="text-xs">Exceeds allocation — unpaid</Badge>
                    )}
                    {selectedBalance && leaveType === 'sick' && selectedBalance.sick_leave_used + daysCount > selectedBalance.sick_leave_total && (
                      <Badge variant="destructive" className="text-xs">Exceeds allocation — unpaid</Badge>
                    )}
                    {selectedBalance && leaveType === 'family' && selectedBalance.family_leave_used + daysCount > selectedBalance.family_leave_total && (
                      <Badge variant="destructive" className="text-xs">Exceeds allocation — unpaid</Badge>
                    )}
                  </div>
                )}

                <div>
                  <Label>Reason (optional)</Label>
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave..." rows={3} />
                </div>

                <Button onClick={handleSubmit} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Submit Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl p-3 bg-primary text-primary-foreground">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAllocated}</p>
                <p className="text-xs text-muted-foreground">Total Allocated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl p-3 bg-warning text-warning-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsed}</p>
                <p className="text-xs text-muted-foreground">Days Used</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl p-3 bg-success text-success-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRemaining}</p>
                <p className="text-xs text-muted-foreground">Days Remaining</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl p-3 bg-accent text-accent-foreground">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Breakdown per Employee */}
        {balances.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Leave Balances — {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances.map(bal => {
                  const empName = getEmployeeName(bal.employee_id);
                  const categories = [
                    { label: 'Annual', total: bal.annual_leave_total, used: bal.annual_leave_used, ...colorMap.annual, icon: iconMap.annual },
                    { label: 'Sick', total: bal.sick_leave_total, used: bal.sick_leave_used, ...colorMap.sick, icon: iconMap.sick },
                    { label: 'Family', total: bal.family_leave_total, used: bal.family_leave_used, ...colorMap.family, icon: iconMap.family },
                  ];
                  return (
                    <div key={bal.id} className="rounded-lg border p-4">
                      <p className="font-medium mb-3">{empName}</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {categories.map(cat => {
                          const remaining = cat.total - cat.used;
                          const pct = cat.total > 0 ? (cat.used / cat.total) * 100 : 0;
                          const CatIcon = cat.icon;
                          return (
                            <div key={cat.label} className={`rounded-lg p-3 ${cat.bg}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <CatIcon className={`h-4 w-4 ${cat.text}`} />
                                <span className="text-sm font-medium">{cat.label}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{remaining} left</span>
                                <span>{cat.used}/{cat.total}</span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Leave Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No leave requests yet</p>
            ) : (
              <div className="space-y-2">
                {requests.map(req => {
                  const cfg = statusConfig[req.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 shrink-0 ${cfg.color.split(' ')[1]}`} />
                        <div>
                          <p className="text-sm font-medium">
                            {getEmployeeName(req.employee_id)} — <span className="capitalize">{req.leave_type} Leave</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {req.start_date} → {req.end_date} · {req.days_count} day(s)
                            {req.reason && ` · ${req.reason}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!req.is_paid && <Badge variant="destructive" className="text-[10px]">Unpaid</Badge>}
                        <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                        {req.approved_by && (
                          <span className="text-[10px] text-muted-foreground">by {req.approved_by}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LeaveApplication;
