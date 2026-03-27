import { useState } from 'react';
import { useLivestock, useCategories, useShelters, useAddLivestock, useDeleteLivestock, type Livestock } from '@/hooks/useLivestock';
import { useAuth } from '@/contexts/AuthContext';
import { branches } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  sold: 'bg-muted text-muted-foreground',
  transferred: 'bg-primary/10 text-primary',
  deceased: 'bg-destructive/10 text-destructive',
  quarantined: 'bg-warning/10 text-warning',
};

const healthColors: Record<string, string> = {
  healthy: 'bg-success/10 text-success',
  sick: 'bg-destructive/10 text-destructive',
  under_treatment: 'bg-warning/10 text-warning',
  quarantined: 'bg-destructive/10 text-destructive',
};

export const LivestockList = () => {
  const { user, branch } = useAuth();
  const { data: livestock = [], isLoading } = useLivestock();
  const { data: categories = [] } = useCategories();
  const { data: shelters = [] } = useShelters();
  const addLivestock = useAddLivestock();
  const deleteLivestock = useDeleteLivestock();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const currentBranchId = user?.role === 'super_admin' ? branch?.id || 'b1' : user?.branchId || 'b1';

  const [form, setForm] = useState({
    tag_number: '', name: '', category_id: '', breed: '', color: '', gender: 'female',
    date_of_birth: '', age_on_capture: '', weight: '', shelter_id: '', notes: '',
    acquired_from: '', purchase_price: '',
  });

  const filtered = livestock.filter(item => {
    const matchSearch = item.tag_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || item.category_id === filterCategory;
    return matchSearch && matchCat;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getShelterName = (id: string | null) => id ? shelters.find(s => s.id === id)?.name || 'Unknown' : 'Unassigned';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';

  const needsAttention = livestock.filter(l => l.health_status !== 'healthy').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLivestock.mutate({
      tag_number: form.tag_number,
      name: form.name || null,
      category_id: form.category_id,
      breed: form.breed,
      color: form.color || null,
      gender: form.gender,
      date_of_birth: form.date_of_birth || null,
      age_on_capture: form.age_on_capture || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      shelter_id: form.shelter_id || null,
      branch_id: currentBranchId,
      acquired_from: form.acquired_from || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : 0,
      notes: form.notes || null,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setForm({ tag_number: '', name: '', category_id: '', breed: '', color: '', gender: 'female', date_of_birth: '', age_on_capture: '', weight: '', shelter_id: '', notes: '', acquired_from: '', purchase_price: '' });
      }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading livestock...</p></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-3"><span className="text-2xl">🐄</span></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Livestock</p>
              <p className="text-2xl font-bold font-display">{livestock.filter(l => l.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-warning p-3"><AlertTriangle className="h-6 w-6 text-warning-foreground" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
              <p className="text-2xl font-bold font-display">{needsAttention}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-success p-3"><span className="text-2xl">🏠</span></div>
            <div>
              <p className="text-sm text-muted-foreground">Shelters</p>
              <p className="text-2xl font-bold font-display">{shelters.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by tag, name, breed..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-farm pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-farm">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Livestock</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Livestock</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tag Number *</label>
                    <input required type="text" className="input-farm" value={form.tag_number}
                      onChange={e => setForm({...form, tag_number: e.target.value})} placeholder="e.g. TAG-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input type="text" className="input-farm" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} placeholder="Optional name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select required className="input-farm" value={form.category_id}
                      onChange={e => setForm({...form, category_id: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Breed *</label>
                    <input required type="text" className="input-farm" value={form.breed}
                      onChange={e => setForm({...form, breed: e.target.value})} placeholder="e.g. Hereford, Rhode Island Red" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender *</label>
                    <select required className="input-farm" value={form.gender}
                      onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input type="text" className="input-farm" value={form.color}
                      onChange={e => setForm({...form, color: e.target.value})} placeholder="e.g. Brown, White" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                    <input type="number" className="input-farm" value={form.weight}
                      onChange={e => setForm({...form, weight: e.target.value})} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input type="date" className="input-farm" value={form.date_of_birth}
                      onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age on Capture</label>
                    <input type="text" className="input-farm" value={form.age_on_capture}
                      onChange={e => setForm({...form, age_on_capture: e.target.value})} placeholder="e.g. 2 years" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Shelter</label>
                    <select className="input-farm" value={form.shelter_id}
                      onChange={e => setForm({...form, shelter_id: e.target.value})}>
                      <option value="">Select shelter</option>
                      {shelters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.shelter_type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Acquired From</label>
                    <input type="text" className="input-farm" value={form.acquired_from}
                      onChange={e => setForm({...form, acquired_from: e.target.value})} placeholder="Supplier or source" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Price ($)</label>
                  <input type="number" className="input-farm" value={form.purchase_price}
                    onChange={e => setForm({...form, purchase_price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea className="input-farm" rows={2} value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional notes..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={addLivestock.isPending}>
                    {addLivestock.isPending ? 'Adding...' : 'Add Livestock'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Breed</th>
                <th>Color</th>
                <th>Gender</th>
                <th>Shelter</th>
                {user?.role === 'super_admin' && <th>Branch</th>}
                <th>Health</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">No livestock found. Add your first animal above.</td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="font-medium font-mono">{item.tag_number}</td>
                  <td>{item.name || '—'}</td>
                  <td><Badge className="bg-primary/10 text-primary">{getCategoryName(item.category_id)}</Badge></td>
                  <td>{item.breed}</td>
                  <td>{item.color || '—'}</td>
                  <td className="capitalize">{item.gender}</td>
                  <td className="text-muted-foreground">{getShelterName(item.shelter_id)}</td>
                  {user?.role === 'super_admin' && <td className="text-muted-foreground">{getBranchName(item.branch_id)}</td>}
                  <td><Badge className={cn(healthColors[item.health_status] || 'bg-muted')}>{item.health_status.replace('_', ' ')}</Badge></td>
                  <td><Badge className={cn(statusColors[item.status] || 'bg-muted')}>{item.status}</Badge></td>
                  <td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="p-2 rounded-lg hover:bg-muted"><MoreVertical className="h-4 w-4" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteLivestock.mutate(item.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
