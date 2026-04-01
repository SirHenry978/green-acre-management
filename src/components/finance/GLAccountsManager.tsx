import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, MoreVertical, Edit, Trash2, ChevronDown, ChevronRight, FolderPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGLAccounts, GLAccount, GLSubAccount } from '@/hooks/useGLAccounts';
import { useAuth } from '@/contexts/AuthContext';

const accountTypeColors: Record<string, string> = {
  asset: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  liability: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  equity: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  revenue: 'bg-success/10 text-success',
  expense: 'bg-destructive/10 text-destructive',
};

const accountTypeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense',
};

export const GLAccountsManager = () => {
  const { user } = useAuth();
  const {
    accounts, subAccounts, loading,
    createAccount, updateAccount, deleteAccount,
    createSubAccount, updateSubAccount, deleteSubAccount,
    getSubAccountsForAccount,
  } = useGLAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<GLAccount | null>(null);
  const [selectedSub, setSelectedSub] = useState<GLSubAccount | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<GLAccount['account_type']>('asset');
  const [formDesc, setFormDesc] = useState('');
  const [formSubCode, setFormSubCode] = useState('');
  const [formSubName, setFormSubName] = useState('');
  const [formSubDesc, setFormSubDesc] = useState('');
  const [parentAccountId, setParentAccountId] = useState('');

  const toggleExpand = (id: string) => {
    const next = new Set(expandedAccounts);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedAccounts(next);
  };

  const filtered = accounts
    .filter(a => filterType === 'all' || a.account_type === filterType)
    .filter(a =>
      a.account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.account_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const resetAccountForm = () => {
    setFormCode(''); setFormName(''); setFormType('asset'); setFormDesc('');
  };

  const resetSubForm = () => {
    setFormSubCode(''); setFormSubName(''); setFormSubDesc(''); setParentAccountId('');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await createAccount({
      account_code: formCode, account_name: formName,
      account_type: formType, description: formDesc || null,
      is_active: true, branch_id: user?.branchId || null,
    });
    if (ok) { setIsAddAccountOpen(false); resetAccountForm(); }
  };

  const handleEditAccount = (a: GLAccount) => {
    setSelectedAccount(a);
    setFormCode(a.account_code); setFormName(a.account_name);
    setFormType(a.account_type); setFormDesc(a.description || '');
    setIsEditAccountOpen(true);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    const ok = await updateAccount(selectedAccount.id, {
      account_code: formCode, account_name: formName,
      account_type: formType, description: formDesc || null,
    });
    if (ok) { setIsEditAccountOpen(false); resetAccountForm(); }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await createSubAccount({
      parent_account_id: parentAccountId,
      sub_account_code: formSubCode, sub_account_name: formSubName,
      description: formSubDesc || null, is_active: true,
    });
    if (ok) { setIsAddSubOpen(false); resetSubForm(); }
  };

  const handleEditSub = (sub: GLSubAccount) => {
    setSelectedSub(sub);
    setFormSubCode(sub.sub_account_code); setFormSubName(sub.sub_account_name);
    setFormSubDesc(sub.description || ''); setParentAccountId(sub.parent_account_id);
    setIsEditSubOpen(true);
  };

  const handleUpdateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    const ok = await updateSubAccount(selectedSub.id, {
      sub_account_code: formSubCode, sub_account_name: formSubName,
      description: formSubDesc || null,
    });
    if (ok) { setIsEditSubOpen(false); resetSubForm(); }
  };

  const openAddSub = (accountId: string) => {
    setParentAccountId(accountId);
    resetSubForm();
    setParentAccountId(accountId);
    setIsAddSubOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading GL Accounts...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-farm pl-10"
            />
          </div>
          <select
            className="input-farm w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(accountTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => { resetAccountForm(); setIsAddAccountOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          New Account
        </Button>
      </div>

      {/* Accounts Tree */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No GL accounts found. Create your first account.</td></tr>
              )}
              {filtered.map(account => {
                const subs = getSubAccountsForAccount(account.id);
                const isExpanded = expandedAccounts.has(account.id);
                return (
                  <tbody key={account.id}>
                    <tr className="hover:bg-muted/30 transition-colors font-medium">
                      <td className="w-8">
                        {subs.length > 0 ? (
                          <button onClick={() => toggleExpand(account.id)} className="p-1 hover:bg-muted rounded">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : <div className="w-6" />}
                      </td>
                      <td className="font-mono text-sm">{account.account_code}</td>
                      <td>{account.account_name}</td>
                      <td>
                        <Badge className={cn(accountTypeColors[account.account_type])}>
                          {accountTypeLabels[account.account_type]}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => openAddSub(account.id)}
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                            Sub-Account
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteAccount(account.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && subs.map(sub => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors bg-muted/10">
                        <td></td>
                        <td className="font-mono text-sm pl-8">↳ {sub.sub_account_code}</td>
                        <td className="pl-8">{sub.sub_account_name}</td>
                        <td><span className="text-xs text-muted-foreground">Sub-account</span></td>
                        <td>
                          <Badge variant={sub.is_active ? 'default' : 'secondary'} className="text-xs">
                            {sub.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSub(sub)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteSubAccount(sub.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New GL Account</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleCreateAccount}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Code</label>
                <input className="input-farm" value={formCode} onChange={e => setFormCode(e.target.value)} required placeholder="e.g. 1000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Type</label>
                <select className="input-farm" value={formType} onChange={e => setFormType(e.target.value as GLAccount['account_type'])}>
                  {Object.entries(accountTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <input className="input-farm" value={formName} onChange={e => setFormName(e.target.value)} required placeholder="e.g. Cash and Cash Equivalents" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="input-farm" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddAccountOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Create Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit GL Account</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleUpdateAccount}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Account Code</label>
                <input className="input-farm" value={formCode} onChange={e => setFormCode(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Type</label>
                <select className="input-farm" value={formType} onChange={e => setFormType(e.target.value as GLAccount['account_type'])}>
                  {Object.entries(accountTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <input className="input-farm" value={formName} onChange={e => setFormName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="input-farm" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditAccountOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Update Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Sub-Account Dialog */}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Sub-Account</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleCreateSub}>
            <div>
              <label className="block text-sm font-medium mb-2">Parent Account</label>
              <select className="input-farm" value={parentAccountId} onChange={e => setParentAccountId(e.target.value)} required>
                <option value="">Select parent account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sub-Account Code</label>
                <input className="input-farm" value={formSubCode} onChange={e => setFormSubCode(e.target.value)} required placeholder="e.g. 1001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sub-Account Name</label>
                <input className="input-farm" value={formSubName} onChange={e => setFormSubName(e.target.value)} required placeholder="e.g. Petty Cash" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="input-farm" rows={2} value={formSubDesc} onChange={e => setFormSubDesc(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddSubOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Create Sub-Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-Account Dialog */}
      <Dialog open={isEditSubOpen} onOpenChange={setIsEditSubOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Sub-Account</DialogTitle></DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleUpdateSub}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sub-Account Code</label>
                <input className="input-farm" value={formSubCode} onChange={e => setFormSubCode(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sub-Account Name</label>
                <input className="input-farm" value={formSubName} onChange={e => setFormSubName(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="input-farm" rows={2} value={formSubDesc} onChange={e => setFormSubDesc(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditSubOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Update Sub-Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
