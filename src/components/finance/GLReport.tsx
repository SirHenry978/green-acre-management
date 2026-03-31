import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGLAccounts } from '@/hooks/useGLAccounts';

const accountTypeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense',
};

const accountTypeColors: Record<string, string> = {
  asset: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  liability: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  equity: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  revenue: 'bg-success/10 text-success',
  expense: 'bg-destructive/10 text-destructive',
};

export const GLReport = () => {
  const { accounts, subAccounts, entries, loading, getAccountById, getSubAccountById } = useGLAccounts();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Date filter
      if (dateFrom && entry.entry_date < dateFrom) return false;
      if (dateTo && entry.entry_date > dateTo) return false;

      // Account type filter
      if (filterAccountType !== 'all') {
        const account = getAccountById(entry.gl_account_id);
        if (!account || account.account_type !== filterAccountType) return false;
      }

      // Specific account filter
      if (filterAccountId !== 'all' && entry.gl_account_id !== filterAccountId) return false;

      return true;
    });
  }, [entries, dateFrom, dateTo, filterAccountType, filterAccountId, getAccountById]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, e) => ({
        totalDebit: acc.totalDebit + Number(e.debit),
        totalCredit: acc.totalCredit + Number(e.credit),
      }),
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [filteredEntries]);

  // Summary by account
  const accountSummary = useMemo(() => {
    const map = new Map<string, { debit: number; credit: number; account: ReturnType<typeof getAccountById> }>();
    filteredEntries.forEach(e => {
      const existing = map.get(e.gl_account_id) || { debit: 0, credit: 0, account: getAccountById(e.gl_account_id) };
      existing.debit += Number(e.debit);
      existing.credit += Number(e.credit);
      map.set(e.gl_account_id, existing);
    });
    return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
  }, [filteredEntries, getAccountById]);

  const filteredAccounts = filterAccountType === 'all'
    ? accounts
    : accounts.filter(a => a.account_type === filterAccountType);

  const handleExport = () => {
    const headers = ['Date', 'Account Code', 'Account Name', 'Sub-Account', 'Description', 'Debit', 'Credit', 'Reference'];
    const rows = filteredEntries.map(e => {
      const account = getAccountById(e.gl_account_id);
      const sub = e.gl_sub_account_id ? getSubAccountById(e.gl_sub_account_id) : null;
      return [
        e.entry_date,
        account?.account_code || '',
        account?.account_name || '',
        sub?.sub_account_name || '',
        e.description,
        Number(e.debit).toFixed(2),
        Number(e.credit).toFixed(2),
        e.reference_number || '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gl-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading GL Report...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card-farm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date From</label>
            <input type="date" className="input-farm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date To</label>
            <input type="date" className="input-farm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Account Type</label>
            <select className="input-farm" value={filterAccountType} onChange={e => { setFilterAccountType(e.target.value); setFilterAccountId('all'); }}>
              <option value="all">All Types</option>
              {Object.entries(accountTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GL Account</label>
            <select className="input-farm" value={filterAccountId} onChange={e => setFilterAccountId(e.target.value)}>
              <option value="all">All Accounts</option>
              {filteredAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Debits</p>
          <p className="text-2xl font-bold font-display">${totals.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Credits</p>
          <p className="text-2xl font-bold font-display">${totals.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className={cn("text-2xl font-bold font-display", totals.totalDebit - totals.totalCredit >= 0 ? "text-success" : "text-destructive")}>
            ${Math.abs(totals.totalDebit - totals.totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            {totals.totalDebit - totals.totalCredit < 0 ? ' (Cr)' : ' (Dr)'}
          </p>
        </div>
      </div>

      {/* Account Summary */}
      {accountSummary.length > 0 && (
        <div className="card-farm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-display font-semibold text-lg">Account Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table-farm">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Type</th>
                  <th className="text-right">Total Debit</th>
                  <th className="text-right">Total Credit</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accountSummary.map(item => {
                  const balance = item.debit - item.credit;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="font-medium">
                        {item.account ? `${item.account.account_code} - ${item.account.account_name}` : 'Unknown'}
                      </td>
                      <td>
                        {item.account && (
                          <Badge className={cn(accountTypeColors[item.account.account_type])}>
                            {accountTypeLabels[item.account.account_type]}
                          </Badge>
                        )}
                      </td>
                      <td className="text-right font-mono">${item.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-right font-mono">${item.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={cn("text-right font-mono font-semibold", balance >= 0 ? "text-success" : "text-destructive")}>
                        ${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} {balance < 0 ? '(Cr)' : '(Dr)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entries Detail */}
      <div className="card-farm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-lg">GL Entries ({filteredEntries.length})</h3>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Sub-Account</th>
                <th>Description</th>
                <th>Reference</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No entries found for the selected filters.</td></tr>
              ) : (
                filteredEntries.map(entry => {
                  const account = getAccountById(entry.gl_account_id);
                  const sub = entry.gl_sub_account_id ? getSubAccountById(entry.gl_sub_account_id) : null;
                  return (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="text-muted-foreground">{new Date(entry.entry_date).toLocaleDateString()}</td>
                      <td className="font-medium">
                        {account ? `${account.account_code} - ${account.account_name}` : 'Unknown'}
                      </td>
                      <td className="text-muted-foreground">
                        {sub ? `${sub.sub_account_code} - ${sub.sub_account_name}` : '-'}
                      </td>
                      <td className="max-w-xs truncate">{entry.description}</td>
                      <td className="text-muted-foreground">{entry.reference_number || '-'}</td>
                      <td className="text-right font-mono">
                        {Number(entry.debit) > 0 ? `$${Number(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="text-right font-mono">
                        {Number(entry.credit) > 0 ? `$${Number(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
              {filteredEntries.length > 0 && (
                <tr className="font-bold border-t-2 border-border bg-muted/30">
                  <td colSpan={5} className="text-right">Totals:</td>
                  <td className="text-right font-mono">${totals.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="text-right font-mono">${totals.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
