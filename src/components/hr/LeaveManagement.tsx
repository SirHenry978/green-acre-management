import { useState } from 'react';
import { Employee } from '@/hooks/useEmployees';
import { LeaveBalance, LeaveRequest } from '@/hooks/useLeave';
import { LeaveType } from '@/hooks/useLeaveTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, CheckCircle, XCircle, RefreshCw, Settings2, Pencil, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaveManagementProps {
  employees: Employee[];
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  loading: boolean;
  createRequest: (req: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>) => Promise<boolean>;
  approveRequest: (id: string, approverName: string) => Promise<boolean>;
  rejectRequest: (id: string) => Promise<boolean>;
  allocateAllEmployees: (employeeIds: string[], year: number) => Promise<void>;
  getBalanceForEmployee: (employeeId: string, year: number) => LeaveBalance | undefined;
  leaveTypes: LeaveType[];
  createLeaveType: (lt: Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateLeaveType: (id: string, updates: Partial<LeaveType>) => Promise<boolean>;
  deleteLeaveType: (id: string) => Promise<boolean>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-destructive/10 text-destructive',
};

export const LeaveManagement = ({
  employees, balances, requests, loading,
  createRequest, approveRequest, rejectRequest,
  allocateAllEmployees, getBalanceForEmployee,
  leaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
}: LeaveManagementProps) => {
  const [showApply, setShowApply] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Leave type CRUD state
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeDefaultDays, setTypeDefaultDays] = useState(0);
  const [typeIsPaid, setTypeIsPaid] = useState(true);
  const [typeDescription, setTypeDescription] = useState('');
  const [typeIsActive, setTypeIsActive] = useState(true);
  const [savingType, setSavingType] = useState(false);

  const currentYear = new Date().getFullYear();
  const activeLeaveTypes = leaveTypes.filter(lt => lt.is_active);

  const calcDays = (start: string, end: string) => {
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

  const getLeaveTypeObj = (name: string) => leaveTypes.find(lt => lt.name === name);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const days = calcDays(startDate, endDate);
    if (days <= 0) return;
    setSubmitting(true);

    const ltObj = getLeaveTypeObj(leaveType);
    let isPaid = ltObj?.is_paid ?? true;

    // Check balance if it's a paid leave type
    if (isPaid) {
      const balance = getBalanceForEmployee(employeeId, new Date(startDate).getFullYear());
      if (balance) {
        const key = leaveType.toLowerCase().replace(/\s+/g, '_');
        const used = key === 'annual_leave' ? balance.annual_leave_used
          : key === 'sick_leave' ? balance.sick_leave_used
          : key === 'family_leave' ? balance.family_leave_used : 0;
        const total = key === 'annual_leave' ? balance.annual_leave_total
          : key === 'sick_leave' ? balance.sick_leave_total
          : key === 'family_leave' ? balance.family_leave_total : 0;
        if (used + days > total) isPaid = false;
      }
    }

    await createRequest({
      employee_id: employeeId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days_count: days,
      reason: reason || null,
      status: 'pending',
      is_paid: isPaid,
    });
    setSubmitting(false);
    setShowApply(false);
    setEmployeeId(''); setLeaveType(''); setStartDate(''); setEndDate(''); setReason('');
  };

  const openCreateType = () => {
    setEditingType(null);
    setTypeName(''); setTypeDefaultDays(0); setTypeIsPaid(true); setTypeDescription(''); setTypeIsActive(true);
    setShowTypeDialog(true);
  };

  const openEditType = (lt: LeaveType) => {
    setEditingType(lt);
    setTypeName(lt.name);
    setTypeDefaultDays(lt.default_days);
    setTypeIsPaid(lt.is_paid);
    setTypeDescription(lt.description || '');
    setTypeIsActive(lt.is_active);
    setShowTypeDialog(true);
  };

  const handleSaveType = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!typeName.trim()) return;
    setSavingType(true);
    const payload = {
      name: typeName.trim(),
      default_days: typeDefaultDays,
      is_paid: typeIsPaid,
      description: typeDescription || null,
      is_active: typeIsActive,
    };
    if (editingType) {
      await updateLeaveType(editingType.id, payload);
    } else {
      await createLeaveType(payload);
    }
    setSavingType(false);
    setShowTypeDialog(false);
  };

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  const activeEmployeeIds = employees.filter(e => e.status === 'active').map(e => e.id);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="requests" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <TabsList>
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="types">Leave Types</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => allocateAllEmployees(activeEmployeeIds, currentYear)}>
              <RefreshCw className="h-4 w-4 mr-2" />Allocate {currentYear}
            </Button>
            <Button size="sm" onClick={() => setShowApply(true)}>
              <Plus className="h-4 w-4 mr-2" />Apply for Leave
            </Button>
          </div>
        </div>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <Button key={s} size="sm" variant={filterStatus === s ? 'default' : 'outline'}
                onClick={() => setFilterStatus(s)} className="capitalize">{s}</Button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="px-4 py-3 text-left font-medium">Employee</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Period</th>
                <th className="px-4 py-3 text-center font-medium">Days</th>
                <th className="px-4 py-3 text-center font-medium">Paid</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{getEmployeeName(req.employee_id)}</td>
                    <td className="px-4 py-3">{req.leave_type}</td>
                    <td className="px-4 py-3">{req.start_date} → {req.end_date}</td>
                    <td className="px-4 py-3 text-center">{req.days_count}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={req.is_paid ? 'default' : 'destructive'} className="text-xs">
                        {req.is_paid ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={statusColors[req.status] || ''}>{req.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{req.reason || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {req.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" onClick={() => approveRequest(req.id, 'Admin')}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => rejectRequest(req.id)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No leave requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.filter(e => e.status === 'active').map(emp => {
              const bal = getBalanceForEmployee(emp.id, currentYear);
              return (
                <Card key={emp.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{emp.first_name} {emp.last_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{emp.department || 'No department'} • {currentYear}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {bal ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Annual Leave</span>
                          <span className={bal.annual_leave_used > bal.annual_leave_total ? 'text-destructive font-semibold' : ''}>
                            {bal.annual_leave_used}/{bal.annual_leave_total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min((bal.annual_leave_used / bal.annual_leave_total) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sick Leave</span>
                          <span className={bal.sick_leave_used > bal.sick_leave_total ? 'text-destructive font-semibold' : ''}>
                            {bal.sick_leave_used}/{bal.sick_leave_total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${Math.min((bal.sick_leave_used / bal.sick_leave_total) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Family Leave</span>
                          <span className={bal.family_leave_used > bal.family_leave_total ? 'text-destructive font-semibold' : ''}>
                            {bal.family_leave_used}/{bal.family_leave_total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-secondary h-2 rounded-full transition-all" style={{ width: `${Math.min((bal.family_leave_used / bal.family_leave_total) * 100, 100)}%` }} />
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No allocation yet. Click "Allocate {currentYear}" above.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leave Types</h3>
            <Button size="sm" onClick={openCreateType}>
              <Plus className="h-4 w-4 mr-2" />Add Leave Type
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-center font-medium">Default Days</th>
                <th className="px-4 py-3 text-center font-medium">Paid</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-center font-medium">Active</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {leaveTypes.map(lt => (
                  <tr key={lt.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{lt.name}</td>
                    <td className="px-4 py-3 text-center">{lt.default_days}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={lt.is_paid ? 'default' : 'secondary'} className="text-xs">
                        {lt.is_paid ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lt.description || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={lt.is_active ? 'default' : 'outline'} className="text-xs">
                        {lt.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => openEditType(lt)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteLeaveType(lt.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaveTypes.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No leave types configured</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Apply for Leave Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee *</label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Leave Type *</label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>
                  {activeLeaveTypes.map(lt => (
                    <SelectItem key={lt.id} value={lt.name}>{lt.name} ({lt.default_days} days)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input className="input-farm" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date *</label>
                <input className="input-farm" type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            {startDate && endDate && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p><strong>{calcDays(startDate, endDate)}</strong> working day(s)</p>
                {employeeId && leaveType && (() => {
                  const ltObj = getLeaveTypeObj(leaveType);
                  if (!ltObj?.is_paid) return <p className="text-muted-foreground">This leave type is unpaid — days will be deducted from salary.</p>;
                  const bal = getBalanceForEmployee(employeeId, new Date(startDate).getFullYear());
                  if (!bal) return <p className="text-muted-foreground">No leave balance allocated yet</p>;
                  const key = leaveType.toLowerCase().replace(/\s+/g, '_');
                  const used = key === 'annual_leave' ? bal.annual_leave_used : key === 'sick_leave' ? bal.sick_leave_used : key === 'family_leave' ? bal.family_leave_used : 0;
                  const total = key === 'annual_leave' ? bal.annual_leave_total : key === 'sick_leave' ? bal.sick_leave_total : key === 'family_leave' ? bal.family_leave_total : 0;
                  const remaining = total - used;
                  const days = calcDays(startDate, endDate);
                  const willExceed = days > remaining;
                  return (
                    <div>
                      <p>Remaining: <strong>{remaining}</strong> day(s)</p>
                      {willExceed && (
                        <p className="text-destructive font-medium mt-1">
                          ⚠ Exceeds allocation by {days - remaining} day(s) — those days will be unpaid and deducted from salary.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea className="input-farm min-h-[60px]" value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional reason..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || !employeeId || !leaveType}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Leave Type Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveType} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Maternity Leave" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Days Per Year *</label>
              <Input type="number" min={0} value={typeDefaultDays} onChange={e => setTypeDefaultDays(Number(e.target.value))} required />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Paid Leave</label>
              <Switch checked={typeIsPaid} onCheckedChange={setTypeIsPaid} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Switch checked={typeIsActive} onCheckedChange={setTypeIsActive} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input-farm min-h-[60px]" value={typeDescription} onChange={e => setTypeDescription(e.target.value)} placeholder="Optional description..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTypeDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={savingType}>{savingType ? 'Saving...' : editingType ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
