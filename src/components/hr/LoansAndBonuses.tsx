import { useState } from 'react';
import { Employee } from '@/hooks/useEmployees';
import { usePayrollExtras } from '@/hooks/usePayrollExtras';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, HandCoins, Award } from 'lucide-react';

interface Props { employees: Employee[]; }

export const LoansAndBonuses = ({ employees }: Props) => {
  const { loans, bonuses, createLoan, deleteLoan, createBonus, deleteBonus } = usePayrollExtras();
  const [showLoan, setShowLoan] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [loanForm, setLoanForm] = useState({ employee_id: '', principal_amount: 0, monthly_installment: 0, reason: '', loan_date: new Date().toISOString().split('T')[0] });
  const [bonusForm, setBonusForm] = useState({ employee_id: '', bonus_type: 'harvest', amount: 0, description: '', bonus_date: new Date().toISOString().split('T')[0] });

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n || 0);
  const empName = (id: string) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : 'Unknown';
  };

  const submitLoan = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!loanForm.employee_id || loanForm.principal_amount <= 0) return;
    const ok = await createLoan({
      employee_id: loanForm.employee_id,
      loan_date: loanForm.loan_date,
      principal_amount: loanForm.principal_amount,
      monthly_installment: loanForm.monthly_installment,
      balance: loanForm.principal_amount,
      reason: loanForm.reason || null,
      status: 'active', branch_id: null,
    });
    if (ok) { setShowLoan(false); setLoanForm({ employee_id: '', principal_amount: 0, monthly_installment: 0, reason: '', loan_date: new Date().toISOString().split('T')[0] }); }
  };

  const submitBonus = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!bonusForm.employee_id || bonusForm.amount <= 0) return;
    const ok = await createBonus({
      employee_id: bonusForm.employee_id,
      bonus_type: bonusForm.bonus_type,
      amount: bonusForm.amount,
      bonus_date: bonusForm.bonus_date,
      description: bonusForm.description || null,
      applied_to_payroll_id: null, branch_id: null,
    });
    if (ok) { setShowBonus(false); setBonusForm({ employee_id: '', bonus_type: 'harvest', amount: 0, description: '', bonus_date: new Date().toISOString().split('T')[0] }); }
  };

  return (
    <div className="space-y-6">
      {/* Loans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2"><HandCoins className="h-5 w-5" />Employee Loans</h3>
          <Button onClick={() => setShowLoan(true)} size="sm"><Plus className="h-4 w-4 mr-1" />New Loan</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">Principal</th>
              <th className="px-3 py-2 text-right">Installment</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loans.map(l => (
                <tr key={l.id}>
                  <td className="px-3 py-2">{empName(l.employee_id)}</td>
                  <td className="px-3 py-2">{l.loan_date}</td>
                  <td className="px-3 py-2 text-right">{fmt(l.principal_amount)}</td>
                  <td className="px-3 py-2 text-right">{fmt(l.monthly_installment)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmt(l.balance)}</td>
                  <td className="px-3 py-2 text-center"><Badge variant={l.status === 'active' ? 'default' : 'secondary'}>{l.status}</Badge></td>
                  <td className="px-3 py-2 text-center">
                    <Button variant="ghost" size="sm" onClick={() => confirm('Delete loan?') && deleteLoan(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No loans recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonuses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Award className="h-5 w-5" />Bonuses</h3>
          <Button onClick={() => setShowBonus(true)} size="sm"><Plus className="h-4 w-4 mr-1" />New Bonus</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-center">Applied</th>
              <th className="px-3 py-2 text-center"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {bonuses.map(b => (
                <tr key={b.id}>
                  <td className="px-3 py-2">{empName(b.employee_id)}</td>
                  <td className="px-3 py-2">{b.bonus_date}</td>
                  <td className="px-3 py-2"><Badge variant="outline">{b.bonus_type}</Badge></td>
                  <td className="px-3 py-2 text-right font-semibold">{fmt(b.amount)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.description || '-'}</td>
                  <td className="px-3 py-2 text-center">{b.applied_to_payroll_id ? <Badge>applied</Badge> : <Badge variant="outline">pending</Badge>}</td>
                  <td className="px-3 py-2 text-center">
                    {!b.applied_to_payroll_id && <Button variant="ghost" size="sm" onClick={() => confirm('Delete bonus?') && deleteBonus(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </td>
                </tr>
              ))}
              {bonuses.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No bonuses recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan dialog */}
      <Dialog open={showLoan} onOpenChange={setShowLoan}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Loan</DialogTitle></DialogHeader>
          <form onSubmit={submitLoan} className="space-y-3">
            <div><label className="text-sm font-medium">Employee *</label>
              <select className="input-farm" required value={loanForm.employee_id} onChange={e => setLoanForm({ ...loanForm, employee_id: e.target.value })}>
                <option value="">Select...</option>
                {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Loan Date</label><Input type="date" value={loanForm.loan_date} onChange={e => setLoanForm({ ...loanForm, loan_date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Principal *</label><Input type="number" step="0.01" required value={loanForm.principal_amount} onChange={e => setLoanForm({ ...loanForm, principal_amount: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="text-sm font-medium">Monthly Installment *</label><Input type="number" step="0.01" required value={loanForm.monthly_installment} onChange={e => setLoanForm({ ...loanForm, monthly_installment: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div><label className="text-sm font-medium">Reason</label><Input value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowLoan(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bonus dialog */}
      <Dialog open={showBonus} onOpenChange={setShowBonus}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Bonus</DialogTitle></DialogHeader>
          <form onSubmit={submitBonus} className="space-y-3">
            <div><label className="text-sm font-medium">Employee *</label>
              <select className="input-farm" required value={bonusForm.employee_id} onChange={e => setBonusForm({ ...bonusForm, employee_id: e.target.value })}>
                <option value="">Select...</option>
                {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Type</label>
                <select className="input-farm" value={bonusForm.bonus_type} onChange={e => setBonusForm({ ...bonusForm, bonus_type: e.target.value })}>
                  <option value="harvest">Harvest</option>
                  <option value="performance">Performance</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="other">Other</option>
                </select></div>
              <div><label className="text-sm font-medium">Date</label><Input type="date" value={bonusForm.bonus_date} onChange={e => setBonusForm({ ...bonusForm, bonus_date: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Amount *</label><Input type="number" step="0.01" required value={bonusForm.amount} onChange={e => setBonusForm({ ...bonusForm, amount: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div><label className="text-sm font-medium">Description</label><Input value={bonusForm.description} onChange={e => setBonusForm({ ...bonusForm, description: e.target.value })} /></div>
            <div className="rounded bg-muted/50 p-2 text-xs text-muted-foreground">This bonus will be auto-added to the next payroll run for this employee.</div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowBonus(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
