import { useState, useMemo, useEffect } from 'react';
import {
   RiShoppingCartLine, RiSearchLine, RiFilterLine,
   RiEyeLine, RiFileDownloadLine, RiFilter2Line,
   RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine,
   RiArrowRightLine, RiUserLine, RiStore2Line
} from 'react-icons/ri';
import {
   PageHeader, Card, CardHeader, CardTitle, CardDescription,
   DataTable, Badge, Button, Input, Select, useSearch, useSort,
   usePagination, formatCurrency, formatDateTime, useModal, Modal
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function OrderPipelinePage() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('all');
   const { isOpen, open, close, data: selectedOrder } = useModal();

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const res = await logisticsService.getOrderPipeline();
         setOrders(res.data || []);
      } catch (error) {
         toast.error('Failed to fetch global orders');
      } finally {
         setLoading(false);
      }
   };

   const filteredByType = useMemo(() => {
      if (activeTab === 'all') return orders;
      if (activeTab === 'distributor') return orders.filter(o => o.orderType === 'distributor_to_admin');
      if (activeTab === 'retailer') return orders.filter(o => o.orderType === 'retailer_to_distributor');
      return orders;
   }, [orders, activeTab]);

   const { query, setQuery, filteredData } = useSearch(filteredByType, ['orderId', 'buyer.name', 'seller.name', 'buyer.businessName']);
   const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'createdAt', 'desc');
   const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);

   const columns = [
      {
         key: 'orderId', label: 'Order ID', sortable: true, render: (val) => (
            <span className="font-bold text-content-primary p-2 bg-surface-secondary/50 border border-border/50">{val}</span>
         )
      },
      {
         key: 'orderType', label: 'Flow Type', render: (val) => {
            const types = {
               'distributor_to_admin': { label: 'DIST → ADMIN', variant: 'teal' },
               'retailer_to_distributor': { label: 'RET → DIST', variant: 'info' },
               'executive_to_retailer': { label: 'EXEC → RET', variant: 'warning' }
            };
            const t = types[val] || { label: val, variant: 'secondary' };
            return <Badge variant={t.variant} className="text-[9px]">{t.label}</Badge>;
         }
      },
      { 
         key: 'buyer', label: 'Supply Chain Nodes', render: (_, row) => (
            <div className="flex items-center gap-2">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-content-primary truncate max-w-[100px]">{row.buyer?.name || row.buyer?.businessName}</span>
                  <span className="text-[8px] text-content-tertiary uppercase tracking-tighter">{row.buyer?.role}</span>
               </div>
               <RiArrowRightLine className="text-content-tertiary w-3 h-3" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-content-primary truncate max-w-[100px]">{row.seller?.name || row.seller?.businessName || 'ADMIN'}</span>
                  <span className="text-[8px] text-content-tertiary uppercase tracking-tighter">{row.sellerRole || 'admin'}</span>
               </div>
            </div>
         )
      },
      {
         key: 'totalAmount', label: 'Value', align: 'right', sortable: true, render: (val) => (
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
            <Button variant="secondary" size="xs" icon={RiEyeLine} onClick={() => open(row)}>Audit</Button>
         )
      }
   ];

   return (
      <div className="page-container">
         <PageHeader
            title="Supply Chain Order Pipeline"
            subtitle="Cross-sectional view of all commercial movement across the organization"
         >
            <Button icon={RiFileDownloadLine} variant="secondary">Pipeline Report</Button>
         </PageHeader>

         {/* Tabs */}
         <div className="flex border-b border-border mb-6">
            <button 
               onClick={() => setActiveTab('all')}
               className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'all' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-content-tertiary hover:text-content-primary'}`}
            >
               Global Flow
            </button>
            <button 
               onClick={() => setActiveTab('distributor')}
               className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'distributor' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-content-tertiary hover:text-content-primary'}`}
            >
               Distributor → Admin
            </button>
            <button 
               onClick={() => setActiveTab('retailer')}
               className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'retailer' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-content-tertiary hover:text-content-primary'}`}
            >
               Retailer → Distributor
            </button>
         </div>

         <Card>
            <CardHeader className="pb-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-surface-secondary border border-border text-[10px] font-black text-content-tertiary uppercase tracking-widest">
                        Filtering: {activeTab === 'all' ? 'Entire Network' : activeTab}
                     </div>
                  </div>
                  <div className="relative group">
                     <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
                     <Input
                        placeholder="Search ID, Node Name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 w-72 h-10"
                     />
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
                  Auditing {startIndex}-{endIndex} of {totalItems} cross-role transactions
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
            title={`Order Audit: ${selectedOrder?.orderId}`}
         >
            <div className="space-y-6 py-2">
               {/* Supply Chain Chain */}
               <div className="flex items-center justify-center p-6 bg-surface-secondary border border-border gap-6">
                  <div className="text-center">
                     <div className="w-12 h-12 bg-white border border-border flex items-center justify-center mx-auto mb-2">
                        <RiUserLine className="text-content-secondary" />
                     </div>
                     <p className="text-[10px] font-black text-content-primary uppercase">{selectedOrder?.buyer?.name}</p>
                     <p className="text-[8px] text-brand-teal font-bold uppercase tracking-tighter">Initiator ({selectedOrder?.buyer?.role})</p>
                  </div>
                  
                  <div className="flex-1 h-px bg-border relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] font-bold text-content-tertiary">
                        {formatCurrency(selectedOrder?.totalAmount)}
                     </div>
                  </div>

                  <div className="text-center">
                     <div className="w-12 h-12 bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mx-auto mb-2">
                        <RiStore2Line className="text-brand-teal" />
                     </div>
                     <p className="text-[10px] font-black text-content-primary uppercase">{selectedOrder?.seller?.name || 'ADMIN'}</p>
                     <p className="text-[8px] text-brand-teal font-bold uppercase tracking-tighter">Fulfiller ({selectedOrder?.sellerRole || 'admin'})</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest">Transaction Details</h5>
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-content-tertiary">Order Date</span>
                           <span className="text-content-primary font-medium">{formatDateTime(selectedOrder?.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-content-tertiary">Stock Status</span>
                           <Badge variant={selectedOrder?.stockDeducted ? 'success' : 'warning'}>
                              {selectedOrder?.stockDeducted ? 'Deducted from Seller' : 'Stock Pending'}
                           </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-content-tertiary">Buyer Inventory</span>
                           <Badge variant={selectedOrder?.stockAddedToBuyer ? 'success' : 'info'}>
                              {selectedOrder?.stockAddedToBuyer ? 'Updated' : 'Pending Receipt'}
                           </Badge>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest">Pipeline Status</h5>
                     <div className="p-3 bg-surface-secondary border border-border">
                        <div className="flex items-center gap-3">
                           <Badge variant="teal" size="lg">{selectedOrder?.status}</Badge>
                           <p className="text-[10px] text-content-tertiary leading-tight italic">
                              Current commercial state of this transaction.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Items */}
               <div>
                  <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest mb-3">Line Items ({selectedOrder?.products?.length})</h5>
                  <div className="border border-border divide-y divide-border">
                     {selectedOrder?.products?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-surface-secondary/30">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-content-primary">{item.product?.name}</span>
                              <span className="text-[9px] text-content-tertiary font-mono">#{item.product?.sku}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-content-secondary">{item.quantity} units</span>
                              <span className="text-xs font-black text-brand-teal">{formatCurrency(item.priceAtOrder * item.quantity)}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </Modal>
      </div>
   );
}
