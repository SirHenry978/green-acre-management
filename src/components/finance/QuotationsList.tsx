import { useState } from 'react';
import { quotations as initialQuotations, customers, branches, Quotation, DocumentItem } from '@/data/dummyData';
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
  ArrowRightLeft,
  Printer,
  Mail,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  converted: 'bg-accent/20 text-accent-foreground',
};

interface QuotationsListProps {
  onConvertToInvoice?: (quotation: Quotation) => void;
}

export const QuotationsList = ({ onConvertToInvoice }: QuotationsListProps) => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  
  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<DocumentItem[]>([
    { id: 'new-1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const filteredQuotations = useBranchFilter(quotations);

  const searchedQuotations = filteredQuotations.filter(q =>
    q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customers.find(c => c.id === q.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const generateQRData = (quotation: Quotation) => {
    return JSON.stringify({
      type: 'quotation',
      number: quotation.quotationNumber,
      total: quotation.total,
      customer: getCustomerName(quotation.customerId),
      date: quotation.createdAt
    });
  };

  const resetForm = () => {
    setFormCustomerId('');
    setFormValidUntil('');
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

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formCustomerId) {
      toast.error('Please select a customer');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const newQuotation: Quotation = {
      id: `q${Date.now()}`,
      quotationNumber: `QT-2024-${String(quotations.length + 1).padStart(3, '0')}`,
      customerId: formCustomerId,
      branchId: user?.branchId || 'b1',
      items: formItems.filter(item => item.description.trim()),
      subtotal,
      tax,
      total,
      status: 'draft',
      validUntil: formValidUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: formNotes || undefined
    };

    setQuotations([...quotations, newQuotation]);
    
    if (sendEmail) {
      const customerEmail = getCustomerEmail(formCustomerId);
      toast.success(`Quotation created and sent to ${customerEmail}`);
    } else {
      toast.success('Quotation created successfully');
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setFormCustomerId(quotation.customerId);
    setFormValidUntil(quotation.validUntil);
    setFormNotes(quotation.notes || '');
    setFormItems(quotation.items);
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuotation) return;

    const { subtotal, tax, total } = calculateTotals();
    const updatedQuotation: Quotation = {
      ...selectedQuotation,
      customerId: formCustomerId,
      items: formItems.filter(item => item.description.trim()),
      subtotal,
      tax,
      total,
      validUntil: formValidUntil,
      notes: formNotes || undefined
    };

    setQuotations(quotations.map(q => q.id === selectedQuotation.id ? updatedQuotation : q));
    toast.success('Quotation updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteQuotation = (quotation: Quotation) => {
    setQuotations(quotations.filter(q => q.id !== quotation.id));
    toast.success('Quotation deleted successfully');
  };

  const handleConvertToInvoice = (quotation: Quotation) => {
    setQuotations(quotations.map(q => 
      q.id === quotation.id ? { ...q, status: 'converted' as const } : q
    ));
    if (onConvertToInvoice) {
      onConvertToInvoice(quotation);
    }
    toast.success(`Quotation ${quotation.quotationNumber} converted to invoice`);
  };

  const handlePrintPDF = (quotation: Quotation) => {
    const qrDataUrl = document.getElementById(`qr-${quotation.id}`)?.querySelector('svg');
    const qrSvgString = qrDataUrl ? new XMLSerializer().serializeToString(qrDataUrl) : '';
    const qrBase64 = qrSvgString ? `data:image/svg+xml;base64,${btoa(qrSvgString)}` : '';
    
    const printContent = `
      <html>
        <head>
          <title>Quotation ${quotation.quotationNumber}</title>
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
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-section img { width: 100px; height: 100px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🌾 FarmIQ</div>
            <div class="doc-title">QUOTATION</div>
          </div>
          <div class="info-row">
            <div class="info-block">
              <div class="info-label">Quotation Number</div>
              <div class="info-value">${quotation.quotationNumber}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(quotation.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Valid Until</div>
              <div class="info-value">${new Date(quotation.validUntil).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-block">
              <div class="info-label">Customer</div>
              <div class="info-value">${getCustomerName(quotation.customerId)}</div>
            </div>
            <div class="info-block">
              <div class="info-label">Branch</div>
              <div class="info-value">${getBranchName(quotation.branchId)}</div>
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
              ${quotation.items.map(item => `
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
            <div class="total-row">Subtotal: $${quotation.subtotal.toLocaleString()}</div>
            <div class="total-row">Tax (10%): $${quotation.tax.toLocaleString()}</div>
            <div class="total-row grand-total">Total: $${quotation.total.toLocaleString()}</div>
          </div>
          ${quotation.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong> ${quotation.notes}</div>` : ''}
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

  const renderQuotationForm = (isEdit: boolean) => {
    const { subtotal, tax, total } = calculateTotals();
    
    return (
      <form className="space-y-4 mt-4" onSubmit={isEdit ? handleUpdateQuotation : handleCreateQuotation}>
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
            <label className="block text-sm font-medium mb-2">Valid Until</label>
            <input 
              type="date" 
              className="input-farm" 
              value={formValidUntil}
              onChange={(e) => setFormValidUntil(e.target.value)}
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
              id="sendEmail" 
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label htmlFor="sendEmail" className="text-sm flex items-center gap-2 cursor-pointer">
              <Mail className="h-4 w-4" />
              Send quotation PDF to customer email
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
            {isEdit ? 'Update Quotation' : 'Create Quotation'}
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
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-farm pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Quotation
        </Button>
      </div>

      {/* Quotations Table */}
      <div className="card-farm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-farm">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Total</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-muted/30 transition-colors">
                  <td className="font-medium">{quotation.quotationNumber}</td>
                  <td>{getCustomerName(quotation.customerId)}</td>
                  <td className="text-muted-foreground">{getBranchName(quotation.branchId)}</td>
                  <td className="font-semibold">${quotation.total.toLocaleString()}</td>
                  <td className="text-muted-foreground">
                    {new Date(quotation.validUntil).toLocaleDateString()}
                  </td>
                  <td>
                    <Badge className={cn("capitalize", statusColors[quotation.status])}>
                      {quotation.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div id={`qr-${quotation.id}`} className="hidden">
                      <QRCodeSVG value={generateQRData(quotation)} size={100} />
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
                            setSelectedQuotation(quotation);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        {quotation.status !== 'converted' && (
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleEditQuotation(quotation)}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handlePrintPDF(quotation)}
                        >
                          <Printer className="h-4 w-4" /> Print PDF
                        </DropdownMenuItem>
                        {quotation.status === 'accepted' && (
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => handleConvertToInvoice(quotation)}
                          >
                            <ArrowRightLeft className="h-4 w-4" /> Convert to Invoice
                          </DropdownMenuItem>
                        )}
                        {quotation.status !== 'converted' && (
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => handleDeleteQuotation(quotation)}
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

      {/* Add Quotation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          {renderQuotationForm(false)}
        </DialogContent>
      </Dialog>

      {/* Edit Quotation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
          </DialogHeader>
          {renderQuotationForm(true)}
        </DialogContent>
      </Dialog>

      {/* View Quotation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedQuotation?.quotationNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{getCustomerName(selectedQuotation.customerId)}</p>
                  <p className="text-xs text-muted-foreground">{getCustomerEmail(selectedQuotation.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn("capitalize", statusColors[selectedQuotation.status])}>
                    {selectedQuotation.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
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
                    {selectedQuotation.items.map(item => (
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
                  <QRCodeSVG value={generateQRData(selectedQuotation)} size={80} />
                  <p className="text-xs text-muted-foreground text-center mt-1">Scan to verify</p>
                </div>
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedQuotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${selectedQuotation.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${selectedQuotation.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedQuotation.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handlePrintPDF(selectedQuotation)}>
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
                {selectedQuotation.status === 'accepted' && (
                  <Button className="flex-1 gap-2" onClick={() => handleConvertToInvoice(selectedQuotation)}>
                    <ArrowRightLeft className="h-4 w-4" />
                    Convert to Invoice
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
