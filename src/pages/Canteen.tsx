import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Star, Utensils, Users, Boxes, MessageSquare, ScrollText, Pencil } from 'lucide-react';
import { useCanteen, CanteenMeal } from '@/hooks/useCanteen';
import { useEmployees } from '@/hooks/useEmployees';
import { useWarehouses } from '@/hooks/useWarehouses';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TIMES = ['Breakfast','Lunch','Supper','Snack'];
const STAFF_ROLES = ['Head Chef','Chef','Sous Chef','Cook','Assistant','Cashier','Cleaner','Server'];

export default function Canteen() {
  const c = useCanteen();
  const { employees } = useEmployees();
  const { warehouses } = useWarehouses();

  const empName = (id: string) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.first_name} ${e.last_name}` : '—';
  };

  const avgRating = useMemo(() => {
    if (!c.reviews.length) return 0;
    return c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length;
  }, [c.reviews]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Canteen</h1>
            <p className="text-muted-foreground">Manage meals, kitchen staff, stock requests and feedback.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<Utensils className="h-5 w-5" />} label="Meals on chart" value={c.meals.length} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Canteen staff" value={c.staff.filter(s=>s.is_active).length} />
          <StatCard icon={<Boxes className="h-5 w-5" />} label="Open requests" value={c.requests.filter(r=>r.status==='pending').length} />
          <StatCard icon={<Star className="h-5 w-5" />} label="Avg rating" value={avgRating.toFixed(1)} />
        </div>

        <Tabs defaultValue="meals">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="meals">Meals Chart</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Requests</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* MEALS CHART */}
          <TabsContent value="meals" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Meals Chart</CardTitle>
                <MealDialog onSave={c.saveMeal} />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 w-24">Time</th>
                        {DAYS.map(d => <th key={d} className="text-left p-2">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {MEAL_TIMES.map(time => (
                        <tr key={time} className="border-b align-top">
                          <td className="p-2 font-medium">{time}</td>
                          {DAYS.map(d => {
                            const items = c.meals.filter(m => m.meal_time === time && m.day_of_week === d);
                            return (
                              <td key={d} className="p-2">
                                <div className="space-y-1">
                                  {items.map(m => (
                                    <div key={m.id} className="rounded border p-2 bg-muted/40 group">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{m.name}</span>
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                          <MealDialog meal={m} onSave={c.saveMeal} />
                                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => c.deleteMeal(m.id)}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                      {m.price > 0 && <div className="text-xs text-muted-foreground">${Number(m.price).toFixed(2)}</div>}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STAFF */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Canteen Staff</CardTitle>
                <StaffDialog employees={employees} onSave={c.saveStaff} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.staff.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{empName(s.employee_id)}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>{s.shift || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => c.removeStaff(s.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!c.staff.length && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No canteen staff yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTORY REQUESTS */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stock Requests & Transfers</CardTitle>
                <RequestDialog warehouses={warehouses} onSave={c.createRequest} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.requests.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{r.item_name}</TableCell>
                        <TableCell>{r.quantity} {r.unit}</TableCell>
                        <TableCell>{warehouses.find((w:any)=>w.id===r.warehouse_id)?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={r.status==='fulfilled'?'default':r.status==='rejected'?'destructive':'secondary'}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          {r.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => c.updateRequestStatus(r.id, 'approved')}>Approve</Button>
                              <Button size="sm" variant="ghost" onClick={() => c.updateRequestStatus(r.id, 'rejected')}>Reject</Button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <Button size="sm" onClick={() => c.updateRequestStatus(r.id, 'fulfilled')}>Mark Fulfilled</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!c.requests.length && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No requests yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Staff Meal Reviews</CardTitle>
                <ReviewDialog meals={c.meals} onSave={c.addReview} />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {c.reviews.map(r => (
                    <div key={r.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{r.meal_name || 'Meal'}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">by {r.reviewer_name || 'Anon'}</span>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => c.deleteReview(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {!c.reviews.length && <p className="text-sm text-muted-foreground text-center py-6">No reviews yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUDIT */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" /> Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Who</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.logs.map(l => (
                      <TableRow key={l.id}>
                        <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                        <TableCell>{l.performed_by_name || '—'}</TableCell>
                        <TableCell>{l.entity}</TableCell>
                        <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {!c.logs.length && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No activity yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MealDialog({ meal, onSave }: { meal?: CanteenMeal; onSave: (m: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(meal || {
    name: '', description: '', category: '', day_of_week: 'Monday',
    meal_time: 'Lunch', price: 0, calories: null, ingredients: '', is_active: true,
  });

  const submit = async () => {
    await onSave(form);
    setOpen(false);
    if (!meal) setForm({ name:'', description:'', category:'', day_of_week:'Monday', meal_time:'Lunch', price:0, calories:null, ingredients:'', is_active:true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {meal
          ? <Button size="icon" variant="ghost" className="h-6 w-6"><Pencil className="h-3 w-3" /></Button>
          : <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Meal</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{meal ? 'Edit' : 'Add'} Meal</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div><Label>Day</Label>
            <Select value={form.day_of_week} onValueChange={v=>setForm({...form,day_of_week:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DAYS.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Meal Time</Label>
            <Select value={form.meal_time} onValueChange={v=>setForm({...form,meal_time:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MEAL_TIMES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Category</Label><Input value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})} /></div>
          <div><Label>Price</Label><Input type="number" value={form.price||0} onChange={e=>setForm({...form,price:Number(e.target.value)})} /></div>
          <div><Label>Calories</Label><Input type="number" value={form.calories||''} onChange={e=>setForm({...form,calories:e.target.value?Number(e.target.value):null})} /></div>
          <div className="col-span-2"><Label>Ingredients</Label><Textarea value={form.ingredients||''} onChange={e=>setForm({...form,ingredients:e.target.value})} /></div>
          <div className="col-span-2"><Label>Description</Label><Textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        </div>
        <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StaffDialog({ employees, onSave }: { employees: any[]; onSave: (s: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', role: 'Chef', shift: 'Morning', is_active: true, notes: '' });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Assign Staff</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign Canteen Staff</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Employee</Label>
            <Select value={form.employee_id} onValueChange={v=>setForm({...form,employee_id:v})}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e:any)=><SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.position||'Staff'}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Role</Label>
            <Select value={form.role} onValueChange={v=>setForm({...form,role:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STAFF_ROLES.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Shift</Label>
            <Select value={form.shift} onValueChange={v=>setForm({...form,shift:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Morning','Afternoon','Evening','Night'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <DialogFooter><Button disabled={!form.employee_id} onClick={async()=>{await onSave(form); setOpen(false);}}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestDialog({ warehouses, onSave }: { warehouses: any[]; onSave: (r:any)=>void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ item_name:'', quantity:1, unit:'kg', warehouse_id:'', notes:'' });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />New Request</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Request Stock from Inventory</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Item</Label><Input value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})} /></div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:Number(e.target.value)})} /></div>
          <div><Label>Unit</Label><Input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} /></div>
          <div className="col-span-2"><Label>Warehouse</Label>
            <Select value={form.warehouse_id} onValueChange={v=>setForm({...form,warehouse_id:v})}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>{warehouses.map((w:any)=><SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <DialogFooter><Button disabled={!form.item_name} onClick={async()=>{await onSave(form); setOpen(false);}}>Submit</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({ meals, onSave }: { meals: CanteenMeal[]; onSave: (r:any)=>void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ meal_id:'', meal_name:'', rating:5, comment:'' });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><MessageSquare className="h-4 w-4 mr-1" />Write Review</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Review a Meal</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Meal</Label>
            <Select value={form.meal_id} onValueChange={v=>{
              const m = meals.find(x=>x.id===v);
              setForm({...form, meal_id:v, meal_name:m?.name||''});
            }}>
              <SelectTrigger><SelectValue placeholder="Select meal" /></SelectTrigger>
              <SelectContent>{meals.map(m=><SelectItem key={m.id} value={m.id}>{m.name} ({m.day_of_week} {m.meal_time})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(i=>(
                <button key={i} type="button" onClick={()=>setForm({...form,rating:i})}>
                  <Star className={`h-6 w-6 ${i<=form.rating?'fill-yellow-400 text-yellow-400':'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
          </div>
          <div><Label>Comment</Label><Textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} /></div>
        </div>
        <DialogFooter><Button disabled={!form.meal_id} onClick={async()=>{await onSave(form); setOpen(false); setForm({meal_id:'',meal_name:'',rating:5,comment:''});}}>Post</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}