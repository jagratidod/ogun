import { useMemo, useState, useEffect } from 'react';
import { RiSearchLine, RiFilterLine, RiPulseLine, RiLineChartLine, RiInboxLine, RiAlertLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Input, Select } from '../../../core';
import partnerService from '../../../core/services/partnerService';
import { toast } from 'react-hot-toast';

export default function DistributorStockPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getInventory();
      setInventory(res.data || []);
    } catch (error) {
      toast.error('Failed to load live inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (inventory || [])
      .filter((item) => {
        const status = (item.status || '').toLowerCase().replace(/\s/g, '');
        const filter = statusFilter.toLowerCase().replace(/\s/g, '');
        return statusFilter === 'all' ? true : status === filter;
      })
      .filter((item) => {
        if (!q) return true;
        const productName = item.product?.name?.toLowerCase() || '';
        const productSku = item.product?.sku?.toLowerCase() || '';
        return productName.includes(q) || productSku.includes(q);
      });
  }, [inventory, search, statusFilter]);

  const columns = [
    { key: 'product', label: 'Product Details', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
             {val?.images?.[0]?.url ? (
               <img src={val.images[0].url} alt={val.name} className="w-full h-full object-cover" />
             ) : (
               <RiInboxLine className="text-slate-300 w-5 h-5" />
             )}
          </div>
          <div>
            <p className="text-sm font-bold text-content-primary leading-tight">{val?.name || 'Unknown Product'}</p>
            <p className="text-[10px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{val?.sku || 'NO-SKU'}</p>
          </div>
       </div>
    )},
    { key: 'product.category', label: 'Category', render: (_, row) => (
       <Badge variant="ghost">{row.product?.category || 'General'}</Badge>
    )},
    { key: 'quantity', label: 'In Stock', align: 'center', sortable: true, render: (val) => (
       <div className="flex flex-col items-center">
          <span className={`text-sm font-black ${val === 0 ? 'text-state-danger' : val <= 10 ? 'text-state-warning' : 'text-state-success'}`}>
             {val} Units
          </span>
       </div>
    )},
    { key: 'product.distributorPrice', label: 'Purchase ₹', render: (_, row) => (
       <span className="text-xs font-bold text-content-secondary">₹{row.product?.distributorPrice?.toLocaleString() || '0'}</span>
    )},
    { key: 'product.retailerPrice', label: 'MOP (Retail) ₹', render: (_, row) => (
       <span className="text-xs font-bold text-brand-teal">₹{row.product?.retailerPrice?.toLocaleString() || '0'}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => {
        const variants = {
          'In Stock': 'success',
          'Low Stock': 'warning',
          'Out of Stock': 'danger'
        };
        return <Badge status={variants[val] || 'neutral'}>{val}</Badge>;
    }}
  ];

  const totalValue = inventory.reduce((acc, curr) => acc + ((curr.product?.distributorPrice || 0) * (curr.quantity || 0)), 0);

  return (
    <div className="page-container">
      <PageHeader 
        title="Inventory Warehouse" 
        subtitle="Live monitoring of available units and regional stock valuation"
      >
        <Button icon={RiPulseLine} variant="secondary" onClick={fetchInventory} disabled={loading}>
          {loading ? 'Syncing...' : 'Sync Live Status'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Total Units', val: inventory.reduce((acc, curr) => acc + (curr.quantity || 0), 0), icon: RiInboxLine, color: 'text-brand-teal' },
           { label: 'Stock Valuation', val: `₹${totalValue.toLocaleString()}`, icon: RiLineChartLine, color: 'text-brand-magenta' },
           { label: 'Low Stock SKU', val: inventory.filter(i => i.status === 'Low Stock').length, icon: RiAlertLine, color: 'text-orange-500' },
           { label: 'Product Range', val: inventory.length, icon: RiPulseLine, color: 'text-slate-400' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h4 className="text-xl font-black text-content-primary">{stat.val}</h4>
              </div>
              <stat.icon className={`absolute right-[-10px] bottom-[-10px] w-20 h-20 opacity-5 transition-transform group-hover:scale-110 ${stat.color}`} />
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select
                className="w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Stock', value: 'all' },
                  { label: 'In Stock', value: 'instock' },
                  { label: 'Low Stock', value: 'lowstock' },
                  { label: 'Out of Stock', value: 'outofstock' },
                ]}
              />
              <div className="flex items-center gap-2">
                 <Input
                   icon={RiSearchLine}
                   placeholder="Search product or SKU..."
                   className="w-full md:w-64"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine} onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredStock} loading={loading} />
      </Card>
    </div>
  );
}
