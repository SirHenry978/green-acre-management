import { useState } from 'react';
import { useLivestockTransfers, useLivestock, useAddLivestockTransfer, useInventoryTransfers, useAddInventoryTransfer } from '@/hooks/useLivestock';
import { useAuth } from '@/contexts/AuthContext';
import { branches, customers } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, ArrowLeftRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const transferStatusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export const TransferRecords = () => {
  const { user, branch } = useAuth();
  const { data: transfers = [], isLoading: loadingTransfers } = useLivestockTransfers();
  const { data: invTransfers = [], isLoading: loadingInv } = useInventoryTransfers();
  const { data: livestock = [] } = useLivestock();
  const addTransfer = useAddLivestockTransfer();
  const addInvTransfer = useAddInventoryTransfer();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddInvOpen, setIsAddInvOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentBranchId = user?.role === 'super_admin' ? branch?.id || 'b1' : user?.branchId || 'b1';

  const [form, setForm] = useState({
    livestock_id: '', transfer_type: 'branch_transfer', to_branch_id: '', customer_id: '',
    reason: '', quantity: '1', unit_price: '', notes: '',
  });

  const [invForm, setInvForm] = useState({
    inventory_item_name: '', category: 'feed', quantity: '', unit: 'kg',
    from_location: '', to_location: '', livestock_id: '', purpose: 'feeding', transferred_by: '',
  });

  const getAnimalTag = (id: string | null) => id ? livestock.find(l => l.id === id)?.tag_number || 'Unknown' : '—';
  const getBranchName = (id: string | null) => id ? branches.find(b => b.id === id)?.name || 'Unknown' : '—';
  const getCustomerName = (id: string | null) => id ? customers.find(c => c.id === id)?.name || 'Unknown' : '—';

  const generateRef = () => `TRF-${Date.now().toString(36).toUpperCase()}`;

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = (parseInt(form.quantity) || 1) * (parseFloat(form.unit_price) || 0);
    addTransfer.mutate({
      livestock_id: form.livestock_id || null,
      reference_number: generateRef(),
      transfer_type: form.transfer_type,
      from_branch_id: currentBranchId,
      to_branch_id: form.transfer_type === 'branch_transfer' ? form.to_branch_id : null,
      customer_id: form.transfer_type === 'sale' ? form.customer_id : null,
      reason: form.reason || null,
      quantity: parseInt(form.quantity) || 1,
      unit_price: parseFloat(form.unit_price) || 0,
      total_value: totalValue,
      notes: form.notes || null,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setForm({ livestock_id: '', transfer_type: 'branch_transfer', to_branch_id: '', customer_id: '', reason: '', quantity: '1', unit_price: '', notes: '' });
      }
    });
  };

  const handleInvTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvTransfer.mutate({
      inventory_item_name: invForm.inventory_item_name,
      category: invForm.category,
      quantity: parseFloat(invForm.quantity) || 0,
      unit: invForm.unit,
      from_location: invForm.from_location,
      to_location: invForm.to_location,
      branch_id: currentBranchId,
      livestock_id: invForm.livestock_id || null,
      purpose: invForm.purpose || null,
      transferred_by: invForm.transferred_by || null,
    }, {
      onSuccess: () => {
        setIsAddInvOpen(false);
        setInvForm({ inventory_item_name: '', category: 'feed', quantity: '', unit: 'kg', from_location: '', to_location: '', livestock_id: '', purpose: 'feeding', transferred_by: '' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="livestock" className="w-full">
        <TabsList>
          <TabsTrigger value="livestock" className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Livestock Transfers</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" /> Inventory Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="livestock" className="space-y-4 mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search transfers..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="input-farm pl-10" />
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Record Transfer</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Record Livestock Transfer</DialogTitle></DialogHeader>
                <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Transfer Type *</label>
                    <select required className="input-farm" value={form.transfer_type}
                      onChange={e => setForm({...form, transfer_type: e.target.value})}>
                      <option value="branch_transfer">Branch Transfer</option>
                      <option value="sale">Sale to Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Animal</label>
                    <select className="input-farm" value={form.livestock_id}
                      onChange={e => setForm({...form, livestock_id: e.target.value})}>
                      <option value="">Select animal (optional for batch)</option>
                      {livestock.filter(l => l.status === 'active').map(l => (
                        <option key={l.id} value={l.id}>{l.tag_number}{l.name ? ` - ${l.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  {form.transfer_type === 'branch_transfer' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">To Branch *</label>
                      <select required className="input-farm" value={form.to_branch_id}
                        onChange={e => setForm({...form, to_branch_id: e.target.value})}>
                        <option value="">Select destination branch</option>
                        {branches.filter(b => b.id !== currentBranchId).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {form.transfer_type === 'sale' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Customer *</label>
                      <select required className="input-farm" value={form.customer_id}
                        onChange={e => setForm({...form, customer_id: e.target.value})}>
                        <option value="">Select customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity</label>
                      <input type="number" className="input-farm" value={form.quantity}
                        onChange={e => setForm({...form, quantity: e.target.value})} min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit Price ($)</label>
                      <input type="number" className="input-farm" value={form.unit_price}
                        onChange={e => setForm({...form, unit_price: e.target.value})} placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <input type="text" className="input-farm" value={form.reason}
                      onChange={e => setForm({...form, reason: e.target.value})} placeholder="Reason for transfer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea className="input-farm" rows={2} value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={addTransfer.isPending}>
                      {addTransfer.isPending ? 'Recording...' : 'Record Transfer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="card-farm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Animal</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Qty</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No transfer records found.</td></tr>
                  ) : transfers.map(t => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="font-mono text-sm">{t.reference_number}</td>
                      <td>{getAnimalTag(t.livestock_id)}</td>
                      <td><Badge className="bg-primary/10 text-primary capitalize">{t.transfer_type.replace('_', ' ')}</Badge></td>
                      <td className="text-muted-foreground">{getBranchName(t.from_branch_id)}</td>
                      <td className="text-muted-foreground">
                        {t.transfer_type === 'sale' ? getCustomerName(t.customer_id) : getBranchName(t.to_branch_id)}
                      </td>
                      <td>{t.quantity}</td>
                      <td className="font-medium">${(t.total_value || 0).toLocaleString()}</td>
                      <td className="text-muted-foreground">{t.transfer_date}</td>
                      <td><Badge className={cn(transferStatusColors[t.status] || 'bg-muted')}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Track feed, medicine, and supplies issued from warehouses to livestock shelters.</p>
            <Dialog open={isAddInvOpen} onOpenChange={setIsAddInvOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Issue Inventory</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Issue Inventory to Livestock</DialogTitle></DialogHeader>
                <form onSubmit={handleInvTransferSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name *</label>
                    <input required type="text" className="input-farm" value={invForm.inventory_item_name}
                      onChange={e => setInvForm({...invForm, inventory_item_name: e.target.value})} placeholder="e.g. Cattle Feed Premium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select required className="input-farm" value={invForm.category}
                        onChange={e => setInvForm({...invForm, category: e.target.value})}>
                        <option value="feed">Feed</option>
                        <option value="medicine">Medicine</option>
                        <option value="supplement">Supplement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Purpose</label>
                      <select className="input-farm" value={invForm.purpose}
                        onChange={e => setInvForm({...invForm, purpose: e.target.value})}>
                        <option value="feeding">Feeding</option>
                        <option value="treatment">Treatment</option>
                        <option value="routine">Routine</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantity *</label>
                      <input required type="number" className="input-farm" value={invForm.quantity}
                        onChange={e => setInvForm({...invForm, quantity: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit</label>
                      <input type="text" className="input-farm" value={invForm.unit}
                        onChange={e => setInvForm({...invForm, unit: e.target.value})} placeholder="kg, liters" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">From (Warehouse) *</label>
                      <input required type="text" className="input-farm" value={invForm.from_location}
                        onChange={e => setInvForm({...invForm, from_location: e.target.value})} placeholder="Main Warehouse" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">To (Shelter/Area) *</label>
                      <input required type="text" className="input-farm" value={invForm.to_location}
                        onChange={e => setInvForm({...invForm, to_location: e.target.value})} placeholder="Barn A" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">For Animal (optional)</label>
                    <select className="input-farm" value={invForm.livestock_id}
                      onChange={e => setInvForm({...invForm, livestock_id: e.target.value})}>
                      <option value="">General use</option>
                      {livestock.filter(l => l.status === 'active').map(l => (
                        <option key={l.id} value={l.id}>{l.tag_number}{l.name ? ` - ${l.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Transferred By</label>
                    <input type="text" className="input-farm" value={invForm.transferred_by}
                      onChange={e => setInvForm({...invForm, transferred_by: e.target.value})} placeholder="Staff name" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddInvOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={addInvTransfer.isPending}>
                      {addInvTransfer.isPending ? 'Recording...' : 'Issue Inventory'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="card-farm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-farm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Purpose</th>
                    <th>For Animal</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invTransfers.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No inventory transfers recorded.</td></tr>
                  ) : invTransfers.map(t => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="font-medium">{t.inventory_item_name}</td>
                      <td><Badge className="bg-primary/10 text-primary capitalize">{t.category}</Badge></td>
                      <td>{t.quantity} {t.unit}</td>
                      <td className="text-muted-foreground">{t.from_location}</td>
                      <td className="text-muted-foreground">{t.to_location}</td>
                      <td className="capitalize text-muted-foreground">{t.purpose || '—'}</td>
                      <td className="font-mono text-sm">{getAnimalTag(t.livestock_id)}</td>
                      <td className="text-muted-foreground">{t.transfer_date}</td>
                      <td><Badge className={cn(transferStatusColors[t.status] || 'bg-muted')}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
