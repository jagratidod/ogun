import { useState, useEffect, useMemo } from 'react';
import { 
  RiMessage2Line, RiTimeLine, RiInboxLine, RiRefreshLine, 
  RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine, RiEyeLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Modal, useModal, formatDateTime, Select 
} from '../../../core';
import queryService from '../../../core/services/queryService';
import { toast } from 'react-hot-toast';

export default function DistributorProductQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedQuery } = useModal();
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await queryService.getDistributorQueries();
      setQueries(res.data || []);
    } catch (error) {
      toast.error('Failed to load retailer requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await queryService.updateDistributorQueryStatus(id, { status });
      toast.success(`Request marked as ${status}`);
      fetchQueries();
      close();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredQueries = useMemo(() => {
    if (statusFilter === 'all') return queries;
    return queries.filter(q => q.status.toLowerCase() === statusFilter.toLowerCase());
  }, [queries, statusFilter]);

  const stats = useMemo(() => ({
    total: queries.length,
    pending: queries.filter(q => q.status === 'Pending').length,
    acknowledged: queries.filter(q => q.status === 'Acknowledged').length,
    fulfilled: queries.filter(q => q.status === 'Fulfilled').length,
  }), [queries]);

  const columns = [
    {
      key: 'queryId', label: 'ID',
      render: (val) => <span className="font-bold text-content-primary">#{val}</span>
    },
    {
      key: 'retailer', label: 'Retailer / Shop',
      render: (val) => (
        <div>
          <p className="text-sm font-bold text-content-primary leading-tight">{val?.shopName || val?.name}</p>
          <p className="text-[10px] text-content-tertiary font-medium uppercase">{val?.phone}</p>
        </div>
      )
    },
    {
      key: 'product', label: 'Product',
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
      key: 'requestedQuantity', label: 'Qty', align: 'center',
      render: (val, row) => <span className="font-bold text-content-secondary">{val} {row.product?.unit || 'pcs'}</span>
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
        <div className="flex justify-end gap-1">
          {row.status === 'Pending' && (
            <Button variant="secondary" size="xs" onClick={() => handleUpdateStatus(row._id, 'Acknowledged')}>
              Acknowledge
            </Button>
          )}
          <Button variant="icon" onClick={() => open(row)}>
            <RiEyeLine className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Retailer Product Requests" 
        subtitle="Manage requests from your retailers for products you don't currently stock"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchQueries} disabled={loading}>
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-content-primary' },
          { label: 'Pending', value: stats.pending, color: 'text-state-warning' },
          { label: 'Acknowledged', value: stats.acknowledged, color: 'text-brand-teal' },
          { label: 'Fulfilled', value: stats.fulfilled, color: 'text-state-success' },
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
              <CardTitle>Inbound Request Log</CardTitle>
              <CardDescription>Requests from your assigned retailer network</CardDescription>
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
        title={`Request Detail: #${selectedQuery?.queryId}`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Close</Button>
            {selectedQuery?.status === 'Acknowledged' && (
              <Button onClick={() => handleUpdateStatus(selectedQuery._id, 'Processing')}>Mark Processing</Button>
            )}
            {selectedQuery?.status === 'Processing' && (
              <Button onClick={() => handleUpdateStatus(selectedQuery._id, 'Fulfilled')}>Mark Fulfilled</Button>
            )}
          </div>
        }
      >
        {selectedQuery && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-secondary border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Retailer</p>
                  <p className="font-bold text-content-primary">{selectedQuery.retailer?.shopName || selectedQuery.retailer?.name}</p>
                  <p className="text-xs text-content-tertiary">{selectedQuery.retailer?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Requested On</p>
                  <p className="font-bold text-content-primary">{formatDateTime(selectedQuery.createdAt)}</p>
                </div>
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
                <p className="text-xs font-bold text-brand-teal mt-1">Qty: {selectedQuery.requestedQuantity} {selectedQuery.product?.unit || 'pcs'}</p>
              </div>
              <Badge status={selectedQuery.status.toLowerCase()}>{selectedQuery.status}</Badge>
            </div>

            {selectedQuery.message && (
              <div className="p-4 bg-brand-teal/5 border border-brand-teal/10">
                <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <RiMessage2Line /> Retailer's Note
                </p>
                <p className="text-sm text-content-secondary leading-relaxed italic">"{selectedQuery.message}"</p>
              </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
              <RiInformationLine className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                Updating this status will notify the Retailer. If you mark it as 'Fulfilled', it means you have added this product to your inventory or managed to supply it.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
