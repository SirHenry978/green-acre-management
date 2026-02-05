import { useState, useEffect } from 'react';
import { receipts as initialReceipts, invoices as allInvoices, customers, branches, Receipt, Invoice } from '@/data/dummyData';
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
  Eye,
  FileText,
  Printer,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  Building,
  FileCheck,
  Edit,
  Mail,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

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
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formInvoiceId, setFormInvoiceId] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState<Receipt['paymentMethod']>('cash');
  const [formNotes, setFormNotes] = useState('');

  const filteredReceipts = useBranchFilter(receipts);

  const searchedReceipts = filteredReceipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customers.find(c => c.id === r.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get customers for the branch
  const branchCustomers = customers.filter(c => 
    user?.role === 'super_admin' || c.branchId === user?.branchId
  );

  // Get paid invoices for selected customer
  const getCustomerInvoices = (customerId: string): Invoice[] => {
    if (!customerId) return [];
    return allInvoices.filter(inv => 
      inv.customerId === customerId && 
      inv.status === 'paid' &&
      (user?.role === 'super_admin' || inv.branchId === user?.branchId)
    );
  };

  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (formCustomerId) {
      const invoices = getCustomerInvoices(formCustomerId);
      setCustomerInvoices(invoices);
      // Reset invoice selection if customer changes
      setFormInvoiceId('');
      setFormAmount(0);
    } else {
      setCustomerInvoices([]);
    }
  }, [formCustomerId]);

  useEffect(() => {
    if (formInvoiceId) {
      const invoice = allInvoices.find(inv => inv.id === formInvoiceId);
      if (invoice) {
        setFormAmount(invoice.total);
      }
    }
  }, [formInvoiceId]);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getCustomerEmail = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.email || '';
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown';
  };

  const getInvoiceNumber = (invoiceId: string) => {
    return allInvoices.find(i => i.id === invoiceId)?.invoiceNumber || 'Unknown';
  };

  const generateQRData = (receipt: Receipt) => {
    return JSON.stringify({
      type: 'receipt',
      number: receipt.receiptNumber,
      amount: receipt.amount,
      customer: getCustomerName(receipt.customerId),
      invoice: getInvoiceNumber(receipt.invoiceId),
      date: receipt.createdAt,
      paymentMethod: paymentMethodLabels[receipt.paymentMethod]
    });
  };

  const resetForm = () => {
    setFormCustomerId('');
    setFormInvoiceId('');
    setFormAmount(0);
    setFormPaymentMethod('cash');
    setFormNotes('');
    setSendEmail(true);
    setCustomerInvoices([]);
  };

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    if (!formInvoiceId) {
      toast.error('Please select an invoice');
      return;
    }

    const newReceipt: Receipt = {
      id: `r${Date.now()}`,
      receiptNumber: `REC-2024-${String(receipts.length + 1).padStart(3, '0')}`,
      invoiceId: formInvoiceId,
      customerId: formCustomerId,
      branchId: user?.branchId || 'b1',
      amount: formAmount,
      paymentMethod: formPaymentMethod,
      createdAt: new Date().toISOString().split('T')[0],
      notes: formNotes || undefined,
      isPrinted: false
    };

    setReceipts([...receipts, newReceipt]);
    
    if (sendEmail) {
      const customerEmail = getCustomerEmail(formCustomerId);
      toast.success(`Receipt created and sent to ${customerEmail}`);
    } else {
      toast.success('Receipt created successfully');
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditReceipt = (receipt: Receipt) => {
    if (receipt.isPrinted) {
      toast.error('Cannot edit a printed receipt');
      return;
    }
    setSelectedReceipt(receipt);
    setFormCustomerId(receipt.customerId);
    setFormInvoiceId(receipt.invoiceId);
    setFormAmount(receipt.amount);
    setFormPaymentMethod(receipt.paymentMethod);
    setFormNotes(receipt.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReceipt) return;

    if (selectedReceipt.isPrinted) {
      toast.error('Cannot edit a printed receipt');
      return;
    }

    const updatedReceipt: Receipt = {
      ...selectedReceipt,
      customerId: formCustomerId,
      invoiceId: formInvoiceId,
      amount: formAmount,
      paymentMethod: formPaymentMethod,
      notes: formNotes || undefined
    };

    setReceipts(receipts.map(r => r.id === selectedReceipt.id ? updatedReceipt : r));
    toast.success('Receipt updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handlePrintReceipt = (receipt: Receipt) => {
    // Mark as printed first
    setReceipts(receipts.map(r => 
      r.id === receipt.id ? { ...r, isPrinted: true } : r
    ));

    const qrDataUrl = document.getElementById(`qr-rec-${receipt.id}`)?.querySelector('svg');
    const qrSvgString = qrDataUrl ? new XMLSerializer().serializeToString(qrDataUrl) : '';
    const qrBase64 = qrSvgString ? `data:image/svg+xml;base64,${btoa(qrSvgString)}` : '';

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
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-section img { width: 80px; height: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🌾 FarmIQ</div>
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
            <span class="info-label">Email:</span>
            <span>${getCustomerEmail(receipt.customerId)}</span>
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
          
          <div class="qr-section">
            ${qrBase64 ? `<img src="${qrBase64}" alt="QR Code" />` : ''}
            <p style="font-size: 10px; color: #666;">Scan for verification</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>FarmIQ - Modern Farm Management</p>
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

    toast.success('Receipt printed - editing is now locked');
  };

  const renderReceiptForm = (isEdit: boolean) => {
    return (
      <form className="space-y-4 mt-4" onSubmit={isEdit ? handleUpdateReceipt : handleCreateReceipt}>
        <div>
          <label className="block text-sm font-medium mb-2">Customer Account</label>
          <select 
            className="input-farm"
            value={formCustomerId}
            onChange={(e) => setFormCustomerId(e.target.value)}
            required
            disabled={isEdit}
          >
            <option value="">Select customer</option>
            {branchCustomers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Invoice to Pay</label>
          {formCustomerId && customerInvoices.length === 0 ? (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              No paid invoices found for this customer
            </div>
          ) : (
            <select 
              className="input-farm"
              value={formInvoiceId}
              onChange={(e) => setFormInvoiceId(e.target.value)}
              required
              disabled={!formCustomerId || isEdit}
            >
              <option value="">Select invoice</option>
              {customerInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - ${inv.total.toLocaleString()}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input 
              type="number" 
              className="input-farm" 
              placeholder="0.00" 
              value={formAmount || ''}
              onChange={(e) => setFormAmount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select 
              className="input-farm"
              value={formPaymentMethod}
              onChange={(e) => setFormPaymentMethod(e.target.value as Receipt['paymentMethod'])}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea 
            className="input-farm" 
            rows={2} 
            placeholder="Payment notes..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
        </div>

        {!isEdit && (
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="sendEmailRec" 
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label htmlFor="sendEmailRec" className="text-sm flex items-center gap-2 cursor-pointer">
              <Mail className="h-4 w-4" />
              Send receipt PDF to customer email
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
            {isEdit ? 'Update Receipt' : 'Create Receipt'}
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
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedReceipts.map((receipt) => {
                const PaymentIcon = paymentMethodIcons[receipt.paymentMethod];
                return (
                  <tr key={receipt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="font-medium">{receipt.receiptNumber}</td>
                    <td>
                      <div>
                        <div>{getCustomerName(receipt.customerId)}</div>
                        <div className="text-xs text-muted-foreground">{getCustomerEmail(receipt.customerId)}</div>
                      </div>
                    </td>
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
                    <td>
                      {receipt.isPrinted ? (
                        <Badge className="bg-muted text-muted-foreground gap-1">
                          <Lock className="h-3 w-3" />
                          Printed
                        </Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary">
                          Editable
                        </Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <div id={`qr-rec-${receipt.id}`} className="hidden">
                        <QRCodeSVG value={generateQRData(receipt)} size={100} />
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
                              setSelectedReceipt(receipt);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" /> View
                          </DropdownMenuItem>
                          {!receipt.isPrinted && (
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleEditReceipt(receipt)}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          )}
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
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Receipt</DialogTitle>
          </DialogHeader>
          {renderReceiptForm(false)}
        </DialogContent>
      </Dialog>

      {/* Edit Receipt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
          </DialogHeader>
          {renderReceiptForm(true)}
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptIcon className="h-5 w-5" />
              {selectedReceipt?.receiptNumber}
              {selectedReceipt?.isPrinted && (
                <Badge variant="secondary" className="gap-1 ml-2">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
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
                  <div className="text-right">
                    <span className="font-medium">{getCustomerName(selectedReceipt.customerId)}</span>
                    <p className="text-xs text-muted-foreground">{getCustomerEmail(selectedReceipt.customerId)}</p>
                  </div>
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

              <div className="flex justify-center p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <QRCodeSVG value={generateQRData(selectedReceipt)} size={80} />
                  <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
                </div>
              </div>

              <div className="flex gap-3">
                {!selectedReceipt.isPrinted && (
                  <Button 
                    variant="outline"
                    className="flex-1 gap-2" 
                    onClick={() => {
                      handleEditReceipt(selectedReceipt);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button 
                  className={cn("gap-2", selectedReceipt.isPrinted ? "w-full" : "flex-1")}
                  onClick={() => handlePrintReceipt(selectedReceipt)}
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
              </div>

              {!selectedReceipt.isPrinted && (
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ After printing, this receipt will be locked and cannot be edited
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
