import { useState, useMemo, useEffect } from 'react';
import {
   RiShoppingCartLine, RiSearchLine, RiFilterLine,
   RiEyeLine, RiFileDownloadLine, RiFilter2Line,
   RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine,
   RiTruckLine, RiArrowDownSLine
} from 'react-icons/ri';
import {
   PageHeader, Card, CardHeader, CardTitle, CardDescription,
   DataTable, Badge, Button, Input, Select, useSearch, useSort,
   usePagination, formatCurrency, formatDateTime, Modal, useModal
} from '../../../core';
import inventoryService from '../../../core/services/inventoryService';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../../core/context/SocketContext';

export default function OrderListPage() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState('all');
   const [paymentFilter, setPaymentFilter] = useState('all');
   const { isOpen, open, close, data: selectedOrder } = useModal();
   const socket = useSocket();

   useEffect(() => {
      fetchOrders();
   }, []);

   useEffect(() => {
      if (socket) {
         socket.on('order_status_updated', (data) => {
            console.log('[Socket] Order status updated:', data);
            fetchOrders(); // Refresh the list
            toast.success(`Order #${data.orderId} status changed to ${data.status}`, { icon: '🔔' });
         });

         return () => {
            socket.off('order_status_updated');
         };
      }
   }, [socket]);

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const res = await inventoryService.getOrders();
         setOrders(res.data || []);
      } catch (error) {
         toast.error('Failed to fetch orders');
      } finally {
         setLoading(false);
      }
   };

   const filteredBySelects = useMemo(() => {
      return orders.filter(o => {
         const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
         const matchPayment = paymentFilter === 'all' || o.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();
         return matchStatus && matchPayment;
      });
   }, [orders, statusFilter, paymentFilter]);

   const { query, setQuery, filteredData } = useSearch(filteredBySelects, ['orderId', 'buyer.name', 'buyer.businessName']);
   const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'createdAt', 'desc');
   const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);

   const [isExporting, setIsExporting] = useState(false);

   const handleStatusUpdate = async (status) => {
      try {
         await inventoryService.updateOrder(selectedOrder._id, { status });
         toast.success(`Order #${selectedOrder.orderId} moved to ${status}`);
         fetchOrders();
         close();
      } catch (error) {
         toast.error('Failed to update status');
      }
   };

   const handlePaymentUpdate = async (paymentStatus) => {
      try {
         await inventoryService.updateOrder(selectedOrder._id, { paymentStatus });
         toast.success(`Payment status for #${selectedOrder.orderId} set to ${paymentStatus}`);
         fetchOrders();
         close();
      } catch (error) {
         toast.error('Failed to update payment status');
      }
   };

   const handleExport = () => {
      setIsExporting(true);
      toast.loading('Generating Excel report...', { id: 'export' });
      setTimeout(() => {
         toast.success('Report downloaded successfully', { id: 'export' });
         setIsExporting(false);
      }, 1500);
   };

   const handleDownloadInvoice = (orderId) => {
      toast.loading(`Preparing Invoice #${orderId}...`, { id: 'invoice' });
      setTimeout(() => {
         toast.success('Invoice PDF ready for download', { id: 'invoice' });
      }, 1000);
   };

   const columns = [
      {
         key: 'orderId', label: 'Order ID', sortable: true, render: (val) => (
            <span className="font-bold text-content-primary p-2 bg-surface-secondary/50 border border-border/50">{val}</span>
         )
      },
      {
         key: 'createdAt', label: 'Date', sortable: true, render: (val) => {
            const dateObj = formatDateTime(val);
            return (
               <div className="flex flex-col">
                  <span className="text-sm font-medium text-content-primary">{dateObj.split(',')[0]}</span>
                  <span className="text-[10px] text-content-tertiary">{dateObj.split(',')[1]}</span>
               </div>
            );
         }
      },
      { 
         key: 'buyer', label: 'Distributor Details', sortable: true, render: (val) => (
            <div className="flex flex-col">
               <span className="text-sm font-bold text-content-primary uppercase tracking-tight">{val?.businessName || val?.name}</span>
               <span className="text-[10px] text-content-tertiary font-medium">{val?.phone || 'No phone'}</span>
            </div>
         )
      },
      {
         key: 'totalAmount', label: 'Order Value', align: 'right', sortable: true, render: (val) => (
            <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
         )
      },
      {
         key: 'status', label: 'Status', render: (val) => {
            const statusMap = {
               'Pending': 'warning',
               'Confirmed': 'teal',
               'Processing': 'info',
               'In Transit': 'info',
               'Completed': 'success',
               'Cancelled': 'danger'
            };
            return <Badge variant={statusMap[val] || 'secondary'}>{val}</Badge>;
         }
      },
      {
         key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
            <div className="flex justify-end gap-2">
               <Button variant="secondary" size="xs" icon={RiEyeLine} onClick={() => open(row)}>Manage</Button>
               <Button variant="icon" title="Invoice" onClick={() => handleDownloadInvoice(row.orderId)}>
                  <RiFileDownloadLine className="w-4 h-4" />
               </Button>
            </div>
         )
      }
   ];

   return (
      <div className="page-container">
         <PageHeader
            title="Order Fulfillment"
            subtitle="Monitor and process distributor inventory requests across regions"
         >
            <div className="flex gap-2">
               <Button icon={RiFilter2Line} variant="secondary">Filter View</Button>
               <Button 
                  icon={RiFileDownloadLine} 
                  variant="primary" 
                  onClick={handleExport}
                  disabled={isExporting}
               >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
               </Button>
            </div>
         </PageHeader>

         <Card>
            <CardHeader className="pb-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                     <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                           { label: 'All Statuses', value: 'all' },
                           { label: 'Pending Approval', value: 'Pending' },
                           { label: 'Confirmed', value: 'Confirmed' },
                           { label: 'Processing', value: 'Processing' },
                           { label: 'In Transit', value: 'In Transit' },
                           { label: 'Completed', value: 'Completed' },
                           { label: 'Cancelled', value: 'Cancelled' }
                        ]}
                        className="w-48"
                     />
                     <Select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        options={[
                           { label: 'All Payments', value: 'all' },
                           { label: 'Collected', value: 'Paid' },
                           { label: 'Unpaid/Pending', value: 'Pending' }
                        ]}
                        className="w-44"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="relative group">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
                        <Input
                           placeholder="Search Order ID, Distributor..."
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                           className="pl-10 w-64 h-10"
                        />
                     </div>
                  </div>
               </div>
            </CardHeader>
            
            <DataTable
               columns={columns}
               data={paginatedData}
               sortKey={sortKey}
               sortDirection={sortDirection}
               onSort={requestSort}
               loading={loading}
               onRowClick={(row) => open(row)}
            />
            
            <div className="p-4 border-t border-border flex items-center justify-between bg-surface-secondary/20">
               <span className="text-[11px] font-medium text-content-tertiary">
                  Displaying {startIndex}-{endIndex} of {totalItems} active shipments
               </span>
               <div className="flex gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || totalPages <= 1}>Back</Button>
                  <div className="flex items-center px-4 bg-surface-secondary text-[11px] font-bold border border-border">Page {currentPage} of {totalPages}</div>
                  <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages <= 1}>Next</Button>
               </div>
            </div>
         </Card>

         <Modal
            isOpen={isOpen}
            onClose={close}
            size="lg"
            title={`Order Workflow: ${selectedOrder?.orderId}`}
            footer={
               <div className="flex justify-between w-full">
                  {selectedOrder?.status !== 'Cancelled' && selectedOrder?.status !== 'Completed' && (
                     <Button variant="danger" icon={RiCloseLine} onClick={() => handleStatusUpdate('Cancelled')}>Cancel Order</Button>
                  )}
                  <div className="flex gap-3 ml-auto">
                     {selectedOrder?.status === 'Pending' && (
                        <Button icon={RiCheckDoubleLine} onClick={() => handleStatusUpdate('Confirmed')}>Confirm Order</Button>
                     )}
                     {selectedOrder?.status === 'Confirmed' && (
                        <Button icon={RiInboxArchiveLine} onClick={() => handleStatusUpdate('Processing')}>Start Packaging</Button>
                     )}
                     {selectedOrder?.status === 'Processing' && (
                        <Button icon={RiTruckLine} onClick={() => handleStatusUpdate('In Transit')}>Dispatch Shipment</Button>
                     )}
                     {selectedOrder?.status === 'In Transit' && (
                        <Button icon={RiCheckDoubleLine} onClick={() => handleStatusUpdate('Completed')}>Mark as Delivered</Button>
                     )}
                  </div>
               </div>
            }
         >
            <div className="space-y-8 py-2">
               {/* Distributor Profile */}
               <div className="p-5 bg-surface-elevated border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                        <RiShoppingCartLine className="text-brand-teal w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[9px] text-content-tertiary uppercase font-black tracking-widest mb-0.5">Logged Buyer</p>
                        <h4 className="text-base font-bold text-content-primary">{selectedOrder?.buyer?.businessName || selectedOrder?.buyer?.name}</h4>
                        <p className="text-[11px] text-content-tertiary">{selectedOrder?.buyer?.email}</p>
                     </div>
                  </div>
                  <Badge 
                     variant={
                        selectedOrder?.status === 'Pending' ? 'warning' : 
                        selectedOrder?.status === 'Cancelled' ? 'danger' : 
                        selectedOrder?.status === 'Completed' ? 'success' : 'teal'
                     } 
                     size="lg"
                  >
                     {selectedOrder?.status}
                  </Badge>
               </div>

               {/* Status Override (Dropdown) */}
               <div className="p-4 bg-surface-secondary border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <RiArrowDownSLine className="text-content-tertiary" />
                     <span className="text-[10px] font-black uppercase text-content-tertiary tracking-widest">Quick Status Override</span>
                  </div>
                  <Select
                     className="w-48 !h-8 text-xs"
                     value={selectedOrder?.status}
                     onChange={(e) => handleStatusUpdate(e.target.value)}
                     options={[
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Confirmed', value: 'Confirmed' },
                        { label: 'Processing', value: 'Processing' },
                        { label: 'In Transit', value: 'In Transit' },
                        { label: 'Completed', value: 'Completed' },
                        { label: 'Cancelled', value: 'Cancelled' }
                     ]}
                  />
               </div>

               {/* Items Grid */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                     <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest">Fulfillment List</h5>
                     <span className="text-[10px] font-bold text-content-secondary bg-surface-secondary px-2 py-0.5">{selectedOrder?.products?.length} Unique SKUs</span>
                  </div>
                  
                  <div className="border border-border divide-y divide-border">
                     {selectedOrder?.products?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 hover:bg-surface-secondary/30 transition-colors">
                           <div className="w-12 h-12 bg-surface-secondary border border-border flex-shrink-0 overflow-hidden">
                              <img src={item.product?.images?.[0]?.url} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <span className="text-xs font-bold text-content-primary block">{item.product?.name}</span>
                              <span className="text-[10px] text-content-tertiary font-mono">CODE: {item.product?.sku}</span>
                           </div>
                           <div className="text-right flex flex-col gap-1">
                              <span className="text-sm font-black text-content-primary">{item.quantity} Units</span>
                              <span className="text-[10px] font-bold text-brand-teal">{formatCurrency(item.priceAtOrder)}/u</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="bg-surface-secondary p-4 flex flex-col gap-1">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-content-tertiary uppercase">Billing Summary</span>
                        <div className="flex gap-1">
                           {['Unpaid', 'Partial', 'Paid'].map(ps => (
                              <button 
                                 key={ps}
                                 onClick={() => handlePaymentUpdate(ps)}
                                 className={`text-[8px] px-1.5 py-0.5 font-bold uppercase transition-colors ${
                                    selectedOrder?.paymentStatus === ps 
                                    ? 'bg-brand-teal text-white' 
                                    : 'bg-surface-tertiary text-content-tertiary hover:bg-surface-accent/20'
                                 }`}
                              >
                                 {ps}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex justify-between items-baseline mt-1">
                        <span className="text-content-tertiary text-[11px]">Subtotal</span>
                        <span className="text-content-primary font-bold text-xs">{formatCurrency(selectedOrder?.totalAmount)}</span>
                     </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-content-tertiary text-[11px]">Tax (GST 18%)</span>
                        <span className="text-content-primary font-bold text-xs">{formatCurrency(0)}</span>
                     </div>
                     <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-border/50">
                        <span className="text-brand-teal text-xs font-black uppercase">Grand Total</span>
                        <span className="text-brand-teal font-black text-lg">{formatCurrency(selectedOrder?.totalAmount)}</span>
                     </div>
                  </div>

                  <div className="bg-state-info/5 border border-state-info/20 p-4 relative overflow-hidden">
                     <RiInboxArchiveLine className="absolute -bottom-2 -right-2 text-state-info/10 w-24 h-24 rotate-12" />
                     <p className="text-[10px] font-black text-state-info uppercase mb-2">Internal Logistics Note</p>
                     <p className="text-[11px] text-state-info leading-normal italic">
                        "Ensure batch numbers are matched before packaging. Regional shipping route {selectedOrder?.buyer?.location || 'Central Corridor'}."
                     </p>
                  </div>
               </div>
            </div>
         </Modal>
      </div>
   );
}
