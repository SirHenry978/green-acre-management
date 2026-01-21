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
}

// Dummy Users
export const users: User[] = [
  { id: 'u1', name: 'John Greenfield', email: 'john@farmhub.com', role: 'super_admin', avatar: '', phone: '+1-555-0100' },
  { id: 'u2', name: 'Sarah Harvest', email: 'sarah@farmhub.com', role: 'branch_manager', branchId: 'b1', phone: '+1-555-0101' },
  { id: 'u3', name: 'Mike Fields', email: 'mike@farmhub.com', role: 'branch_manager', branchId: 'b2', phone: '+1-555-0102' },
  { id: 'u4', name: 'Emily Crops', email: 'emily@farmhub.com', role: 'field_staff', branchId: 'b1', phone: '+1-555-0103' },
  { id: 'u5', name: 'David Ranch', email: 'david@farmhub.com', role: 'field_staff', branchId: 'b2', phone: '+1-555-0104' },
  { id: 'u6', name: 'Lisa Accounts', email: 'lisa@farmhub.com', role: 'accountant', branchId: 'b1', phone: '+1-555-0105' },
  { id: 'u7', name: 'Tom Stock', email: 'tom@farmhub.com', role: 'inventory_staff', branchId: 'b1', phone: '+1-555-0106' },
  { id: 'u8', name: 'Anna Dairy', email: 'anna@farmhub.com', role: 'field_staff', branchId: 'b3', phone: '+1-555-0107' },
];

// Dummy Branches
export const branches: Branch[] = [
  { id: 'b1', name: 'Green Valley Farm', location: 'California, USA', managerId: 'u2', farmType: 'crops', size: '500 acres', status: 'active', totalStaff: 25, monthlyRevenue: 85000, monthlyExpenses: 45000 },
  { id: 'b2', name: 'Sunrise Ranch', location: 'Texas, USA', managerId: 'u3', farmType: 'livestock', size: '1200 acres', status: 'active', totalStaff: 35, monthlyRevenue: 120000, monthlyExpenses: 68000 },
  { id: 'b3', name: 'Mountain Dairy', location: 'Vermont, USA', managerId: 'u2', farmType: 'dairy', size: '300 acres', status: 'active', totalStaff: 18, monthlyRevenue: 65000, monthlyExpenses: 35000 },
  { id: 'b4', name: 'River Aqua Farm', location: 'Florida, USA', managerId: 'u3', farmType: 'aquaculture', size: '50 acres', status: 'active', totalStaff: 12, monthlyRevenue: 45000, monthlyExpenses: 22000 },
  { id: 'b5', name: 'Poultry Paradise', location: 'Georgia, USA', managerId: 'u2', farmType: 'poultry', size: '200 acres', status: 'inactive', totalStaff: 20, monthlyRevenue: 0, monthlyExpenses: 5000 },
];

// Dummy Inventory
export const inventory: InventoryItem[] = [
  { id: 'i1', name: 'Corn Seeds', category: 'seeds', quantity: 5000, unit: 'kg', minStock: 1000, branchId: 'b1', lastUpdated: '2024-01-10', value: 15000 },
  { id: 'i2', name: 'Wheat Seeds', category: 'seeds', quantity: 3500, unit: 'kg', minStock: 800, branchId: 'b1', lastUpdated: '2024-01-08', value: 10500 },
  { id: 'i3', name: 'NPK Fertilizer', category: 'fertilizers', quantity: 2000, unit: 'kg', minStock: 500, branchId: 'b1', lastUpdated: '2024-01-12', value: 8000 },
  { id: 'i4', name: 'Cattle Feed', category: 'feed', quantity: 10000, unit: 'kg', minStock: 2000, branchId: 'b2', lastUpdated: '2024-01-11', value: 25000 },
  { id: 'i5', name: 'Pesticide A', category: 'chemicals', quantity: 500, unit: 'liters', minStock: 100, branchId: 'b1', lastUpdated: '2024-01-09', value: 4500 },
  { id: 'i6', name: 'Dairy Cattle', category: 'livestock', quantity: 150, unit: 'heads', minStock: 100, branchId: 'b3', lastUpdated: '2024-01-12', value: 225000 },
  { id: 'i7', name: 'Tractor Parts', category: 'machinery', quantity: 25, unit: 'sets', minStock: 5, branchId: 'b1', lastUpdated: '2024-01-07', value: 12500 },
  { id: 'i8', name: 'Fish Feed', category: 'feed', quantity: 3000, unit: 'kg', minStock: 500, branchId: 'b4', lastUpdated: '2024-01-10', value: 9000 },
  { id: 'i9', name: 'Poultry Feed', category: 'feed', quantity: 8000, unit: 'kg', minStock: 1500, branchId: 'b5', lastUpdated: '2024-01-11', value: 16000 },
  { id: 'i10', name: 'Beef Cattle', category: 'livestock', quantity: 500, unit: 'heads', minStock: 300, branchId: 'b2', lastUpdated: '2024-01-12', value: 750000 },
];

// Dummy Transactions
export const transactions: Transaction[] = [
  { id: 't1', type: 'income', category: 'Crop Sales', amount: 25000, description: 'Corn harvest sale', date: '2024-01-10', branchId: 'b1' },
  { id: 't2', type: 'expense', category: 'Equipment', amount: 5000, description: 'Tractor maintenance', date: '2024-01-09', branchId: 'b1' },
  { id: 't3', type: 'income', category: 'Livestock Sales', amount: 45000, description: 'Cattle auction', date: '2024-01-11', branchId: 'b2' },
  { id: 't4', type: 'expense', category: 'Feed', amount: 8000, description: 'Monthly feed purchase', date: '2024-01-08', branchId: 'b2' },
  { id: 't5', type: 'income', category: 'Dairy Products', amount: 18000, description: 'Milk sales', date: '2024-01-12', branchId: 'b3' },
  { id: 't6', type: 'expense', category: 'Payroll', amount: 35000, description: 'Staff salaries', date: '2024-01-01', branchId: 'b1' },
  { id: 't7', type: 'income', category: 'Fish Sales', amount: 12000, description: 'Tilapia export', date: '2024-01-10', branchId: 'b4' },
  { id: 't8', type: 'expense', category: 'Utilities', amount: 2500, description: 'Electricity bill', date: '2024-01-05', branchId: 'b1' },
  { id: 't9', type: 'income', category: 'Egg Sales', amount: 8500, description: 'Weekly egg delivery', date: '2024-01-11', branchId: 'b5' },
  { id: 't10', type: 'expense', category: 'Seeds', amount: 12000, description: 'Spring planting seeds', date: '2024-01-07', branchId: 'b1' },
];

// Dummy Attendance
export const attendance: AttendanceRecord[] = [
  { id: 'a1', staffId: 'u4', staffName: 'Emily Crops', date: '2024-01-12', checkIn: '07:00', checkOut: '16:00', status: 'present', branchId: 'b1' },
  { id: 'a2', staffId: 'u5', staffName: 'David Ranch', date: '2024-01-12', checkIn: '06:30', checkOut: '15:30', status: 'present', branchId: 'b2' },
  { id: 'a3', staffId: 'u6', staffName: 'Lisa Accounts', date: '2024-01-12', checkIn: '09:00', checkOut: '17:00', status: 'present', branchId: 'b1' },
  { id: 'a4', staffId: 'u7', staffName: 'Tom Stock', date: '2024-01-12', checkIn: '08:30', checkOut: '17:30', status: 'late', branchId: 'b1' },
  { id: 'a5', staffId: 'u8', staffName: 'Anna Dairy', date: '2024-01-12', checkIn: '05:00', checkOut: '14:00', status: 'present', branchId: 'b3' },
  { id: 'a6', staffId: 'u4', staffName: 'Emily Crops', date: '2024-01-11', checkIn: '07:15', checkOut: '16:00', status: 'late', branchId: 'b1' },
  { id: 'a7', staffId: 'u5', staffName: 'David Ranch', date: '2024-01-11', checkIn: '', checkOut: '', status: 'absent', branchId: 'b2' },
  { id: 'a8', staffId: 'u6', staffName: 'Lisa Accounts', date: '2024-01-11', checkIn: '09:00', checkOut: '13:00', status: 'half-day', branchId: 'b1' },
];

// Dummy Suppliers
export const suppliers: Supplier[] = [
  { id: 's1', name: 'AgriSeeds Co.', contact: '+1-555-0101', email: 'sales@agriseeds.com', category: 'Seeds', totalOrders: 45, totalValue: 125000, status: 'active', branchId: 'b1' },
  { id: 's2', name: 'FarmFuel Inc.', contact: '+1-555-0102', email: 'orders@farmfuel.com', category: 'Fuel & Energy', totalOrders: 120, totalValue: 85000, status: 'active', branchId: 'b1' },
  { id: 's3', name: 'LivestockPro', contact: '+1-555-0103', email: 'info@livestockpro.com', category: 'Livestock', totalOrders: 28, totalValue: 450000, status: 'active', branchId: 'b2' },
  { id: 's4', name: 'NutriFeed Ltd.', contact: '+1-555-0104', email: 'supply@nutrifeed.com', category: 'Animal Feed', totalOrders: 200, totalValue: 180000, status: 'active', branchId: 'b2' },
  { id: 's5', name: 'AquaTech Systems', contact: '+1-555-0105', email: 'sales@aquatech.com', category: 'Aquaculture Equipment', totalOrders: 15, totalValue: 75000, status: 'active', branchId: 'b4' },
];

// Dummy Customers
export const customers: Customer[] = [
  { id: 'c1', name: 'FreshMart Grocery', contact: '+1-555-0201', email: 'procurement@freshmart.com', type: 'corporate', totalPurchases: 250000, outstandingBalance: 15000, branchId: 'b1' },
  { id: 'c2', name: 'Local Farmers Market', contact: '+1-555-0202', email: 'orders@localmarket.com', type: 'wholesale', totalPurchases: 85000, outstandingBalance: 5000, branchId: 'b1' },
  { id: 'c3', name: 'Ranch Supply Co.', contact: '+1-555-0203', email: 'buying@ranchsupply.com', type: 'wholesale', totalPurchases: 320000, outstandingBalance: 0, branchId: 'b2' },
  { id: 'c4', name: 'Dairy Delights', contact: '+1-555-0204', email: 'orders@dairydelights.com', type: 'corporate', totalPurchases: 180000, outstandingBalance: 8500, branchId: 'b3' },
  { id: 'c5', name: 'Seafood Express', contact: '+1-555-0205', email: 'purchase@seafoodexpress.com', type: 'wholesale', totalPurchases: 95000, outstandingBalance: 3200, branchId: 'b4' },
];

// Dummy Assets
export const assets: Asset[] = [
  { id: 'as1', name: 'John Deere Tractor 5075E', type: 'machinery', status: 'operational', value: 65000, purchaseDate: '2022-03-15', lastMaintenance: '2024-01-05', branchId: 'b1' },
  { id: 'as2', name: 'Irrigation System A', type: 'equipment', status: 'operational', value: 25000, purchaseDate: '2021-06-20', lastMaintenance: '2023-12-10', branchId: 'b1' },
  { id: 'as3', name: 'Ford F-350 Truck', type: 'vehicle', status: 'maintenance', value: 45000, purchaseDate: '2020-09-01', lastMaintenance: '2024-01-12', branchId: 'b2' },
  { id: 'as4', name: 'Main Barn', type: 'building', status: 'operational', value: 150000, purchaseDate: '2018-01-01', lastMaintenance: '2023-08-15', branchId: 'b2' },
  { id: 'as5', name: 'Holstein Dairy Herd', type: 'livestock', status: 'operational', value: 225000, purchaseDate: '2021-04-10', lastMaintenance: '2024-01-10', branchId: 'b3' },
  { id: 'as6', name: 'Combine Harvester', type: 'machinery', status: 'operational', value: 180000, purchaseDate: '2023-02-28', lastMaintenance: '2024-01-02', branchId: 'b1' },
  { id: 'as7', name: 'Fish Ponds (10 units)', type: 'building', status: 'operational', value: 80000, purchaseDate: '2022-07-15', lastMaintenance: '2023-11-20', branchId: 'b4' },
  { id: 'as8', name: 'Poultry Houses (5 units)', type: 'building', status: 'operational', value: 120000, purchaseDate: '2021-11-05', lastMaintenance: '2023-10-30', branchId: 'b5' },
];

// Dummy Activities
export const activities: Activity[] = [
  { id: 'act1', type: 'planting', description: 'Spring corn planting started in Field A', date: '2024-01-10', branchId: 'b1', staffId: 'u4' },
  { id: 'act2', type: 'feeding', description: 'Morning cattle feeding completed', date: '2024-01-12', branchId: 'b2', staffId: 'u5' },
  { id: 'act3', type: 'harvesting', description: 'Wheat harvest from Field B - 500 bushels', date: '2024-01-09', branchId: 'b1', staffId: 'u4' },
  { id: 'act4', type: 'treatment', description: 'Veterinary checkup for dairy herd', date: '2024-01-11', branchId: 'b3', staffId: 'u8' },
  { id: 'act5', type: 'maintenance', description: 'Tractor oil change and inspection', date: '2024-01-08', branchId: 'b1', staffId: 'u7' },
  { id: 'act6', type: 'sale', description: 'Sold 200 heads of cattle to Ranch Supply Co.', date: '2024-01-11', branchId: 'b2', staffId: 'u5' },
  { id: 'act7', type: 'purchase', description: 'Received 2000kg fish feed from NutriFeed', date: '2024-01-10', branchId: 'b4', staffId: 'u7' },
];

// Dummy Quotations
export const quotations: Quotation[] = [
  {
    id: 'q1',
    quotationNumber: 'QT-2024-001',
    customerId: 'c1',
    branchId: 'b1',
    items: [
      { id: 'qi1', description: 'Organic Corn (Premium)', quantity: 500, unitPrice: 50, total: 25000 },
      { id: 'qi2', description: 'Wheat Grain (Grade A)', quantity: 300, unitPrice: 45, total: 13500 },
    ],
    subtotal: 38500,
    tax: 3850,
    total: 42350,
    status: 'sent',
    validUntil: '2024-02-15',
    createdAt: '2024-01-10',
    notes: 'Bulk order discount applied',
  },
  {
    id: 'q2',
    quotationNumber: 'QT-2024-002',
    customerId: 'c3',
    branchId: 'b2',
    items: [
      { id: 'qi3', description: 'Beef Cattle (Prime)', quantity: 50, unitPrice: 1200, total: 60000 },
    ],
    subtotal: 60000,
    tax: 6000,
    total: 66000,
    status: 'accepted',
    validUntil: '2024-02-20',
    createdAt: '2024-01-08',
  },
  {
    id: 'q3',
    quotationNumber: 'QT-2024-003',
    customerId: 'c4',
    branchId: 'b3',
    items: [
      { id: 'qi4', description: 'Fresh Milk (1000L)', quantity: 1000, unitPrice: 3, total: 3000 },
      { id: 'qi5', description: 'Cream (500L)', quantity: 500, unitPrice: 8, total: 4000 },
    ],
    subtotal: 7000,
    tax: 700,
    total: 7700,
    status: 'draft',
    validUntil: '2024-02-10',
    createdAt: '2024-01-12',
  },
];

// Dummy Invoices
export const invoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'c3',
    branchId: 'b2',
    quotationId: 'q2',
    items: [
      { id: 'ii1', description: 'Beef Cattle (Prime)', quantity: 50, unitPrice: 1200, total: 60000 },
    ],
    subtotal: 60000,
    tax: 6000,
    total: 66000,
    status: 'paid',
    dueDate: '2024-02-08',
    createdAt: '2024-01-08',
    paidAt: '2024-01-15',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'c1',
    branchId: 'b1',
    items: [
      { id: 'ii2', description: 'Organic Corn (Premium)', quantity: 200, unitPrice: 50, total: 10000 },
    ],
    subtotal: 10000,
    tax: 1000,
    total: 11000,
    status: 'sent',
    dueDate: '2024-02-01',
    createdAt: '2024-01-05',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    customerId: 'c5',
    branchId: 'b4',
    items: [
      { id: 'ii3', description: 'Fresh Tilapia (500kg)', quantity: 500, unitPrice: 15, total: 7500 },
      { id: 'ii4', description: 'Catfish (300kg)', quantity: 300, unitPrice: 12, total: 3600 },
    ],
    subtotal: 11100,
    tax: 1110,
    total: 12210,
    status: 'overdue',
    dueDate: '2024-01-10',
    createdAt: '2024-01-01',
  },
];

// Dummy Receipts
export const receipts: Receipt[] = [
  {
    id: 'r1',
    receiptNumber: 'REC-2024-001',
    invoiceId: 'inv1',
    customerId: 'c3',
    branchId: 'b2',
    amount: 66000,
    paymentMethod: 'bank_transfer',
    createdAt: '2024-01-15',
    notes: 'Full payment received',
  },
  {
    id: 'r2',
    receiptNumber: 'REC-2024-002',
    invoiceId: 'inv2',
    customerId: 'c1',
    branchId: 'b1',
    amount: 5000,
    paymentMethod: 'check',
    createdAt: '2024-01-12',
    notes: 'Partial payment - 50%',
  },
];

// Monthly revenue data for charts
export const monthlyRevenueData = [
  { month: 'Jan', income: 285000, expenses: 175000 },
  { month: 'Feb', income: 310000, expenses: 185000 },
  { month: 'Mar', income: 295000, expenses: 168000 },
  { month: 'Apr', income: 340000, expenses: 195000 },
  { month: 'May', income: 380000, expenses: 210000 },
  { month: 'Jun', income: 420000, expenses: 225000 },
  { month: 'Jul', income: 395000, expenses: 198000 },
  { month: 'Aug', income: 450000, expenses: 235000 },
  { month: 'Sep', income: 410000, expenses: 215000 },
  { month: 'Oct', income: 365000, expenses: 188000 },
  { month: 'Nov', income: 320000, expenses: 175000 },
  { month: 'Dec', income: 350000, expenses: 192000 },
];

// Farm types distribution
export const farmTypeDistribution = [
  { name: 'Crops', value: 35, color: '#16a34a' },
  { name: 'Livestock', value: 28, color: '#ca8a04' },
  { name: 'Dairy', value: 18, color: '#0891b2' },
  { name: 'Poultry', value: 12, color: '#dc2626' },
  { name: 'Aquaculture', value: 7, color: '#7c3aed' },
];

// Role permissions mapping
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'branches', 'users', 'inventory', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports', 'settings'],
  branch_manager: ['dashboard', 'users', 'inventory', 'finance', 'attendance', 'suppliers', 'customers', 'assets', 'reports'],
  field_staff: ['dashboard', 'attendance', 'activities'],
  accountant: ['dashboard', 'finance', 'reports', 'suppliers', 'customers'],
  inventory_staff: ['dashboard', 'inventory', 'suppliers', 'assets'],
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
