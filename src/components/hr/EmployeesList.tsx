import { useState } from 'react';
import { Employee, useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { branches } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeesListProps {
  employees: Employee[];
  loading: boolean;
  createEmployee: (emp: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
}

const emptyForm = {
  first_name: '', last_name: '', id_number: '', tax_number: '', email: '', phone: '',
  department: '', position: '', employment_date: '', basic_salary: 0, housing_allowance: 0,
  transport_allowance: 0, tax_deduction_rate: 0, pension_deduction_rate: 0,
  medical_aid_deduction: 0, bank_name: '', bank_account: '', branch_id: '', status: 'active',
  user_id: null as string | null,
  pay_type: 'monthly', daily_rate: 0, hourly_rate: 0, piece_rate: 0,
  piece_unit: 'kg', overtime_multiplier: 1.5,
};

export const EmployeesList = ({ employees, loading, createEmployee, updateEmployee, deleteEmployee }: EmployeesListProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.department} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (e: Employee) => {
    setForm({
      first_name: e.first_name, last_name: e.last_name, id_number: e.id_number || '',
      tax_number: e.tax_number || '', email: e.email || '', phone: e.phone || '',
      department: e.department || '', position: e.position || '',
      employment_date: e.employment_date || '', basic_salary: e.basic_salary,
      housing_allowance: e.housing_allowance, transport_allowance: e.transport_allowance,
      tax_deduction_rate: e.tax_deduction_rate, pension_deduction_rate: e.pension_deduction_rate,
      medical_aid_deduction: e.medical_aid_deduction, bank_name: e.bank_name || '',
      bank_account: e.bank_account || '', branch_id: e.branch_id || '', status: e.status,
      user_id: e.user_id,
      pay_type: e.pay_type || 'monthly',
      daily_rate: e.daily_rate || 0,
      hourly_rate: e.hourly_rate || 0,
      piece_rate: e.piece_rate || 0,
      piece_unit: e.piece_unit || 'kg',
      overtime_multiplier: e.overtime_multiplier || 1.5,
    });
    setEditingId(e.id);
    setShowForm(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const payload = { ...form, user_id: form.user_id || null };
    if (editingId) {
      await updateEmployee(editingId, payload);
    } else {
      await createEmployee(payload);
    }
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this employee?')) await deleteEmployee(id);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="input-farm pl-10" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Department</th>
              <th className="px-4 py-3 text-left font-medium">Position</th>
              <th className="px-4 py-3 text-right font-medium">Basic Salary</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{e.first_name} {e.last_name}</td>
                  <td className="px-4 py-3">{e.department || '-'}</td>
                  <td className="px-4 py-3">{e.position || '-'}</td>
                  <td className="px-4 py-3 text-right">{fmt(e.basic_salary)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setViewEmployee(e); setShowView(true); }}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(e)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(e.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No employees found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">First Name *</label>
                <input className="input-farm" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Last Name *</label>
                <input className="input-farm" required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">ID Number</label>
                <input className="input-farm" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Tax Number</label>
                <input className="input-farm" value={form.tax_number} onChange={e => setForm({ ...form, tax_number: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label>
                <input className="input-farm" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label>
                <input className="input-farm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Department</label>
                <input className="input-farm" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Position</label>
                <input className="input-farm" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Employment Date</label>
                <input className="input-farm" type="date" value={form.employment_date} onChange={e => setForm({ ...form, employment_date: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Branch</label>
                <select className="input-farm" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })}>
                  <option value="">Select branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
            </div>
            <h4 className="font-semibold text-sm pt-2 border-t">Salary & Allowances</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Pay Type *</label>
                <select className="input-farm" value={form.pay_type} onChange={e => setForm({ ...form, pay_type: e.target.value })}>
                  <option value="monthly">Monthly Salary</option>
                  <option value="daily">Daily Wage</option>
                  <option value="hourly">Hourly + Overtime</option>
                  <option value="piece">Piece Rate</option>
                </select></div>
              <div><label className="block text-sm font-medium mb-1">Overtime Multiplier</label>
                <input className="input-farm" type="number" step="0.1" value={form.overtime_multiplier} onChange={e => setForm({ ...form, overtime_multiplier: parseFloat(e.target.value) || 1.5 })} /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium mb-1">Daily Rate</label>
                <input className="input-farm" type="number" step="0.01" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Hourly Rate</label>
                <input className="input-farm" type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Piece Rate</label>
                <input className="input-farm" type="number" step="0.01" value={form.piece_rate} onChange={e => setForm({ ...form, piece_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Piece Unit</label>
                <input className="input-farm" placeholder="kg, crate, bag" value={form.piece_unit} onChange={e => setForm({ ...form, piece_unit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1">Basic Salary (Monthly)</label>
                <input className="input-farm" type="number" step="0.01" required value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Housing Allowance</label>
                <input className="input-farm" type="number" step="0.01" value={form.housing_allowance} onChange={e => setForm({ ...form, housing_allowance: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Transport Allowance</label>
                <input className="input-farm" type="number" step="0.01" value={form.transport_allowance} onChange={e => setForm({ ...form, transport_allowance: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <h4 className="font-semibold text-sm pt-2 border-t">Deductions</h4>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input className="input-farm" type="number" step="0.01" value={form.tax_deduction_rate} onChange={e => setForm({ ...form, tax_deduction_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Pension Rate (%)</label>
                <input className="input-farm" type="number" step="0.01" value={form.pension_deduction_rate} onChange={e => setForm({ ...form, pension_deduction_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-sm font-medium mb-1">Medical Aid (Fixed)</label>
                <input className="input-farm" type="number" step="0.01" value={form.medical_aid_deduction} onChange={e => setForm({ ...form, medical_aid_deduction: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <h4 className="font-semibold text-sm pt-2 border-t">Bank Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Bank Name</label>
                <input className="input-farm" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-1">Account Number</label>
                <input className="input-farm" value={form.bank_account} onChange={e => setForm({ ...form, bank_account: e.target.value })} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Status</label>
              <select className="input-farm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Employee Details</DialogTitle></DialogHeader>
          {viewEmployee && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Name:</span> {viewEmployee.first_name} {viewEmployee.last_name}</div>
                <div><span className="text-muted-foreground">ID Number:</span> {viewEmployee.id_number || '-'}</div>
                <div><span className="text-muted-foreground">Tax Number:</span> {viewEmployee.tax_number || '-'}</div>
                <div><span className="text-muted-foreground">Email:</span> {viewEmployee.email || '-'}</div>
                <div><span className="text-muted-foreground">Phone:</span> {viewEmployee.phone || '-'}</div>
                <div><span className="text-muted-foreground">Department:</span> {viewEmployee.department || '-'}</div>
                <div><span className="text-muted-foreground">Position:</span> {viewEmployee.position || '-'}</div>
                <div><span className="text-muted-foreground">Employment Date:</span> {viewEmployee.employment_date || '-'}</div>
                <div><span className="text-muted-foreground">Basic Salary:</span> {fmt(viewEmployee.basic_salary)}</div>
                <div><span className="text-muted-foreground">Housing:</span> {fmt(viewEmployee.housing_allowance)}</div>
                <div><span className="text-muted-foreground">Transport:</span> {fmt(viewEmployee.transport_allowance)}</div>
                <div><span className="text-muted-foreground">Tax Rate:</span> {viewEmployee.tax_deduction_rate}%</div>
                <div><span className="text-muted-foreground">Pension Rate:</span> {viewEmployee.pension_deduction_rate}%</div>
                <div><span className="text-muted-foreground">Medical Aid:</span> {fmt(viewEmployee.medical_aid_deduction)}</div>
                <div><span className="text-muted-foreground">Bank:</span> {viewEmployee.bank_name || '-'}</div>
                <div><span className="text-muted-foreground">Account:</span> {viewEmployee.bank_account || '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
