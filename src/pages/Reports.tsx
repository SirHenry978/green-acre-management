import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { branches, transactions, inventory, attendance, assets, users, monthlyRevenueData } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  ArrowLeft,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

type ReportType = 'financial' | 'inventory' | 'branch' | 'attendance' | null;

const Reports = () => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const filteredTransactions = useBranchFilter(transactions);
  const filteredInventory = useBranchFilter(inventory);
  const filteredAttendance = useBranchFilter(attendance);
  const filteredAssets = useBranchFilter(assets);

  // Filter transactions by date
  const dateFilteredTransactions = filteredTransactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= new Date(startDate) && transDate <= new Date(endDate);
  });

  // Calculate branch performance data
  const branchPerformance = branches.map(branch => ({
    name: branch.name.split(' ')[0],
    fullName: branch.name,
    location: branch.location,
    farmType: branch.farmType,
    revenue: branch.monthlyRevenue,
    expenses: branch.monthlyExpenses,
    profit: branch.monthlyRevenue - branch.monthlyExpenses,
    staff: branch.totalStaff,
    status: branch.status,
  }));

  // Inventory by category (filtered by branch)
  const inventoryByCategory = Object.entries(
    filteredInventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, value]) => ({ category, value }));

  // Transaction summary (filtered by date and branch)
  const totalIncome = dateFilteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = dateFilteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Attendance stats
  const attendanceStats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === 'present').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    halfDay: filteredAttendance.filter(a => a.status === 'half-day').length,
  };

  // Income by category
  const incomeByCategory = Object.entries(
    dateFilteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({ category, amount }));

  const expenseByCategory = Object.entries(
    dateFilteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({ category, amount }));

  const reports = [
    { name: 'Financial Summary', key: 'financial' as ReportType, description: 'Overview of income, expenses, and profit margins', icon: TrendingUp, color: 'bg-success/10 text-success' },
    { name: 'Inventory Report', key: 'inventory' as ReportType, description: 'Stock levels, valuations, and movement history', icon: BarChart3, color: 'bg-primary/10 text-primary' },
    { name: 'Branch Performance', key: 'branch' as ReportType, description: 'Comparative analysis across all farm branches', icon: PieChart, color: 'bg-accent/20 text-accent-foreground' },
    { name: 'Attendance Report', key: 'attendance' as ReportType, description: 'Staff attendance patterns and statistics', icon: Calendar, color: 'bg-warning/10 text-warning' },
  ];

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-success/5 p-4">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className="text-2xl font-bold text-primary">${(totalIncome - totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* Income breakdown */}
      <div>
        <h4 className="font-semibold mb-3">Income by Category</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeByCategory.map(item => (
              <TableRow key={item.category}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell className="text-right text-success">${item.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totalIncome > 0 ? ((item.amount / totalIncome) * 100).toFixed(1) : 0}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Expense breakdown */}
      <div>
        <h4 className="font-semibold mb-3">Expenses by Category</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseByCategory.map(item => (
              <TableRow key={item.category}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell className="text-right text-destructive">${item.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : 0}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* All transactions */}
      <div>
        <h4 className="font-semibold mb-3">Transaction Details</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dateFilteredTransactions.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>
                  <Badge variant={t.type === 'income' ? 'default' : 'destructive'}>
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{filteredInventory.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold text-primary">${filteredInventory.reduce((s, i) => s + i.value, 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-2xl font-bold text-destructive">{filteredInventory.filter(i => i.quantity <= i.minStock).length}</p>
        </div>
      </div>

      {/* Value by category */}
      <div>
        <h4 className="font-semibold mb-3">Value by Category</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryByCategory.map(item => (
              <TableRow key={item.category}>
                <TableCell className="font-medium capitalize">{item.category}</TableCell>
                <TableCell className="text-right">${item.value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Full inventory list */}
      <div>
        <h4 className="font-semibold mb-3">Inventory Details</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Min Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">{item.minStock.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={item.quantity <= item.minStock ? 'destructive' : 'default'}>
                    {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${item.value.toLocaleString()}</TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderBranchReport = () => (
    <div className="space-y-6">
      {/* Branch comparison table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Staff</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Expenses</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branchPerformance.map(b => (
            <TableRow key={b.fullName}>
              <TableCell className="font-medium">{b.fullName}</TableCell>
              <TableCell>{b.location}</TableCell>
              <TableCell className="capitalize">{b.farmType}</TableCell>
              <TableCell className="text-right">{b.staff}</TableCell>
              <TableCell className="text-right text-success">${b.revenue.toLocaleString()}</TableCell>
              <TableCell className="text-right text-destructive">${b.expenses.toLocaleString()}</TableCell>
              <TableCell className="text-right font-medium">${b.profit.toLocaleString()}</TableCell>
              <TableCell className="text-right">{b.revenue > 0 ? ((b.profit / b.revenue) * 100).toFixed(1) : 0}%</TableCell>
              <TableCell>
                <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>{b.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Total Branches</p>
          <p className="text-2xl font-bold">{branches.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-success/5 p-4">
          <p className="text-sm text-muted-foreground">Combined Revenue</p>
          <p className="text-2xl font-bold text-success">${branches.reduce((s, b) => s + b.monthlyRevenue, 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">Combined Expenses</p>
          <p className="text-2xl font-bold text-destructive">${branches.reduce((s, b) => s + b.monthlyExpenses, 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Staff</p>
          <p className="text-2xl font-bold">{branches.reduce((s, b) => s + b.totalStaff, 0)}</p>
        </div>
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-success/5 p-4">
          <p className="text-sm text-muted-foreground">Present</p>
          <p className="text-2xl font-bold text-success">{attendanceStats.present}</p>
        </div>
        <div className="rounded-lg border border-border bg-warning/5 p-4">
          <p className="text-sm text-muted-foreground">Late</p>
          <p className="text-2xl font-bold text-warning">{attendanceStats.late}</p>
        </div>
        <div className="rounded-lg border border-border bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">Absent</p>
          <p className="text-2xl font-bold text-destructive">{attendanceStats.absent}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Half-day</p>
          <p className="text-2xl font-bold">{attendanceStats.halfDay}</p>
        </div>
      </div>

      {/* Attendance table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttendance.map(a => {
            const hours = a.checkIn && a.checkOut
              ? ((new Date(`2024-01-01T${a.checkOut}`) .getTime() - new Date(`2024-01-01T${a.checkIn}`).getTime()) / 3600000).toFixed(1)
              : '-';
            return (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.staffName}</TableCell>
                <TableCell>{a.date}</TableCell>
                <TableCell>{a.checkIn || '-'}</TableCell>
                <TableCell>{a.checkOut || '-'}</TableCell>
                <TableCell>{hours}h</TableCell>
                <TableCell>
                  <Badge variant={
                    a.status === 'present' ? 'default' :
                    a.status === 'late' ? 'secondary' :
                    a.status === 'absent' ? 'destructive' : 'outline'
                  }>
                    {a.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Attendance rate */}
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
        <p className="text-2xl font-bold">
          {attendanceStats.total > 0
            ? (((attendanceStats.present + attendanceStats.late + attendanceStats.halfDay) / attendanceStats.total) * 100).toFixed(1)
            : 0}%
        </p>
      </div>
    </div>
  );

  const reportRenderers: Record<string, () => JSX.Element> = {
    financial: renderFinancialReport,
    inventory: renderInventoryReport,
    branch: renderBranchReport,
    attendance: renderAttendanceReport,
  };

  const activeReportMeta = reports.find(r => r.key === activeReport);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Reports</h1>
            <p className="text-muted-foreground mt-1">Generate and download comprehensive farm reports</p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        {/* Date Filters */}
        <div className="card-farm p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">From:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-farm w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">To:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-farm w-auto" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Revenue (Period)</p>
            <p className="text-2xl font-bold font-display text-success">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Expenses (Period)</p>
            <p className="text-2xl font-bold font-display text-destructive">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Net Profit (Period)</p>
            <p className="text-2xl font-bold font-display text-primary">${(totalIncome - totalExpenses).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Inventory Value</p>
            <p className="text-2xl font-bold font-display">${filteredInventory.reduce((sum, i) => sum + i.value, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.name}
                className="card-farm p-5 hover:shadow-farm-lg transition-all cursor-pointer"
                onClick={() => setActiveReport(report.key)}
              >
                <div className={`inline-flex p-3 rounded-xl ${report.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={(e) => { e.stopPropagation(); setActiveReport(report.key); }}>
                  <FileText className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-farm p-5">
            <h3 className="font-display font-semibold text-lg mb-4">Branch Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(140, 15%, 88%)', borderRadius: '8px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(142, 72%, 29%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-farm p-5">
            <h3 className="font-display font-semibold text-lg mb-4">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(140, 15%, 88%)', borderRadius: '8px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="hsl(142, 72%, 29%)" strokeWidth={2} dot={{ fill: 'hsl(142, 72%, 29%)' }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ fill: 'hsl(0, 72%, 51%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Inventory Value by Category */}
        <div className="card-farm p-5">
          <h3 className="font-display font-semibold text-lg mb-4">Inventory Value by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryByCategory} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" horizontal />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)}k`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(140, 15%, 88%)', borderRadius: '8px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" fill="hsl(142, 72%, 29%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Dialog */}
        <Dialog open={!!activeReport} onOpenChange={(open) => !open && setActiveReport(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {activeReportMeta && (() => { const Icon = activeReportMeta.icon; return <Icon className="h-5 w-5" />; })()}
                {activeReportMeta?.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Period: {startDate} to {endDate}
              </p>
            </DialogHeader>
            {activeReport && reportRenderers[activeReport]?.()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
