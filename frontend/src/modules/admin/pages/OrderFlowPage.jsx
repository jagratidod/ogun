import { RiNodeTree, RiArrowRightLine, RiTimeLine, RiMapPinLine, RiCheckboxCircleLine, RiTruckLine, RiUserLine, RiStore2Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, Button, EmptyState } from '../../../core';

export default function OrderFlowPage() {
  const lifecycle = [
    { id: 1, name: "Order Placed", description: "Retailer creates a new order/request.", icon: RiStore2Line, status: "completed", date: "2026-04-06 10:30" },
    { id: 2, name: "Approval", description: "Admin reviews and approves the request.", icon: RiUserLine, status: "completed", date: "2026-04-06 11:15" },
    { id: 3, name: "Processing", description: "Distributor prepares shipment from warehouse.", icon: RiTimeLine, status: "active", date: "In Progress" },
    { id: 4, name: "Shipped", description: "Logistics carrier picks up the shipment.", icon: RiTruckLine, status: "pending", date: "TBD" },
    { id: 5, name: "Delivered", description: "Retailer confirms receipt of items.", icon: RiCheckboxCircleLine, status: "pending", date: "TBD" }
  ];

  return (
    <div className="page-container max-w-4xl mx-auto">
      <PageHeader 
        title="Order Lifecycle" 
        subtitle="Visualizing the end-to-end journey of an order"
      >
        <Button variant="secondary" icon={RiNodeTree}>Reset View</Button>
      </PageHeader>

      <Card className="p-8">
        <div className="relative">
          <div className="absolute left-6 top-6 h-full w-0.5 bg-border -z-0" />
          <div className="space-y-12">
            {lifecycle.map((step, idx) => (
               <div key={step.id} className="relative z-10 flex gap-6 group">
                  <div className={`w-12 h-12 rounded-none flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    step.status === 'completed' ? 'bg-state-success shadow-glow-lg' : 
                    step.status === 'active' ? 'bg-brand-teal shadow-glow animate-pulse-glow' : 
                    'bg-surface-input border border-border group-hover:border-content-tertiary'
                  }`}>
                    <step.icon className={`w-5 h-5 ${
                      step.status === 'completed' ? 'text-white' : 
                      step.status === 'active' ? 'text-white' : 
                      'text-content-tertiary'
                    }`} />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3">
                        <h4 className={`text-lg font-bold ${
                          step.id <= 2 ? 'text-content-primary' : 
                          step.status === 'active' ? 'text-brand-teal' : 
                          'text-content-secondary'
                        }`}>{step.name}</h4>
                        {step.status === 'active' && <Badge size="xs" variant="teal">CURRENT</Badge>}
                        {step.status === 'completed' && <RiCheckboxCircleLine className="text-state-success w-5 h-5" />}
                     </div>
                     <p className="text-sm text-content-tertiary mt-1 leading-relaxed">{step.description}</p>
                     <div className="mt-2 text-[10px] text-content-tertiary font-bold tracking-widest uppercase">
                        {step.date}
                     </div>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-8 flex justify-center">
         <div className="glass-card flex items-center gap-4 px-6 py-4">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-state-success" />
               <span className="text-xs text-content-secondary">Completed</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-brand-teal animate-pulse" />
               <span className="text-xs text-content-secondary">Active</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-surface-input border border-border" />
               <span className="text-xs text-content-secondary">Pending</span>
            </div>
         </div>
      </div>
    </div>
  );
}
