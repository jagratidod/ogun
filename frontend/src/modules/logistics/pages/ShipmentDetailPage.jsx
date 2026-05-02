import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiTruckLine, RiArrowLeftLine, RiMapPinLine, RiHistoryLine, 
  RiCheckDoubleLine, RiTimeLine, RiAlertLine, RiUserLine 
} from 'react-icons/ri';
import { PageHeader, Card, Button, Badge, formatDateTime, Select, Modal, useModal } from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close } = useModal();
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [updateData, setUpdateData] = useState({ status: '', location: '', note: '' });

  useEffect(() => {
    fetchShipment();
    fetchAgents();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.getTrackingInfo(id);
      if (res.success) {
        setShipment(res.data);
        setUpdateData({ ...updateData, status: res.data.status });
      }
    } catch (error) {
      toast.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await logisticsService.getAgents();
      if (res.success) setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch agents');
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent) return toast.error('Please select an agent');
    try {
      const res = await logisticsService.assignAgent(shipment._id, selectedAgent);
      if (res.success) {
        toast.success('Agent assigned to shipment');
        fetchShipment();
        setShowAssignModal(false);
      }
    } catch (error) {
      toast.error('Failed to assign agent');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await logisticsService.updateShipmentStatus(shipment._id, updateData);
      if (res.success) {
        toast.success('Shipment status updated');
        fetchShipment();
        close();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading shipment data...</div>;
  if (!shipment) return <div className="p-8 text-center text-danger">Shipment not found.</div>;

  return (
    <div className="page-container max-w-6xl mx-auto">
      <PageHeader
        title={`Shipment ${shipment.shipmentId}`}
        subtitle={`Monitoring movement between ${shipment.sender?.name || 'Admin'} and ${shipment.recipient?.businessName || shipment.recipient?.name}`}
      >
        <div className="flex gap-2">
           <Button variant="secondary" icon={RiArrowLeftLine} onClick={() => navigate(-1)}>Back</Button>
           <Button icon={RiTruckLine} onClick={open}>Update Status</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Visual Tracking Progress */}
           <Card className="p-8">
              <div className="flex items-center justify-between mb-10">
                 <Badge variant="teal" size="lg">{shipment.status}</Badge>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-content-tertiary uppercase">Tracking ID</p>
                    <p className="text-sm font-mono font-bold text-content-primary">{shipment.trackingNumber || 'Pending'}</p>
                 </div>
              </div>

              <div className="relative flex justify-between items-center mb-12">
                 <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface-secondary -translate-y-1/2 z-0"></div>
                 {['Pending', 'In Transit', 'Out for Delivery', 'Delivered'].map((s, i) => {
                    const isCompleted = shipment.trackingTimeline.some(t => t.status === s) || shipment.status === s;
                    const isActive = shipment.status === s;
                    return (
                       <div key={i} className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${isCompleted ? 'bg-brand-teal' : 'bg-surface-tertiary'}`}>
                             {isCompleted ? <RiCheckDoubleLine className="text-white w-4 h-4" /> : <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className={`absolute -bottom-6 text-[9px] font-black uppercase whitespace-nowrap ${isActive ? 'text-brand-teal' : 'text-content-tertiary'}`}>{s}</span>
                       </div>
                    );
                 })}
              </div>
           </Card>

           {/* Transit History */}
           <Card className="p-8">
              <h3 className="text-sm font-black text-content-primary uppercase tracking-widest mb-8 flex items-center gap-2">
                 <RiHistoryLine className="text-brand-teal" /> Transit Timeline
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {shipment.trackingTimeline.slice().reverse().map((event, idx) => (
                  <div key={idx} className="flex items-start gap-6 relative">
                    <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-4 border-white z-10 shadow-sm ${idx === 0 ? 'bg-brand-teal' : 'bg-surface-tertiary'}`}>
                      <RiTimeLine className={idx === 0 ? 'text-white w-4 h-4' : 'text-content-tertiary w-4 h-4'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <p className="text-sm font-black text-content-primary">{event.status}</p>
                         <span className="text-[10px] text-content-tertiary font-medium">{formatDateTime(event.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-brand-teal font-bold">{event.location}</p>
                      <p className="text-xs text-content-tertiary mt-1">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>

           {/* Manifest */}
           <Card className="p-6">
              <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Package Manifest</h3>
              <div className="border border-border divide-y divide-border">
                {shipment.products.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-surface-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-surface-secondary border border-border flex items-center justify-center overflow-hidden">
                          {item.product?.images?.[0]?.url ? <img src={item.product.images[0].url} className="w-full h-full object-cover" /> : <RiTruckLine className="text-content-tertiary" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-content-primary">{item.product?.name}</p>
                          <p className="text-[10px] text-content-tertiary font-mono">SKU: {item.product?.sku}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-brand-teal">{item.quantity} Units</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6">
              <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Logistics Route</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface-secondary flex items-center justify-center border border-border">
                    <RiMapPinLine className="text-content-tertiary" />
                  </div>
                  <div>
                    <p className="text-[9px] text-content-tertiary uppercase font-bold">Origin</p>
                    <p className="text-xs font-bold text-content-primary">{shipment.sender?.name || 'Central Hub'}</p>
                    <p className="text-[10px] text-content-tertiary leading-tight mt-1">{shipment.sender?.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                    <RiMapPinLine className="text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[9px] text-brand-teal uppercase font-bold">Destination</p>
                    <p className="text-xs font-bold text-content-primary">{shipment.recipient?.businessName || shipment.recipient?.name}</p>
                    <p className="text-[10px] text-content-tertiary leading-tight mt-1">{shipment.recipient?.location}</p>
                  </div>
                </div>
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Assigned Personnel</h3>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center text-content-tertiary">
                    <RiUserLine className="w-6 h-6" />
                 </div>
                 {shipment.assignedAgent ? (
                   <div>
                      <p className="text-sm font-bold text-content-primary">{shipment.assignedAgent.name}</p>
                      <p className="text-[10px] text-content-tertiary">{shipment.assignedAgent.phone}</p>
                   </div>
                 ) : (
                   <div>
                      <p className="text-sm font-bold text-content-tertiary italic">No Agent Assigned</p>
                      <button 
                        onClick={() => setShowAssignModal(true)}
                        className="text-[10px] font-black text-brand-teal uppercase mt-1 hover:underline"
                      >
                        Assign Now
                      </button>
                   </div>
                 )}
              </div>
           </Card>

           <div className="p-6 bg-state-info/5 border border-state-info/20">
              <h4 className="text-[10px] font-black text-state-info uppercase mb-2 flex items-center gap-2">
                 <RiAlertLine /> Operational Note
              </h4>
              <p className="text-[11px] text-state-info leading-normal italic">
                 {shipment.notes || "No special handling instructions provided for this consignment."}
              </p>
           </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Update Shipment Status"
        size="md"
      >
        <div className="space-y-6 py-4">
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-content-tertiary uppercase mb-1.5">New Status</label>
                 <Select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    options={[
                       { label: 'Pending', value: 'Pending' },
                       { label: 'In Transit', value: 'In Transit' },
                       { label: 'Out for Delivery', value: 'Out for Delivery' },
                       { label: 'Delivered', value: 'Delivered' },
                       { label: 'Cancelled', value: 'Cancelled' },
                    ]}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-content-tertiary uppercase mb-1.5">Current Location</label>
                 <Input 
                   placeholder="e.g. Nagpur Hub, In Transit..." 
                   value={updateData.location}
                   onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-content-tertiary uppercase mb-1.5">Log / Note</label>
                 <textarea
                   className="w-full bg-surface-secondary border border-border p-3 text-sm focus:outline-none focus:border-brand-teal min-h-[80px]"
                   placeholder="Enter details about this status change..."
                   value={updateData.note}
                   onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                 ></textarea>
              </div>
           </div>
           <div className="pt-6 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={handleUpdateStatus} icon={RiCheckDoubleLine}>Update Milestone</Button>
           </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Delivery Agent"
        size="md"
      >
        <div className="space-y-6 py-4">
           <div className="space-y-3">
              <label className="block text-[10px] font-black text-content-tertiary uppercase mb-1.5">Select Available Agent</label>
              <div className="max-h-[300px] overflow-y-auto border border-border divide-y divide-border">
                {agents.length > 0 ? agents.map((agent) => (
                  <div 
                    key={agent._id} 
                    onClick={() => setSelectedAgent(agent._id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${selectedAgent === agent._id ? 'bg-brand-teal/10 border-l-4 border-brand-teal' : 'hover:bg-surface-secondary'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-secondary rounded-full flex items-center justify-center text-content-tertiary">
                        <RiUserLine />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-content-primary">{agent.name}</p>
                        <p className="text-[10px] text-content-tertiary">{agent.location || 'Hub Area'}</p>
                      </div>
                    </div>
                    {selectedAgent === agent._id && <RiCheckDoubleLine className="text-brand-teal" />}
                  </div>
                )) : (
                  <div className="p-8 text-center text-content-tertiary text-xs italic">No agents registered in system.</div>
                )}
              </div>
           </div>
           <div className="pt-6 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button onClick={handleAssignAgent} icon={RiTruckLine} disabled={!selectedAgent}>Confirm Assignment</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
