import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { branches, transactions, inventory, monthlyRevenueData } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { Button } from '@/components/ui/button';
import { 
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar
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

const Reports = () => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const filteredTransactions = useBranchFilter(transactions);
  const filteredInventory = useBranchFilter(inventory);

  // Filter transactions by date
  const dateFilteredTransactions = filteredTransactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= new Date(startDate) && transDate <= new Date(endDate);
  });

  // Calculate branch performance data
  const branchPerformance = branches.map(branch => ({
    name: branch.name.split(' ')[0],
    revenue: branch.monthlyRevenue,
    expenses: branch.monthlyExpenses,
    profit: branch.monthlyRevenue - branch.monthlyExpenses,
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

  const reports = [
    { name: 'Financial Summary', description: 'Overview of income, expenses, and profit margins', icon: TrendingUp, color: 'bg-success/10 text-success' },
    { name: 'Inventory Report', description: 'Stock levels, valuations, and movement history', icon: BarChart3, color: 'bg-primary/10 text-primary' },
    { name: 'Branch Performance', description: 'Comparative analysis across all farm branches', icon: PieChart, color: 'bg-accent/20 text-accent-foreground' },
    { name: 'Attendance Report', description: 'Staff attendance patterns and statistics', icon: Calendar, color: 'bg-warning/10 text-warning' },
  ];

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
              <div key={report.name} className="card-farm p-5 hover:shadow-farm-lg transition-all cursor-pointer">
                <div className={`inline-flex p-3 rounded-xl ${report.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <Button variant="outline" size="sm" className="w-full gap-2">
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
      </div>
    </DashboardLayout>
  );
};

export default Reports;
