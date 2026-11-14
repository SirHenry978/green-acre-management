import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, parseISO } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Plus, Leaf, Wheat, Wrench, Pencil, Trash2, Package, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { canSchedule, listEvents, saveEvent, deleteEvent, calendarResources, resourceMatchesBranch, eventKinds, validEvent, type FarmEvent, type EventDraft } from '@/lib/farmCalendar';

const kindLabels = { planting: 'Planting', harvesting: 'Harvesting', maintenance: 'Maintenance' };
const kindIcons = { planting: Leaf, harvesting: Wheat, maintenance: Wrench };
const dateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export default function FarmCalendar() {
  const { user, branch } = useAuth();
  const [params] = useSearchParams();
  const cache = useQueryClient();
  const allowed = canSchedule(user?.role, user?.branchId);
  const scope = user?.role === 'super_admin' ? branch?.id : user?.branchId;
  const [date, setDate] = useState(startOfDay(new Date()));
  const [month, setMonth] = useState(date);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string>();
  const [removing, setRemoving] = useState<FarmEvent>();
  const [formError, setFormError] = useState('');
  const blank = (): EventDraft => ({ title: '', kind: 'planting', scheduled_date: dateKey(date), branch_id: scope || '', status: 'scheduled', notes: '', asset: null, inventory_item: null });
  const [draft, setDraft] = useState<EventDraft>(blank);
  useEffect(() => { setOpen(false); setRemoving(undefined); }, [scope, user?.id]);
  const events = useQuery({ queryKey: ['farm-calendar', user?.id, scope], queryFn: () => listEvents(scope), enabled: allowed });
  const branches = useQuery({ queryKey: ['calendar-branches', user?.id], queryFn: () => api<{ id: string; name: string }[]>('/api/db/branches/'), enabled: allowed && user?.role === 'super_admin' });
  const assets = useQuery({ queryKey: ['calendar-assets', user?.id, draft.branch_id], queryFn: () => calendarResources('assets', draft.branch_id), enabled: allowed && open && Boolean(draft.branch_id) });
  const inventory = useQuery({ queryKey: ['calendar-inventory', user?.id, draft.branch_id], queryFn: () => calendarResources('inventory_items', draft.branch_id), enabled: allowed && open && Boolean(draft.branch_id) });
  const mutation = useMutation({ mutationFn: () => saveEvent(draft, editing), onSuccess: () => { cache.invalidateQueries({ queryKey: ['farm-calendar'] }); setDate(parseISO(draft.scheduled_date)); setMonth(parseISO(draft.scheduled_date)); setOpen(false); toast.success(editing ? 'Event updated' : 'Event scheduled'); }, onError: (error: Error) => setFormError(error.message) });
  const deletion = useMutation({ mutationFn: deleteEvent, onSuccess: () => { cache.invalidateQueries({ queryKey: ['farm-calendar'] }); setRemoving(undefined); toast.success('Event deleted'); }, onError: (error: Error) => toast.error(error.message) });
  const visible = (events.data || []).filter(event => (filter === 'all' || event.kind === filter) && (!params.get('asset') || event.asset === params.get('asset')) && (!params.get('inventory_item') || event.inventory_item === params.get('inventory_item')));
  const dayEvents = visible.filter(event => event.scheduled_date === dateKey(date));
  function newEvent() { setEditing(undefined); setDraft(blank()); setFormError(''); setOpen(true); }
  function edit(event: FarmEvent) { setEditing(event.id); setDraft({ title: event.title, kind: event.kind, branch_id: event.branch_id, scheduled_date: event.scheduled_date, status: event.status, notes: event.notes, asset: event.asset, inventory_item: event.inventory_item }); setFormError(''); setOpen(true); }
  const resourceError = assets.isError || inventory.isError;
  return <DashboardLayout>
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <div><h1 className="flex items-center gap-2 font-display text-2xl font-semibold"><CalendarDays className="h-6 w-6 text-primary" />Farm calendar</h1><p className="mt-1 text-sm text-muted-foreground">{branch?.name || (user?.role === 'super_admin' ? 'All branches' : 'My branch')}</p></div>
        {allowed && <Button onClick={newEvent} className="gap-2"><Plus className="h-4 w-4" />Schedule event</Button>}
      </header>
      {!allowed ? <p role="alert" className="text-destructive">Only branch managers with an assigned branch and administrators can access the farm calendar.</p> : <>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-44" aria-label="Event category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All events</SelectItem>{eventKinds.map(kind => <SelectItem key={kind} value={kind}>{kindLabels[kind]}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" onClick={() => { const today = startOfDay(new Date()); setDate(today); setMonth(today); }}>Today</Button>
          <div className="ml-auto flex gap-2"><Button asChild variant="ghost" className="gap-2"><Link to="/assets?tab=register"><Warehouse className="h-4 w-4" />Assets</Link></Button><Button asChild variant="ghost" className="gap-2"><Link to="/inventory?tab=stock"><Package className="h-4 w-4" />Inventory</Link></Button></div>
        </div>
        {(params.get('asset') || params.get('inventory_item')) && <Button asChild variant="outline"><Link to="/farm-calendar">Clear resource filter</Link></Button>}
        {events.isError ? <div role="alert" className="space-y-3 border-l-4 border-destructive bg-destructive/10 p-4"><p>Calendar unavailable. Check your server connection and install the calendar update.</p><Button variant="outline" onClick={() => events.refetch()}>Retry</Button></div> : events.isPending ? <p role="status">Loading calendar…</p> : <div className="grid gap-8 lg:grid-cols-[minmax(300px,1fr)_minmax(0,1fr)]">
          <section aria-label="Month calendar" className="min-w-0">
            <Calendar mode="single" selected={date} onSelect={value => value && setDate(value)} month={month} onMonthChange={setMonth} className="pointer-events-auto w-full p-0" classNames={{ month: 'w-full space-y-4', head_row: 'flex w-full', head_cell: 'flex-1 text-center text-muted-foreground text-xs', row: 'flex w-full mt-2', cell: 'flex-1 h-14 text-center relative p-0', day: 'w-full h-14 rounded-md text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring' }} modifiers={{ events: visible.filter(e => e.status !== 'cancelled').map(e => parseISO(e.scheduled_date)) }} modifiersClassNames={{ events: 'underline decoration-primary decoration-2 underline-offset-4 font-semibold' }} />
            <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground">{eventKinds.map(kind => { const Icon = kindIcons[kind]; return <span key={kind} className="flex items-center gap-1"><Icon className="h-4 w-4 text-primary" />{kindLabels[kind]}</span>; })}</div>
          </section>
          <section aria-label="Selected day events" className="min-w-0 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h2 className="font-display text-lg font-semibold">{format(date, 'EEEE, d MMMM yyyy')}</h2><p className="mt-1 text-sm text-muted-foreground">{dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}</p>
            {dayEvents.length === 0 ? <div className="py-12 text-center"><CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No events scheduled</p><Button variant="ghost" onClick={newEvent} className="mt-3 gap-2"><Plus className="h-4 w-4" />Schedule event</Button></div> : <div className="mt-4 divide-y">{dayEvents.map(event => { const Icon = kindIcons[event.kind]; return <article key={event.id} className="space-y-3 py-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="mb-1 flex items-center gap-2 text-xs text-primary"><Icon className="h-4 w-4" />{kindLabels[event.kind]}</p><h3 className="break-words font-semibold">{event.title}</h3></div><div className="flex shrink-0"><Button variant="ghost" size="icon" title="Edit event" aria-label={`Edit ${event.title}`} onClick={() => edit(event)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Delete event" aria-label={`Delete ${event.title}`} onClick={() => setRemoving(event)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div><div className="flex flex-wrap gap-2"><Badge variant="outline">{event.status}</Badge>{!scope && <Badge variant="secondary">{event.branch_name}</Badge>}</div>{event.asset && <Button asChild variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left"><Link to={`/assets?tab=register&asset=${event.asset}`}><Warehouse className="mr-2 h-4 w-4 shrink-0" />{event.asset_name || 'Linked asset'}</Link></Button>}{event.inventory_item && <div><Button asChild variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left"><Link to={`/inventory?tab=stock&item=${event.inventory_item}`}><Package className="mr-2 h-4 w-4 shrink-0" />{event.inventory_name || 'Linked inventory'}</Link></Button></div>}{event.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{event.notes}</p>}</article>; })}</div>}
          </section>
        </div>}
      </>}
      <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{editing ? 'Edit event' : 'Schedule event'}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={e => { e.preventDefault(); setFormError(''); mutation.mutate(); }}>
        {user?.role === 'super_admin' && <div className="space-y-2"><Label>Branch</Label><Select value={draft.branch_id} onValueChange={branch_id => setDraft({ ...draft, branch_id, asset: null, inventory_item: null })} disabled={mutation.isPending}><SelectTrigger aria-label="Branch"><SelectValue placeholder="Choose branch" /></SelectTrigger><SelectContent>{branches.data?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>{branches.isError && <p role="alert" className="text-sm text-destructive">Could not load branches.</p>}</div>}
        <div className="space-y-2"><Label htmlFor="event-title">Event title</Label><Input id="event-title" required maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} disabled={mutation.isPending} /></div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Category</Label><Select value={draft.kind} onValueChange={kind => setDraft({ ...draft, kind: kind as EventDraft['kind'] })}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent>{eventKinds.map(kind => <SelectItem key={kind} value={kind}>{kindLabels[kind]}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start gap-2" aria-label="Event date"><CalendarDays className="h-4 w-4" />{format(parseISO(draft.scheduled_date), 'dd MMM yyyy')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" selected={parseISO(draft.scheduled_date)} onSelect={value => value && setDraft({ ...draft, scheduled_date: dateKey(value) })} initialFocus className="pointer-events-auto p-3" /></PopoverContent></Popover></div></div>
        <div className="space-y-2"><Label>Asset (optional)</Label><Select value={draft.asset || 'none'} onValueChange={value => setDraft({ ...draft, asset: value === 'none' ? null : value })} disabled={!draft.branch_id || assets.isPending}><SelectTrigger aria-label="Asset"><SelectValue placeholder="No asset" /></SelectTrigger><SelectContent><SelectItem value="none">No asset</SelectItem>{assets.data?.filter(r => resourceMatchesBranch(r, draft.branch_id)).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Inventory item (optional)</Label><Select value={draft.inventory_item || 'none'} onValueChange={value => setDraft({ ...draft, inventory_item: value === 'none' ? null : value })} disabled={!draft.branch_id || inventory.isPending}><SelectTrigger aria-label="Inventory item"><SelectValue placeholder="No inventory item" /></SelectTrigger><SelectContent><SelectItem value="none">No inventory item</SelectItem>{inventory.data?.filter(r => resourceMatchesBranch(r, draft.branch_id)).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
        {resourceError && <p role="alert" className="text-sm text-destructive">Could not load linked resources. Close and retry.</p>}
        <div className="space-y-2"><Label>Status</Label><Select value={draft.status} onValueChange={status => setDraft({ ...draft, status: status as EventDraft['status'] })}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="event-notes">Notes</Label><Textarea id="event-notes" value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} /></div>
        {formError && <p role="alert" className="break-words text-sm text-destructive">{formError}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={!validEvent(draft) || mutation.isPending || resourceError}>{mutation.isPending ? 'Saving…' : 'Save event'}</Button></div>
      </form></DialogContent></Dialog>
      <AlertDialog open={Boolean(removing)} onOpenChange={value => { if (!value && !deletion.isPending) setRemoving(undefined); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle><AlertDialogDescription>{removing?.title} will be removed from the calendar. Linked assets and inventory will not be deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deletion.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={deletion.isPending} onClick={e => { e.preventDefault(); if (removing) deletion.mutate(removing); }}>{deletion.isPending ? 'Deleting…' : 'Delete event'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  </DashboardLayout>;
}