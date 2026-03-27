import { useState } from 'react';
import { useShelters, useAddShelter } from '@/hooks/useLivestock';
import { useAuth } from '@/contexts/AuthContext';
import { branches } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const shelterTypeIcons: Record<string, string> = {
  barn: '🏠', pen: '🏗️', coop: '🐔', stable: '🐴', paddock: '🌿', shed: '🏚️', house: '🏡',
};

export const SheltersList = () => {
  const { user, branch } = useAuth();
  const { data: shelters = [], isLoading } = useShelters();
  const addShelter = useAddShelter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const currentBranchId = user?.role === 'super_admin' ? branch?.id || 'b1' : user?.branchId || 'b1';

  const [form, setForm] = useState({
    name: '', shelter_type: 'barn', capacity: '', location_description: '',
  });

  const filtered = shelters.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shelter_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addShelter.mutate({
      name: form.name,
      shelter_type: form.shelter_type,
      capacity: parseInt(form.capacity) || 0,
      branch_id: currentBranchId,
      location_description: form.location_description || null,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setForm({ name: '', shelter_type: 'barn', capacity: '', location_description: '' });
      }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading shelters...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search shelters..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-farm pl-10" />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Shelter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Shelter</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shelter Name *</label>
                <input required type="text" className="input-farm" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Main Barn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select className="input-farm" value={form.shelter_type}
                    onChange={e => setForm({...form, shelter_type: e.target.value})}>
                    <option value="barn">Barn</option>
                    <option value="pen">Pen</option>
                    <option value="coop">Coop</option>
                    <option value="stable">Stable</option>
                    <option value="paddock">Paddock</option>
                    <option value="shed">Shed</option>
                    <option value="house">House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capacity</label>
                  <input type="number" className="input-farm" value={form.capacity}
                    onChange={e => setForm({...form, capacity: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location Description</label>
                <textarea className="input-farm" rows={2} value={form.location_description}
                  onChange={e => setForm({...form, location_description: e.target.value})}
                  placeholder="e.g. North side of the farm, near the water source" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={addShelter.isPending}>
                  {addShelter.isPending ? 'Adding...' : 'Add Shelter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shelters found. Add your first shelter above.</p>
          </div>
        ) : filtered.map(shelter => (
          <div key={shelter.id} className="card-farm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{shelterTypeIcons[shelter.shelter_type] || '🏠'}</span>
                <div>
                  <h3 className="font-semibold">{shelter.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{shelter.shelter_type}</p>
                </div>
              </div>
              <Badge className={cn(shelter.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                {shelter.status}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{shelter.capacity} heads</span>
              </div>
              {user?.role === 'super_admin' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-medium">{getBranchName(shelter.branch_id)}</span>
                </div>
              )}
              {shelter.location_description && (
                <p className="text-muted-foreground text-xs mt-2">{shelter.location_description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
