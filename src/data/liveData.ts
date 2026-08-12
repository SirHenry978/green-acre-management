// Hydrates the shared in-memory stores from the Django backend.
// Everything the dashboard/reporting pages read now comes from the API.
import { supabase } from '@/lib/backend';
import {
  users, branches, inventory, transactions, attendance, suppliers, customers,
  assets, activities, quotations, invoices, receipts,
  monthlyRevenueData, farmTypeDistribution,
  User, UserRole,
} from '@/data/dummyData';

const fill = <T,>(target: T[], rows: T[]) => {
  target.length = 0;
  rows.forEach(r => target.push(r));
};

const num = (v: any) => Number(v ?? 0) || 0;
const str = (v: any) => (v === null || v === undefined ? '' : String(v));

const FARM_TYPE_COLORS: Record<string, string> = {
  crops: 'hsl(var(--chart-1))',
  livestock: 'hsl(var(--chart-2))',
  dairy: 'hsl(var(--chart-3))',
  poultry: 'hsl(var(--chart-4))',
  aquaculture: 'hsl(var(--chart-5))',
  mixed: 'hsl(var(--chart-1))',
};

const grab = async (table: string, order?: string) => {
  let q = supabase.from(table).select('*');
  if (order) q = q.order(order, { ascending: false });
  const { data, error } = await q;
  if (error) return [];
  return (data as any[]) || [];
};

export const hydrateAppData = async () => {
  const [
    branchRows, userRows, invRows, txRows, attRows, supRows, custRows,
    assetRows, actRows, quoRows, invcRows, recRows, empRows,
  ] = await Promise.all([
    grab('branches'), grab('core_user'), grab('inventory_items'),
    grab('transactions', 'transaction_date'), grab('attendance_records', 'attendance_date'),
    grab('suppliers'), grab('customers'), grab('assets'), grab('activities', 'activity_date'),
    grab('quotations', 'created_at'), grab('invoices', 'created_at'), grab('receipts', 'created_at'),
    grab('employees'),
  ]);

  fill(branches, branchRows.map((b: any) => ({
    id: str(b.id), name: b.name, location: str(b.location), managerId: str(b.manager_id),
    farmType: (b.farm_type || 'mixed'), size: str(b.size),
    status: (b.status || 'active'), totalStaff: num(b.total_staff),
    monthlyRevenue: num(b.monthly_revenue), monthlyExpenses: num(b.monthly_expenses),
  })) as any);

  fill(users, userRows.map((u: any) => ({
    id: str(u.id),
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email,
    email: str(u.email),
    role: (u.role || 'field_staff') as UserRole,
    branchId: u.branch_id ? str(u.branch_id) : undefined,
    phone: u.phone || undefined,
  })) as User[]);

  fill(inventory, invRows.map((i: any) => ({
    id: str(i.id), name: i.name, category: i.category || 'tools', quantity: num(i.quantity),
    unit: str(i.unit), minStock: num(i.min_stock), branchId: str(i.branch_id),
    lastUpdated: str(i.last_updated || i.updated_at).slice(0, 10), value: num(i.value),
  })) as any);

  fill(transactions, txRows.map((t: any) => ({
    id: str(t.id), type: t.transaction_type || 'income', category: str(t.category),
    amount: num(t.amount), description: str(t.description),
    date: str(t.transaction_date).slice(0, 10), branchId: str(t.branch_id),
  })) as any);

  const empName = (id: any) => {
    const e = empRows.find((x: any) => str(x.id) === str(id));
    return e ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : '';
  };

  fill(attendance, attRows.map((a: any) => ({
    id: str(a.id), staffId: str(a.employee_id || a.user_id), staffName: empName(a.employee_id),
    date: str(a.attendance_date).slice(0, 10), checkIn: str(a.check_in), checkOut: str(a.check_out),
    status: a.status || 'present', branchId: str(a.branch_id),
  })) as any);

  fill(suppliers, supRows.map((s: any) => ({
    id: str(s.id), name: s.name, contact: str(s.phone || s.contact_person), email: str(s.email),
    category: str(s.category), totalOrders: num(s.total_orders), totalValue: 0,
    status: s.status || 'active', branchId: str(s.branch_id),
  })) as any);

  fill(customers, custRows.map((c: any) => ({
    id: str(c.id), name: c.name, contact: str(c.phone || c.contact_person), email: str(c.email),
    type: c.customer_type || 'retail', totalPurchases: num(c.total_purchases),
    outstandingBalance: 0, branchId: str(c.branch_id),
  })) as any);

  fill(assets, assetRows.map((a: any) => ({
    id: str(a.id), name: a.name || a.asset_name, type: a.asset_type || 'equipment',
    status: a.status === 'active' ? 'operational' : (a.status || 'operational'),
    value: num(a.current_value ?? a.purchase_cost),
    purchaseDate: str(a.purchase_date).slice(0, 10),
    lastMaintenance: str(a.last_maintenance_date || '').slice(0, 10),
    branchId: str(a.branch_id),
  })) as any);

  fill(activities, actRows.map((a: any) => ({
    id: str(a.id), type: a.activity_type || 'maintenance', description: str(a.description),
    date: str(a.activity_date).slice(0, 10), branchId: str(a.branch_id), staffId: str(a.staff_id),
  })) as any);

  const mapItems = (d: any) => ({
    items: Array.isArray(d.items) ? d.items : [],
    subtotal: num(d.subtotal), tax: num(d.tax), total: num(d.total),
  });

  fill(quotations, quoRows.map((q: any) => ({
    id: str(q.id), quotationNumber: q.quotation_number, customerId: str(q.customer_id),
    branchId: str(q.branch_id), ...mapItems(q), status: q.status || 'draft',
    validUntil: str(q.valid_until).slice(0, 10), createdAt: str(q.created_at), notes: q.notes || undefined,
  })) as any);

  fill(invoices, invcRows.map((i: any) => ({
    id: str(i.id), invoiceNumber: i.invoice_number, customerId: str(i.customer_id),
    branchId: str(i.branch_id), quotationId: i.quotation_id || undefined, ...mapItems(i),
    status: i.status || 'draft', dueDate: str(i.due_date).slice(0, 10), createdAt: str(i.created_at),
    paidAt: i.paid_at || undefined, notes: i.notes || undefined,
  })) as any);

  fill(receipts, recRows.map((r: any) => ({
    id: str(r.id), receiptNumber: r.receipt_number, invoiceId: str(r.invoice_id),
    customerId: str(r.customer_id), branchId: str(r.branch_id), amount: num(r.amount),
    paymentMethod: r.payment_method || 'cash', createdAt: str(r.created_at),
    notes: r.notes || undefined, isPrinted: !!r.is_printed,
  })) as any);

  // Derived series -----------------------------------------------------------
  const byMonth = new Map<string, { revenue: number; expenses: number }>();
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('en', { month: 'short' });
    const entry = byMonth.get(month) || { revenue: 0, expenses: 0 };
    if (t.type === 'income') entry.revenue += t.amount; else entry.expenses += t.amount;
    byMonth.set(month, entry);
  });
  fill(monthlyRevenueData, [...byMonth.entries()].map(([month, v]) => ({ month, ...v })));

  const byType = new Map<string, number>();
  branches.forEach(b => byType.set(b.farmType, (byType.get(b.farmType) || 0) + 1));
  fill(farmTypeDistribution, [...byType.entries()].map(([name, value]) => ({
    name, value, color: FARM_TYPE_COLORS[name] || 'hsl(var(--chart-1))',
  })));
};
