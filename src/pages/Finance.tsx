import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { transactions, branches, monthlyRevenueData } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuotationsList } from '@/components/finance/QuotationsList';
import { InvoicesList } from '@/components/finance/InvoicesList';
import { ReceiptsList } from '@/components/finance/ReceiptsList';
import { 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileText,
  Receipt,
  ClipboardList
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const Finance = () => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [activeTab, setActiveTab] = useState('transactions');

  const filteredByBranch = useBranchFilter(transactions);
  
  const filteredTransactions = filteredByBranch.filter(t => 
    filterType === 'all' || t.type === filterType
  );

  const totalIncome = filteredByBranch
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredByBranch
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Finance</h1>
            <p className="text-muted-foreground mt-1">
              Manage transactions, quotations, invoices, and receipts
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold font-display text-success">${totalIncome.toLocaleString()}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" /> +12.5% from last month
                </p>
              </div>
              <div className="rounded-xl bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold font-display text-destructive">${totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3" /> -3.2% from last month
                </p>
              </div>
              <div className="rounded-xl bg-destructive/10 p-3">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={cn(
                  "text-2xl font-bold font-display",
                  netProfit >= 0 ? "text-success" : "text-destructive"
                )}>${netProfit.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}% profit margin
                </p>
              </div>
              <div className="rounded-xl bg-primary p-3">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different document types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="transactions" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Quotations</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Receipts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {/* Chart */}
            <div className="card-farm p-5">
              <h3 className="font-display font-semibold text-lg mb-4">Monthly Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 15%, 88%)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(140, 15%, 88%)', borderRadius: '8px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="hsl(142, 72%, 29%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions List */}
            <div className="card-farm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-display font-semibold text-lg">Recent Transactions</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {filterType === 'all' ? 'All' : filterType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('income')}>Income</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('expense')}>Expense</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="overflow-x-auto">
                <table className="table-farm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Branch</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                        <td className="text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>
                          <Badge className={cn(transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="font-medium">{transaction.category}</td>
                        <td className="text-muted-foreground max-w-xs truncate">{transaction.description}</td>
                        <td className="text-muted-foreground">{getBranchName(transaction.branchId)}</td>
                        <td className={cn("text-right font-semibold", transaction.type === 'income' ? 'text-success' : 'text-destructive')}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quotations">
            <QuotationsList />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesList />
          </TabsContent>

          <TabsContent value="receipts">
            <ReceiptsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
