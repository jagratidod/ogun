import { useState } from 'react';
import { 
  RiTruckLine, RiArrowRightLine, RiTimeLine, 
  RiMapPinLine, RiCheckboxCircleLine, RiUserLine, 
  RiStore2Line, RiInformationLine, RiPulseLine, RiCheckDoubleLine, RiSave3Line 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, EmptyState, Modal, useModal, Input, Select 
} from '../../../core';
import { toast } from 'react-hot-toast';

export default function DispatchPage() {
  const { isOpen, open, close, data: selectedShipment } = useModal();
  const [loading, setLoading] = useState(false);

  const shipments = [
    { id: 'SHP-001', retailer: 'Priya Kitchen World', items: 12, status: 'In Transit', carrier: 'Bluedart Service', eta: 'Tomorrow, 10:00 AM' },
    { id: 'SHP-002', retailer: 'HomeChef Appliances', items: 5, status: 'Out for Delivery', carrier: 'Local Express', eta: 'Today, 2:00 PM' }
  ];

  const handleManifest = () => {
    setLoading(true);
    toast.loading('Saving cargo manifest...');
    setTimeout(() => {
       toast.dismiss();
       toast.success('Manifest saved and carrier notified.');
       setLoading(false);
       close();
    }, 1500);
  };

  const handleManualDelivery = (id) => {
    toast.success(`Shipment ${id} marked as DELIVERED manually.`);
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Dispatch Board" 
        subtitle="Track and manage outgoing shipments and logistics carrier status"
      >
        <Button icon={RiTruckLine} onClick={() => open({ type: 'new' })}>Add Cargo Manifest</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {shipments.map(shp => (
            <Card key={shp.id} className="animate-slide-up group border-border hover:border-brand-teal transition-all">
               <CardHeader className="bg-surface-elevated/40">
                  <div className="flex items-center justify-between w-full">
                     <div>
                        <CardTitle>{shp.id}</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider">{shp.retailer}</CardDescription>
                     </div>
                     <Badge status={shp.status.toLowerCase()}>{shp.status}</Badge>
                  </div>
               </CardHeader>
               <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-none bg-surface-elevated border border-border group-hover:bg-brand-teal group-hover:text-white transition-all group-hover:border-brand-teal">
                     <div className="flex items-center gap-3">
                        <RiTimeLine className="text-brand-teal w-5 h-5 flex-shrink-0 group-hover:text-white" />
                        <div>
                           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest group-hover:text-white/60">Expected Delivery</p>
                           <h4 className="text-sm font-bold text-content-primary group-hover:text-white">{shp.eta}</h4>
                        </div>
                     </div>
                     <RiArrowRightLine className="text-content-tertiary w-5 h-5 group-hover:text-white" />
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center text-brand-teal flex-shrink-0">
                           <RiTruckLine className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs text-brand-teal font-bold tracking-widest uppercase">Assigned Carrier</p>
                           <h4 className="text-sm font-bold text-content-primary">{shp.carrier}</h4>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center text-state-info flex-shrink-0">
                           <RiPulseLine className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs text-state-info font-bold tracking-widest uppercase">Last Update</p>
                           <p className="text-[11px] text-content-secondary line-clamp-1 italic">"Package scanned at Mumbai Sorting Facility center"</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-border flex gap-2">
                     <Button className="flex-1" variant="secondary" size="sm" icon={RiInformationLine} onClick={() => toast.info(`Live tracking SHP: ${shp.id}`)}>Track Live</Button>
                     <Button variant="ghost" size="sm" icon={RiCheckboxCircleLine} onClick={() => handleManualDelivery(shp.id)}>Force Deliver</Button>
                  </div>
               </div>
            </Card>
         ))}
      </div>

      <div className="mt-8 text-center glass-card p-6 border-dashed border-2 border-border opacity-60">
         <RiInformationLine className="w-12 h-12 text-content-tertiary mx-auto mb-2 opacity-50" />
         <p className="text-sm text-content-tertiary font-medium">To dispatch pending orders, please visit the Inbound Requests page and approve eligible retailer applications.</p>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title="Add New Cargo Manifest"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiSave3Line} onClick={handleManifest} loading={loading}>Save & Publish</Button>
           </div>
        }
      >
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <Select label="Partner Store" options={[{ label: 'Priya Kitchen World', value: 'pk' }, { label: 'HomeChef', value: 'hc' }]} />
              <Input label="Truck Registration" placeholder="MH-XX-XXXX" />
           </div>
           <Input label="Carrier Detail" defaultValue="Local Delivery Service" />
           <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 flex items-center gap-3">
              <RiCheckDoubleLine className="text-brand-teal w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] text-brand-teal leading-normal">Approved retailers for this cargo will be notified instantly for incoming stock.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
