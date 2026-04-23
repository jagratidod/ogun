import { useState, useEffect, useMemo } from 'react';
import { 
  RiMessage2Line, RiTimeLine, RiInboxLine, RiRefreshLine, 
  RiEyeLine, RiUserLine, RiStore2Line, RiInformationLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Modal, useModal, formatDateTime, Select 
} from '../../../core';
import queryService from '../../../core/services/queryService';
import { toast } from 'react-hot-toast';

export default function AdminProductQueriesPage() {
  const [data, setData] = useState({ queries: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedQuery } = useModal();
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await queryService.getAdminQueries();
      setData(res.data || { queries: [], stats: {} });
    } catch (error) {
      toast.error('Failed to load product queries');
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = useMemo(() => {
    const queries = data.queries || [];
    if (statusFilter === 'all') return queries;
    return queries.filter(q => q.status.toLowerCase() === statusFilter.toLowerCase());
  }, [data.queries, statusFilter]);

  const columns = [
    {
      key: 'queryId', label: 'ID',
      render: (val) => <span className="font-bold text-content-primary">#{val}</span>
    },
    {
      key: 'retailer', label: 'Retailer',
      render: (val) => (
        <div>
          <p className="text-sm font-bold text-content-primary leading-tight">{val?.shopName || val?.name}</p>
          <p className="text-[10px] text-content-tertiary font-medium uppercase">{val?.businessName}</p>
        </div>
      )
    },
    {
      key: 'distributor', label: 'Distributor',
      render: (val) => (
        <div className="flex items-center gap-2">
          <RiStore2Line className="w-3 h-3 text-content-tertiary" />
          <span className="text-xs font-bold text-content-secondary">{val?.businessName || val?.name}</span>
        </div>
      )
    },
    {
      key: 'product', label: 'Requested Product',
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center overflow-hidden">
            {val?.images?.[0]?.url 
              ? <img src={val.images[0].url} alt="" className="w-full h-full object-cover" />
              : <RiInboxLine className="text-slate-300 w-4 h-4" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-content-primary leading-tight">{val?.name}</p>
            <p className="text-[10px] text-content-tertiary uppercase font-black">{val?.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge status={val.toLowerCase()}>{val}</Badge>
    },
    {
      key: 'createdAt', label: 'Date',
      render: (val) => <span className="text-sm text-content-secondary">{formatDateTime(val).split(',')[0]}</span>
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_, row) => (
        <Button variant="icon" onClick={() => open(row)}>
          <RiEyeLine className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Network Product Queries" 
        subtitle="Monitor and oversee product requests from retailers across your entire supply chain"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchQueries} disabled={loading}>
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Queries', value: data.stats?.total || 0, color: 'text-content-primary' },
          { label: 'Pending Review', value: data.stats?.pending || 0, color: 'text-state-warning' },
          { label: 'In Process', value: data.stats?.processing || 0, color: 'text-brand-teal' },
          { label: 'Fulfilled', value: data.stats?.fulfilled || 0, color: 'text-state-success' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h4 className={`text-2xl font-black ${s.color}`}>{s.value}</h4>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Master Query Log</CardTitle>
              <CardDescription>Overview of what products retailers are asking for</CardDescription>
            </div>
            <Select 
              className="w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Acknowledged', value: 'acknowledged' },
                { label: 'Processing', value: 'processing' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Rejected', value: 'rejected' },
              ]}
            />
          </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredQueries} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Query Detail: #${selectedQuery?.queryId}`}
        size="md"
      >
        {selectedQuery && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-secondary border border-border">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <RiUserLine className="text-brand-teal" /> Retailer Info
                </p>
                <p className="font-bold text-content-primary text-sm">{selectedQuery.retailer?.shopName || selectedQuery.retailer?.name}</p>
                <p className="text-xs text-content-tertiary">{selectedQuery.retailer?.businessName}</p>
                <p className="text-xs text-content-tertiary mt-1">{selectedQuery.retailer?.email}</p>
              </div>
              <div className="p-4 bg-surface-secondary border border-border">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <RiStore2Line className="text-amber-500" /> Distributor Info
                </p>
                <p className="font-bold text-content-primary text-sm">{selectedQuery.distributor?.businessName || selectedQuery.distributor?.name}</p>
                <p className="text-xs text-content-tertiary mt-1">{selectedQuery.distributor?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-border">
              <div className="w-16 h-16 bg-slate-50 border border-border flex items-center justify-center overflow-hidden">
                {selectedQuery.product?.images?.[0]?.url 
                  ? <img src={selectedQuery.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  : <RiInboxLine className="w-8 h-8 text-slate-200" />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-content-primary">{selectedQuery.product?.name}</p>
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">{selectedQuery.product?.sku}</p>
                <p className="text-xs font-bold text-brand-teal mt-1">Requested Qty: {selectedQuery.requestedQuantity} {selectedQuery.product?.unit || 'pcs'}</p>
              </div>
              <div className="text-right">
                <Badge status={selectedQuery.status.toLowerCase()}>{selectedQuery.status}</Badge>
                <p className="text-[10px] text-content-tertiary mt-1 font-bold uppercase tracking-widest">{formatDateTime(selectedQuery.createdAt).split(',')[0]}</p>
              </div>
            </div>

            {selectedQuery.message && (
              <div className="p-4 bg-surface-secondary border border-border border-l-brand-teal border-l-4">
                <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-1">Retailer's Message</p>
                <p className="text-sm text-content-secondary italic">"{selectedQuery.message}"</p>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 flex items-start gap-3">
              <RiInformationLine className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest">Administrative Context</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This query represents a gap in the distributor's inventory. Monitoring these helps in identifying high-demand products that are missing from specific regions.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" variant="secondary" onClick={close}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
