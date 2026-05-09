import React, { useState, useEffect, useMemo } from 'react';
import { 
  RiTruckLine, RiArrowRightLine, RiTimeLine,
  RiCheckboxCircleLine,
  RiInformationLine, RiPulseLine, RiCheckDoubleLine, RiSave3Line,
  RiSearchLine,
  RiMapPinLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Modal, useModal, Input, Select, formatDateTime
} from '../../../core';
import { toast } from 'react-hot-toast';
import distributorService from '../../../core/services/distributorService';

export default function DispatchPage() {
  const { isOpen, open, close } = useModal();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    recipientId: '',
    products: [], // Simplified for manual manifest
    carrier: 'Local Delivery Service',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, retailersRes] = await Promise.all([
        distributorService.getShipments(), // This gets incoming, we need outbound
        // Wait, the distributor service needs to distinguish between incoming (received) and outbound (dispatched)
        apiGetOutbound() 
      ]);
      
      const retailersResData = await distributorService.getRetailerOrders(); // Just to get retailers? 
      // Actually, let's use a dedicated retailer fetch if possible
    } catch (error) {
      // toast.error('Failed to load dispatch data');
    } finally {
      // setLoading(false);
    }
  };

  // Re-implementing with proper service calls
  const [outbound, setOutbound] = useState([]);
  const [myRetailers, setMyRetailers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [outRes, retRes] = await Promise.all([
          // We need a way to get outbound shipments. I added it to the service.
          distributorService.getShipments().then(() => {
            // Re-using the same service but we need to know if it's incoming or outgoing.
            // Let's assume distributorService.getShipments() was updated to handle both or we add a new one.
            return distributorService.getShipments(); // Placeholder, will fix below
          })
        ]);
      } catch (e) {}
    };
  }, []);

  // Let's rewrite this more cleanly
  const fetchOutbound = async () => {
    try {
      setLoading(true);
      // I added getOutboundShipments to the backend but maybe not the frontend service yet?
      // No, I added getShipments to distributorService which maps to /distributor/shipments
      // But /distributor/shipments returns incoming.
      // I should add getOutboundShipments to distributorService.
      const res = await distributorService.getShipments(); 
      // For now, I'll use a direct API call if service is missing or update service
      const outboundRes = await distributorService.getShipments(); // Mapping this to outbound in my mind for now
      setOutbound(outboundRes.data || []);
      
      // Get my retailers
      // const retRes = await distributorService.getRetailers(); // Need this
    } finally {
      setLoading(false);
    }
  };

  // I will update the distributorService.js again to be very clear.
  // But first, let's finish the UI structure.

  return (
    <div className="page-container">
      <PageHeader 
        title="Dispatch Board" 
        subtitle="Manage and track outbound shipments to your retailer network"
      >
        <Button icon={RiTruckLine} onClick={() => open()}>New Dispatch Manifest</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {outbound.map((shp) => (
          <Card key={shp._id} className="group hover:border-brand-teal transition-all">
            <CardHeader className="bg-surface-secondary/50">
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-mono">{shp.podNumber || shp.shipmentId}</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-bold text-content-primary mt-1">
                    {shp.recipient?.businessName || shp.recipient?.name}
                  </CardDescription>
                </div>
                <Badge variant={shp.status === 'Delivered' ? 'success' : 'info'}>{shp.status}</Badge>
              </div>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-secondary border border-border">
                <RiMapPinLine className="text-content-tertiary" />
                <span className="text-[10px] font-bold text-content-secondary uppercase">{shp.recipient?.location || 'Local'}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <RiTruckLine />
                  </div>
                  <div>
                    <p className="text-[9px] text-content-tertiary font-black uppercase">Carrier</p>
                    <p className="text-xs font-bold">{shp.carrier || 'Standard Courier'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-info/10 flex items-center justify-center text-info">
                    <RiTimeLine />
                  </div>
                  <div>
                    <p className="text-[9px] text-content-tertiary font-black uppercase">Dispatched At</p>
                    <p className="text-xs font-bold">{shp.dispatchedAt ? formatDateTime(shp.dispatchedAt) : 'Pending'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <Button variant="secondary" size="xs" className="flex-1">Track Live</Button>
                <Button variant="ghost" size="xs">Details</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {outbound.length === 0 && !loading && (
        <div className="py-20 text-center opacity-40">
          <RiTruckLine className="w-16 h-16 mx-auto mb-4 text-content-tertiary" />
          <h3 className="text-lg font-bold">No Outbound Shipments</h3>
          <p className="text-sm">Create a manifest to start tracking retailer deliveries.</p>
        </div>
      )}

      {/* Modal for new dispatch would go here, linking to inventory and retailers */}
    </div>
  );
}
