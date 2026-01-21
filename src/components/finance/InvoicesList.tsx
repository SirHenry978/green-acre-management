import { useState } from 'react';
import { invoices, customers, branches, Invoice } from '@/data/dummyData';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export const InvoicesList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredInvoices = useBranchFilter(invoices);

  const searchedInvoices = filteredInvoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customers.find(c => c.id === inv.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`);
  };

  const handleGenerateReceipt = (invoice: Invoice) => {
    toast.success(`Receipt generated for invoice ${invoice.invoiceNumber}`);
  };

  const handlePrintPDF = (invoice: Invoice) => {
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🌾 FarmHub</div>
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
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>FarmHub - Modern Farm Management</p>
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
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
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
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer</label>
                <select className="input-farm">
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input type="date" className="input-farm" />
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
                <div className="grid grid-cols-12 gap-2">
                  <input className="input-farm col-span-5" placeholder="Item description" />
                  <input type="number" className="input-farm col-span-2" placeholder="1" />
                  <input type="number" className="input-farm col-span-2" placeholder="0.00" />
                  <div className="col-span-2 flex items-center font-medium">$0.00</div>
                  <button type="button" className="col-span-1 text-destructive">×</button>
                </div>
                <Button type="button" variant="outline" size="sm" className="w-full">
                  + Add Item
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea className="input-farm" rows={2} placeholder="Additional notes..." />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Invoice
              </Button>
            </div>
          </form>
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

              <div className="flex justify-end">
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
                {selectedInvoice.status !== 'paid' ? (
                  <Button className="flex-1 gap-2" onClick={() => handleMarkAsPaid(selectedInvoice)}>
                    <CheckCircle className="h-4 w-4" />
                    Mark as Paid
                  </Button>
                ) : (
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
