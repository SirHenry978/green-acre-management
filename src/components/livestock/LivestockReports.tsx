import { useState, useMemo } from 'react';
import { useLivestock, useCategories, useShelters, useHealthRecords } from '@/hooks/useLivestock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, FileText, AlertTriangle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LivestockReports = () => {
  const { data: livestock = [] } = useLivestock();
  const { data: categories = [] } = useCategories();
  const { data: shelters = [] } = useShelters();
  const { data: healthRecords = [] } = useHealthRecords();

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBreed, setFilterBreed] = useState('all');
  const [filterShelter, setFilterShelter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'attention'>('summary');

  const breeds = useMemo(() => [...new Set(livestock.map(l => l.breed))], [livestock]);

  const filtered = useMemo(() => {
    return livestock.filter(l => {
      if (filterCategory !== 'all' && l.category_id !== filterCategory) return false;
      if (filterBreed !== 'all' && l.breed !== filterBreed) return false;
      if (filterShelter !== 'all' && l.shelter_id !== filterShelter) return false;
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      return true;
    });
  }, [livestock, filterCategory, filterBreed, filterShelter, filterStatus]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getShelterName = (id: string | null) => id ? shelters.find(s => s.id === id)?.name || 'Unknown' : 'Unassigned';

  const needsAttention = livestock.filter(l => l.health_status !== 'healthy');
  const upcomingDue = healthRecords.filter(r => r.next_due_date && new Date(r.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // Summary by category
  const categorySummary = useMemo(() => {
    const summary: Record<string, { total: number; active: number; sick: number; sold: number }> = {};
    filtered.forEach(l => {
      const catName = getCategoryName(l.category_id);
      if (!summary[catName]) summary[catName] = { total: 0, active: 0, sick: 0, sold: 0 };
      summary[catName].total++;
      if (l.status === 'active') summary[catName].active++;
      if (l.health_status !== 'healthy') summary[catName].sick++;
      if (l.status === 'sold') summary[catName].sold++;
    });
    return summary;
  }, [filtered, categories]);

  // Summary by breed
  const breedSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filtered.forEach(l => {
      summary[l.breed] = (summary[l.breed] || 0) + 1;
    });
    return summary;
  }, [filtered]);

  // Summary by shelter
  const shelterSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filtered.forEach(l => {
      const name = getShelterName(l.shelter_id);
      summary[name] = (summary[name] || 0) + 1;
    });
    return summary;
  }, [filtered, shelters]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card-farm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Report Filters</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <select className="input-farm" value={reportType} onChange={e => setReportType(e.target.value as any)}>
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="attention">Attention Report</option>
          </select>
          <select className="input-farm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input-farm" value={filterBreed} onChange={e => setFilterBreed(e.target.value)}>
            <option value="all">All Breeds</option>
            {breeds.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="input-farm" value={filterShelter} onChange={e => setFilterShelter(e.target.value)}>
            <option value="all">All Shelters</option>
            {shelters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="input-farm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="transferred">Transferred</option>
            <option value="deceased">Deceased</option>
            <option value="quarantined">Quarantined</option>
          </select>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Print Report
        </Button>
      </div>

      {/* Summary Report */}
      {reportType === 'summary' && (
        <div className="space-y-6 print:space-y-4">
          <div className="print:block hidden text-center mb-4">
            <h1 className="text-2xl font-bold">FarmIQ - Livestock Summary Report</h1>
            <p className="text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Total Livestock</p>
              <p className="text-3xl font-bold font-display">{filtered.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold font-display text-success">{filtered.filter(l => l.status === 'active').length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Needs Attention</p>
              <p className="text-3xl font-bold font-display text-warning">{filtered.filter(l => l.health_status !== 'healthy').length}</p>
            </div>
          </div>

          {/* By Category */}
          <div className="card-farm overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> By Category</h3></div>
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead><tr><th>Category</th><th>Total</th><th>Active</th><th>Sick/Attention</th><th>Sold</th></tr></thead>
                <tbody>
                  {Object.entries(categorySummary).map(([name, data]) => (
                    <tr key={name}>
                      <td className="font-medium">{name}</td>
                      <td>{data.total}</td>
                      <td className="text-success">{data.active}</td>
                      <td className={cn(data.sick > 0 && 'text-warning font-medium')}>{data.sick}</td>
                      <td className="text-muted-foreground">{data.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Breed */}
          <div className="card-farm overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="font-semibold">By Breed</h3></div>
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead><tr><th>Breed</th><th>Count</th></tr></thead>
                <tbody>
                  {Object.entries(breedSummary).sort((a, b) => b[1] - a[1]).map(([breed, count]) => (
                    <tr key={breed}><td className="font-medium">{breed}</td><td>{count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Shelter */}
          <div className="card-farm overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="font-semibold">By Shelter</h3></div>
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead><tr><th>Shelter</th><th>Count</th></tr></thead>
                <tbody>
                  {Object.entries(shelterSummary).sort((a, b) => b[1] - a[1]).map(([shelter, count]) => (
                    <tr key={shelter}><td className="font-medium">{shelter}</td><td>{count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report */}
      {reportType === 'detailed' && (
        <div className="card-farm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Detailed Livestock List ({filtered.length} records)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table-farm text-sm">
              <thead>
                <tr>
                  <th>Tag</th><th>Name</th><th>Category</th><th>Breed</th><th>Color</th>
                  <th>Gender</th><th>Age</th><th>Weight</th><th>Shelter</th><th>Health</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td className="font-mono">{l.tag_number}</td>
                    <td>{l.name || '—'}</td>
                    <td>{getCategoryName(l.category_id)}</td>
                    <td>{l.breed}</td>
                    <td>{l.color || '—'}</td>
                    <td className="capitalize">{l.gender}</td>
                    <td>{l.age_on_capture || (l.date_of_birth ? `Born ${l.date_of_birth}` : '—')}</td>
                    <td>{l.weight ? `${l.weight} kg` : '—'}</td>
                    <td>{getShelterName(l.shelter_id)}</td>
                    <td><Badge className={cn(l.health_status !== 'healthy' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>{l.health_status}</Badge></td>
                    <td><Badge className={cn(l.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted')}>{l.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attention Report */}
      {reportType === 'attention' && (
        <div className="space-y-6">
          {/* Sick/Quarantined Animals */}
          <div className="card-farm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">Animals Needing Attention ({needsAttention.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead><tr><th>Tag</th><th>Name</th><th>Category</th><th>Breed</th><th>Health Status</th><th>Shelter</th></tr></thead>
                <tbody>
                  {needsAttention.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-success">✅ All animals are healthy!</td></tr>
                  ) : needsAttention.map(l => (
                    <tr key={l.id}>
                      <td className="font-mono">{l.tag_number}</td>
                      <td>{l.name || '—'}</td>
                      <td>{getCategoryName(l.category_id)}</td>
                      <td>{l.breed}</td>
                      <td><Badge className="bg-warning/10 text-warning">{l.health_status.replace('_', ' ')}</Badge></td>
                      <td>{getShelterName(l.shelter_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Veterinary */}
          <div className="card-farm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Upcoming Veterinary Actions ({upcomingDue.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead><tr><th>Animal</th><th>Type</th><th>Description</th><th>Due Date</th></tr></thead>
                <tbody>
                  {upcomingDue.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-success">✅ No upcoming veterinary actions.</td></tr>
                  ) : upcomingDue.map(r => {
                    const animal = livestock.find(l => l.id === r.livestock_id);
                    return (
                      <tr key={r.id}>
                        <td className="font-mono">{animal?.tag_number || 'Unknown'}</td>
                        <td><Badge className="capitalize bg-primary/10 text-primary">{r.record_type}</Badge></td>
                        <td>{r.description}</td>
                        <td><Badge variant="outline" className="border-destructive text-destructive">{r.next_due_date}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
