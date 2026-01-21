import { useState } from 'react';
import { receipts, invoices, customers, branches, Receipt } from '@/data/dummyData';
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
  Eye,
  FileText,
  Printer,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  Building,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const paymentMethodIcons: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  bank_transfer: Building,
  check: FileCheck,
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  check: 'Check',
};

export const ReceiptsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredReceipts = useBranchFilter(receipts);

  const searchedReceipts = filteredReceipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customers.find(c => c.id === r.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices.find(i => i.id === invoiceId)?.invoiceNumber || 'Unknown';
  };

  const handlePrintReceipt = (receipt: Receipt) => {
    const printContent = `
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ddd; padding-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: bold; color: #16a34a; }
            .doc-title { font-size: 16px; margin-top: 8px; }
            .receipt-number { font-size: 12px; color: #666; margin-top: 4px; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .info-label { color: #666; }
            .amount-section { text-align: center; margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .amount-label { font-size: 12px; color: #666; }
            .amount-value { font-size: 32px; font-weight: bold; color: #16a34a; }
            .footer { margin-top: 30px; text-align: center; border-top: 2px dashed #ddd; padding-top: 20px; }
            .footer p { font-size: 12px; color: #666; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🌾 FarmHub</div>
            <div class="doc-title">PAYMENT RECEIPT</div>
            <div class="receipt-number">${receipt.receiptNumber}</div>
          </div>
          
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date(receipt.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer:</span>
            <span>${getCustomerName(receipt.customerId)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Invoice:</span>
            <span>${getInvoiceNumber(receipt.invoiceId)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>${paymentMethodLabels[receipt.paymentMethod]}</span>
          </div>
          
          <div class="amount-section">
            <div class="amount-label">AMOUNT RECEIVED</div>
            <div class="amount-value">$${receipt.amount.toLocaleString()}</div>
          </div>
          
          ${receipt.notes ? `<div class="info-row"><span class="info-label">Notes:</span><span>${receipt.notes}</span></div>` : ''}
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>FarmHub - Modern Farm Management</p>
            <p>${getBranchName(receipt.branchId)}</p>
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

  const paidInvoices = invoices.filter(i => i.status === 'paid');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedReceipts.map((receipt) => {
                const PaymentIcon = paymentMethodIcons[receipt.paymentMethod];
                return (
                  <tr key={receipt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="font-medium">{receipt.receiptNumber}</td>
                    <td>{getCustomerName(receipt.customerId)}</td>
                    <td className="text-muted-foreground">{getInvoiceNumber(receipt.invoiceId)}</td>
                    <td className="font-semibold text-success">${receipt.amount.toLocaleString()}</td>
                    <td>
                      <Badge variant="secondary" className="gap-1">
                        <PaymentIcon className="h-3 w-3" />
                        {paymentMethodLabels[receipt.paymentMethod]}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground">
                      {new Date(receipt.createdAt).toLocaleDateString()}
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
                              setSelectedReceipt(receipt);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handlePrintReceipt(receipt)}
                          >
                            <Printer className="h-4 w-4" /> Print Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Receipt Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Receipt</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invoice</label>
              <select className="input-farm">
                <option value="">Select paid invoice</option>
                {paidInvoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {getCustomerName(inv.customerId)} (${inv.total.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input type="number" className="input-farm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="input-farm">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea className="input-farm" rows={2} placeholder="Payment notes..." />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Receipt
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptIcon className="h-5 w-5" />
              {selectedReceipt?.receiptNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 mt-4">
              <div className="text-center p-6 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount Received</p>
                <p className="text-4xl font-bold text-success">${selectedReceipt.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{getCustomerName(selectedReceipt.customerId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-medium">{getInvoiceNumber(selectedReceipt.invoiceId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="secondary" className="gap-1">
                    {(() => {
                      const Icon = paymentMethodIcons[selectedReceipt.paymentMethod];
                      return <Icon className="h-3 w-3" />;
                    })()}
                    {paymentMethodLabels[selectedReceipt.paymentMethod]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-medium">{getBranchName(selectedReceipt.branchId)}</span>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedReceipt.notes}</p>
                </div>
              )}

              <Button 
                className="w-full gap-2" 
                onClick={() => handlePrintReceipt(selectedReceipt)}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
