import { useState, useMemo } from 'react';
import { Employee, PayrollRun } from '@/hooks/useEmployees';
import { usePayrollExtras } from '@/hooks/usePayrollExtras';
import { useAccommodation } from '@/hooks/useAccommodation';
import { GLAccountSelect } from '@/components/finance/GLAccountSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, CheckCircle, Printer, Mail, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generatePayslipPDF, generatePayrollExcel } from '@/lib/payrollExports';
import { supabase } from '@/integrations/supabase/client';

interface PayrollProcessorProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  createPayrollRun: (run: Omit<PayrollRun, 'id' | 'created_at' | 'updated_at'>) => Promise<PayrollRun | null>;
  createPayrollItems: (items: any[]) => Promise<boolean>;
  updatePayrollRun: (id: string, updates: Partial<PayrollRun>) => Promise<boolean>;
  getPayrollItemsForRun: (runId: string) => any[];
  getEmployeeById: (id: string) => Employee | undefined;
  glCreateEntry: (entry: any) => Promise<boolean>;
  getUnpaidLeaveDays?: (employeeId: string, periodStart: string, periodEnd: string) => number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/10 text-primary',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

interface WorkRow {
  employee_id: string;
  days_worked: number;
  hours_worked: number;
  overtime_hours: number;
  quantity_produced: number;
  food_allowance: number;
  other_earnings: number;
  other_deductions: number;
  absence_penalty: number;
  accommodation_deduction: number;
}

export const PayrollProcessor = ({
  employees, payrollRuns, createPayrollRun, createPayrollItems,
  updatePayrollRun, getPayrollItemsForRun, getEmployeeById, glCreateEntry,
  getUnpaidLeaveDays,
}: PayrollProcessorProps) => {
  const { loans, bonuses, getActiveLoanForEmployee, getUnappliedBonusesForEmployee, refetch: refetchExtras } = usePayrollExtras();
  const { getActiveAllocationForEmployee } = useAccommodation();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [glAccountId, setGlAccountId] = useState('');
  const [glSubAccountId, setGlSubAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [processing, setProcessing] = useState(false);
  const [workData, setWorkData] = useState<Record<string, WorkRow>>({});

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);
  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n || 0);

  const periodDays = useMemo(() => {
    if (!periodStart || !periodEnd) return 0;
    const ms = new Date(periodEnd).getTime() - new Date(periodStart).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }, [periodStart, periodEnd]);

  const initWorkData = () => {
    const data: Record<string, WorkRow> = {};
    activeEmployees.forEach(emp => {
      // Auto-pull defaults based on pay type
      const unpaidDays = getUnpaidLeaveDays ? getUnpaidLeaveDays(emp.id, periodStart, periodEnd) : 0;
      const workingDays = Math.max(0, Math.min(22, periodDays * 0.73) - unpaidDays);
      data[emp.id] = {
        employee_id: emp.id,
        days_worked: emp.pay_type === 'daily' ? Math.round(workingDays) : 0,
        hours_worked: emp.pay_type === 'hourly' ? Math.round(workingDays * 8) : 0,
        overtime_hours: 0,
        quantity_produced: 0,
        food_allowance: 0,
        other_earnings: 0,
        other_deductions: 0,
        absence_penalty: 0,
        accommodation_deduction: getActiveAllocationForEmployee(emp.id)?.monthly_charge || 0,
      };
    });
    setWorkData(data);
  };

  const openCreate = () => {
    setShowCreate(true);
    setTimeout(initWorkData, 50);
  };

  const calcItem = (emp: Employee, w: WorkRow) => {
    let basic = 0, overtimePay = 0;
    const otRate = (emp.hourly_rate || 0) * (emp.overtime_multiplier || 1.5);

    if (emp.pay_type === 'monthly') {
      const unpaidDays = getUnpaidLeaveDays ? getUnpaidLeaveDays(emp.id, periodStart, periodEnd) : 0;
      const dailyRate = emp.basic_salary / 22;
      basic = Math.max(emp.basic_salary - unpaidDays * dailyRate, 0);
    } else if (emp.pay_type === 'daily') {
      basic = w.days_worked * emp.daily_rate;
    } else if (emp.pay_type === 'hourly') {
      basic = w.hours_worked * emp.hourly_rate;
      overtimePay = w.overtime_hours * otRate;
    } else if (emp.pay_type === 'piece') {
      basic = w.quantity_produced * emp.piece_rate;
    }

    const housing = emp.pay_type === 'monthly' ? emp.housing_allowance : 0;
    const transport = emp.transport_allowance;
    const empBonuses = getUnappliedBonusesForEmployee(emp.id).reduce((s, b) => s + Number(b.amount), 0);
    const gross = basic + housing + transport + overtimePay + empBonuses + w.food_allowance + w.other_earnings;

    const tax = gross * (emp.tax_deduction_rate / 100);
    const pension = gross * (emp.pension_deduction_rate / 100);
    const medical = emp.pay_type === 'monthly' ? emp.medical_aid_deduction : 0;

    const loan = getActiveLoanForEmployee(emp.id);
    const loanDed = loan ? Math.min(loan.monthly_installment, loan.balance) : 0;

    const accommodation = w.accommodation_deduction || 0;
    const totalDed = tax + pension + medical + loanDed + accommodation + w.absence_penalty + w.other_deductions;
    const net = gross - totalDed;

    return {
      basic_salary: Math.round(basic * 100) / 100,
      housing_allowance: housing,
      transport_allowance: transport,
      overtime_pay: Math.round(overtimePay * 100) / 100,
      harvest_bonus: empBonuses,
      food_allowance: w.food_allowance,
      other_earnings: w.other_earnings,
      gross_pay: Math.round(gross * 100) / 100,
      tax_deduction: Math.round(tax * 100) / 100,
      pension_deduction: Math.round(pension * 100) / 100,
      medical_aid_deduction: medical,
      loan_deduction: Math.round(loanDed * 100) / 100,
      accommodation_deduction: Math.round(accommodation * 100) / 100,
      absence_penalty: w.absence_penalty,
      other_deductions: w.other_deductions,
      total_deductions: Math.round(totalDed * 100) / 100,
      net_pay: Math.round(net * 100) / 100,
      pay_type: emp.pay_type,
      days_worked: w.days_worked,
      hours_worked: w.hours_worked,
      overtime_hours: w.overtime_hours,
      quantity_produced: w.quantity_produced,
      payment_method: paymentMethod,
    };
  };

  const handleCreatePayroll = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!glAccountId) { toast.error('Please select a GL account'); return; }
    if (activeEmployees.length === 0) { toast.error('No active employees'); return; }
    setProcessing(true);

    const items = activeEmployees.map(emp => {
      const w = workData[emp.id] || { employee_id: emp.id, days_worked: 0, hours_worked: 0, overtime_hours: 0, quantity_produced: 0, food_allowance: 0, other_earnings: 0, other_deductions: 0, absence_penalty: 0, accommodation_deduction: 0 };
      return { employee_id: emp.id, ...calcItem(emp, w) };
    });

    const totalGross = items.reduce((s, i) => s + i.gross_pay, 0);
    const totalDed = items.reduce((s, i) => s + i.total_deductions, 0);
    const totalNet = items.reduce((s, i) => s + i.net_pay, 0);

    const run = await createPayrollRun({
      period_start: periodStart, period_end: periodEnd,
      run_date: new Date().toISOString().split('T')[0], status: 'draft',
      total_gross: totalGross, total_deductions: totalDed, total_net: totalNet,
      gl_account_id: glAccountId, gl_sub_account_id: glSubAccountId || null,
      branch_id: null, processed_by: null, notes: null,
      ...({ default_payment_method: paymentMethod } as any),
    } as any);

    if (run) {
      const itemsWithRun = items.map(i => ({ ...i, payroll_run_id: run.id }));
      const ok = await createPayrollItems(itemsWithRun);
      if (ok) {
        // Mark applied bonuses + decrement loan balances
        for (const emp of activeEmployees) {
          const empBonuses = getUnappliedBonusesForEmployee(emp.id);
          for (const b of empBonuses) {
            await (supabase as any).from('employee_bonuses').update({ applied_to_payroll_id: run.id }).eq('id', b.id);
          }
          const loan = getActiveLoanForEmployee(emp.id);
          if (loan) {
            const newBal = Math.max(0, loan.balance - Math.min(loan.monthly_installment, loan.balance));
            await (supabase as any).from('employee_loans').update({
              balance: newBal,
              status: newBal === 0 ? 'paid_off' : 'active',
            }).eq('id', loan.id);
          }
        }
        await refetchExtras();
        toast.success(`Payroll processed for ${items.length} employees`);
      }
    }
    setProcessing(false);
    setShowCreate(false);
  };

  const handleApprove = async (run: PayrollRun) => {
    await updatePayrollRun(run.id, { status: 'approved' });
    if (run.gl_account_id) {
      await glCreateEntry({
        entry_date: run.run_date, gl_account_id: run.gl_account_id,
        gl_sub_account_id: run.gl_sub_account_id || null,
        description: `Payroll ${run.period_start} to ${run.period_end}`,
        debit: run.total_net, credit: 0,
        reference_type: 'payroll', reference_id: run.id,
        reference_number: `PAY-${run.period_start}`, branch_id: run.branch_id || null,
      });
      toast.success('Approved & GL entry posted');
    }
  };

  const handleMarkPaid = async (run: PayrollRun) => {
    await updatePayrollRun(run.id, { status: 'paid' });
    const items = getPayrollItemsForRun(run.id);
    for (const it of items) {
      await (supabase as any).from('payroll_items').update({
        paid_at: new Date().toISOString(),
        payment_reference: `${(run as any).default_payment_method || 'bank'}-${run.id.slice(0, 8)}`,
      }).eq('id', it.id);
    }
    toast.success('Marked as paid');
  };

  const handleSendPayslips = async (run: PayrollRun) => {
    const items = getPayrollItemsForRun(run.id);
    const recipients = items
      .map(it => ({ item: it, emp: getEmployeeById(it.employee_id) }))
      .filter(r => r.emp?.email);
    if (recipients.length === 0) { toast.error('No employees with email addresses'); return; }
    toast.info(`Sending payslips to ${recipients.length} employee(s)...`);

    try {
      const { data, error } = await supabase.functions.invoke('send-payslips', {
        body: {
          run_id: run.id,
          period_start: run.period_start,
          period_end: run.period_end,
          recipients: recipients.map(r => ({
            employee_id: r.emp!.id,
            name: `${r.emp!.first_name} ${r.emp!.last_name}`,
            email: r.emp!.email,
            phone: r.emp!.phone,
            net_pay: r.item.net_pay,
            gross_pay: r.item.gross_pay,
            total_deductions: r.item.total_deductions,
            payment_method: r.item.payment_method,
          })),
        },
      });
      if (error) throw error;
      for (const r of recipients) {
        await (supabase as any).from('payroll_items').update({ payslip_sent_at: new Date().toISOString() }).eq('id', r.item.id);
      }
      toast.success(`Payslips sent: ${data?.sent || recipients.length}`);
    } catch (e: any) {
      toast.error('Send failed: ' + (e?.message || 'unknown'));
    }
  };

  const viewDetails = (run: PayrollRun) => { setSelectedRun(run); setShowDetails(true); };

  const runItems = selectedRun ? getPayrollItemsForRun(selectedRun.id) : [];

  const setW = (empId: string, field: keyof WorkRow, value: number) => {
    setWorkData(d => ({ ...d, [empId]: { ...d[empId], [field]: value } }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll Runs</h3>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Process Payroll</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-4 py-3 text-left font-medium">Period</th>
            <th className="px-4 py-3 text-left font-medium">Run Date</th>
            <th className="px-4 py-3 text-right font-medium">Gross</th>
            <th className="px-4 py-3 text-right font-medium">Deductions</th>
            <th className="px-4 py-3 text-right font-medium">Net</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {payrollRuns.map(run => (
              <tr key={run.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">{run.period_start} → {run.period_end}</td>
                <td className="px-4 py-3">{run.run_date}</td>
                <td className="px-4 py-3 text-right">{fmt(run.total_gross)}</td>
                <td className="px-4 py-3 text-right">{fmt(run.total_deductions)}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(run.total_net)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge className={statusColors[run.status] || ''}>{run.status}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => viewDetails(run)} title="View"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => generatePayrollExcel(run, getPayrollItemsForRun(run.id), getEmployeeById)} title="Excel">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    </Button>
                    {run.status === 'draft' && (
                      <Button variant="ghost" size="sm" onClick={() => handleApprove(run)} title="Approve">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    {run.status === 'approved' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(run)} title="Mark Paid">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendPayslips(run)} title="Email Payslips">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </Button>
                      </>
                    )}
                    {run.status === 'paid' && (
                      <Button variant="ghost" size="sm" onClick={() => handleSendPayslips(run)} title="Email Payslips">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payrollRuns.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payroll runs yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create Payroll Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Process Payroll</DialogTitle></DialogHeader>
          <form onSubmit={handleCreatePayroll} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium mb-1">Period Start *</label>
                <Input type="date" required value={periodStart} onChange={e => { setPeriodStart(e.target.value); setTimeout(initWorkData, 50); }} /></div>
              <div><label className="block text-sm font-medium mb-1">Period End *</label>
                <Input type="date" required value={periodEnd} onChange={e => { setPeriodEnd(e.target.value); setTimeout(initWorkData, 50); }} /></div>
              <div><label className="block text-sm font-medium mb-1">Payment Method</label>
                <select className="input-farm" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                </select></div>
              <div className="flex items-end">
                <Button type="button" variant="outline" size="sm" onClick={initWorkData}>Auto-fill from Attendance</Button>
              </div>
            </div>
            <GLAccountSelect
              selectedAccountId={glAccountId} selectedSubAccountId={glSubAccountId}
              onAccountChange={setGlAccountId} onSubAccountChange={setGlSubAccountId}
            />

            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50"><tr>
                  <th className="px-2 py-2 text-left">Employee</th>
                  <th className="px-2 py-2 text-left">Pay Type</th>
                  <th className="px-2 py-2 text-right">Days</th>
                  <th className="px-2 py-2 text-right">Hours</th>
                  <th className="px-2 py-2 text-right">OT Hrs</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">Food</th>
                  <th className="px-2 py-2 text-right">Other +</th>
                  <th className="px-2 py-2 text-right">Penalty</th>
                  <th className="px-2 py-2 text-right">Other -</th>
                  <th className="px-2 py-2 text-right">Accom.</th>
                  <th className="px-2 py-2 text-right font-semibold">Net Preview</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {activeEmployees.map(emp => {
                    const w = workData[emp.id];
                    if (!w) return null;
                    const preview = calcItem(emp, w);
                    return (
                      <tr key={emp.id}>
                        <td className="px-2 py-1.5 whitespace-nowrap">{emp.first_name} {emp.last_name}</td>
                        <td className="px-2 py-1.5"><Badge variant="outline" className="text-[10px]">{emp.pay_type}</Badge></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" disabled={emp.pay_type !== 'daily' && emp.pay_type !== 'monthly'} value={w.days_worked} onChange={e => setW(emp.id, 'days_worked', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" disabled={emp.pay_type !== 'hourly'} value={w.hours_worked} onChange={e => setW(emp.id, 'hours_worked', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-14 text-right" type="number" disabled={emp.pay_type !== 'hourly'} value={w.overtime_hours} onChange={e => setW(emp.id, 'overtime_hours', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" disabled={emp.pay_type !== 'piece'} value={w.quantity_produced} onChange={e => setW(emp.id, 'quantity_produced', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" value={w.food_allowance} onChange={e => setW(emp.id, 'food_allowance', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" value={w.other_earnings} onChange={e => setW(emp.id, 'other_earnings', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" value={w.absence_penalty} onChange={e => setW(emp.id, 'absence_penalty', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-16 text-right" type="number" value={w.other_deductions} onChange={e => setW(emp.id, 'other_deductions', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1"><Input className="h-7 w-20 text-right" type="number" value={w.accommodation_deduction} onChange={e => setW(emp.id, 'accommodation_deduction', parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-1.5 text-right font-semibold">{fmt(preview.net_pay)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm flex justify-between">
              <span>Bonuses & loans applied automatically per employee</span>
              <span className="font-semibold">Total Net: {fmt(activeEmployees.reduce((s, emp) => {
                const w = workData[emp.id]; if (!w) return s;
                return s + calcItem(emp, w).net_pay;
              }, 0))}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={processing}>{processing ? 'Processing...' : 'Process Payroll'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payroll Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payroll Details — {selectedRun?.period_start} to {selectedRun?.period_end}</span>
              {selectedRun && (
                <Button size="sm" variant="outline" onClick={() => generatePayrollExcel(selectedRun, runItems, getEmployeeById)}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />Excel
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50"><tr>
                <th className="px-2 py-2 text-left">Employee</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-right">Basic</th>
                <th className="px-2 py-2 text-right">OT</th>
                <th className="px-2 py-2 text-right">Bonus</th>
                <th className="px-2 py-2 text-right">Allow.</th>
                <th className="px-2 py-2 text-right">Gross</th>
                <th className="px-2 py-2 text-right">Tax</th>
                <th className="px-2 py-2 text-right">Loan</th>
                <th className="px-2 py-2 text-right">Other Ded.</th>
                <th className="px-2 py-2 text-right font-semibold">Net</th>
                <th className="px-2 py-2 text-center">Pay</th>
                <th className="px-2 py-2 text-center">Slip</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {runItems.map((item: any) => {
                  const emp = getEmployeeById(item.employee_id);
                  const allowances = (item.housing_allowance || 0) + (item.transport_allowance || 0) + (item.food_allowance || 0) + (item.other_earnings || 0);
                  const otherDed = (item.pension_deduction || 0) + (item.medical_aid_deduction || 0) + (item.absence_penalty || 0) + (item.other_deductions || 0);
                  return (
                    <tr key={item.id}>
                      <td className="px-2 py-1.5 whitespace-nowrap">{emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</td>
                      <td className="px-2 py-1.5"><Badge variant="outline" className="text-[10px]">{item.pay_type || 'monthly'}</Badge></td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.basic_salary)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.overtime_pay || 0)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.harvest_bonus || 0)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(allowances)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.gross_pay)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.tax_deduction)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(item.loan_deduction || 0)}</td>
                      <td className="px-2 py-1.5 text-right">{fmt(otherDed)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{fmt(item.net_pay)}</td>
                      <td className="px-2 py-1.5 text-center">
                        <Button variant="ghost" size="sm" onClick={() => emp && generatePayslipPDF(emp, item, selectedRun!)} title="PDF Payslip">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {item.payslip_sent_at ? <Badge variant="outline" className="text-[10px]">sent</Badge> : <span className="text-muted-foreground">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
