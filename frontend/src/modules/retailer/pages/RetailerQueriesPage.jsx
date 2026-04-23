import { useState, useEffect } from 'react';
import { RiMessage2Line, RiTimeLine, RiInboxLine, RiRefreshLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, DataTable, Badge, Button, formatDateTime } from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function RetailerQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getMyQueries();
      setQueries(res.data || []);
    } catch (error) {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'queryId', label: 'Query ID',
      render: (val) => <span className="font-bold text-content-primary">#{val}</span>
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
      key: 'requestedQuantity', label: 'Requested Qty', align: 'center',
      render: (val, row) => <span className="font-bold text-content-secondary">{val} {row.product?.unit || 'pcs'}</span>
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge status={val.toLowerCase()}>{val}</Badge>
    },
    {
      key: 'createdAt', label: 'Date Submitted',
      render: (val) => (
        <div className="flex items-center gap-2 text-content-secondary">
          <RiTimeLine className="w-4 h-4 text-content-tertiary" />
          <span className="text-sm">{formatDateTime(val).split(',')[0]}</span>
        </div>
      )
    },
    {
      key: 'message', label: 'My Note',
      render: (val) => val ? (
        <div className="flex items-center gap-2 group cursor-help" title={val}>
          <RiMessage2Line className="w-4 h-4 text-brand-teal" />
          <span className="text-xs text-content-tertiary line-clamp-1 max-w-[150px]">{val}</span>
        </div>
      ) : <span className="text-xs text-content-tertiary italic">No note</span>
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Product Requests" 
        subtitle="Track requests you've made for products not currently stocked by your distributor"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchQueries} disabled={loading}>
          Refresh
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <DataTable 
          columns={columns} 
          data={queries} 
          loading={loading}
          emptyMessage="You haven't made any product requests yet."
        />
      </Card>
    </div>
  );
}
