import { useState, useMemo } from 'react';
import { 
  RiShoppingCartLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiFileDownloadLine, RiFilter2Line, 
  RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, useSearch, useSort, 
  usePagination, formatCurrency, formatDateTime, Modal, useModal 
} from '../../../core';
import ordersData from '../../../data/orders.json';
import { toast } from 'react-hot-toast';

export default function OrderListPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const { isOpen, open, close, data: selectedOrder } = useModal();
  
  const allOrders = useMemo(() => ordersData.filter(o => !o.type), []);
  
  const filteredBySelects = useMemo(() => {
    return allOrders.filter(o => {
      const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
      const matchPayment = paymentFilter === 'all' || o.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();
      return matchStatus && matchPayment;
    });
  }, [allOrders, statusFilter, paymentFilter]);

  const { query, setQuery, filteredData } = useSearch(filteredBySelects, ['id', 'retailer', 'distributor']);
  const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'date', 'desc');
  const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);

  const handleStatusUpdate = (res) => {
    toast.success(`Order #${selectedOrder.id} ${res ? 'Approved' : 'Cancelled'} successfully.`);
    close();
  };

  const columns = [
    { key: 'id', label: 'Order ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'date', label: 'Date', sortable: true, render: (val) => {
       const dateObj = formatDateTime(val);
       return (
        <div className="flex flex-col">
           <span className="text-sm font-medium text-content-primary">{dateObj.split(',')[0]}</span>
           <span className="text-[10px] text-content-tertiary">{dateObj.split(',')[1]}</span>
        </div>
       );
    }},
    { key: 'retailer', label: 'Retailer', sortable: true },
    { key: 'distributor', label: 'Distributor', sortable: true },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true, render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'paymentStatus', label: 'Payment', align: 'center', render: (val) => (
       <Badge variant={val === 'Paid' ? 'success' : 'warning'}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" title="Review Order" onClick={() => open(row)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Download Invoice" onClick={() => toast.success(`Downloading Invoice for ${row.id}...`)}>
             <RiFileDownloadLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Orders" 
        subtitle="Complete order history across all retailers and distributors"
      >
        <Button icon={RiFileDownloadLine} variant="secondary" onClick={() => toast.success('Generation full order report (CSV)...')}>Export report</Button>
      </PageHeader>

      <Card>
         <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
               <div className="flex items-center gap-3">
                  <Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                       { label: 'All Statuses', value: 'all' },
                       { label: 'Processing', value: 'Processing' },
                       { label: 'Shipped', value: 'Shipped' },
                       { label: 'Delivered', value: 'Delivered' }
                    ]} 
                    className="w-40" 
                  />
                  <Select 
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    options={[
                       { label: 'All Payment', value: 'all' },
                       { label: 'Paid', value: 'Paid' },
                       { label: 'Pending', value: 'Pending' }
                    ]} 
                    className="w-40" 
                  />
               </div>
               <div className="flex items-center gap-2">
                  <Input 
                    icon={RiSearchLine} 
                    placeholder="Search order ID, retailer..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full md:w-64"
                  />
                  <Button variant="secondary" icon={RiFilter2Line}>More Filters</Button>
               </div>
            </div>
         </CardHeader>
         <DataTable 
            columns={columns} 
            data={paginatedData} 
            sortKey={sortKey} 
            sortDirection={sortDirection} 
            onSort={requestSort}
         />
         <div className="p-4 border-t border-border flex items-center justify-between">
           <span className="text-xs text-content-tertiary">Showing {startIndex} to {endIndex} of {totalItems} orders</span>
           <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
           </div>
        </div>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Review Order: ${selectedOrder?.id}`}
        footer={
           <div className="flex gap-3">
              <Button variant="danger" icon={RiCloseLine} onClick={() => handleStatusUpdate(false)}>Cancel Transaction</Button>
              <Button icon={RiCheckDoubleLine} onClick={() => handleStatusUpdate(true)}>Approve Fulfillment</Button>
           </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-surface-elevated border border-border flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Retailer Store</p>
                 <h4 className="text-sm font-bold text-content-primary">{selectedOrder?.retailer}</h4>
              </div>
              <Badge status={selectedOrder?.status.toLowerCase()}>{selectedOrder?.status}</Badge>
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-content-tertiary">Total Item Value</span>
                 <span className="text-content-primary font-bold">{formatCurrency(selectedOrder?.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-content-tertiary">Logistics Channel</span>
                 <span className="text-brand-teal font-black uppercase tracking-wider">{selectedOrder?.distributor}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-content-tertiary">Warehouse Area</span>
                 <span className="text-content-primary font-bold">Sector 4, Warehouse A</span>
              </div>
           </div>

           <div className="p-4 rounded-none bg-state-info/5 border border-state-info/20 flex items-start gap-3">
              <RiInboxArchiveLine className="text-state-info w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] text-state-info leading-normal italic">Approval will release stock allocation from regional warehouse for pickup.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
