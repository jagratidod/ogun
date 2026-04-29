import { useState, useEffect } from 'react';
import { RiFileTextLine, RiSearchLine, RiDownloadLine, RiPrinterLine, RiMailSendLine, RiEyeLine, RiLoader4Line, RiHandCoinLine, RiHistoryLine, RiCloseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/invoices');
      setInvoices(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (invoice) => {
      setSelectedInvoice(invoice);
      setPayAmount(invoice.totalAmount - invoice.amountPaid);
      setShowPayModal(true);
  };

  const openViewModal = async (invoice) => {
      try {
          toast.loading('Fetching details...');
          const res = await api.get(`/admin/accounts/invoices/${invoice._id}`);
          setSelectedInvoice(res.data.data);
          setShowViewModal(true);
          toast.dismiss();
      } catch (error) {
          toast.dismiss();
          toast.error('Failed to load details');
      }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return toast.error("Invalid amount");

    try {
        setSubmitting(true);
        await api.post(`/admin/accounts/invoices/${selectedInvoice._id}/payment`, {
            amount: parseFloat(payAmount),
            method: payMethod,
            note: 'System Entry'
        });
        toast.success('Payment recorded successfully');
        setShowPayModal(false);
        fetchInvoices();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
        setSubmitting(false);
    }
  };

  const handleExport = () => {
      const headers = ['Invoice #', 'Distributor', 'Date', 'Due Date', 'Total', 'Paid', 'Status'];
      const rows = filteredInvoices.map(inv => [
          inv.invoiceId,
          inv.buyer?.businessName || inv.buyer?.name,
          new Date(inv.createdAt).toLocaleDateString(),
          new Date(inv.dueDate).toLocaleDateString(),
          inv.totalAmount,
          inv.amountPaid,
          inv.status
      ]);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       inv.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       inv.buyer?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'invoiceId', label: 'Invoice #', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'buyer', label: 'Distributor', render: (val) => (
        <div className="flex flex-col">
            <span className="text-sm font-bold text-content-primary">{val?.businessName || val?.name || 'N/A'}</span>
            <span className="text-[10px] text-content-tertiary uppercase font-black">{val?.shopName || 'Partner'}</span>
        </div>
    )},
    { key: 'createdAt', label: 'Issue Date', render: (val) => (
       <span className="text-sm text-content-secondary">{new Date(val).toLocaleDateString()}</span>
    )},
    { key: 'dueDate', label: 'Due Date', render: (val) => {
        const isOverdue = new Date(val) < new Date() && statusFilter !== 'paid';
        return <span className={`text-sm ${isOverdue ? 'text-state-danger font-bold' : 'text-state-warning'}`}>{new Date(val).toLocaleDateString()}</span>
    }},
    { key: 'totalAmount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-bold text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'amountPaid', label: 'Paid', align: 'right', render: (val) => (
        <span className="text-sm text-state-success font-medium">{formatCurrency(val)}</span>
     )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val}>{val.toUpperCase()}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (val, row) => (
       <div className="flex justify-end gap-1">
          {row.status !== 'paid' && (
              <Button variant="ghost" size="sm" onClick={() => openPayModal(row)} icon={RiHandCoinLine} title="Record Payment">
                  Pay
              </Button>
          )}
          <Button variant="icon" onClick={() => openViewModal(row)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiPrinterLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  if (loading && !showPayModal && !showViewModal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Sales Invoices" 
        subtitle="Manage and track invoice status across all partners"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchInvoices}>Refresh</Button>
            <Button icon={RiDownloadLine} variant="primary" onClick={handleExport}>Export All</Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { label: 'All Statuses', value: 'all' },
                        { label: 'Paid Only', value: 'paid' },
                        { label: 'Pending/Partial', value: 'partial' },
                        { label: 'Unpaid Only', value: 'unpaid' }
                    ]} 
                    className="w-48" 
                 />
              </div>
              <div className="flex items-center gap-2">
                 <Input 
                    icon={RiSearchLine} 
                    placeholder="Search #, customer..." 
                    className="w-full md:w-64" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiPrinterLine} onClick={() => window.print()}>Batch Print</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredInvoices} />
      </Card>

      {/* RECORD PAYMENT MODAL */}
      {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-sm bg-surface-primary border border-border">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
                      <h3 className="font-bold">Record Payment: {selectedInvoice?.invoiceId}</h3>
                      <button onClick={() => setShowPayModal(false)}><RiCloseLine className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handlePaySubmit} className="p-5 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Payment Amount</label>
                          <input 
                            type="number" 
                            className="w-full h-11 bg-surface-input border border-border px-4 text-lg font-bold text-brand-teal outline-none focus:border-brand-teal"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            required
                          />
                          <p className="text-[10px] text-content-tertiary mt-1">Pending: {formatCurrency(selectedInvoice?.totalAmount - selectedInvoice?.amountPaid)}</p>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Method</label>
                          <select 
                             className="w-full h-10 bg-surface-input border border-border px-3 text-sm outline-none"
                             value={payMethod}
                             onChange={(e) => setPayMethod(e.target.value)}
                          >
                              <option value="bank_transfer">Bank Transfer / NEFT</option>
                              <option value="upi">UPI / Digital Wallet</option>
                              <option value="cash">Cash / Collection</option>
                          </select>
                      </div>
                      <div className="pt-2 flex gap-3">
                          <Button variant="secondary" className="flex-1" onClick={() => setShowPayModal(false)}>Cancel</Button>
                          <Button variant="primary" className="flex-1" type="submit" disabled={submitting}>
                              {submitting ? 'Updating...' : 'Submit Payment'}
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* VIEW INVOICE MODAL */}
      {showViewModal && selectedInvoice && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="w-full max-w-2xl bg-surface-primary border border-border">
               <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
                   <div className="flex items-center gap-2">
                        <Badge status={selectedInvoice.status}>{selectedInvoice.status.toUpperCase()}</Badge>
                        <h3 className="font-bold">Invoice Details: {selectedInvoice.invoiceId}</h3>
                   </div>
                   <button onClick={() => setShowViewModal(false)}><RiCloseLine className="w-6 h-6 text-content-tertiary" /></button>
               </div>
               <div className="p-6">
                   <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-border border-dashed">
                        <div>
                            <p className="text-[10px] font-bold text-content-tertiary uppercase mb-2">Billed To</p>
                            <h4 className="text-lg font-bold text-content-primary leading-tight">{selectedInvoice.buyer?.businessName}</h4>
                            <p className="text-sm text-content-secondary mt-1">{selectedInvoice.buyer?.name}</p>
                            <p className="text-sm text-content-secondary">{selectedInvoice.buyer?.phone}</p>
                            <p className="text-xs text-content-tertiary mt-1 italic">{selectedInvoice.buyer?.location}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-content-tertiary uppercase mb-2">Invoice Details</p>
                            <p className="text-sm text-content-secondary">Date: <span className="text-content-primary font-medium">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></p>
                            <p className="text-sm text-content-secondary">Due: <span className="text-content-primary font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span></p>
                            <p className="text-sm text-content-secondary">Order ID: <span className="text-brand-teal font-medium">#{selectedInvoice.order?.orderId}</span></p>
                        </div>
                   </div>

                   <table className="w-full mb-8">
                       <thead>
                           <tr className="text-left border-b border-border">
                               <th className="py-2 text-[10px] font-bold text-content-tertiary uppercase">Product Item</th>
                               <th className="py-2 text-[10px] font-bold text-content-tertiary uppercase text-center">Qty</th>
                               <th className="py-2 text-[10px] font-bold text-content-tertiary uppercase text-right">Price</th>
                               <th className="py-2 text-[10px] font-bold text-content-tertiary uppercase text-right">Total</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-border/50">
                           {selectedInvoice.items.map((item, idx) => (
                               <tr key={idx}>
                                   <td className="py-3">
                                       <p className="text-sm font-semibold text-content-primary">{item.product?.name || item.name}</p>
                                       <p className="text-[10px] text-content-tertiary">SKU: {item.product?.sku || 'N/A'}</p>
                                   </td>
                                   <td className="py-3 text-sm text-center font-medium">{item.quantity}</td>
                                   <td className="py-3 text-sm text-right text-content-secondary">{formatCurrency(item.price)}</td>
                                   <td className="py-3 text-sm text-right font-bold text-content-primary">{formatCurrency(item.lineTotal)}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>

                   <div className="flex justify-end pt-4">
                       <div className="w-64 space-y-2">
                           <div className="flex justify-between text-sm">
                               <span className="text-content-tertiary">Subtotal</span>
                               <span className="text-content-primary font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                               <span className="text-content-tertiary">GST (0%)</span>
                               <span className="text-content-primary font-medium">{formatCurrency(0)}</span>
                           </div>
                           <div className="flex justify-between border-t border-border pt-2">
                               <span className="font-bold text-content-primary">Total Amount</span>
                               <span className="font-bold text-brand-teal text-lg">{formatCurrency(selectedInvoice.totalAmount)}</span>
                           </div>
                           <div className="flex justify-between text-xs pt-1">
                               <span className="text-state-success font-bold">Total Paid</span>
                               <span className="text-state-success font-bold">{formatCurrency(selectedInvoice.amountPaid)}</span>
                           </div>
                       </div>
                   </div>

                   <div className="mt-8 flex gap-3">
                        <Button className="flex-1" variant="secondary" icon={RiPrinterLine} onClick={() => window.print()}>Print Invoice</Button>
                        <Button className="flex-1" variant="primary" icon={RiDownloadLine}>Download PDF</Button>
                   </div>
               </div>
           </div>
       </div>
      )}
    </div>
  );
}
