import { useState } from 'react';
import { useHealthRecords, useLivestock, useAddHealthRecord } from '@/hooks/useLivestock';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Stethoscope, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const recordTypeColors: Record<string, string> = {
  vaccination: 'bg-primary/10 text-primary',
  treatment: 'bg-warning/10 text-warning',
  checkup: 'bg-success/10 text-success',
  deworming: 'bg-accent/20 text-accent-foreground',
};

export const HealthRecords = () => {
  const { user, branch } = useAuth();
  const { data: records = [], isLoading } = useHealthRecords();
  const { data: livestock = [] } = useLivestock();
  const addRecord = useAddHealthRecord();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const currentBranchId = user?.role === 'super_admin' ? branch?.id || 'b1' : user?.branchId || 'b1';

  const [form, setForm] = useState({
    livestock_id: '', record_type: 'checkup', description: '', vet_name: '',
    diagnosis: '', treatment: '', medication: '', cost: '', next_due_date: '',
  });

  const filtered = records.filter(r =>
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.vet_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAnimalTag = (id: string) => livestock.find(l => l.id === id)?.tag_number || 'Unknown';
  const getAnimalName = (id: string) => {
    const animal = livestock.find(l => l.id === id);
    return animal ? `${animal.tag_number}${animal.name ? ` - ${animal.name}` : ''}` : 'Unknown';
  };

  const upcomingDue = records.filter(r => r.next_due_date && new Date(r.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecord.mutate({
      livestock_id: form.livestock_id,
      record_type: form.record_type,
      description: form.description,
      vet_name: form.vet_name || null,
      diagnosis: form.diagnosis || null,
      treatment: form.treatment || null,
      medication: form.medication || null,
      cost: form.cost ? parseFloat(form.cost) : 0,
      next_due_date: form.next_due_date || null,
      branch_id: currentBranchId,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setForm({ livestock_id: '', record_type: 'checkup', description: '', vet_name: '', diagnosis: '', treatment: '', medication: '', cost: '', next_due_date: '' });
      }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading health records...</p></div>;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {upcomingDue.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-warning">Veterinary Attention Required</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{upcomingDue.length} record(s) due within the next 7 days:</p>
          <ul className="text-sm space-y-1">
            {upcomingDue.slice(0, 5).map(r => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="font-mono text-xs">{getAnimalTag(r.livestock_id)}</span>
                <span>— {r.record_type}: {r.description}</span>
                <Badge variant="outline" className="text-xs">Due: {r.next_due_date}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search records..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-farm pl-10" />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Health Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Animal *</label>
                <select required className="input-farm" value={form.livestock_id}
                  onChange={e => setForm({...form, livestock_id: e.target.value})}>
                  <option value="">Select animal</option>
                  {livestock.filter(l => l.status === 'active').map(l => (
                    <option key={l.id} value={l.id}>{l.tag_number}{l.name ? ` - ${l.name}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Record Type *</label>
                  <select required className="input-farm" value={form.record_type}
                    onChange={e => setForm({...form, record_type: e.target.value})}>
                    <option value="checkup">Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="treatment">Treatment</option>
                    <option value="deworming">Deworming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vet Name</label>
                  <input type="text" className="input-farm" value={form.vet_name}
                    onChange={e => setForm({...form, vet_name: e.target.value})} placeholder="Dr. Smith" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea required className="input-farm" rows={2} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the health event..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Diagnosis</label>
                  <input type="text" className="input-farm" value={form.diagnosis}
                    onChange={e => setForm({...form, diagnosis: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Treatment</label>
                  <input type="text" className="input-farm" value={form.treatment}
                    onChange={e => setForm({...form, treatment: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Medication</label>
                  <input type="text" className="input-farm" value={form.medication}
                    onChange={e => setForm({...form, medication: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cost ($)</label>
                  <input type="number" className="input-farm" value={form.cost}
                    onChange={e => setForm({...form, cost: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Next Due Date</label>
                <input type="date" className="input-farm" value={form.next_due_date}
                  onChange={e => setForm({...form, next_due_date: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={addRecord.isPending}>
                  {addRecord.isPending ? 'Saving...' : 'Save Record'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Records Table */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Type</th>
                <th>Description</th>
                <th>Vet</th>
                <th>Medication</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Next Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No health records found.
                </td></tr>
              ) : filtered.map(record => (
                <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                  <td className="font-mono text-sm">{getAnimalName(record.livestock_id)}</td>
                  <td><Badge className={cn('capitalize', recordTypeColors[record.record_type] || 'bg-muted')}>{record.record_type}</Badge></td>
                  <td className="max-w-[200px] truncate">{record.description}</td>
                  <td className="text-muted-foreground">{record.vet_name || '—'}</td>
                  <td className="text-muted-foreground">{record.medication || '—'}</td>
                  <td className="font-medium">{record.cost ? `$${record.cost}` : '—'}</td>
                  <td className="text-muted-foreground">{record.record_date}</td>
                  <td>
                    {record.next_due_date ? (
                      <Badge variant="outline" className={cn(
                        new Date(record.next_due_date) <= new Date() ? 'border-destructive text-destructive' :
                        new Date(record.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'border-warning text-warning' : ''
                      )}>
                        {record.next_due_date}
                      </Badge>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
