import { useState, useMemo } from 'react';
import { useInventoryIssues, useInventoryReceipts } from '@/hooks/useInventoryTransactions';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const WarehouseTransferReport = () => {
  const { issues } = useInventoryIssues();
  const { receipts } = useInventoryReceipts();
  const { warehouses } = useWarehouses();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const warehouseMap = useMemo(() => {
    const map: Record<string, string> = {};
    warehouses.forEach((w: any) => { map[w.id] = w.name; });
    return map;
  }, [warehouses]);

  const allTransactions = useMemo(() => {
    const txns: any[] = [];
    issues.forEach((i: any) => txns.push({ ...i, type: 'issue', date: i.issue_date, warehouse_id: i.from_warehouse_id }));
    receipts.forEach((r: any) => txns.push({ ...r, type: 'receipt', date: r.receipt_date, warehouse_id: r.warehouse_id }));
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [issues, receipts]);

  const filtered = useMemo(() => {
    return allTransactions.filter(t => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (warehouseFilter !== 'all') {
        const matchesFrom = t.from_warehouse_id === warehouseFilter;
        const matchesTo = t.to_warehouse_id === warehouseFilter;
        const matchesWh = t.warehouse_id === warehouseFilter;
        if (!matchesFrom && !matchesTo && !matchesWh) return false;
      }
      return true;
    });
  }, [allTransactions, dateFrom, dateTo, warehouseFilter]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Ref #', 'Item', 'Qty', 'Unit', 'From', 'To', 'Status'];
    const rows = filtered.map(t => [
      t.date,
      t.type,
      t.reference_number || '',
      t.item_name,
      t.quantity,
      t.unit,
      t.type === 'issue' ? (warehouseMap[t.from_warehouse_id] || '—') : (t.supplier_source || '—'),
      t.type === 'issue' ? (t.recipient_name || warehouseMap[t.to_warehouse_id] || '—') : (warehouseMap[t.warehouse_id] || '—'),
      t.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Warehouse Transfer Report</h3>
        <Button size="sm" variant="outline" className="gap-2" onClick={exportCSV}><FileDown className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input type="date" className="input-farm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input type="date" className="input-farm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Warehouse</label>
          <select className="input-farm" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="all">All Warehouses</option>
            {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => { setDateFrom(''); setDateTo(''); setWarehouseFilter('all'); }}>
          <Filter className="h-4 w-4" /> Clear
        </Button>
      </div>

      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Ref #</th>
                <th>Item</th>
                <th>Qty</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-6">No transactions found</td></tr>
              ) : filtered.map((t: any) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground">{t.date}</td>
                  <td>
                    <Badge className={cn(t.type === 'issue' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success', 'capitalize')}>
                      {t.type === 'issue' ? 'Issue' : 'Receipt'}
                    </Badge>
                  </td>
                  <td className="font-mono text-xs">{t.reference_number || '—'}</td>
                  <td className="font-medium">{t.item_name}</td>
                  <td>{t.quantity} {t.unit}</td>
                  <td className="text-muted-foreground">
                    {t.type === 'issue' ? (warehouseMap[t.from_warehouse_id] || '—') : (t.supplier_source || '—')}
                  </td>
                  <td className="text-muted-foreground">
                    {t.type === 'issue' ? (t.recipient_name || warehouseMap[t.to_warehouse_id] || '—') : (warehouseMap[t.warehouse_id] || '—')}
                  </td>
                  <td>
                    <Badge className={cn('capitalize',
                      t.status === 'approved' ? 'bg-success/10 text-success' :
                      t.status === 'pending' ? 'bg-warning/10 text-warning' :
                      t.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-primary/10 text-primary'
                    )}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t text-sm text-muted-foreground">
          Showing {filtered.length} of {allTransactions.length} total transactions
        </div>
      </div>
    </div>
  );
};

export default WarehouseTransferReport;
