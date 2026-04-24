import { useEffect, useMemo, useRef, useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, Download, Receipt } from 'lucide-react';

export const MyPayslips = () => {
  const { user } = useAuth();
  const { employees, payrollRuns, getPayrollItemsForRun, getEmployeeById, loading } = useEmployees();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  // Match the logged-in user to an employee record by name or email
  const myEmployee = useMemo(() => {
    if (!user) return null;
    const norm = (s: string) => s.trim().toLowerCase();
    return (
      employees.find(e => e.email && user.email && norm(e.email) === norm(user.email)) ||
      employees.find(e => norm(`${e.first_name} ${e.last_name}`) === norm(user.name)) ||
      null
    );
  }, [employees, user]);

  // Find all payslip items belonging to my employee across approved/paid runs
  const myPayslips = useMemo(() => {
    if (!myEmployee) return [];
    const visibleRuns = payrollRuns.filter(r => r.status === 'approved' || r.status === 'paid');
    const rows = visibleRuns.flatMap(run => {
      const items = getPayrollItemsForRun(run.id);
      const mine = items.find((i: any) => i.employee_id === myEmployee.id);
      return mine ? [{ run, item: mine }] : [];
    });
    return rows.sort((a, b) => (a.run.period_end < b.run.period_end ? 1 : -1));
  }, [myEmployee, payrollRuns, getPayrollItemsForRun]);

  useEffect(() => {
    if (!selectedItemId && myPayslips.length > 0) setSelectedItemId(myPayslips[0].item.id);
  }, [myPayslips, selectedItemId]);

  const selected = myPayslips.find(p => p.item.id === selectedItemId);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(n) || 0);

  const printPayslip = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Payslip</title><style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      .text-right { text-align: right; }
      .header { text-align: center; margin-bottom: 24px; }
      .section-title { font-weight: bold; margin-top: 16px; padding: 6px 0; border-bottom: 2px solid #333; }
      .total-row { font-weight: bold; background: #f0f0f0; }
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  const downloadPayslip = () => {
    if (!selected || !myEmployee) return;
    const { run, item } = selected;
    const lines = [
      ['PAYSLIP'],
      [`Period:,${run.period_start} to ${run.period_end}`],
      [`Employee:,${myEmployee.first_name} ${myEmployee.last_name}`],
      [`ID Number:,${myEmployee.id_number || '-'}`],
      [`Department:,${myEmployee.department || '-'}`],
      [`Position:,${myEmployee.position || '-'}`],
      [''],
      ['EARNINGS'],
      [`Basic Salary,${item.basic_salary}`],
      [`Housing Allowance,${item.housing_allowance}`],
      [`Transport Allowance,${item.transport_allowance}`],
      [`Gross Pay,${item.gross_pay}`],
      [''],
      ['DEDUCTIONS'],
      [`Tax (PAYE),${item.tax_deduction}`],
      [`Pension,${item.pension_deduction}`],
      [`Medical Aid,${item.medical_aid_deduction}`],
      [`Total Deductions,${item.total_deductions}`],
      [''],
      [`NET PAY,${item.net_pay}`],
    ];
    const csv = lines.map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${myEmployee.last_name}-${run.period_end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading payslips…</p>;
  }

  if (!myEmployee) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">No employee record linked to your profile</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ask HR to create an employee record matching your name or email so payslips can appear here.
        </p>
      </div>
    );
  }

  if (myPayslips.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">No payslips available yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Payslips appear here once your payroll run is approved or paid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm font-medium mb-1">Payroll Period</label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
          >
            {myPayslips.map(p => (
              <option key={p.item.id} value={p.item.id}>
                {p.run.period_start} → {p.run.period_end} ({p.run.status})
              </option>
            ))}
          </select>
        </div>
        {selected && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadPayslip} className="gap-2">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
            <Button onClick={printPayslip} className="gap-2">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
          </div>
        )}
      </div>

      {selected && (
        <div ref={printRef} className="bg-card border border-border rounded-xl p-6">
          <div className="header text-center mb-6">
            <h2 className="text-xl font-bold">PAYSLIP</h2>
            <p className="text-sm text-muted-foreground">
              Period: {selected.run.period_start} to {selected.run.period_end}
            </p>
            <Badge variant="secondary" className="mt-2 capitalize">{selected.run.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-muted-foreground">Employee:</span> <strong>{myEmployee.first_name} {myEmployee.last_name}</strong></div>
            <div><span className="text-muted-foreground">ID Number:</span> {myEmployee.id_number || '-'}</div>
            <div><span className="text-muted-foreground">Department:</span> {myEmployee.department || '-'}</div>
            <div><span className="text-muted-foreground">Position:</span> {myEmployee.position || '-'}</div>
          </div>

          <div className="section-title text-sm font-semibold border-b-2 border-foreground pb-1 mb-2">EARNINGS</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr><td className="border border-border px-3 py-2">Basic Salary</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.basic_salary)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Housing Allowance</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.housing_allowance)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Transport Allowance</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.transport_allowance)}</td></tr>
              <tr className="font-semibold bg-muted/50"><td className="border border-border px-3 py-2">Gross Pay</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.gross_pay)}</td></tr>
            </tbody>
          </table>

          <div className="section-title text-sm font-semibold border-b-2 border-foreground pb-1 mb-2 mt-4">DEDUCTIONS</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr><td className="border border-border px-3 py-2">Tax (PAYE)</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.tax_deduction)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Pension</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.pension_deduction)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Medical Aid</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.medical_aid_deduction)}</td></tr>
              <tr className="font-semibold bg-muted/50"><td className="border border-border px-3 py-2">Total Deductions</td><td className="border border-border px-3 py-2 text-right">{fmt(selected.item.total_deductions)}</td></tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-primary/10 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">NET PAY</span>
            <span className="font-bold text-lg">{fmt(selected.item.net_pay)}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="px-4 py-2 border-b bg-muted/30 text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> Payslip History
        </div>
        <div className="divide-y">
          {myPayslips.map(p => (
            <button
              key={p.item.id}
              onClick={() => setSelectedItemId(p.item.id)}
              className={`w-full text-left px-4 py-2 flex justify-between items-center hover:bg-muted/40 transition-colors ${
                selectedItemId === p.item.id ? 'bg-muted/50' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium">{p.run.period_start} → {p.run.period_end}</p>
                <p className="text-xs text-muted-foreground capitalize">{p.run.status}</p>
              </div>
              <span className="text-sm font-semibold">{fmt(p.item.net_pay)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};