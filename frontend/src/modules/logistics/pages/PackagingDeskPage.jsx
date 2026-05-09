import React, { useState, useEffect } from 'react';
import { 
  RiBox3Line, 
  RiScalesLine, 
  RiRulerLine, 
  RiSaveLine, 
  RiTruckLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiPulseLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Modal, useModal, Input 
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import carrierService from '../../../core/services/carrierService';
import { toast } from 'react-hot-toast';

export default function PackagingDeskPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: activeShipment } = useModal();
  
  const [packages, setPackages] = useState([
    { weight: '', length: '', width: '', height: '', boxCount: 1, fragileType: 'None' }
  ]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.getPackagingQueue();
      if (res.success) setQueue(res.data);
    } catch (error) {
      toast.error('Failed to load packaging queue');
    } finally {
      setLoading(false);
    }
  };

  const addBox = () => {
    setPackages([...packages, { weight: '', length: '', width: '', height: '', boxCount: 1, fragileType: 'None' }]);
  };

  const removeBox = (idx) => {
    setPackages(packages.filter((_, i) => i !== idx));
  };

  const updateBox = (idx, field, value) => {
    const next = [...packages];
    next[idx][field] = value;
    setPackages(next);
  };

  const calculateRates = async () => {
    // For demo/simplicity, we calculate rates based on the first box or aggregate
    const mainPkg = packages[0];
    if (!mainPkg.weight || !mainPkg.length) return toast.error('Fill main box dimensions');

    try {
      const res = await carrierService.calculateFreight({
        weight: mainPkg.weight,
        length: mainPkg.length,
        width: mainPkg.width,
        height: mainPkg.height,
        zone: activeShipment.recipient?.location?.includes('Delhi') ? 'North' : 'West' // Mock zone mapping
      });
      if (res.success) setRecommendations(res.data.recommendations);
    } catch (error) {
      toast.error('Rate calculation failed');
    }
  };

  const handleFinalize = async () => {
    if (!selectedCarrier) return toast.error('Please select a carrier');

    try {
      toast.loading('Processing shipment packaging...');
      
      // 1. Save packaging details
      await logisticsService.addPackagingDetails(activeShipment._id, { packages });
      
      // 2. Assign carrier
      await logisticsService.selectCarrier(activeShipment._id, {
        carrierId: selectedCarrier.carrierId,
        cost: selectedCarrier.cost,
        zone: activeShipment.recipient?.location?.includes('Delhi') ? 'North' : 'West'
      });

      toast.dismiss();
      toast.success('Shipment ready for dispatch');
      fetchQueue();
      close();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to finalize packaging');
    }
  };

  const columns = [
    { key: 'podNumber', label: 'POD Number', render: (val) => <span className="font-mono font-bold">{val}</span> },
    { key: 'recipient', label: 'Destination', render: (val) => (
      <div>
        <p className="text-sm font-bold text-content-primary">{val?.businessName || val?.name}</p>
        <p className="text-[10px] text-content-tertiary">{val?.location}</p>
      </div>
    )},
    { key: 'products', label: 'Items', render: (val) => (
      <Badge variant="secondary">{val?.reduce((acc, p) => acc + p.quantity, 0)} Units</Badge>
    )},
    { key: 'createdAt', label: 'Queue Time', render: (val) => (
      <span className="text-xs text-content-tertiary">Waiting: 2.4 hrs</span>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <Button size="xs" icon={RiBox3Line} onClick={() => {
        setPackages([{ weight: '', length: '', width: '', height: '', boxCount: 1, fragileType: 'None' }]);
        setRecommendations([]);
        setSelectedCarrier(null);
        open(row);
      }}>Start Packaging</Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Packaging Desk" 
        subtitle="Finalize shipment dimensions, weight and select optimal logistics carriers"
      >
        <RiBox3Line className="w-8 h-8 text-brand-teal opacity-50" />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Packaging Queue</CardTitle>
          <CardDescription>Shipments awaiting physical dimensions and carrier assignment</CardDescription>
        </CardHeader>
        <DataTable 
          columns={columns} 
          data={queue} 
          loading={loading} 
        />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        size="xl"
        title={`Packaging Desk: ${activeShipment?.podNumber}`}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button icon={RiCheckboxCircleLine} disabled={!selectedCarrier} onClick={handleFinalize}>Finalize & Move to Dispatch</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-secondary border border-border">
              <p className="text-[9px] text-content-tertiary uppercase font-black mb-1">Recipient</p>
              <h4 className="text-sm font-bold text-content-primary">{activeShipment?.recipient?.businessName}</h4>
              <p className="text-[10px] text-content-tertiary">{activeShipment?.recipient?.location}</p>
            </div>
            <div className="p-4 bg-brand-teal/5 border border-brand-teal/10">
              <p className="text-[9px] text-brand-teal uppercase font-black mb-1">Manifest</p>
              <h4 className="text-sm font-bold text-brand-teal">{activeShipment?.products?.reduce((acc, p) => acc + p.quantity, 0)} Total Units</h4>
              <p className="text-[10px] text-content-tertiary">Verified manifest items ready.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-content-primary flex items-center gap-2">
                <RiRulerLine /> Box Dimensions & Weight
              </h5>
              <Button size="xs" variant="secondary" onClick={addBox}>Add Box</Button>
            </div>

            {packages.map((pkg, i) => (
              <div key={i} className="grid grid-cols-6 gap-3 items-end p-4 border border-border bg-surface-secondary/20">
                <div className="col-span-1">
                  <Input label="Weight (kg)" type="number" value={pkg.weight} onChange={(e) => updateBox(i, 'weight', e.target.value)} />
                </div>
                <div>
                  <Input label="L (cm)" type="number" value={pkg.length} onChange={(e) => updateBox(i, 'length', e.target.value)} />
                </div>
                <div>
                  <Input label="W (cm)" type="number" value={pkg.width} onChange={(e) => updateBox(i, 'width', e.target.value)} />
                </div>
                <div>
                  <Input label="H (cm)" type="number" value={pkg.height} onChange={(e) => updateBox(i, 'height', e.target.value)} />
                </div>
                <div>
                  <Input label="Qty" type="number" value={pkg.boxCount} onChange={(e) => updateBox(i, 'boxCount', e.target.value)} />
                </div>
                <div className="flex justify-end pb-2">
                  {packages.length > 1 && <Button variant="ghost" size="xs" className="text-danger" onClick={() => removeBox(i)}>Rem</Button>}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-xs font-bold text-content-primary flex items-center gap-2">
                <RiTruckLine /> Carrier Selection Intelligence
              </h5>
              <Button size="xs" variant="primary" icon={RiPulseLine} onClick={calculateRates}>Fetch Rates</Button>
            </div>

            <div className="space-y-2">
              {recommendations.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border opacity-40">
                  <p className="text-[10px]">Enter dimensions and click "Fetch Rates" to see carrier options.</p>
                </div>
              ) : recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className={`p-4 border cursor-pointer transition-all flex items-center justify-between ${selectedCarrier?.carrierId === rec.carrierId ? 'border-brand-teal bg-brand-teal/5' : 'border-border bg-surface-secondary hover:border-brand-teal/50'}`}
                  onClick={() => setSelectedCarrier(rec)}
                >
                  <div className="flex items-center gap-3">
                    <RiTruckLine className={selectedCarrier?.carrierId === rec.carrierId ? 'text-brand-teal' : 'text-content-tertiary'} />
                    <div>
                      <p className="text-xs font-bold text-content-primary">{rec.name}</p>
                      <p className="text-[9px] text-content-tertiary">SLA: {rec.sla} Days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-content-primary">₹ {rec.cost.toFixed(2)}</p>
                    <p className="text-[9px] text-content-tertiary uppercase">Billed: {rec.billedWeight.toFixed(2)}kg</p>
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
