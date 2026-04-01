import { useState } from 'react';
import { Employee, PayrollRun, useEmployees } from '@/hooks/useEmployees';
import { useGLAccounts } from '@/hooks/useGLAccounts';
import { GLAccountSelect } from '@/components/finance/GLAccountSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PayrollProcessorProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  createPayrollRun: (run: Omit<PayrollRun, 'id' | 'created_at' | 'updated_at'>) => Promise<PayrollRun | null>;
  createPayrollItems: (items: any[]) => Promise<boolean>;
  updatePayrollRun: (id: string, updates: Partial<PayrollRun>) => Promise<boolean>;
  getPayrollItemsForRun: (runId: string) => any[];
  getEmployeeById: (id: string) => Employee | undefined;
  glCreateEntry: (entry: any) => Promise<boolean>;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/10 text-primary',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const PayrollProcessor = ({
  employees, payrollRuns, createPayrollRun, createPayrollItems,
  updatePayrollRun, getPayrollItemsForRun, getEmployeeById, glCreateEntry,
}: PayrollProcessorProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [glAccountId, setGlAccountId] = useState('');
  const [glSubAccountId, setGlSubAccountId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [processing, setProcessing] = useState(false);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  const handleCreatePayroll = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!glAccountId) { toast.error('Please select a GL account'); return; }
    if (activeEmployees.length === 0) { toast.error('No active employees'); return; }
    setProcessing(true);

    // Calculate totals
    const items = activeEmployees.map(emp => {
      const gross = emp.basic_salary + emp.housing_allowance + emp.transport_allowance;
      const tax = gross * (emp.tax_deduction_rate / 100);
      const pension = gross * (emp.pension_deduction_rate / 100);
      const medical = emp.medical_aid_deduction;
      const totalDed = tax + pension + medical;
      return {
        employee_id: emp.id,
        basic_salary: emp.basic_salary,
        housing_allowance: emp.housing_allowance,
        transport_allowance: emp.transport_allowance,
        gross_pay: gross,
        tax_deduction: Math.round(tax * 100) / 100,
        pension_deduction: Math.round(pension * 100) / 100,
        medical_aid_deduction: medical,
        total_deductions: Math.round(totalDed * 100) / 100,
        net_pay: Math.round((gross - totalDed) * 100) / 100,
      };
    });

    const totalGross = items.reduce((s, i) => s + i.gross_pay, 0);
    const totalDed = items.reduce((s, i) => s + i.total_deductions, 0);
    const totalNet = items.reduce((s, i) => s + i.net_pay, 0);

    const run = await createPayrollRun({
      period_start: periodStart,
      period_end: periodEnd,
      run_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      total_gross: totalGross,
      total_deductions: totalDed,
      total_net: totalNet,
      gl_account_id: glAccountId,
      gl_sub_account_id: glSubAccountId || null,
      branch_id: branchId || null,
      processed_by: null,
      notes: null,
    });

    if (run) {
      const itemsWithRun = items.map(i => ({ ...i, payroll_run_id: run.id }));
      await createPayrollItems(itemsWithRun);
      toast.success(`Payroll processed for ${items.length} employees`);
    }
    setProcessing(false);
    setShowCreate(false);
  };

  const handleApprove = async (run: PayrollRun) => {
    await updatePayrollRun(run.id, { status: 'approved' });
    // Post GL entry
    if (run.gl_account_id) {
      await glCreateEntry({
        entry_date: run.run_date,
        gl_account_id: run.gl_account_id,
        gl_sub_account_id: run.gl_sub_account_id || null,
        description: `Payroll ${run.period_start} to ${run.period_end}`,
        debit: run.total_net,
        credit: 0,
        reference_type: 'payroll',
        reference_id: run.id,
        reference_number: `PAY-${run.period_start}`,
        branch_id: run.branch_id || null,
      });
      toast.success('GL entry posted for payroll');
    }
  };

  const handleMarkPaid = async (run: PayrollRun) => {
    await updatePayrollRun(run.id, { status: 'paid' });
  };

  const viewDetails = (run: PayrollRun) => {
    setSelectedRun(run);
    setShowDetails(true);
  };

  const runItems = selectedRun ? getPayrollItemsForRun(selectedRun.id) : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll Runs</h3>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Process Payroll</Button>
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
                <td className="px-4 py-3 text-center flex gap-1 justify-center">
                  <Button variant="ghost" size="sm" onClick={() => viewDetails(run)}><Eye className="h-4 w-4" /></Button>
                  {run.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => handleApprove(run)}>
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  {run.status === 'approved' && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(run)}>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {payrollRuns.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payroll runs yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create Payroll Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Process Payroll</DialogTitle></DialogHeader>
          <form onSubmit={handleCreatePayroll} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Period Start *</label>
                <input className="input-farm" type="date" required value={periodStart} onChange={e => setPeriodStart(e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1">Period End *</label>
                <input className="input-farm" type="date" required value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} /></div>
            </div>
            <GLAccountSelect
              selectedAccountId={glAccountId}
              selectedSubAccountId={glSubAccountId}
              onAccountChange={setGlAccountId}
              onSubAccountChange={setGlSubAccountId}
            />
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">Will process {activeEmployees.length} active employee(s)</p>
              <p className="text-muted-foreground">Payroll will be created as draft. Approve to post GL entries.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={processing}>{processing ? 'Processing...' : 'Process'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payroll Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Payroll Details — {selectedRun?.period_start} to {selectedRun?.period_end}</DialogTitle></DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-right">Basic</th>
                <th className="px-3 py-2 text-right">Housing</th>
                <th className="px-3 py-2 text-right">Transport</th>
                <th className="px-3 py-2 text-right">Gross</th>
                <th className="px-3 py-2 text-right">Tax</th>
                <th className="px-3 py-2 text-right">Pension</th>
                <th className="px-3 py-2 text-right">Medical</th>
                <th className="px-3 py-2 text-right font-semibold">Net</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {runItems.map((item: any) => {
                  const emp = getEmployeeById(item.employee_id);
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.basic_salary)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.housing_allowance)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.transport_allowance)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.gross_pay)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.tax_deduction)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.pension_deduction)}</td>
                      <td className="px-3 py-2 text-right">{fmt(item.medical_aid_deduction)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(item.net_pay)}</td>
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
