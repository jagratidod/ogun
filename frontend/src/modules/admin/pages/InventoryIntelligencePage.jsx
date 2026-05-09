import { useState, useEffect } from 'react';
import { 
  RiPulseLine, RiAlertLine, RiArrowUpLine, RiArrowDownLine, 
  RiHistoryLine, RiSearchLine, RiLoader4Line, RiBarChartFill,
  RiInformationLine, RiShoppingBag3Line
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, formatCurrency 
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function InventoryIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inventory/overview');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory intelligence');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'product', label: 'Product Item', render: (val) => (
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-brand-teal">
             <RiShoppingBag3Line className="w-5 h-5" />
          </div>
          <div>
             <p className="text-sm font-bold text-content-primary">{val?.name}</p>
             <p className="text-[10px] text-content-tertiary uppercase font-black">SKU: {val?.sku}</p>
          </div>
       </div>
    )},
    { key: 'quantity', label: 'Current Stock', align: 'center', render: (val, row) => (
       <div className="flex flex-col items-center">
          <span className="text-sm font-black text-content-primary">{val} {row.product?.unit || 'units'}</span>
          <Badge status={val > row.minStockThreshold ? 'active' : 'inactive'} className="text-[8px] px-1 py-0 mt-1">
             {val > row.minStockThreshold ? 'HEALTHY' : 'CRITICAL'}
          </Badge>
       </div>
    )},
    { key: 'stockVelocity', label: 'Sales Velocity', align: 'center', render: (val) => (
       <div className="flex flex-col items-center">
          <span className="text-sm font-black text-brand-teal">{val || 0}</span>
          <p className="text-[8px] text-content-tertiary font-bold uppercase">Units / Day</p>
       </div>
    )},
    { key: 'predictionDays', label: 'Stock-Out In', align: 'center', render: (val) => {
       const isUrgent = val <= 7;
       return (
          <div className="flex flex-col items-center">
             <span className={`text-sm font-black ${isUrgent ? 'text-state-danger' : 'text-state-success'}`}>
                {val === 999 ? '∞' : `${val} Days`}
             </span>
             <p className="text-[8px] text-content-tertiary font-bold uppercase">{val === 999 ? 'NO MOVEMENT' : 'PREDICTED'}</p>
          </div>
       );
    }},
    { key: 'status', label: 'AI Recommendation', render: (val, row) => {
        if (row.predictionDays <= 3) return <Badge variant="danger" className="text-[9px]">RESTOCK IMMEDIATELY</Badge>;
        if (row.predictionDays <= 7) return <Badge variant="warning" className="text-[9px]">PLAN PROCUREMENT</Badge>;
        if (row.stockVelocity > 10) return <Badge variant="teal" className="text-[9px]">HIGH DEMAND ITEM</Badge>;
        return <Badge variant="secondary" className="text-[9px]">MONITORING</Badge>;
    }}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const criticalCount = data.filter(i => i.predictionDays <= 7).length;

  return (
    <div className="page-container max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Inventory Intelligence" 
        subtitle="Predictive stock analysis and sales velocity tracking"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchInventory}>Recalculate</Button>
            <Button icon={RiBarChartFill} variant="primary">Download Forecast</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Global Stock Health</p>
            <h3 className="text-3xl font-black text-content-primary">94.2%</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-state-success">
               <RiArrowUpLine /> 2.1% from last month
            </div>
         </Card>
         <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32 bg-state-danger/[0.03] border-l-4 border-l-state-danger">
            <p className="text-[10px] font-black text-state-danger uppercase tracking-widest">Critical Stock-outs</p>
            <h3 className="text-3xl font-black text-state-danger">{criticalCount}</h3>
            <p className="text-[10px] text-content-tertiary font-bold italic">Predicted within 7 days</p>
         </Card>
         <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Fastest Mover</p>
            <h3 className="text-xl font-black text-brand-teal truncate">H-800 Motor</h3>
            <p className="text-[10px] text-content-tertiary font-bold">Velocity: 42 units/day</p>
         </Card>
         <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Procurement Efficiency</p>
            <h3 className="text-3xl font-black text-content-primary">82%</h3>
            <RiPulseLine className="text-brand-pink w-6 h-6 opacity-30" />
         </Card>
      </div>

      <Card className="border-none shadow-sm">
         <CardHeader className="py-5 bg-surface-secondary/30">
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <RiPulseLine className="text-brand-teal" />
                  <CardTitle className="text-sm uppercase tracking-widest">Predictive Stock Ledger</CardTitle>
               </div>
               <Input 
                 icon={RiSearchLine} 
                 placeholder="Filter by SKU or Name..." 
                 className="w-64"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </CardHeader>
         <DataTable columns={columns} data={filteredData} />
      </Card>
    </div>
  );
}
