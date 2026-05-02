import { useState } from 'react';
import { 
  RiSearchLine, RiCompass3Fill, RiTruckLine, RiCheckDoubleLine, 
  RiTimeLine, RiMapPinLine, RiHistoryLine 
} from 'react-icons/ri';
import { PageHeader, Card, Input, Button, Badge, formatDateTime } from '../../../core';

export default function TrackingPage() {
  const [searchId, setSearchId] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId) return;
    // Mock tracking data
    setTrackingData({
      id: searchId,
      status: 'In Transit',
      carrier: 'Blue Dart Logistics',
      trackingNo: 'BD-9982716',
      origin: 'Mumbai Central Hub',
      destination: 'Pune Distribution Center',
      eta: '2026-05-02T18:00:00Z',
      history: [
        { status: 'Order Processed', location: 'Mumbai Central Hub', time: '2026-04-30T10:00:00Z' },
        { status: 'Dispatched', location: 'Mumbai Central Hub', time: '2026-04-30T14:30:00Z' },
        { status: 'In Transit', location: 'Nagpur Transit Point', time: '2026-05-01T09:15:00Z' },
      ]
    });
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader
        title="Global Asset Tracking"
        subtitle="Real-time visibility into any unit moving across the national supply chain"
      />

      <Card className="p-8 mb-8 bg-brand-teal/5 border-brand-teal/20">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal w-5 h-5" />
            <Input
              placeholder="Enter Shipment ID, Order ID or AWB Tracking Number..."
              className="pl-12 h-14 text-lg border-brand-teal/30 focus:border-brand-teal"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-14 px-10 text-lg" icon={RiCompass3Fill}>Locate Unit</Button>
        </form>
      </Card>

      {trackingData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Visualizer */}
            <Card className="p-8 relative overflow-hidden">
              <RiTruckLine className="absolute -right-8 -bottom-8 w-48 h-48 text-brand-teal/5 -rotate-12" />
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Live Status</p>
                  <h2 className="text-3xl font-black text-brand-teal">{trackingData.status}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Estimated Arrival</p>
                  <p className="text-lg font-bold text-content-primary">{formatDateTime(trackingData.eta)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-surface-secondary mb-12">
                <div className="absolute top-0 left-0 h-full bg-brand-teal w-[66%] transition-all duration-1000"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-brand-teal rounded-full border-4 border-white shadow-sm"></div>
                <div className="absolute top-1/2 left-[33%] -translate-y-1/2 w-4 h-4 bg-brand-teal rounded-full border-4 border-white shadow-sm"></div>
                <div className="absolute top-1/2 left-[66%] -translate-y-1/2 w-6 h-6 bg-brand-teal rounded-full border-4 border-white shadow-md ring-4 ring-brand-teal/20"></div>
                <div className="absolute top-1/2 left-[100%] -translate-y-1/2 w-4 h-4 bg-surface-tertiary rounded-full border-4 border-white shadow-sm"></div>
              </div>

              <div className="grid grid-cols-4 text-center">
                <span className="text-[9px] font-black text-brand-teal uppercase">Booked</span>
                <span className="text-[9px] font-black text-brand-teal uppercase">Dispatched</span>
                <span className="text-[9px] font-black text-brand-teal uppercase">In Transit</span>
                <span className="text-[9px] font-black text-content-tertiary uppercase">Delivered</span>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-8">
              <h3 className="text-sm font-black text-content-primary uppercase tracking-widest mb-8 flex items-center gap-2">
                <RiHistoryLine className="text-brand-teal" /> Shipment Milestones
              </h3>
              <div className="space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {trackingData.history.reverse().map((event, idx) => (
                  <div key={idx} className="flex items-start gap-6 relative">
                    <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-4 border-white z-10 shadow-sm ${idx === 0 ? 'bg-brand-teal' : 'bg-surface-tertiary'}`}>
                      {idx === 0 ? <RiTimeLine className="text-white w-4 h-4" /> : <RiCheckDoubleLine className="text-content-tertiary w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-content-primary">{event.status}</p>
                      <p className="text-[10px] text-brand-teal font-bold mb-1">{event.location}</p>
                      <p className="text-[10px] text-content-tertiary">{formatDateTime(event.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Unit Identification</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] text-content-tertiary uppercase font-bold">Network ID</p>
                  <p className="text-sm font-mono font-black text-content-primary">{trackingData.id}</p>
                </div>
                <div>
                  <p className="text-[9px] text-content-tertiary uppercase font-bold">Carrier Partner</p>
                  <p className="text-sm font-bold text-content-primary">{trackingData.carrier}</p>
                </div>
                <div>
                  <p className="text-[9px] text-content-tertiary uppercase font-bold">Consignment Number</p>
                  <p className="text-sm font-mono font-bold text-brand-teal">{trackingData.trackingNo}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Route Info</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface-secondary flex items-center justify-center border border-border">
                    <RiMapPinLine className="text-content-tertiary" />
                  </div>
                  <div>
                    <p className="text-[9px] text-content-tertiary uppercase font-bold">Origin</p>
                    <p className="text-xs font-bold text-content-primary">{trackingData.origin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                    <RiMapPinLine className="text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[9px] text-brand-teal uppercase font-bold">Destination</p>
                    <p className="text-xs font-bold text-content-primary">{trackingData.destination}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-6 bg-state-info/5 border border-state-info/20">
              <p className="text-[10px] font-black text-state-info uppercase mb-2">Need Assistance?</p>
              <p className="text-[11px] text-state-info leading-normal">
                Contact the logistics desk at 1800-OGUN-LOG for priority overrides or redirection requests.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-surface-secondary flex items-center justify-center mb-6">
            <RiCompass3Fill className="w-12 h-12 text-content-tertiary" />
          </div>
          <h3 className="text-xl font-bold text-content-primary">Ready to Locate</h3>
          <p className="text-content-tertiary max-w-sm mt-2">
            Enter a valid shipment or tracking ID above to visualize the asset's current position and transit history.
          </p>
        </div>
      )}
    </div>
  );
}
