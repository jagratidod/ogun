import React, { useState, useEffect } from 'react';
import { 
  RiTruckLine, 
  RiMapPinLine, 
  RiTimeLine, 
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiInformationLine,
  RiHistoryLine,
  RiPulseLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Input, formatDateTime
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function TrackShipmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!searchTerm) return;

    try {
      setLoading(true);
      const res = await logisticsService.getPublicTracking(searchTerm);
      if (res.success) {
        setTrackingData(res.data);
      } else {
        toast.error('Shipment not found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <PageHeader 
        title="Track Shipments" 
        subtitle="Monitor incoming inventory and stock shipments in real-time"
      >
        <RiTruckLine className="w-8 h-8 text-brand-teal opacity-50" />
      </PageHeader>

      <div className="mb-8">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1 group">
            <RiInformationLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <Input 
              placeholder="Enter POD Number or Shipment ID (e.g. POD-2026-...)" 
              className="pl-10 h-12" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" loading={loading} icon={RiPulseLine}>Track Now</Button>
        </form>
      </div>

      {trackingData ? (
        <div className="space-y-6 animate-slide-up">
          {/* Status Header */}
          <Card className="border-t-4 border-brand-teal">
            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-teal/10 flex items-center justify-center text-brand-teal rounded-none border border-brand-teal/20">
                  <RiTruckLine className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-content-primary">{trackingData.shipment.status}</h2>
                  <p className="text-sm text-content-tertiary">POD: <span className="font-bold text-brand-teal">{trackingData.shipment.podNumber}</span></p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] text-content-tertiary uppercase font-black tracking-widest">Expected Delivery</p>
                <h3 className="text-lg font-bold text-content-primary">Tomorrow, by 6:00 PM</h3>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tracking Timeline */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiHistoryLine className="text-brand-teal" /> Shipment Journey
                </CardTitle>
              </CardHeader>
              <div className="p-8">
                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {trackingData.timeline.map((log, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className={`absolute left-0 top-1 w-6 h-6 border-4 border-white flex items-center justify-center ${idx === 0 ? 'bg-brand-teal' : 'bg-content-tertiary'}`}>
                        <div className="w-2 h-2 bg-white" />
                      </div>
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-bold ${idx === 0 ? 'text-brand-teal' : 'text-content-primary'}`}>{log.status}</h4>
                          <span className="text-[10px] text-content-tertiary font-mono">{formatDateTime(log.timestamp)}</span>
                        </div>
                        <p className="text-xs text-content-secondary mt-0.5 flex items-center gap-1">
                          <RiMapPinLine className="w-3 h-3" /> {log.location}
                        </p>
                        {log.remarks && (
                          <p className="text-[11px] text-content-tertiary italic mt-1 leading-relaxed">"{log.remarks}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Shipment Detail */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Carrier Info</CardTitle>
                </CardHeader>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] text-content-tertiary uppercase font-black">Partner</p>
                    <p className="text-sm font-bold text-brand-teal">{trackingData.shipment.carrierId?.name || 'Local Logistics'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-content-tertiary uppercase font-black">Tracking ID</p>
                    <p className="text-sm font-mono">{trackingData.shipment.trackingNumber || 'Manual Tracking'}</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" icon={RiArrowRightLine}>Carrier Website</Button>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipment Context</CardTitle>
                </CardHeader>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-content-tertiary">Sender</span>
                    <span className="text-xs font-bold">{trackingData.shipment.sender?.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-content-tertiary">Billed Weight</span>
                    <span className="text-xs font-bold">{trackingData.shipment.billedWeight || 0} Kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-content-tertiary">Package Units</span>
                    <span className="text-xs font-bold">{trackingData.shipment.products?.reduce((acc, p) => acc + p.quantity, 0)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center opacity-30">
          <RiPulseLine className="w-16 h-16 mx-auto mb-4 text-content-tertiary animate-pulse" />
          <h3 className="text-lg font-bold">Awaiting Intelligence</h3>
          <p className="text-sm max-w-xs mx-auto">Search for an active shipment POD to see its real-time location and lifecycle status.</p>
        </div>
      )}
    </div>
  );
}
