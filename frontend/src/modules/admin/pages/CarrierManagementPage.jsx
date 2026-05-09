import { useState, useEffect } from 'react';
import { 
  RiTruckLine, RiAddLine, RiSearchLine, RiMapPinLine, 
  RiShieldCheckLine, RiPriceTag3Line, RiLoader4Line, 
  RiDeleteBinLine, RiEditLine, RiInformationLine, RiCalculatorLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, formatCurrency 
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function CarrierManagementPage() {
  const [loading, setLoading] = useState(true);
  const [carriers, setCarriers] = useState([]);
  const [showRateEngine, setShowRateEngine] = useState(false);
  const [rateQuery, setRateQuery] = useState({ weight: 1, length: 10, width: 10, height: 10, zone: 'North' });
  const [rateResults, setRateResults] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/carriers');
      setCarriers(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch carriers');
    } finally {
      setLoading(false);
    }
  };

  const calculateRates = async () => {
    try {
      setCalcLoading(true);
      const params = new URLSearchParams(rateQuery).toString();
      const res = await api.get(`/admin/carriers/rate-engine?${params}`);
      setRateResults(res.data.data);
    } catch (error) {
      toast.error('Rate calculation failed');
    } finally {
      setCalcLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Carrier Partner', render: (val, row) => (
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-brand-teal">
             <RiTruckLine className="w-5 h-5" />
          </div>
          <div>
             <p className="text-sm font-bold text-content-primary">{val}</p>
             <p className="text-[10px] text-content-tertiary uppercase font-black">{row.type}</p>
          </div>
       </div>
    )},
    { key: 'pricingZones', label: 'Coverage Zones', render: (val) => (
       <div className="flex flex-wrap gap-1">
          {val.map((z, i) => (
             <Badge key={i} variant="secondary" className="text-[8px]">{z.zone}</Badge>
          ))}
       </div>
    )},
    { key: 'deliverySLA', label: 'Avg SLA', align: 'center', render: (val) => (
       <span className="text-sm font-bold text-content-secondary">{val} Days</span>
    )},
    { key: 'isActive', label: 'Status', render: (val) => (
       <Badge status={val ? 'active' : 'inactive'}>{val ? 'ACTIVE' : 'DISABLED'}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon"><RiEditLine className="w-4 h-4" /></Button>
          <Button variant="icon" className="text-state-danger"><RiDeleteBinLine className="w-4 h-4" /></Button>
       </div>
    )}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Logistics Control Plane" 
        subtitle="Carrier partner management and freight rate optimization"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiCalculatorLine} onClick={() => setShowRateEngine(!showRateEngine)}>Rate Engine</Button>
            <Button icon={RiAddLine} variant="primary">Add Carrier</Button>
        </div>
      </PageHeader>

      {showRateEngine && (
         <Card className="border-brand-teal bg-brand-teal/[0.02] border-dashed">
            <CardHeader>
               <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                  <RiCalculatorLine /> Freight Simulator
               </CardTitle>
            </CardHeader>
            <div className="p-6">
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                     <label className="text-[10px] font-black text-content-tertiary uppercase mb-1 block">Weight (KG)</label>
                     <Input 
                        type="number" 
                        value={rateQuery.weight} 
                        onChange={(e) => setRateQuery({...rateQuery, weight: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-content-tertiary uppercase mb-1 block">Zone</label>
                     <Select 
                        value={rateQuery.zone}
                        onChange={(e) => setRateQuery({...rateQuery, zone: e.target.value})}
                        options={[
                           { label: 'North', value: 'North' },
                           { label: 'West', value: 'West' },
                           { label: 'East', value: 'East' },
                           { label: 'South', value: 'South' }
                        ]}
                     />
                  </div>
                  <div className="md:col-span-2">
                     <label className="text-[10px] font-black text-content-tertiary uppercase mb-1 block">Dimensions (L x W x H cm)</label>
                     <div className="flex gap-2">
                        <Input placeholder="L" type="number" value={rateQuery.length} onChange={(e) => setRateQuery({...rateQuery, length: e.target.value})} />
                        <Input placeholder="W" type="number" value={rateQuery.width} onChange={(e) => setRateQuery({...rateQuery, width: e.target.value})} />
                        <Input placeholder="H" type="number" value={rateQuery.height} onChange={(e) => setRateQuery({...rateQuery, height: e.target.value})} />
                     </div>
                  </div>
                  <div className="flex items-end">
                     <Button className="w-full h-10" onClick={calculateRates} loading={calcLoading}>Estimate</Button>
                  </div>
               </div>

               {rateResults && (
                  <div className="bg-white rounded-2xl p-5 border border-brand-teal/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex gap-4">
                           <div className="text-center px-4 border-r border-gray-100">
                              <p className="text-[8px] font-black text-content-tertiary uppercase">Billed Weight</p>
                              <p className="text-sm font-black text-brand-teal">{rateResults.metrics.billedWeight.toFixed(2)} KG</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] font-black text-content-tertiary uppercase">Density Ratio</p>
                              <p className="text-sm font-black text-content-secondary">{rateResults.metrics.densityRatio}</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-content-tertiary font-bold italic">* Based on volumetric vs actual max</p>
                     </div>
                     <div className="space-y-3">
                        {rateResults.recommendations.map((rec, i) => (
                           <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${rec.isBestValue ? 'border-brand-teal bg-brand-teal/[0.03]' : 'border-gray-100'}`}>
                              <div className="flex items-center gap-4">
                                 <RiTruckLine className={`w-5 h-5 ${rec.isBestValue ? 'text-brand-teal' : 'text-gray-400'}`} />
                                 <div>
                                    <p className="text-sm font-black text-content-primary">{rec.name} {rec.isBestValue && <Badge variant="teal" className="ml-2">BEST VALUE</Badge>}</p>
                                    <p className="text-[10px] text-content-tertiary font-bold">{rec.type.toUpperCase()} • SLA: {rec.sla} Days</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-lg font-black text-brand-teal">{formatCurrency(rec.cost)}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </Card>
      )}

      <Card className="border-none shadow-sm">
         <CardHeader>
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <RiTruckLine className="text-brand-teal" />
                  <CardTitle className="text-sm uppercase tracking-widest">Carrier Registry</CardTitle>
               </div>
               <Input 
                 icon={RiSearchLine} 
                 placeholder="Search partners..." 
                 className="w-64"
               />
            </div>
         </CardHeader>
         <DataTable columns={columns} data={carriers} />
      </Card>
    </div>
  );
}
