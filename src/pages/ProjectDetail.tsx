import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import {
  useProject, useProjectPhases, useProjectMilestones, useProjectTeam, useProjectResources,
  useProjectRisks, useProjectObservations, useProjectWeather, useProjectDocuments, useProjectComments,
  useProjectActivity, useProjectNotifications, useProjectExpenses, useProjectTasks, useProjectClosure,
  useGenericInsert, useGenericUpdate, useGenericDelete, usePostExpense, useUploadProjectDocument,
} from '@/hooks/useProjects';
import {
  ArrowLeft, Plus, MapPin, Camera, FileText, AlertTriangle, CloudRain, MessageSquare,
  DollarSign, Users, Boxes, ListChecks, Activity, Bell, ClipboardCheck, Archive, Trash2,
  Download, Loader2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--success))'];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const branchId = useCurrentBranchId();
  const qc = useQueryClient();

  const { data: project, isLoading } = useProject(id);
  const { data: phases = [] } = useProjectPhases(id);
  const { data: milestones = [] } = useProjectMilestones(id);
  const { data: team = [] } = useProjectTeam(id);
  const { data: resources = [] } = useProjectResources(id);
  const { data: risks = [] } = useProjectRisks(id);
  const { data: observations = [] } = useProjectObservations(id);
  const { data: weather = [] } = useProjectWeather(id);
  const { data: documents = [] } = useProjectDocuments(id);
  const { data: comments = [] } = useProjectComments(id);
  const { data: activity = [] } = useProjectActivity(id);
  const { data: notifications = [] } = useProjectNotifications(id);
  const { data: expenses = [] } = useProjectExpenses(id);
  const { data: tasks = [] } = useProjectTasks(id);
  const { data: closure } = useProjectClosure(id);

  const refreshProject = () => {
    qc.invalidateQueries({ queryKey: ['farm-project', id] });
    qc.invalidateQueries({ queryKey: ['farm-projects'] });
  };

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }
  if (!project) {
    return <DashboardLayout><div className="p-12 text-center text-muted-foreground">Project not found.</div></DashboardLayout>;
  }

  const budget = Number(project.budget || 0);
  const spent = Number(project.spent || 0);
  const revenue = Number(project.revenue || 0);
  const budgetPct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const tasksDone = tasks.filter((t: any) => t.status === 'done').length;
  const progress = tasks.length ? (tasksDone / tasks.length) * 100 : 0;
  const openRisks = risks.filter((r: any) => r.status !== 'closed').length;
  const overdueTasks = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => nav('/farm-projects')} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects</Button>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">{project.name}
              {project.archived && <Badge variant="outline"><Archive className="h-3 w-3 mr-1" />Archived</Badge>}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary">{project.status}</Badge>
              <Badge variant="outline">{project.priority}</Badge>
              {project.project_type && <Badge variant="outline">{project.project_type}</Badge>}
              {project.location_name && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location_name}</span>}
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">{Math.round(progress)}%</p>
            <Progress value={progress} className="h-2 mt-2" />
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-2xl font-bold">${budget.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(budgetPct)}% used</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-2xl font-bold text-warning">${spent.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Open Risks</p>
            <p className="text-2xl font-bold text-destructive">{openRisks}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue Tasks</p>
            <p className="text-2xl font-bold">{overdueTasks}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="observations">Field Log</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="closure">Closure</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab project={project} milestones={milestones} expenses={expenses} tasks={tasks} notifications={notifications} /></TabsContent>
          <TabsContent value="phases"><PhasesTab projectId={id!} branchId={branchId} phases={phases} /></TabsContent>
          <TabsContent value="milestones"><MilestonesTab projectId={id!} branchId={branchId} milestones={milestones} phases={phases} /></TabsContent>
          <TabsContent value="tasks"><TasksTab projectId={id!} branchId={branchId} tasks={tasks} phases={phases} /></TabsContent>
          <TabsContent value="team"><TeamTab projectId={id!} branchId={branchId} team={team} /></TabsContent>
          <TabsContent value="resources"><ResourcesTab projectId={id!} branchId={branchId} resources={resources} /></TabsContent>
          <TabsContent value="finance"><FinanceTab projectId={id!} branchId={branchId} project={project} expenses={expenses} onChange={refreshProject} /></TabsContent>
          <TabsContent value="risks"><RisksTab projectId={id!} branchId={branchId} risks={risks} /></TabsContent>
          <TabsContent value="observations"><ObservationsTab projectId={id!} branchId={branchId} observations={observations} /></TabsContent>
          <TabsContent value="weather"><WeatherTab projectId={id!} branchId={branchId} weather={weather} /></TabsContent>
          <TabsContent value="documents"><DocumentsTab projectId={id!} branchId={branchId} documents={documents} /></TabsContent>
          <TabsContent value="comments"><CommentsTab projectId={id!} branchId={branchId} comments={comments} /></TabsContent>
          <TabsContent value="activity"><ActivityTab activity={activity} notifications={notifications} /></TabsContent>
          <TabsContent value="reports"><ReportsTab project={project} tasks={tasks} expenses={expenses} milestones={milestones} risks={risks} /></TabsContent>
          <TabsContent value="closure"><ClosureTab projectId={id!} branchId={branchId} project={project} closure={closure} expenses={expenses} revenue={revenue} onChange={refreshProject} /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

/* ============================ Overview ============================ */
function OverviewTab({ project, milestones, expenses, tasks, notifications }: any) {
  const expensesByCat = Object.values(expenses.reduce((acc: any, e: any) => {
    acc[e.category] = acc[e.category] || { name: e.category, value: 0 };
    acc[e.category].value += Number(e.amount);
    return acc;
  }, {})) as any[];

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Objectives:</span> {project.objectives || '—'}</div>
          <div><span className="text-muted-foreground">Description:</span> {project.description || '—'}</div>
          <div><span className="text-muted-foreground">Manager:</span> {project.manager_name || '—'}</div>
          <div><span className="text-muted-foreground">Location:</span> {project.location_name || '—'} {project.gps_lat ? `(${project.gps_lat}, ${project.gps_lng})` : ''}</div>
          <div><span className="text-muted-foreground">Dates:</span> {project.start_date || '?'} → {project.end_date || '?'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Spend by Category</CardTitle></CardHeader>
        <CardContent>
          {expensesByCat.length === 0 ? <p className="text-sm text-muted-foreground">No expenses yet.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expensesByCat} dataKey="value" nameKey="name" outerRadius={80} label>
                  {expensesByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle className="text-base">Upcoming Milestones</CardTitle></CardHeader>
        <CardContent>
          {milestones.length === 0 ? <p className="text-sm text-muted-foreground">No milestones yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {milestones.slice(0, 5).map((m: any) => (
                  <TableRow key={m.id}><TableCell>{m.title}</TableCell><TableCell>{m.due_date || '—'}</TableCell><TableCell><Badge variant="outline">{m.status}</Badge></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ Phases ============================ */
function PhasesTab({ projectId, branchId, phases }: any) {
  const ins = useGenericInsert<any>('project_phases', ['project_phases']);
  const del = useGenericDelete('project_phases', ['project_phases']);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sequence: 1, start_date: '', end_date: '', status: 'planning' });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Project Phases</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Phase</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Phase</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input type="number" placeholder="Sequence" value={form.sequence} onChange={e => setForm({ ...form, sequence: Number(e.target.value) })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button onClick={async () => { await ins.mutateAsync({ ...form, project_id: projectId, branch_id: branchId, start_date: form.start_date || null, end_date: form.end_date || null }); setOpen(false); setForm({ name: '', sequence: 1, start_date: '', end_date: '', status: 'planning' }); }} disabled={!form.name}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {phases.length === 0 ? <p className="text-sm text-muted-foreground">No phases yet.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {[...phases].sort((a: any, b: any) => a.sequence - b.sequence).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.sequence}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-xs">{p.start_date || '?'} → {p.end_date || '?'}</TableCell>
                  <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                  <TableCell className="w-32"><Progress value={Number(p.progress_pct || 0)} className="h-2" /></TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(p.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Milestones ============================ */
function MilestonesTab({ projectId, branchId, milestones, phases }: any) {
  const ins = useGenericInsert<any>('project_milestones', ['project_milestones']);
  const upd = useGenericUpdate('project_milestones', ['project_milestones']);
  const del = useGenericDelete('project_milestones', ['project_milestones']);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '', phase_id: '', deliverables: '', status: 'pending' });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Milestones</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Milestone</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Milestone</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              <Select value={form.phase_id} onValueChange={v => setForm({ ...form, phase_id: v })}>
                <SelectTrigger><SelectValue placeholder="Phase (optional)" /></SelectTrigger>
                <SelectContent>{phases.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Deliverables" value={form.deliverables} onChange={e => setForm({ ...form, deliverables: e.target.value })} />
            </div>
            <DialogFooter><Button onClick={async () => { await ins.mutateAsync({ project_id: projectId, branch_id: branchId, title: form.title, due_date: form.due_date || null, phase_id: form.phase_id || null, deliverables: form.deliverables, status: form.status }); setOpen(false); setForm({ title: '', due_date: '', phase_id: '', deliverables: '', status: 'pending' }); }} disabled={!form.title}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? <p className="text-sm text-muted-foreground">No milestones.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {milestones.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}{m.deliverables && <p className="text-xs text-muted-foreground">{m.deliverables}</p>}</TableCell>
                  <TableCell>{m.due_date || '—'}</TableCell>
                  <TableCell>
                    <Select value={m.status} onValueChange={(v) => upd.mutate({ id: m.id, patch: { status: v, completed_at: v === 'completed' ? new Date().toISOString() : null } })}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(m.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Tasks (mini-kanban with phase + deps) ============================ */
function TasksTab({ projectId, branchId, tasks, phases }: any) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', phase_id: '', predecessor_task_id: '', estimated_hours: 0 });

  const create = async () => {
    const { error } = await supabase.from('farm_tasks').insert({
      project_id: projectId, branch_id: branchId || 'default',
      title: form.title, description: form.description || null, priority: form.priority,
      due_date: form.due_date || null, assigned_to: form.assigned_to || null,
      phase_id: form.phase_id || null, predecessor_task_id: form.predecessor_task_id || null,
      estimated_hours: form.estimated_hours,
    });
    if (error) return toast.error(error.message);
    toast.success('Task added');
    setOpen(false);
    setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', phase_id: '', predecessor_task_id: '', estimated_hours: 0 });
    qc.invalidateQueries({ queryKey: ['farm_tasks', projectId] });
  };

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from('farm_tasks').update(patch).eq('id', id);
    if (!error) qc.invalidateQueries({ queryKey: ['farm_tasks', projectId] });
  };

  const cols = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['low','medium','high','critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <Input placeholder="Assigned to" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.phase_id} onValueChange={v => setForm({ ...form, phase_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Phase" /></SelectTrigger>
                  <SelectContent>{phases.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.predecessor_task_id} onValueChange={v => setForm({ ...form, predecessor_task_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Depends on" /></SelectTrigger>
                  <SelectContent>{tasks.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Input type="number" placeholder="Estimated hours" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: Number(e.target.value) })} />
            </div>
            <DialogFooter><Button onClick={create} disabled={!form.title}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map(c => (
          <div key={c.key} className="space-y-2">
            <div className="font-medium text-sm">{c.label} ({tasks.filter((t: any) => t.status === c.key).length})</div>
            {tasks.filter((t: any) => t.status === c.key).map((t: any) => {
              const phase = phases.find((p: any) => p.id === t.phase_id);
              const blocker = tasks.find((x: any) => x.id === t.predecessor_task_id);
              const blocked = blocker && blocker.status !== 'done';
              return (
                <Card key={t.id} className={`border-l-4 ${blocked ? 'border-l-warning' : c.key === 'done' ? 'border-l-success' : 'border-l-primary'}`}>
                  <CardContent className="p-3 space-y-1">
                    <p className="font-medium text-sm">{t.title}</p>
                    {phase && <Badge variant="outline" className="text-xs">{phase.name}</Badge>}
                    {blocked && <p className="text-xs text-warning">Waiting on: {blocker.title}</p>}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                      {c.key !== 'done' && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs"
                          onClick={() => update(t.id, { status: c.key === 'todo' ? 'in_progress' : 'done', completed_at: c.key === 'in_progress' ? new Date().toISOString() : null })}
                          disabled={blocked}>
                          {c.key === 'todo' ? 'Start →' : 'Done ✓'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ Team ============================ */
function TeamTab({ projectId, branchId, team }: any) {
  const ins = useGenericInsert<any>('project_team_members', ['project_team_members']);
  const del = useGenericDelete('project_team_members', ['project_team_members']);
  const [form, setForm] = useState({ member_name: '', role: '', allocation_pct: 100 });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
          <Input placeholder="Name *" value={form.member_name} onChange={e => setForm({ ...form, member_name: e.target.value })} />
          <Input placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          <Input type="number" placeholder="Allocation %" value={form.allocation_pct} onChange={e => setForm({ ...form, allocation_pct: Number(e.target.value) })} />
          <Button onClick={async () => { await ins.mutateAsync({ ...form, project_id: projectId, branch_id: branchId }); setForm({ member_name: '', role: '', allocation_pct: 100 }); }} disabled={!form.member_name}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        {team.length === 0 ? <p className="text-sm text-muted-foreground">No team members.</p> : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m: any) => (
              <Card key={m.id}><CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9"><AvatarFallback>{m.member_name?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-sm">{m.member_name}</p>
                    <p className="text-xs text-muted-foreground">{m.role || 'Member'} · {m.allocation_pct}%</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(m.id)}><Trash2 className="h-3 w-3" /></Button>
              </CardContent></Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Resources ============================ */
function ResourcesTab({ projectId, branchId, resources }: any) {
  const ins = useGenericInsert<any>('project_resources', ['project_resources']);
  const del = useGenericDelete('project_resources', ['project_resources']);
  const [form, setForm] = useState({ resource_type: 'asset', resource_name: '', qty_planned: 1, unit_cost: 0, scheduled_from: '', scheduled_to: '' });

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base">Resources & Scheduling</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
          <Select value={form.resource_type} onValueChange={v => setForm({ ...form, resource_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">Equipment/Asset</SelectItem>
              <SelectItem value="inventory">Inventory Item</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Name" value={form.resource_name} onChange={e => setForm({ ...form, resource_name: e.target.value })} />
          <Input type="number" placeholder="Qty" value={form.qty_planned} onChange={e => setForm({ ...form, qty_planned: Number(e.target.value) })} />
          <Input type="number" placeholder="Unit cost" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: Number(e.target.value) })} />
          <Input type="date" value={form.scheduled_from} onChange={e => setForm({ ...form, scheduled_from: e.target.value })} />
          <Input type="date" value={form.scheduled_to} onChange={e => setForm({ ...form, scheduled_to: e.target.value })} />
        </div>
        <Button size="sm" onClick={async () => { await ins.mutateAsync({ ...form, project_id: projectId, branch_id: branchId, scheduled_from: form.scheduled_from || null, scheduled_to: form.scheduled_to || null }); setForm({ resource_type: 'asset', resource_name: '', qty_planned: 1, unit_cost: 0, scheduled_from: '', scheduled_to: '' }); }} disabled={!form.resource_name}><Plus className="h-4 w-4 mr-1" />Add Resource</Button>
        <div className="mt-4">
          {resources.length === 0 ? <p className="text-sm text-muted-foreground">No resources.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Planned</TableHead><TableHead>Used</TableHead><TableHead>Cost</TableHead><TableHead>Schedule</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {resources.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline">{r.resource_type}</Badge></TableCell>
                    <TableCell>{r.resource_name}</TableCell>
                    <TableCell>{r.qty_planned}</TableCell>
                    <TableCell>{r.qty_used}</TableCell>
                    <TableCell>${Number(r.unit_cost).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{r.scheduled_from || '?'} → {r.scheduled_to || '?'}</TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(r.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================ Finance ============================ */
function FinanceTab({ projectId, branchId, project, expenses, onChange }: any) {
  const post = usePostExpense();
  const del = useGenericDelete('project_expenses', ['project_expenses']);
  const [form, setForm] = useState({ category: 'materials', description: '', amount: 0, expense_date: new Date().toISOString().slice(0, 10) });

  const total = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const budget = Number(project.budget || 0);
  const remaining = budget - total;

  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Budget</p><p className="text-xl font-bold">${budget.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Spent</p><p className="text-xl font-bold text-warning">${total.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Remaining</p><p className={`text-xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>${remaining.toLocaleString()}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Record Expense (posts to GL)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['labor','materials','equipment','services','transport','other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="sm:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            <Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
          </div>
          <Button size="sm" className="mt-2" onClick={async () => { await post.mutateAsync({ project_id: projectId, branch_id: branchId, ...form }); setForm({ category: 'materials', description: '', amount: 0, expense_date: new Date().toISOString().slice(0, 10) }); onChange?.(); }} disabled={!form.description || !form.amount}><DollarSign className="h-4 w-4 mr-1" />Post Expense</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Expense Log</CardTitle></CardHeader>
        <CardContent>
          {expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>GL</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {expenses.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.expense_date}</TableCell>
                    <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="font-medium">${Number(e.amount).toLocaleString()}</TableCell>
                    <TableCell>{e.posted_to_finance ? <Badge variant="secondary">Posted</Badge> : <Badge variant="outline">Local</Badge>}</TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(e.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ Risks ============================ */
function RisksTab({ projectId, branchId, risks }: any) {
  const ins = useGenericInsert<any>('project_risks', ['project_risks']);
  const upd = useGenericUpdate('project_risks', ['project_risks']);
  const del = useGenericDelete('project_risks', ['project_risks']);
  const [form, setForm] = useState({ title: '', description: '', likelihood: 'medium', impact: 'medium', mitigation: '', owner: '' });

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Risk Register</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2">
          <Input className="sm:col-span-2" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Select value={form.likelihood} onValueChange={v => setForm({ ...form, likelihood: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['low','medium','high'].map(p => <SelectItem key={p} value={p}>L: {p}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.impact} onValueChange={v => setForm({ ...form, impact: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['low','medium','high'].map(p => <SelectItem key={p} value={p}>I: {p}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Owner" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
          <Button onClick={async () => { await ins.mutateAsync({ ...form, project_id: projectId, branch_id: branchId }); setForm({ title: '', description: '', likelihood: 'medium', impact: 'medium', mitigation: '', owner: '' }); }} disabled={!form.title}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        <Textarea placeholder="Mitigation strategy" value={form.mitigation} onChange={e => setForm({ ...form, mitigation: e.target.value })} className="mb-4" />
        {risks.length === 0 ? <p className="text-sm text-muted-foreground">No risks logged.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Risk</TableHead><TableHead>L×I</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {risks.map((r: any) => {
                const score = (r.likelihood === 'high' ? 3 : r.likelihood === 'medium' ? 2 : 1) * (r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1);
                return (
                  <TableRow key={r.id}>
                    <TableCell><div className="font-medium">{r.title}</div>{r.mitigation && <div className="text-xs text-muted-foreground">Mit: {r.mitigation}</div>}</TableCell>
                    <TableCell><Badge variant={score >= 6 ? 'destructive' : score >= 3 ? 'default' : 'secondary'}>{r.likelihood}/{r.impact}</Badge></TableCell>
                    <TableCell>{r.owner || '—'}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => upd.mutate({ id: r.id, patch: { status: v } })}>
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>{['open','mitigating','closed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(r.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Observations (GPS + photo) ============================ */
function ObservationsTab({ projectId, branchId, observations }: any) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ note: '', observer_name: '', gps_lat: '', gps_lng: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const grabGPS = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(f => ({ ...f, gps_lat: pos.coords.latitude.toFixed(6), gps_lng: pos.coords.longitude.toFixed(6) })),
      () => toast.error('Could not get location'),
    );
  };

  const submit = async () => {
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const path = `${projectId}/obs-${Date.now()}-${photoFile.name}`;
        const { error: upErr } = await supabase.storage.from('project-documents').upload(path, photoFile);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from('project-documents').createSignedUrl(path, 60 * 60 * 24 * 365);
        photo_url = signed?.signedUrl || null;
      }
      const { error } = await supabase.from('project_observations').insert({
        project_id: projectId, branch_id: branchId,
        note: form.note, observer_name: form.observer_name || null,
        gps_lat: form.gps_lat ? Number(form.gps_lat) : null,
        gps_lng: form.gps_lng ? Number(form.gps_lng) : null,
        photo_url,
      });
      if (error) throw error;
      toast.success('Observation logged');
      setForm({ note: '', observer_name: '', gps_lat: '', gps_lng: '' });
      setPhotoFile(null);
      qc.invalidateQueries({ queryKey: ['project_observations', projectId] });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" />New Field Observation</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Textarea placeholder="What did you observe?" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder="Your name" value={form.observer_name} onChange={e => setForm({ ...form, observer_name: e.target.value })} />
            <Input placeholder="Lat" value={form.gps_lat} onChange={e => setForm({ ...form, gps_lat: e.target.value })} />
            <Input placeholder="Lng" value={form.gps_lng} onChange={e => setForm({ ...form, gps_lng: e.target.value })} />
            <Button variant="outline" onClick={grabGPS}><MapPin className="h-4 w-4 mr-1" />Use my location</Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Input type="file" accept="image/*" capture="environment" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="max-w-sm" />
            <Button onClick={submit} disabled={!form.note || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}Log Observation</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Observations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {observations.length === 0 ? <p className="text-sm text-muted-foreground">No observations yet.</p> : observations.map((o: any) => (
            <div key={o.id} className="border rounded-lg p-3 flex gap-3">
              {o.photo_url && <img src={o.photo_url} alt="" className="h-20 w-20 rounded object-cover" />}
              <div className="flex-1">
                <p className="text-sm">{o.note}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {o.observer_name || 'Anonymous'} · {new Date(o.observed_at).toLocaleString()}
                  {o.gps_lat && <> · <a className="underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${o.gps_lat},${o.gps_lng}`}>{o.gps_lat}, {o.gps_lng}</a></>}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ Weather Events ============================ */
function WeatherTab({ projectId, branchId, weather }: any) {
  const ins = useGenericInsert<any>('project_weather_events', ['project_weather_events']);
  const del = useGenericDelete('project_weather_events', ['project_weather_events']);
  const [form, setForm] = useState({ event_date: new Date().toISOString().slice(0, 10), condition: '', severity: 'low', impact_description: '' });

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><CloudRain className="h-4 w-4" />Weather Impact Log</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
          <Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
          <Input placeholder="Condition (rain, frost...)" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} />
          <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['low','medium','high','severe'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Input className="sm:col-span-1" placeholder="Impact" value={form.impact_description} onChange={e => setForm({ ...form, impact_description: e.target.value })} />
          <Button onClick={async () => { await ins.mutateAsync({ ...form, project_id: projectId, branch_id: branchId }); setForm({ event_date: new Date().toISOString().slice(0, 10), condition: '', severity: 'low', impact_description: '' }); }} disabled={!form.condition}><Plus className="h-4 w-4 mr-1" />Log</Button>
        </div>
        {weather.length === 0 ? <p className="text-sm text-muted-foreground">No weather events.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Condition</TableHead><TableHead>Severity</TableHead><TableHead>Impact</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{weather.map((w: any) => (
              <TableRow key={w.id}>
                <TableCell>{w.event_date}</TableCell><TableCell>{w.condition}</TableCell>
                <TableCell><Badge variant={w.severity === 'severe' || w.severity === 'high' ? 'destructive' : 'outline'}>{w.severity}</Badge></TableCell>
                <TableCell className="text-xs">{w.impact_description}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => del.mutate(w.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Documents ============================ */
function DocumentsTab({ projectId, branchId, documents }: any) {
  const upload = useUploadProjectDocument();
  const del = useGenericDelete('project_documents', ['project_documents']);

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Project Documents</CardTitle></CardHeader>
      <CardContent>
        <Input type="file" onChange={e => {
          const f = e.target.files?.[0];
          if (f) upload.mutate({ projectId, file: f, branchId });
          e.target.value = '';
        }} className="mb-4 max-w-sm" />
        {documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents.</p> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {documents.map((d: any) => (
              <Card key={d.id}><CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm truncate font-medium">{d.file_name}</p>
                    <p className="text-xs text-muted-foreground">{d.file_type} · {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" asChild><a href={d.file_url} target="_blank" rel="noreferrer"><Download className="h-3 w-3" /></a></Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(d.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================ Comments ============================ */
function CommentsTab({ projectId, branchId, comments }: any) {
  const ins = useGenericInsert<any>('project_comments', ['project_comments']);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />Team Comments</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Input placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} className="max-w-xs" />
          <Textarea placeholder="Write a comment..." value={text} onChange={e => setText(e.target.value)} />
          <Button size="sm" onClick={async () => { await ins.mutateAsync({ project_id: projectId, branch_id: branchId, author_name: author || 'Anonymous', body: text }); setText(''); }} disabled={!text}><Plus className="h-4 w-4 mr-1" />Post</Button>
        </div>
        <div className="space-y-2">
          {comments.length === 0 ? <p className="text-sm text-muted-foreground">No comments.</p> : comments.map((c: any) => (
            <div key={c.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{c.author_name[0]}</AvatarFallback></Avatar>
                <p className="text-sm font-medium">{c.author_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================ Activity / Notifications ============================ */
function ActivityTab({ activity, notifications }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Activity Feed</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
            <div className="space-y-2">
              {activity.map((a: any) => (
                <div key={a.id} className="text-sm border-l-2 border-primary pl-3">
                  <p>{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.actor || 'System'} · {new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
        <CardContent>
          {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notifications.</p> : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div key={n.id} className="text-sm border rounded p-2">
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ Reports ============================ */
function ReportsTab({ project, tasks, expenses, milestones, risks }: any) {
  const taskStatus = ['todo', 'in_progress', 'done'].map(s => ({ name: s, value: tasks.filter((t: any) => t.status === s).length }));
  const expByMonth: Record<string, number> = {};
  expenses.forEach((e: any) => {
    const m = (e.expense_date || '').slice(0, 7);
    expByMonth[m] = (expByMonth[m] || 0) + Number(e.amount);
  });
  const expChart = Object.entries(expByMonth).sort().map(([month, amount]) => ({ month, amount }));

  const exportCSV = (rows: any[], name: string) => {
    if (!rows.length) return toast.info('Nothing to export');
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Task Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={taskStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                {taskStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Spend Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="amount" fill="hsl(var(--primary))" /></BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Exports</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(tasks, 'tasks.csv')}><Download className="h-4 w-4 mr-1" />Tasks</Button>
          <Button size="sm" variant="outline" onClick={() => exportCSV(expenses, 'expenses.csv')}><Download className="h-4 w-4 mr-1" />Expenses</Button>
          <Button size="sm" variant="outline" onClick={() => exportCSV(milestones, 'milestones.csv')}><Download className="h-4 w-4 mr-1" />Milestones</Button>
          <Button size="sm" variant="outline" onClick={() => exportCSV(risks, 'risks.csv')}><Download className="h-4 w-4 mr-1" />Risks</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ Closure ============================ */
function ClosureTab({ projectId, branchId, project, closure, expenses, revenue, onChange }: any) {
  const [form, setForm] = useState({
    performance_rating: closure?.performance_rating || 4,
    yield_summary: closure?.yield_summary || '',
    lessons_learned: closure?.lessons_learned || '',
    closed_by: closure?.closed_by || '',
  });
  const totalSpent = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const profit = Number(revenue || project.revenue || 0) - totalSpent;
  const qc = useQueryClient();

  const closeProject = async () => {
    const financial_summary = { budget: project.budget, spent: totalSpent, revenue, profit };
    const payload = { project_id: projectId, branch_id: branchId, ...form, financial_summary };
    const { error } = await supabase.from('project_closures').upsert(payload, { onConflict: 'project_id' });
    if (error) return toast.error(error.message);
    await supabase.from('farm_projects').update({ status: 'completed', archived: true }).eq('id', projectId);
    toast.success('Project closed and archived');
    qc.invalidateQueries({ queryKey: ['project_closure', projectId] });
    onChange?.();
  };

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />Project Closure</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-lg font-bold">${totalSpent.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-bold">${Number(revenue || 0).toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Net</p><p className={`text-lg font-bold ${profit < 0 ? 'text-destructive' : 'text-success'}`}>${profit.toLocaleString()}</p></CardContent></Card>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Performance Rating (1-5)</label>
            <Input type="number" min={1} max={5} value={form.performance_rating} onChange={e => setForm({ ...form, performance_rating: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Closed By</label>
            <Input value={form.closed_by} onChange={e => setForm({ ...form, closed_by: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Yield / Output Summary</label>
          <Textarea value={form.yield_summary} onChange={e => setForm({ ...form, yield_summary: e.target.value })} placeholder="What was produced/delivered?" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Lessons Learned</label>
          <Textarea value={form.lessons_learned} onChange={e => setForm({ ...form, lessons_learned: e.target.value })} placeholder="Post-mortem notes for future projects..." />
        </div>
        <Button onClick={closeProject} variant={closure ? 'outline' : 'default'}>
          <Archive className="h-4 w-4 mr-2" />{closure ? 'Update Closure' : 'Close & Archive Project'}
        </Button>
        {closure && <p className="text-xs text-muted-foreground">Last closed: {new Date(closure.closed_at).toLocaleString()}</p>}
      </CardContent>
    </Card>
  );
}

export default ProjectDetail;