import { useState, useMemo } from 'react';
import { Employee, PayrollRun } from '@/hooks/useEmployees';
import { GLAccount } from '@/hooks/useGLAccounts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Filter } from 'lucide-react';

interface PayrollReportsProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  getPayrollItemsForRun: (runId: string) => any[];
  getEmployeeById: (id: string) => Employee | undefined;
  glAccounts: GLAccount[];
}

export const PayrollReports = ({ employees, payrollRuns, getPayrollItemsForRun, getEmployeeById, glAccounts }: PayrollReportsProps) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const departments = useMemo(() => [...new Set(employees.map(e => e.department).filter(Boolean))], [employees]);

  const filteredRuns = useMemo(() => {
    return payrollRuns.filter(r => {
      if (dateFrom && r.period_start < dateFrom) return false;
      if (dateTo && r.period_end > dateTo) return false;
      if (branchFilter && r.branch_id !== branchFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [payrollRuns, dateFrom, dateTo, branchFilter, statusFilter]);

  const summary = useMemo(() => {
    let totalGross = 0, totalDed = 0, totalNet = 0, empCount = 0;
    filteredRuns.forEach(r => {
      totalGross += r.total_gross;
      totalDed += r.total_deductions;
      totalNet += r.total_net;
      empCount += getPayrollItemsForRun(r.id).length;
    });
    return { totalGross, totalDed, totalNet, runs: filteredRuns.length, empCount };
  }, [filteredRuns, getPayrollItemsForRun]);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  // Detailed items for department filtering
  const detailedItems = useMemo(() => {
    const items: any[] = [];
    filteredRuns.forEach(run => {
      getPayrollItemsForRun(run.id).forEach((item: any) => {
        const emp = getEmployeeById(item.employee_id);
        if (departmentFilter && emp?.department !== departmentFilter) return;
        items.push({ ...item, run, employee: emp });
      });
    });
    return items;
  }, [filteredRuns, getPayrollItemsForRun, getEmployeeById, departmentFilter]);

  const exportCSV = () => {
    const headers = ['Period', 'Employee', 'Department', 'Basic Salary', 'Housing', 'Transport', 'Gross', 'Tax', 'Pension', 'Medical', 'Total Deductions', 'Net Pay'];
    const rows = detailedItems.map(i => [
      `${i.run.period_start} - ${i.run.period_end}`,
      i.employee ? `${i.employee.first_name} ${i.employee.last_name}` : 'Unknown',
      i.employee?.department || '',
      i.basic_salary, i.housing_allowance, i.transport_allowance, i.gross_pay,
      i.tax_deduction, i.pension_deduction, i.medical_aid_deduction, i.total_deductions, i.net_pay,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payroll-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Filter className="h-5 w-5" />Payroll Reports</h3>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div><label className="block text-xs font-medium mb-1">From Date</label>
          <input className="input-farm" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1">To Date</label>
          <input className="input-farm" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1">Department</label>
          <select className="input-farm" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="">All</option>
            {departments.map(d => <option key={d} value={d!}>{d}</option>)}
          </select></div>
        <div><label className="block text-xs font-medium mb-1">Status</label>
          <select className="input-farm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select></div>
        <div className="flex items-end">
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setBranchFilter(''); setDepartmentFilter(''); setStatusFilter(''); }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border p-4 bg-card">
          <p className="text-xs text-muted-foreground">Payroll Runs</p>
          <p className="text-2xl font-bold">{summary.runs}</p>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total Gross</p>
          <p className="text-2xl font-bold">{fmt(summary.totalGross)}</p>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total Deductions</p>
          <p className="text-2xl font-bold">{fmt(summary.totalDed)}</p>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total Net Pay</p>
          <p className="text-2xl font-bold">{fmt(summary.totalNet)}</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="px-3 py-2 text-left">Period</th>
            <th className="px-3 py-2 text-left">Employee</th>
            <th className="px-3 py-2 text-left">Department</th>
            <th className="px-3 py-2 text-right">Gross</th>
            <th className="px-3 py-2 text-right">Deductions</th>
            <th className="px-3 py-2 text-right font-semibold">Net Pay</th>
            <th className="px-3 py-2 text-center">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {detailedItems.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-muted/30">
                <td className="px-3 py-2 text-xs">{item.run.period_start} – {item.run.period_end}</td>
                <td className="px-3 py-2">{item.employee ? `${item.employee.first_name} ${item.employee.last_name}` : 'Unknown'}</td>
                <td className="px-3 py-2">{item.employee?.department || '-'}</td>
                <td className="px-3 py-2 text-right">{fmt(item.gross_pay)}</td>
                <td className="px-3 py-2 text-right">{fmt(item.total_deductions)}</td>
                <td className="px-3 py-2 text-right font-semibold">{fmt(item.net_pay)}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline">{item.run.status}</Badge></td>
              </tr>
            ))}
            {detailedItems.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No records match filters</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
