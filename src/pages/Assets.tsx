import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard, Plus, Warehouse, Layers, UserCheck, Wrench, TrendingDown,
  FileBarChart, Trash2, Store, Bell, History, RefreshCw, Search, Download,
  Calculator, BookOpen, CalendarClock, Settings as SettingsIcon,
} from 'lucide-react';
import {
  useAssets, useAssetCategories, useAssetVendors, useAssignments, useMaintenance,
  useDepreciationEntries, useDisposals, useAssetNotifications, useAssetAuditLogs,
  useAssetMutations,
} from '@/hooks/useAssets';
import { useLivestock } from '@/hooks/useLivestock';
import { useGLAccounts } from '@/hooks/useGLAccounts';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  operational: 'bg-success/10 text-success',
  maintenance: 'bg-warning/10 text-warning',
  idle: 'bg-muted text-muted-foreground',
  disposed: 'bg-destructive/10 text-destructive',
  retired: 'bg-muted text-muted-foreground',
};

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

const fmt = (n: number) => `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const exportCsv = (filename: string, rows: any[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

const Assets = () => {
  const { data: assets = [] } = useAssets();
  const { data: categories = [] } = useAssetCategories();
  const { data: vendors = [] } = useAssetVendors();
  const { data: assignments = [] } = useAssignments();
  const { data: maintenance = [] } = useMaintenance();
  const { data: depreciation = [] } = useDepreciationEntries();
  const { data: disposals = [] } = useDisposals();
  const { data: notifications = [] } = useAssetNotifications();
  const { data: auditLogs = [] } = useAssetAuditLogs();
  const { data: livestock = [] } = useLivestock();
  const { accounts: glAccounts = [] } = useGLAccounts();
  const m = useAssetMutations();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [maintOpen, setMaintOpen] = useState(false);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const stats = useMemo(() => {
    const total = assets.length;
    const value = assets.reduce((s, a) => s + Number(a.current_value || 0), 0);
    const operational = assets.filter((a) => a.status === 'operational').length;
    const inMaint = assets.filter((a) => a.status === 'maintenance').length;
    const due = maintenance.filter((mt) => mt.status === 'scheduled').length;
    const unread = notifications.filter((n) => !n.is_read).length;
    return { total, value, operational, inMaint, due, unread };
  }, [assets, maintenance, notifications]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach((a) => map.set(a.asset_type, (map.get(a.asset_type) || 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [assets]);

  const byBranchValue = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach((a) => map.set(a.branch_id || 'Unassigned',
      (map.get(a.branch_id || 'Unassigned') || 0) + Number(a.current_value || 0)));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [assets]);

  const filtered = assets.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code?.toLowerCase().includes(search.toLowerCase()));

  // ---- Depreciation helpers (Settings / Schedule / Book Value / Reports) ----
  const [scheduleAssetId, setScheduleAssetId] = useState<string>('');
  const scheduleAsset = assets.find((a) => a.id === scheduleAssetId) || assets[0];

  const buildSchedule = (asset: any, freq: 'monthly' | 'yearly' = 'yearly') => {
    if (!asset) return [];
    const method = asset.depreciation_method || 'straight_line';
    const life = Math.max(asset.useful_life_years || 1, 1);
    const salvage = Number(asset.salvage_value || 0);
    const cost = Number(asset.purchase_cost || 0);
    const steps = freq === 'monthly' ? life * 12 : life;
    const periodMonths = freq === 'monthly' ? 1 : 12;
    let opening = cost;
    let accum = 0;
    const rows: any[] = [];
    for (let i = 1; i <= steps; i++) {
      let dep = 0;
      if (method === 'declining_balance') {
        const rate = (2 / life) * (periodMonths / 12);
        dep = Math.max(opening * rate, 0);
      } else if (method === 'none') {
        dep = 0;
      } else {
        const annual = Math.max((cost - salvage) / life, 0);
        dep = (annual * periodMonths) / 12;
      }
      let closing = opening - dep;
      if (closing < salvage) {
        dep = Math.max(opening - salvage, 0);
        closing = salvage;
      }
      accum += dep;
      rows.push({
        period: i,
        opening,
        depreciation: dep,
        accumulated: accum,
        closing,
      });
      opening = closing;
      if (closing <= salvage) break;
    }
    return rows;
  };

  // Annual depreciation by year (from posted entries)
  const depByYear = useMemo(() => {
    const map = new Map<string, number>();
    depreciation.forEach((d: any) => {
      const y = String(new Date(d.period_end).getFullYear());
      map.set(y, (map.get(y) || 0) + Number(d.depreciation_amount || 0));
    });
    return Array.from(map, ([year, amount]) => ({ year, amount })).sort((a, b) => a.year.localeCompare(b.year));
  }, [depreciation]);

  const depByMonth = useMemo(() => {
    const map = new Map<string, number>();
    depreciation.forEach((d: any) => {
      const dt = new Date(d.period_end);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + Number(d.depreciation_amount || 0));
    });
    return Array.from(map, ([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));
  }, [depreciation]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Asset Management</h1>
            <p className="text-muted-foreground mt-1">
              Full asset lifecycle — linked with Livestock and Finance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => m.syncLivestock.mutate()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Sync Livestock
            </Button>
            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4"/> Dashboard</TabsTrigger>
            <TabsTrigger value="register" className="gap-2"><Warehouse className="h-4 w-4"/> Asset Register</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><Layers className="h-4 w-4"/> Categories</TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2"><UserCheck className="h-4 w-4"/> Assignments</TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2"><Wrench className="h-4 w-4"/> Maintenance</TabsTrigger>
            <TabsTrigger value="depreciation" className="gap-2"><TrendingDown className="h-4 w-4"/> Depreciation</TabsTrigger>
            <TabsTrigger value="dep-settings" className="gap-2"><SettingsIcon className="h-4 w-4"/> Dep. Settings</TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2"><CalendarClock className="h-4 w-4"/> Schedule</TabsTrigger>
            <TabsTrigger value="book-value" className="gap-2"><BookOpen className="h-4 w-4"/> Book Value</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><FileBarChart className="h-4 w-4"/> Reports</TabsTrigger>
            <TabsTrigger value="disposal" className="gap-2"><Trash2 className="h-4 w-4"/> Disposal</TabsTrigger>
            <TabsTrigger value="vendors" className="gap-2"><Store className="h-4 w-4"/> Vendors</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4"/> Notifications {stats.unread > 0 && <Badge variant="destructive" className="ml-1">{stats.unread}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><History className="h-4 w-4"/> Audit Logs</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6 mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Assets', value: stats.total, icon: Warehouse, color: 'bg-primary' },
                { label: 'Operational', value: stats.operational, icon: UserCheck, color: 'bg-success' },
                { label: 'In Maintenance', value: stats.inMaint, icon: Wrench, color: 'bg-warning' },
                { label: 'Total Value', value: fmt(stats.value), icon: TrendingDown, color: 'bg-accent' },
              ].map((s) => (
                <Card key={s.label} className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl ${s.color} p-3`}>
                      <s.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-bold font-display">{s.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Assets by Type</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byType} dataKey="value" nameKey="name" outerRadius={90} label>
                      {byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Value by Branch</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byBranchValue}>
                    <XAxis dataKey="name" /><YAxis /><Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input className="pl-9" placeholder="Search by name or code…" value={search} onChange={(e)=>setSearch(e.target.value)}/>
              </div>
              <Button variant="outline" className="gap-2" onClick={()=>exportCsv('assets.csv', filtered)}>
                <Download className="h-4 w-4"/> Export
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
                    <TableHead>Cost</TableHead><TableHead>Current Value</TableHead><TableHead>Status</TableHead>
                    <TableHead>Linked</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.asset_code}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="capitalize">{a.asset_type}</TableCell>
                      <TableCell>{fmt(Number(a.purchase_cost))}</TableCell>
                      <TableCell>{fmt(Number(a.current_value))}</TableCell>
                      <TableCell><Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {a.livestock_id && <Badge variant="outline">Livestock</Badge>}
                        {a.gl_account_id && <Badge variant="outline" className="ml-1">GL</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={()=>{setSelected(a); setAssignOpen(true);}}>Assign</Button>
                          <Button size="sm" variant="ghost" onClick={()=>{setSelected(a); setMaintOpen(true);}}>Maint.</Button>
                          <Button size="sm" variant="ghost" onClick={()=>m.runDepreciation.mutate({asset: a, periodMonths: 1})}>Depreciate</Button>
                          <Button size="sm" variant="ghost" onClick={()=>{setSelected(a); setDisposeOpen(true);}}>Dispose</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={()=>m.deleteAsset.mutate(a.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No assets yet — add one or sync from livestock.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* CATEGORIES */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={()=>setCatOpen(true)} className="gap-2"><Plus className="h-4 w-4"/> New Category</Button>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Code</TableHead>
                  <TableHead>Useful Life</TableHead><TableHead>Method</TableHead><TableHead>Salvage %</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {categories.map((c)=>(
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell><TableCell>{c.code}</TableCell>
                      <TableCell>{c.default_useful_life_years} yrs</TableCell>
                      <TableCell className="capitalize">{c.depreciation_method?.replace('_',' ')}</TableCell>
                      <TableCell>{(Number(c.default_salvage_rate)*100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                  {!categories.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No categories yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ASSIGNMENTS */}
          <TabsContent value="assignments" className="space-y-4 mt-4">
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead>Assignee</TableHead>
                  <TableHead>Department</TableHead><TableHead>Assigned</TableHead><TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {assignments.map((a)=>{
                    const asset = assets.find(x=>x.id===a.asset_id);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{asset?.name || '—'}</TableCell>
                        <TableCell>{a.assignee_name}</TableCell>
                        <TableCell>{a.department || '—'}</TableCell>
                        <TableCell>{a.assigned_date}</TableCell>
                        <TableCell>{a.returned_date || '—'}</TableCell>
                        <TableCell><Badge>{a.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {a.status==='assigned' && (
                            <Button size="sm" variant="ghost" onClick={()=>m.returnAssignment.mutate({id:a.id, condition_in:'good'})}>Return</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!assignments.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No assignments yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* MAINTENANCE */}
          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead>Type</TableHead>
                  <TableHead>Scheduled</TableHead><TableHead>Performed</TableHead>
                  <TableHead>Cost</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {maintenance.map((mt)=>{
                    const asset = assets.find(x=>x.id===mt.asset_id);
                    return (
                      <TableRow key={mt.id}>
                        <TableCell className="font-medium">{asset?.name||'—'}</TableCell>
                        <TableCell className="capitalize">{mt.maintenance_type}</TableCell>
                        <TableCell>{mt.scheduled_date||'—'}</TableCell>
                        <TableCell>{mt.performed_date||'—'}</TableCell>
                        <TableCell>{fmt(Number(mt.cost))}</TableCell>
                        <TableCell><Badge>{mt.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {mt.status!=='completed' && (
                            <Button size="sm" variant="ghost" onClick={()=>m.completeMaintenance.mutate({id:mt.id, asset_id:mt.asset_id, cost:Number(mt.cost||0)})}>
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!maintenance.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No maintenance records.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* DEPRECIATION */}
          <TabsContent value="depreciation" className="space-y-4 mt-4">
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead>Period</TableHead>
                  <TableHead>Opening</TableHead><TableHead>Depreciation</TableHead>
                  <TableHead>Closing</TableHead><TableHead>Posted</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {depreciation.map((d)=>{
                    const asset = assets.find(x=>x.id===d.asset_id);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{asset?.name||'—'}</TableCell>
                        <TableCell>{d.period_start} → {d.period_end}</TableCell>
                        <TableCell>{fmt(Number(d.opening_value))}</TableCell>
                        <TableCell className="text-destructive">{fmt(Number(d.depreciation_amount))}</TableCell>
                        <TableCell>{fmt(Number(d.closing_value))}</TableCell>
                        <TableCell>{d.posted_to_finance ? <Badge className="bg-success/10 text-success">Posted</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!depreciation.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No depreciation entries yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* DEPRECIATION SETTINGS */}
          <TabsContent value="dep-settings" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-1">Per-Asset Depreciation Method</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose <strong>Straight Line</strong> (even spread) or <strong>Reducing Balance</strong> (double-declining).
                Changes apply to future depreciation runs.
              </p>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead>Cost</TableHead>
                  <TableHead>Life (yrs)</TableHead><TableHead>Salvage</TableHead>
                  <TableHead>Method</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {assets.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{fmt(Number(a.purchase_cost))}</TableCell>
                      <TableCell>
                        <Input
                          type="number" defaultValue={a.useful_life_years || 5}
                          className="w-20"
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (v && v !== a.useful_life_years) m.updateAsset.mutate({ id: a.id, patch: { useful_life_years: v } });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" step="0.01" defaultValue={a.salvage_value || 0}
                          className="w-24"
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (v !== Number(a.salvage_value || 0)) m.updateAsset.mutate({ id: a.id, patch: { salvage_value: v } });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={a.depreciation_method || 'straight_line'}
                          onValueChange={(v) => m.updateAsset.mutate({ id: a.id, patch: { depreciation_method: v } })}
                        >
                          <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="straight_line">Straight Line</SelectItem>
                            <SelectItem value="declining_balance">Reducing Balance</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => m.runDepreciation.mutate({ asset: a, periodMonths: 1 })}>
                          <Calculator className="h-3 w-3"/> Run 1mo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!assets.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No assets.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* DEPRECIATION SCHEDULE */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
                <div>
                  <h3 className="font-semibold">Depreciation Schedule</h3>
                  <p className="text-sm text-muted-foreground">Forecast yearly depreciation and remaining value.</p>
                </div>
                <div className="w-full sm:w-72">
                  <Select value={scheduleAssetId || (scheduleAsset?.id ?? '')} onValueChange={setScheduleAssetId}>
                    <SelectTrigger><SelectValue placeholder="Select asset"/></SelectTrigger>
                    <SelectContent>
                      {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {scheduleAsset ? (() => {
                const yearly = buildSchedule(scheduleAsset, 'yearly');
                return (
                  <>
                    <div className="grid gap-3 sm:grid-cols-4 text-sm">
                      <div><p className="text-muted-foreground">Method</p><p className="font-medium capitalize">{(scheduleAsset.depreciation_method||'straight_line').replace('_',' ')}</p></div>
                      <div><p className="text-muted-foreground">Cost</p><p className="font-medium">{fmt(Number(scheduleAsset.purchase_cost))}</p></div>
                      <div><p className="text-muted-foreground">Life</p><p className="font-medium">{scheduleAsset.useful_life_years || 5} yrs</p></div>
                      <div><p className="text-muted-foreground">Salvage</p><p className="font-medium">{fmt(Number(scheduleAsset.salvage_value))}</p></div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={yearly}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" /><YAxis /><Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="closing" name="Remaining Value" stroke="hsl(var(--primary))" strokeWidth={2}/>
                        <Line type="monotone" dataKey="depreciation" name="Depreciation" stroke="hsl(var(--destructive))" strokeWidth={2}/>
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-end">
                      <Button variant="outline" className="gap-2" onClick={() => exportCsv(`schedule-${scheduleAsset.name}.csv`, yearly)}>
                        <Download className="h-4 w-4"/> Export Schedule
                      </Button>
                    </div>
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Year</TableHead><TableHead>Opening</TableHead>
                        <TableHead>Depreciation</TableHead><TableHead>Accumulated</TableHead><TableHead>Closing</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {yearly.map((r) => (
                          <TableRow key={r.period}>
                            <TableCell>{r.period}</TableCell>
                            <TableCell>{fmt(r.opening)}</TableCell>
                            <TableCell className="text-destructive">{fmt(r.depreciation)}</TableCell>
                            <TableCell>{fmt(r.accumulated)}</TableCell>
                            <TableCell className="font-medium">{fmt(r.closing)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                );
              })() : <p className="text-muted-foreground text-sm">No assets to schedule.</p>}
            </Card>
          </TabsContent>

          {/* BOOK VALUE */}
          <TabsContent value="book-value" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={() => exportCsv('book-value.csv', assets.map((a)=>({
                code: a.asset_code, name: a.name,
                original_cost: Number(a.purchase_cost||0),
                accumulated_depreciation: Number(a.accumulated_depreciation||0),
                current_value: Number(a.current_value||0),
              })))}>
                <Download className="h-4 w-4"/> Export
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Code</TableHead><TableHead>Asset</TableHead>
                  <TableHead>Original Cost</TableHead>
                  <TableHead>Accumulated Depreciation</TableHead>
                  <TableHead>Current (Book) Value</TableHead>
                  <TableHead>% Depreciated</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {assets.map((a) => {
                    const cost = Number(a.purchase_cost || 0);
                    const accum = Number(a.accumulated_depreciation || 0);
                    const pct = cost > 0 ? Math.min((accum / cost) * 100, 100) : 0;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">{a.asset_code}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{fmt(cost)}</TableCell>
                        <TableCell className="text-destructive">{fmt(accum)}</TableCell>
                        <TableCell className="font-semibold">{fmt(Number(a.current_value||0))}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{a.last_depreciated_at || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!assets.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No assets.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-5"><p className="text-sm text-muted-foreground">Linked Livestock</p>
                <p className="text-3xl font-bold font-display">{assets.filter(a=>a.livestock_id).length}</p>
                <p className="text-xs text-muted-foreground mt-1">of {livestock.length} animals</p></Card>
              <Card className="p-5"><p className="text-sm text-muted-foreground">Total Depreciated</p>
                <p className="text-3xl font-bold font-display">{fmt(depreciation.reduce((s,d)=>s+Number(d.depreciation_amount||0),0))}</p></Card>
              <Card className="p-5"><p className="text-sm text-muted-foreground">Disposed Value</p>
                <p className="text-3xl font-bold font-display">{fmt(disposals.reduce((s,d)=>s+Number(d.sale_price||0),0))}</p></Card>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>exportCsv('asset-register.csv', assets)}>Register CSV</Button>
              <Button variant="outline" onClick={()=>exportCsv('depreciation.csv', depreciation)}>Depreciation CSV</Button>
              <Button variant="outline" onClick={()=>exportCsv('maintenance.csv', maintenance)}>Maintenance CSV</Button>
              <Button variant="outline" onClick={()=>exportCsv('disposals.csv', disposals)}>Disposals CSV</Button>
            </div>
          </TabsContent>

          {/* DISPOSAL */}
          <TabsContent value="disposal" className="space-y-4 mt-4">
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Asset</TableHead><TableHead>Date</TableHead>
                  <TableHead>Method</TableHead><TableHead>Sale</TableHead>
                  <TableHead>Book</TableHead><TableHead>Gain/Loss</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {disposals.map((d)=>{
                    const asset = assets.find(x=>x.id===d.asset_id);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{asset?.name||'—'}</TableCell>
                        <TableCell>{d.disposal_date}</TableCell>
                        <TableCell className="capitalize">{d.method}</TableCell>
                        <TableCell>{fmt(Number(d.sale_price))}</TableCell>
                        <TableCell>{fmt(Number(d.book_value))}</TableCell>
                        <TableCell className={Number(d.gain_loss)>=0?'text-success':'text-destructive'}>{fmt(Number(d.gain_loss))}</TableCell>
                        <TableCell><Badge>{d.approval_status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  {!disposals.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No disposals yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* VENDORS */}
          <TabsContent value="vendors" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={()=>setVendorOpen(true)} className="gap-2"><Plus className="h-4 w-4"/> New Vendor</Button>
            </div>
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead><TableHead>Phone</TableHead><TableHead>Services</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {vendors.map((v)=>(
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.category||'—'}</TableCell>
                      <TableCell>{v.contact_person||'—'}</TableCell>
                      <TableCell>{v.phone||'—'}</TableCell>
                      <TableCell className="text-sm">{v.services_offered||'—'}</TableCell>
                    </TableRow>
                  ))}
                  {!vendors.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No vendors yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications" className="space-y-2 mt-4">
            {notifications.map((n)=>(
              <Card key={n.id} className={`p-4 flex items-center justify-between ${!n.is_read?'border-primary':''}`}>
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <Button size="sm" variant="ghost" onClick={()=>m.markNotificationRead.mutate(n.id)}>Mark read</Button>}
              </Card>
            ))}
            {!notifications.length && <Card className="p-8 text-center text-muted-foreground">No notifications.</Card>}
          </TabsContent>

          {/* AUDIT */}
          <TabsContent value="audit" className="space-y-4 mt-4">
            <Card>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>When</TableHead><TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead><TableHead>Actor</TableHead><TableHead>Details</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {auditLogs.map((l)=>(
                    <TableRow key={l.id}>
                      <TableCell className="text-xs">{new Date(l.created_at).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{l.entity_type}</TableCell>
                      <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                      <TableCell>{l.actor_name||'system'}</TableCell>
                      <TableCell className="text-xs font-mono max-w-md truncate">{l.diff?JSON.stringify(l.diff):''}</TableCell>
                    </TableRow>
                  ))}
                  {!auditLogs.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No audit entries yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ADD ASSET DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Asset</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload: any = Object.fromEntries(fd);
            payload.purchase_cost = Number(payload.purchase_cost||0);
            payload.useful_life_years = Number(payload.useful_life_years||5);
            payload.salvage_value = Number(payload.salvage_value||0);
            if (!payload.category_id) delete payload.category_id;
            if (!payload.vendor_id) delete payload.vendor_id;
            if (!payload.gl_account_id) delete payload.gl_account_id;
            if (!payload.livestock_id) delete payload.livestock_id;
            m.createAsset.mutate(payload, { onSuccess: ()=>setAddOpen(false) });
          }} className="grid grid-cols-2 gap-3">
            <Input name="name" required placeholder="Asset name" className="col-span-2"/>
            <Select name="asset_type" defaultValue="equipment">
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {['equipment','machinery','vehicle','livestock','building','land','furniture','it'].map(t=>
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select name="category_id">
              <SelectTrigger><SelectValue placeholder="Category (optional)"/></SelectTrigger>
              <SelectContent>{categories.map((c)=>(<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
            <Input name="purchase_cost" type="number" step="0.01" placeholder="Purchase cost"/>
            <Input name="purchase_date" type="date"/>
            <Input name="useful_life_years" type="number" placeholder="Useful life (years)" defaultValue={5}/>
            <Input name="salvage_value" type="number" step="0.01" placeholder="Salvage value"/>
            <Input name="location" placeholder="Location"/>
            <Input name="serial_number" placeholder="Serial number"/>
            <Select name="vendor_id">
              <SelectTrigger><SelectValue placeholder="Vendor (optional)"/></SelectTrigger>
              <SelectContent>{vendors.map((v)=>(<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}</SelectContent>
            </Select>
            <Select name="gl_account_id">
              <SelectTrigger><SelectValue placeholder="GL Account (Finance link)"/></SelectTrigger>
              <SelectContent>{glAccounts.map((g:any)=>(<SelectItem key={g.id} value={g.id}>{g.account_code} - {g.account_name}</SelectItem>))}</SelectContent>
            </Select>
            <Select name="livestock_id">
              <SelectTrigger><SelectValue placeholder="Link Livestock (optional)"/></SelectTrigger>
              <SelectContent>{livestock.map((l:any)=>(<SelectItem key={l.id} value={l.id}>{l.tag_number} - {l.breed}</SelectItem>))}</SelectContent>
            </Select>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={()=>setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CATEGORY DIALOG */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload:any = Object.fromEntries(fd);
            payload.default_useful_life_years = Number(payload.default_useful_life_years||5);
            payload.default_salvage_rate = Number(payload.default_salvage_rate||0.1);
            m.createCategory.mutate(payload, { onSuccess: ()=>setCatOpen(false) });
          }} className="space-y-3">
            <Input name="name" required placeholder="Category name"/>
            <Input name="code" placeholder="Code (e.g. EQP)"/>
            <Input name="default_useful_life_years" type="number" defaultValue={5} placeholder="Useful life (yrs)"/>
            <Input name="default_salvage_rate" type="number" step="0.01" defaultValue={0.1} placeholder="Salvage rate (0-1)"/>
            <Select name="depreciation_method" defaultValue="straight_line">
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="straight_line">Straight Line</SelectItem>
                <SelectItem value="declining_balance">Declining Balance</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VENDOR DIALOG */}
      <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Vendor</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload:any = Object.fromEntries(fd);
            m.createVendor.mutate(payload, { onSuccess: ()=>setVendorOpen(false) });
          }} className="space-y-3">
            <Input name="name" required placeholder="Vendor name"/>
            <Input name="category" placeholder="Category"/>
            <Input name="contact_person" placeholder="Contact person"/>
            <Input name="phone" placeholder="Phone"/>
            <Input name="email" type="email" placeholder="Email"/>
            <Input name="services_offered" placeholder="Services offered"/>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGN DIALOG */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign — {selected?.name}</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload:any = { ...Object.fromEntries(fd), asset_id: selected.id };
            m.assignAsset.mutate(payload, { onSuccess: ()=>setAssignOpen(false) });
          }} className="space-y-3">
            <Input name="assignee_name" required placeholder="Assignee name"/>
            <Input name="department" placeholder="Department"/>
            <Input name="assigned_date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
            <Input name="condition_out" placeholder="Condition on issue" defaultValue="good"/>
            <Input name="notes" placeholder="Notes"/>
            <DialogFooter><Button type="submit">Assign</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MAINTENANCE DIALOG */}
      <Dialog open={maintOpen} onOpenChange={setMaintOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Maintenance — {selected?.name}</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload:any = { ...Object.fromEntries(fd), asset_id: selected.id, cost: Number((fd.get('cost') as string)||0) };
            m.createMaintenance.mutate(payload, { onSuccess: ()=>setMaintOpen(false) });
          }} className="space-y-3">
            <Select name="maintenance_type" defaultValue="preventive">
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
            <Input name="scheduled_date" type="date"/>
            <Input name="cost" type="number" step="0.01" placeholder="Estimated cost"/>
            <Input name="description" placeholder="Description"/>
            <DialogFooter><Button type="submit">Schedule</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DISPOSE DIALOG */}
      <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dispose — {selected?.name}</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const payload:any = { ...Object.fromEntries(fd), sale_price: Number((fd.get('sale_price') as string)||0) };
            m.createDisposal.mutate({asset: selected, payload}, { onSuccess: ()=>setDisposeOpen(false) });
          }} className="space-y-3">
            <Select name="method" defaultValue="sale">
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {['sale','scrap','donation','transfer','write_off'].map(x=>
                  <SelectItem key={x} value={x} className="capitalize">{x.replace('_',' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name="disposal_date" type="date" defaultValue={new Date().toISOString().slice(0,10)}/>
            <Input name="buyer" placeholder="Buyer / Recipient"/>
            <Input name="sale_price" type="number" step="0.01" placeholder="Sale price"/>
            <Input name="reason" placeholder="Reason"/>
            <DialogFooter><Button type="submit">Dispose</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Assets;