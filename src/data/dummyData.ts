// Types
export type UserRole = 'super_admin' | 'branch_manager' | 'field_staff' | 'accountant' | 'inventory_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  avatar?: string;
  phone?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  managerId: string;
  farmType: 'crops' | 'livestock' | 'mixed' | 'poultry' | 'dairy' | 'aquaculture';
  size: string;
  status: 'active' | 'inactive';
  totalStaff: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'chemicals' | 'feed' | 'machinery' | 'tools' | 'livestock';
  quantity: number;
  unit: string;
  minStock: number;
  branchId: string;
  lastUpdated: string;
  value: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  branchId: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
  totalOrders: number;
  totalValue: number;
  status: 'active' | 'inactive';
  branchId: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  type: 'wholesale' | 'retail' | 'corporate';
  totalPurchases: number;
  outstandingBalance: number;
  branchId: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'equipment' | 'machinery' | 'vehicle' | 'livestock' | 'building' | 'land';
  status: 'operational' | 'maintenance' | 'retired';
  value: number;
  purchaseDate: string;
  lastMaintenance: string;
  branchId: string;
}

export interface Activity {
  id: string;
  type: 'planting' | 'harvesting' | 'feeding' | 'treatment' | 'maintenance' | 'sale' | 'purchase';
  description: string;
  date: string;
  branchId: string;
  staffId: string;
}

// Document types for Finance
export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  branchId: string;
  items: DocumentItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  validUntil: string;
  createdAt: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  branchId: string;
  quotationId?: string;
  items: DocumentItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  customerId: string;
  branchId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  createdAt: string;
  notes?: string;
  isPrinted?: boolean;
}

// ---------------------------------------------------------------------------
// Live data stores.
// These arrays start empty and are filled from the Django API by
// `hydrateAppData()` (src/data/liveData.ts) before the app renders.
// They are mutated in place so existing module imports keep working.
// ---------------------------------------------------------------------------
export const users: User[] = [];
export const branches: Branch[] = [];
export const inventory: InventoryItem[] = [];
export const transactions: Transaction[] = [];
export const attendance: AttendanceRecord[] = [];
export const suppliers: Supplier[] = [];
export const customers: Customer[] = [];
export const assets: Asset[] = [];
export const activities: Activity[] = [];
export const quotations: Quotation[] = [];
export const invoices: Invoice[] = [];
export const receipts: Receipt[] = [];

/** Revenue/expense series derived from live transactions. */
export const monthlyRevenueData: { month: string; revenue: number; expenses: number }[] = [];

/** Farm-type split derived from live branches. */
export const farmTypeDistribution: { name: string; value: number; color: string }[] = [];

export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'branches', 'users', 'inventory', 'livestock', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports', 'settings'],
  branch_manager: ['dashboard', 'users', 'inventory', 'livestock', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports'],
  field_staff: ['dashboard', 'attendance', 'livestock', 'activities'],
  accountant: ['dashboard', 'finance', 'reports', 'suppliers', 'customers'],
  inventory_staff: ['dashboard', 'inventory', 'livestock', 'suppliers', 'assets'],
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    branch_manager: 'Branch Manager',
    field_staff: 'Field Staff',
    accountant: 'Accountant',
    inventory_staff: 'Inventory Staff',
  };
  return labels[role];
};

export const getFarmTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    crops: '🌾',
    livestock: '🐄',
    dairy: '🥛',
    poultry: '🐔',
    aquaculture: '🐟',
    mixed: '🏡',
  };
  return icons[type] || '🌱';
};

// Helper function to get customer name
export const getCustomerName = (customerId: string): string => {
  return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
};

// Helper function to get branch name
export const getBranchName = (branchId: string): string => {
  return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
};
