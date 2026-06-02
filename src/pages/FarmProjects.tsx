import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentBranchId } from '@/hooks/useBranchFilter';
import {
  FolderKanban, Plus, Calendar, DollarSign, Users, CheckCircle2,
  Clock, AlertCircle, BarChart3, ListTodo, Loader2, Pencil, Trash2,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  planning: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  on_hold: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/10 text-accent-foreground',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
};

const FarmProjects = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', objectives: '', priority: 'medium', project_type: 'crop', budget: '', start_date: '', end_date: '', manager_name: '', location_name: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
  const queryClient = useQueryClient();
  const branchId = useCurrentBranchId();
  const nav = useNavigate();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['farm-projects', branchId],
    queryFn: async () => {
      let q = supabase.from('farm_projects').select('*').order('created_at', { ascending: false });
      if (branchId) q = q.eq('branch_id', branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['farm-tasks', branchId],
    queryFn: async () => {
      let q = supabase.from('farm_tasks').select('*').order('created_at', { ascending: false });
      if (branchId) q = q.eq('branch_id', branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createProjectMut = useMutation({
    mutationFn: async (p: typeof newProject) => {
      const { error } = await supabase.from('farm_projects').insert({
        name: p.name,
        description: p.description || null,
        objectives: p.objectives || null,
        project_type: p.project_type,
        location_name: p.location_name || null,
        priority: p.priority,
        budget: p.budget ? Number(p.budget) : 0,
        start_date: p.start_date || null,
        end_date: p.end_date || null,
        manager_name: p.manager_name || null,
        branch_id: branchId || 'default',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-projects'] });
      toast.success('Project created!');
      setShowCreateProject(false);
      setNewProject({ name: '', description: '', objectives: '', priority: 'medium', project_type: 'crop', budget: '', start_date: '', end_date: '', manager_name: '', location_name: '' });
    },
    onError: () => toast.error('Failed to create project'),
  });

  const createTaskMut = useMutation({
    mutationFn: async (t: typeof newTask & { project_id: string }) => {
      const { error } = await supabase.from('farm_tasks').insert({
        project_id: t.project_id,
        branch_id: branchId || 'default',
        title: t.title,
        description: t.description || null,
        priority: t.priority,
        assigned_to: t.assigned_to || null,
        due_date: t.due_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-tasks'] });
      toast.success('Task created!');
      setShowCreateTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('farm_tasks').update({
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-tasks'] });
      toast.success('Task updated');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('farm_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-projects'] });
      toast.success('Project deleted');
    },
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.project_id === selectedProjectId);
  const todoTasks = projectTasks.filter(t => t.status === 'todo');
  const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress');
  const doneTasks = projectTasks.filter(t => t.status === 'done');

  // Dashboard stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (Number(p.spent) || 0), 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Farm Projects</h1>
            <p className="text-muted-foreground mt-1">Manage projects, tasks, budgets, and timelines</p>
          </div>
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Project name *" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                <Textarea placeholder="Objectives" value={newProject.objectives} onChange={e => setNewProject(p => ({ ...p, objectives: e.target.value }))} />
                <Textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newProject.project_type} onValueChange={v => setNewProject(p => ({ ...p, project_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crop">Crop Production</SelectItem>
                      <SelectItem value="livestock">Livestock Program</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newProject.priority} onValueChange={v => setNewProject(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Budget" type="number" value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} />
                  <Input placeholder="Location" value={newProject.location_name} onChange={e => setNewProject(p => ({ ...p, location_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Start Date</label>
                    <Input type="date" value={newProject.start_date} onChange={e => setNewProject(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">End Date</label>
                    <Input type="date" value={newProject.end_date} onChange={e => setNewProject(p => ({ ...p, end_date: e.target.value }))} />
                  </div>
                </div>
                <Input placeholder="Project manager name" value={newProject.manager_name} onChange={e => setNewProject(p => ({ ...p, manager_name: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button onClick={() => createProjectMut.mutate(newProject)} disabled={!newProject.name}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><FolderKanban className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{activeProjects}</p><p className="text-xs text-muted-foreground">Active Projects</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2"><DollarSign className="h-5 w-5 text-accent-foreground" /></div>
            <div><p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Budget</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2"><BarChart3 className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Spent</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2"><CheckCircle2 className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p><p className="text-xs text-muted-foreground">Tasks Completed</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="board">Task Board</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Projects List */}
          <TabsContent value="projects" className="space-y-4">
            {loadingProjects ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No projects yet. Create your first farm project!</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map(project => {
                  const pTasks = tasks.filter(t => t.project_id === project.id);
                  const pDone = pTasks.filter(t => t.status === 'done').length;
                  const progress = pTasks.length > 0 ? (pDone / pTasks.length) * 100 : 0;
                  return (
                    <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => nav(`/farm-projects/${project.id}`)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className={statusColors[project.status] || ''}>{project.status}</Badge>
                          <Badge className={priorityColors[project.priority] || ''}>{project.priority}</Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{project.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {project.project_type && <Badge variant="outline" className="mb-2 text-xs">{project.project_type}</Badge>}
                        {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><ListTodo className="h-3 w-3" />{pTasks.length} tasks</div>
                            <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(project.budget || 0).toLocaleString()}</div>
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No date'}</div>
                          </div>
                          {project.manager_name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" /> {project.manager_name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Kanban Board */}
          <TabsContent value="board">
            {!selectedProjectId ? (
              <Card><CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Select a project from the Projects tab to view its task board</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedProject?.name} — Tasks</h2>
                  <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <Input placeholder="Task title *" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
                        <Textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} />
                        <div className="grid grid-cols-2 gap-3">
                          <Select value={newTask.priority} onValueChange={v => setNewTask(t => ({ ...t, priority: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))} />
                        </div>
                        <Input placeholder="Assigned to" value={newTask.assigned_to} onChange={e => setNewTask(t => ({ ...t, assigned_to: e.target.value }))} />
                      </div>
                      <DialogFooter>
                        <Button onClick={() => createTaskMut.mutate({ ...newTask, project_id: selectedProjectId! })} disabled={!newTask.title}>Add Task</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* To Do */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-muted-foreground" /><span className="font-medium">To Do ({todoTasks.length})</span></div>
                    {todoTasks.map(task => (
                      <Card key={task.id} className="border-l-4 border-l-muted-foreground">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateTaskStatus.mutate({ id: task.id, status: 'in_progress' })}>Start →</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* In Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span className="font-medium">In Progress ({inProgressTasks.length})</span></div>
                    {inProgressTasks.map(task => (
                      <Card key={task.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateTaskStatus.mutate({ id: task.id, status: 'done' })}>Done ✓</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* Done */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span className="font-medium">Done ({doneTasks.length})</span></div>
                    {doneTasks.map(task => (
                      <Card key={task.id} className="border-l-4 border-l-success opacity-75">
                        <CardContent className="p-3">
                          <p className="font-medium text-sm line-through">{task.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                            <span className="text-xs text-muted-foreground">{task.completed_at ? new Date(task.completed_at).toLocaleDateString() : ''}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Timeline / Gantt-style */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader><CardTitle>Project Timeline</CardTitle></CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Create projects to see the timeline view</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => {
                      const start = project.start_date ? new Date(project.start_date) : null;
                      const end = project.end_date ? new Date(project.end_date) : null;
                      const pTasks = tasks.filter(t => t.project_id === project.id);
                      const pDone = pTasks.filter(t => t.status === 'done').length;
                      const progress = pTasks.length > 0 ? (pDone / pTasks.length) * 100 : 0;

                      return (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FolderKanban className="h-4 w-4 text-primary" />
                              <span className="font-medium">{project.name}</span>
                              <Badge className={`text-xs ${statusColors[project.status]}`}>{project.status}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteProject.mutate(project.id); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{start ? start.toLocaleDateString() : 'No start'}</span>
                            <span>→</span>
                            <span>{end ? end.toLocaleDateString() : 'No end'}</span>
                            <span className="ml-auto">{pDone}/{pTasks.length} tasks</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          {Number(project.budget) > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <DollarSign className="h-3 w-3" />
                              <span>Budget: ${Number(project.budget).toLocaleString()}</span>
                              <span className="text-muted-foreground">/ Spent: ${Number(project.spent || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FarmProjects;
