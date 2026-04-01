import { useState, useRef } from 'react';
import { Employee, PayrollRun } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Search } from 'lucide-react';

interface PayslipViewerProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  getPayrollItemsForRun: (runId: string) => any[];
  getEmployeeById: (id: string) => Employee | undefined;
}

export const PayslipViewer = ({ employees, payrollRuns, getPayrollItemsForRun, getEmployeeById }: PayslipViewerProps) => {
  const [selectedRunId, setSelectedRunId] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const approvedRuns = payrollRuns.filter(r => r.status === 'approved' || r.status === 'paid');
  const runItems = selectedRunId ? getPayrollItemsForRun(selectedRunId) : [];
  const selectedItem = runItems.find((i: any) => i.employee_id === selectedEmpId);
  const selectedRun = payrollRuns.find(r => r.id === selectedRunId);
  const selectedEmp = selectedEmpId ? getEmployeeById(selectedEmpId) : null;

  const empOptions = runItems.map((i: any) => {
    const emp = getEmployeeById(i.employee_id);
    return emp ? { id: emp.id, name: `${emp.first_name} ${emp.last_name}` } : null;
  }).filter(Boolean);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Payslip</title><style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f5f5f5; }
      .text-right { text-align: right; }
      .header { text-align: center; margin-bottom: 24px; }
      .section-title { font-weight: bold; margin-top: 16px; padding: 6px 0; border-bottom: 2px solid #333; }
      .total-row { font-weight: bold; background: #f0f0f0; }
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-1">Payroll Period</label>
          <select className="input-farm" value={selectedRunId} onChange={e => { setSelectedRunId(e.target.value); setSelectedEmpId(''); }}>
            <option value="">Select period</option>
            {approvedRuns.map(r => (
              <option key={r.id} value={r.id}>{r.period_start} → {r.period_end} ({r.status})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-1">Employee</label>
          <select className="input-farm" value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} disabled={!selectedRunId}>
            <option value="">Select employee</option>
            {empOptions.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        {selectedItem && <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print Payslip</Button>}
      </div>

      {selectedItem && selectedEmp && selectedRun && (
        <div ref={printRef} className="bg-card border border-border rounded-xl p-6 max-w-2xl">
          <div className="header text-center mb-6">
            <h2 className="text-xl font-bold">PAYSLIP</h2>
            <p className="text-sm text-muted-foreground">Period: {selectedRun.period_start} to {selectedRun.period_end}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-muted-foreground">Employee:</span> <strong>{selectedEmp.first_name} {selectedEmp.last_name}</strong></div>
            <div><span className="text-muted-foreground">ID Number:</span> {selectedEmp.id_number || '-'}</div>
            <div><span className="text-muted-foreground">Department:</span> {selectedEmp.department || '-'}</div>
            <div><span className="text-muted-foreground">Position:</span> {selectedEmp.position || '-'}</div>
          </div>

          <div className="section-title text-sm font-semibold border-b-2 border-foreground pb-1 mb-2">EARNINGS</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr><td className="border border-border px-3 py-2">Basic Salary</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.basic_salary)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Housing Allowance</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.housing_allowance)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Transport Allowance</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.transport_allowance)}</td></tr>
              <tr className="font-semibold bg-muted/50"><td className="border border-border px-3 py-2">Gross Pay</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.gross_pay)}</td></tr>
            </tbody>
          </table>

          <div className="section-title text-sm font-semibold border-b-2 border-foreground pb-1 mb-2 mt-4">DEDUCTIONS</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr><td className="border border-border px-3 py-2">Tax (PAYE)</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.tax_deduction)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Pension</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.pension_deduction)}</td></tr>
              <tr><td className="border border-border px-3 py-2">Medical Aid</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.medical_aid_deduction)}</td></tr>
              <tr className="font-semibold bg-muted/50"><td className="border border-border px-3 py-2">Total Deductions</td><td className="border border-border px-3 py-2 text-right">{fmt(selectedItem.total_deductions)}</td></tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-primary/10 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">NET PAY</span>
            <span className="font-bold text-lg">{fmt(selectedItem.net_pay)}</span>
          </div>
        </div>
      )}

      {!selectedItem && selectedRunId && selectedEmpId && (
        <p className="text-muted-foreground">No payslip found for this selection.</p>
      )}
    </div>
  );
};
