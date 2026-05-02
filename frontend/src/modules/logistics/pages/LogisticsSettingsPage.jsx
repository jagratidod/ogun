import { useState } from 'react';
import { 
  RiSettings3Line, RiShieldLine, RiTruckLine, RiNotification3Line,
  RiMapPinLine, RiGlobalLine, RiSaveLine, RiDeleteBinLine, RiAddLine
} from 'react-icons/ri';
import { PageHeader, Card, Button, Input, Select, Badge } from '../../../core';
import { toast } from 'react-hot-toast';

export default function LogisticsSettingsPage() {
  const [carriers, setCarriers] = useState([
    { name: 'Blue Dart', type: 'Primary', status: 'Active' },
    { name: 'FedEx', type: 'Secondary', status: 'Active' },
    { name: 'Local Fleet', type: 'Internal', status: 'Active' },
  ]);

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader
        title="Logistics Configuration"
        subtitle="Manage carrier partners, transit protocols, and system alert thresholds"
      >
        <Button icon={RiSaveLine} onClick={() => toast.success('Logistics settings updated')}>Apply Changes</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Carrier Partners */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-content-primary uppercase tracking-widest flex items-center gap-2">
                 <RiTruckLine className="text-brand-teal" /> Carrier Partners
               </h3>
               <Button size="xs" variant="secondary" icon={RiAddLine}>Add Partner</Button>
            </div>
            <div className="border border-border divide-y divide-border">
               {carriers.map((c, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface-secondary border border-border flex items-center justify-center">
                          <RiGlobalLine className="text-content-tertiary" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-content-primary">{c.name}</p>
                          <Badge variant="secondary" className="text-[8px]">{c.type}</Badge>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Badge variant="success" size="sm">{c.status}</Badge>
                       <button className="text-content-tertiary hover:text-danger p-1"><RiDeleteBinLine /></button>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Alert Thresholds */}
          <Card className="p-6">
            <h3 className="text-sm font-black text-content-primary uppercase tracking-widest flex items-center gap-2 mb-6">
              <RiNotification3Line className="text-warning" /> Operational Alert Thresholds
            </h3>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-content-tertiary uppercase">In-Transit Delay Alert (Hrs)</label>
                  <Input type="number" defaultValue="48" />
                  <p className="text-[9px] text-content-tertiary italic">Notify manager if shipment is stagnant for this duration.</p>
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-content-tertiary uppercase">Critical Stock Threshold (Units)</label>
                  <Input type="number" defaultValue="10" />
                  <p className="text-[9px] text-content-tertiary italic">Triggers urgent restock request status across nodes.</p>
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-content-tertiary uppercase">Max Delivery Attempts</label>
                  <Input type="number" defaultValue="3" />
                  <p className="text-[9px] text-content-tertiary italic">Reroute to origin after this many failed attempts.</p>
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-content-tertiary uppercase">Fulfillment Window (Mins)</label>
                  <Input type="number" defaultValue="120" />
                  <p className="text-[9px] text-content-tertiary italic">Expected time from order confirm to dispatch readiness.</p>
               </div>
            </div>
          </Card>

          {/* Regional Hubs */}
          <Card className="p-6">
             <h3 className="text-sm font-black text-content-primary uppercase tracking-widest flex items-center gap-2 mb-6">
               <RiMapPinLine className="text-info" /> Regional Hub Definitions
             </h3>
             <div className="space-y-3">
                {['North (Delhi)', 'West (Mumbai)', 'East (Kolkata)', 'South (Bangalore)'].map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-secondary border border-border">
                     <span className="text-xs font-bold text-content-primary">{h}</span>
                     <Button size="xs" variant="secondary">Manage Nodes</Button>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
             <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Security Protocols</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-content-secondary">Enforce Proof of Delivery</span>
                   <div className="w-10 h-5 bg-brand-teal rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-content-secondary">Digitized Waybills</span>
                   <div className="w-10 h-5 bg-brand-teal rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-content-secondary">Live Agent Tracking</span>
                   <div className="w-10 h-5 bg-surface-tertiary rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
             </div>
          </Card>

          <div className="p-6 bg-brand-teal/5 border border-brand-teal/20 space-y-4">
             <RiShieldLine className="w-10 h-10 text-brand-teal" />
             <h4 className="text-sm font-black text-brand-teal uppercase">Auto-Rebalancing</h4>
             <p className="text-[11px] text-content-secondary leading-relaxed">
               The system is configured to automatically suggest inventory transfers between nodes when stock levels drop below 15% of monthly average.
             </p>
             <Button variant="secondary" className="w-full border-brand-teal/30 text-brand-teal hover:bg-brand-teal/5">Rebalance Rules</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
