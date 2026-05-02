import { useState, useEffect } from 'react';
import { 
  RiAlertLine, RiSearchLine, RiTruckLine, RiCheckDoubleLine, 
  RiArrowRightLine, RiBox3Line, RiStore2Line 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, DataTable, Badge, 
  Button, Input, useSearch, useSort, usePagination, formatDateTime 
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function RestockRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await logisticsService.getRestockRequests();
        if (res.success) setRequests(res.data);
      } catch (error) {
        toast.error('Failed to fetch restock requests');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { query, setQuery, filteredData } = useSearch(requests, ['requester', 'id', 'product']);
  const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'date', 'desc');
  const { paginatedData, currentPage, totalPages, goToPage } = usePagination(sortedData, 10);

  const columns = [
    {
      key: 'buyer', label: 'Requester Node', render: (_, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-content-primary uppercase tracking-tight">{row.buyer?.shopName || row.buyer?.name}</span>
            <Badge variant={row.buyer?.role === 'retailer' ? 'info' : 'teal'} className="text-[8px] py-0 uppercase">{row.buyer?.role}</Badge>
          </div>
          <span className="text-[10px] text-content-tertiary font-mono">{row.orderId}</span>
        </div>
      )
    },
    {
      key: 'products', label: 'Inventory Target', render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{row.products?.[0]?.product?.name} {row.products?.length > 1 ? `(+${row.products.length - 1})` : ''}</span>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-content-tertiary">Requested From: <b className="text-brand-teal capitalize">{row.orderType?.split('_to_')?.[1]}</b></span>
          </div>
        </div>
      )
    },
    { key: 'totalQuantity', label: 'Requested Qty', align: 'center', render: (_, row) => {
        const total = row.products?.reduce((acc, p) => acc + p.quantity, 0);
        return <span className="font-black text-brand-teal text-lg">{total}</span>;
    }},
    {
      key: 'status', label: 'Priority', render: (val) => {
        const variants = {
          'Urgent': 'danger',
          'Pending': 'warning',
          'Confirmed': 'success'
        };
        return <Badge variant={variants[val] || 'secondary'}>{val}</Badge>;
      }
    },
    { key: 'createdAt', label: 'Request Age', render: (val) => <span className="text-[10px] text-content-tertiary font-bold">{formatDateTime(val)}</span> },
    { 
      key: 'actions', label: 'Fulfillment', align: 'right', render: () => (
        <Button variant="primary" size="xs" icon={RiTruckLine}>Quick Dispatch</Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Inventory Rebalancing"
        subtitle="Address critical stock shortages and restock requests from across the network"
      >
        <div className="flex gap-2">
           <Button variant="secondary" icon={RiBox3Line}>Global Stock Audit</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <Card className="p-4 bg-state-danger/5 border-state-danger/20">
            <h4 className="text-[10px] font-black text-state-danger uppercase mb-1">Critical Shortages</h4>
            <p className="text-2xl font-black text-state-danger">12 Nodes</p>
         </Card>
         <Card className="p-4 bg-state-warning/5 border-state-warning/20">
            <h4 className="text-[10px] font-black text-state-warning uppercase mb-1">Pending Requests</h4>
            <p className="text-2xl font-black text-state-warning">48 Requests</p>
         </Card>
         <Card className="p-4 bg-state-info/5 border-state-info/20">
            <h4 className="text-[10px] font-black text-state-info uppercase mb-1">Average Wait Time</h4>
            <p className="text-2xl font-black text-state-info">1.2 Days</p>
         </Card>
         <Card className="p-4 bg-brand-teal/5 border-brand-teal/20">
            <h4 className="text-[10px] font-black text-brand-teal uppercase mb-1">Fulfilled Today</h4>
            <p className="text-2xl font-black text-brand-teal">31 Requests</p>
         </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
               <RiAlertLine className="text-warning w-5 h-5" />
               <span className="text-sm font-bold text-content-primary">Pending Stock Rebalancing Actions</span>
            </div>
            <div className="relative group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
              <Input
                placeholder="Search Requester, ID or Product..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 w-80 h-10"
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
        />
        
        <div className="p-4 border-t border-border flex items-center justify-between bg-surface-secondary/20">
          <span className="text-[11px] font-medium text-content-tertiary">
             Prioritizing {requests.length} critical inventory movements
          </span>
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Back</Button>
            <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
