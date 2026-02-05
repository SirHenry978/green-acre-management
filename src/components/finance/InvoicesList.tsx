import { useState } from 'react';
import { invoices as initialInvoices, customers, branches, Invoice, DocumentItem } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Receipt,
  Printer,
  CheckCircle,
  Mail,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

interface InvoicesListProps {
  onGenerateReceipt?: (invoice: Invoice) => void;
}

export const InvoicesList = ({ onGenerateReceipt }: InvoicesListProps) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<DocumentItem[]>([
    { id: 'new-1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const filteredInvoices = useBranchFilter(invoices);

  const searchedInvoices = filteredInvoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customers.find(c => c.id === inv.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const branchCustomers = customers.filter(c => 
    user?.role === 'super_admin' || c.branchId === user?.branchId
  );

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getCustomerEmail = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.email || '';
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const generateQRData = (invoice: Invoice) => {
    return JSON.stringify({
      type: 'invoice',
      number: invoice.invoiceNumber,
      total: invoice.total,
      customer: getCustomerName(invoice.customerId),
      date: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status
    });
  };

  const resetForm = () => {
    setFormCustomerId('');
    setFormDueDate('');
    setFormNotes('');
    setFormItems([{ id: 'new-1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setSendEmail(true);
  };

  const handleAddItem = () => {
    setFormItems([...formItems, { 
      id: `new-${Date.now()}`, 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      total: 0 
    }]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof DocumentItem, value: string | number) => {
    setFormItems(formItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = formItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      customerId: formCustomerId,
      branchId: user?.branchId || 'b1',
      items: formItems.filter(item => item.description.trim()),
      subtotal,
      tax,
      total,
      status: 'sent',
      dueDate: formDueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: formNotes || undefined
    };

    setInvoices([...invoices, newInvoice]);
    
    if (sendEmail) {
      const customerEmail = getCustomerEmail(formCustomerId);
      toast.success(`Invoice created and sent to ${customerEmail}`);
    } else {
      toast.success('Invoice created successfully');
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormCustomerId(invoice.customerId);
    setFormDueDate(invoice.dueDate);
    setFormNotes(invoice.notes || '');
    setFormItems(invoice.items);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) return;

    const { subtotal, tax, total } = calculateTotals();
    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      customerId: formCustomerId,
      items: formItems.filter(item => item.description.trim()),
      subtotal,
      tax,
      total,
      dueDate: formDueDate,
      notes: formNotes || undefined
    };

    setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    toast.success('Invoice updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoices(invoices.filter(inv => inv.id !== invoice.id));
    toast.success('Invoice deleted successfully');
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] } 
        : inv
    ));
    toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`);
  };

  const handleGenerateReceipt = (invoice: Invoice) => {
    if (onGenerateReceipt) {
      onGenerateReceipt(invoice);
    }
    toast.success(`Receipt generated for invoice ${invoice.invoiceNumber}`);
  };

  const handlePrintPDF = (invoice: Invoice) => {
    const qrDataUrl = document.getElementById(`qr-inv-${invoice.id}`)?.querySelector('svg');
    const qrSvgString = qrDataUrl ? new XMLSerializer().serializeToString(qrDataUrl) : '';
    const qrBase64 = qrSvgString ? `data:image/svg+xml;base64,${btoa(qrSvgString)}` : '';
    
    const printContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #16a34a; }
            .doc-title { font-size: 18px; margin-top: 10px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-block { }
            .info-label { font-weight: bold; color: #666; font-size: 12px; }
            .info-value { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #16a34a; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-paid { background: #dcfce7; color: #16a34a; }
            .status-overdue { background: #fee2e2; color: #dc2626; }
            .status-sent { background: #dbeafe; color: #2563eb; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-section img { width: 100px; height: 100px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🌾 FarmIQ</div>
            <div class="doc-title">INVOICE</div>
          </div>
          <div class="info-row">
            <div class="info-block">
              <div class="info-label">Invoice Number</div>
              <div class="info-value">${invoice.invoiceNumber}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(invoice.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Due Date</div>
              <div class="info-value">${new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-block">
              <div class="info-label">Customer</div>
              <div class="info-value">${getCustomerName(invoice.customerId)}</div>
              <div class="info-value" style="font-size: 12px; color: #666;">${getCustomerEmail(invoice.customerId)}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Branch</div>
              <div class="info-value">${getBranchName(invoice.branchId)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toLocaleString()}</td>
                  <td>$${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row">Subtotal: $${invoice.subtotal.toLocaleString()}</div>
            <div class="total-row">Tax (10%): $${invoice.tax.toLocaleString()}</div>
            <div class="total-row grand-total">Total: $${invoice.total.toLocaleString()}</div>
          </div>
          ${invoice.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
          <div class="qr-section">
            ${qrBase64 ? `<img src="${qrBase64}" alt="QR Code" />` : ''}
            <p style="font-size: 10px; color: #666;">Scan for verification</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>FarmIQ - Modern Farm Management</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderInvoiceForm = (isEdit: boolean) => {
    const { subtotal, tax, total } = calculateTotals();
    
    return (
      <form className="space-y-4 mt-4" onSubmit={isEdit ? handleUpdateInvoice : handleCreateInvoice}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer</label>
            <select 
              className="input-farm"
              value={formCustomerId}
              onChange={(e) => setFormCustomerId(e.target.value)}
              required
            >
              <option value="">Select customer</option>
              {branchCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input 
              type="date" 
              className="input-farm" 
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Items</label>
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>
            {formItems.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input 
                  className="input-farm col-span-5" 
                  placeholder="Item description" 
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                />
                <input 
                  type="number" 
                  className="input-farm col-span-2" 
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                />
                <input 
                  type="number" 
                  className="input-farm col-span-2" 
                  placeholder="0.00"
                  value={item.unitPrice || ''}
                  onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                />
                <div className="col-span-2 flex items-center font-medium">
                  ${item.total.toLocaleString()}
                </div>
                <button 
                  type="button" 
                  className="col-span-1 text-destructive hover:bg-destructive/10 rounded p-1"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddItem}>
              + Add Item
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea 
            className="input-farm" 
            rows={2} 
            placeholder="Additional notes..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </div>

        {!isEdit && (
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="sendEmailInv" 
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label htmlFor="sendEmailInv" className="text-sm flex items-center gap-2 cursor-pointer">
              <Mail className="h-4 w-4" />
              Send invoice PDF to customer email
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            onClick={() => {
              isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {isEdit ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Total</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                  <td className="font-medium">{invoice.invoiceNumber}</td>
                  <td>{getCustomerName(invoice.customerId)}</td>
                  <td className="text-muted-foreground">{getBranchName(invoice.branchId)}</td>
                  <td className="font-semibold">${invoice.total.toLocaleString()}</td>
                  <td className={cn(
                    "text-muted-foreground",
                    invoice.status === 'overdue' && "text-destructive font-medium"
                  )}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td>
                    <Badge className={cn("capitalize", statusColors[invoice.status])}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div id={`qr-inv-${invoice.id}`} className="hidden">
                      <QRCodeSVG value={generateQRData(invoice)} size={100} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handlePrintPDF(invoice)}
                        >
                          <Printer className="h-4 w-4" /> Print PDF
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleMarkAsPaid(invoice)}
                          >
                            <CheckCircle className="h-4 w-4" /> Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'paid' && (
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleGenerateReceipt(invoice)}
                          >
                            <Receipt className="h-4 w-4" /> Generate Receipt
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          {renderInvoiceForm(false)}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {renderInvoiceForm(true)}
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{getCustomerName(selectedInvoice.customerId)}</p>
                  <p className="text-xs text-muted-foreground">{getCustomerEmail(selectedInvoice.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn("capitalize", statusColors[selectedInvoice.status])}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className={cn(
                    "font-medium",
                    selectedInvoice.status === 'overdue' && "text-destructive"
                  )}>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Qty</th>
                      <th className="text-right p-3">Unit Price</th>
                      <th className="text-right p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map(item => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-3">{item.description}</td>
                        <td className="text-right p-3">{item.quantity}</td>
                        <td className="text-right p-3">${item.unitPrice.toLocaleString()}</td>
                        <td className="text-right p-3 font-medium">${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <QRCodeSVG value={generateQRData(selectedInvoice)} size={80} />
                  <p className="text-xs text-muted-foreground text-center mt-1">Scan to verify</p>
                </div>
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handlePrintPDF(selectedInvoice)}>
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
                {selectedInvoice.status !== 'paid' && (
                  <Button className="flex-1 gap-2" onClick={() => handleMarkAsPaid(selectedInvoice)}>
                    <CheckCircle className="h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
                {selectedInvoice.status === 'paid' && (
                  <Button className="flex-1 gap-2" onClick={() => handleGenerateReceipt(selectedInvoice)}>
                    <Receipt className="h-4 w-4" />
                    Generate Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
