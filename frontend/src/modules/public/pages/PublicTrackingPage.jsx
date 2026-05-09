import React, { useState } from 'react';
import { 
  RiTruckLine, 
  RiMapPinLine, 
  RiTimeLine, 
  RiPulseLine,
  RiHistoryLine,
  RiShieldCheckLine,
  RiArrowRightLine
} from 'react-icons/ri';
import { Button, Input, Badge, formatDateTime } from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function PublicTrackingPage() {
  const [identifier, setIdentifier] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!identifier) return;

    try {
      setLoading(true);
      const res = await logisticsService.getPublicTracking(identifier);
      if (res.success) {
        setData(res.data);
      } else {
        toast.error('No shipment found with this ID');
      }
    } catch (error) {
      toast.error('Tracking service is currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary selection:bg-brand-teal selection:text-white">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-teal flex items-center justify-center text-white font-black italic">O</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">OGUN <span className="text-brand-teal">LOGISTICS</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-content-tertiary hover:text-brand-teal">SUPPORT</a>
            <a href="#" className="text-xs font-bold text-content-tertiary hover:text-brand-teal">NETWORK</a>
            <Button variant="secondary" size="sm">LOGIN</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-content-primary tracking-tight mb-4">
            Track Your <span className="text-brand-teal">Shipment</span>
          </h2>
          <p className="text-content-tertiary max-w-lg mx-auto">
            Enter your POD Number, Shipment ID or Tracking Number to see real-time updates from our intelligent logistics network.
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-2 md:p-4 mb-12 shadow-2xl shadow-brand-teal/5 border-2 border-brand-teal/20">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal" />
              <Input 
                placeholder="POD-2026-XXXXXX" 
                className="pl-12 h-14 text-lg border-none bg-surface-secondary/50 focus:bg-white transition-all"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <Button type="submit" size="xl" className="h-14 px-8" loading={loading} icon={RiPulseLine}>TRACK STATUS</Button>
          </form>
        </div>

        {data ? (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Status */}
              <div className="md:col-span-2 space-y-6">
                <div className="glass-card overflow-hidden">
                  <div className="bg-brand-teal p-6 text-white flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Current Status</p>
                      <h3 className="text-2xl font-black">{data.shipment.status}</h3>
                    </div>
                    <RiTruckLine className="w-12 h-12 opacity-20" />
                  </div>
                  <div className="p-8">
                    <div className="relative space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {data.timeline.map((log, idx) => (
                        <div key={idx} className="relative pl-10">
                          <div className={`absolute left-0 top-1 w-6 h-6 border-4 border-white flex items-center justify-center ${idx === 0 ? 'bg-brand-teal' : 'bg-content-tertiary'}`}>
                            <div className="w-2 h-2 bg-white" />
                          </div>
                          <div className="flex flex-col md:flex-row md:justify-between gap-1">
                            <div>
                              <h4 className={`text-sm font-bold ${idx === 0 ? 'text-brand-teal' : 'text-content-primary'}`}>{log.status}</h4>
                              <p className="text-xs text-content-tertiary flex items-center gap-1 mt-0.5">
                                <RiMapPinLine className="w-3 h-3" /> {log.location}
                              </p>
                            </div>
                            <span className="text-[10px] text-content-tertiary font-mono">{formatDateTime(log.timestamp)}</span>
                          </div>
                          {log.remarks && (
                            <p className="text-[11px] text-content-secondary italic mt-2 bg-surface-secondary p-2 border-l-2 border-brand-teal/20">"{log.remarks}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RiShieldCheckLine className="text-brand-teal" /> Verified Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-content-tertiary font-black uppercase">POD Number</p>
                      <p className="text-sm font-bold text-brand-teal font-mono">{data.shipment.podNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-content-tertiary font-black uppercase">Carrier Partner</p>
                      <p className="text-sm font-bold">{data.shipment.carrierId?.name || 'Local Transit'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-content-tertiary font-black uppercase">Est. Delivery</p>
                      <p className="text-sm font-bold">In 2 Days</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 bg-surface-secondary/50 border-dashed border-2">
                  <p className="text-[11px] text-content-tertiary leading-relaxed mb-4">
                    Having trouble with your delivery? Raise a ticket or contact support.
                  </p>
                  <Button variant="secondary" size="xs" className="w-full" icon={RiArrowRightLine}>CONTACT SUPPORT</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-50 mt-20">
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-secondary mx-auto mb-4 flex items-center justify-center">
                <RiPulseLine className="text-brand-teal" />
              </div>
              <h4 className="text-xs font-bold uppercase mb-1">Real-time</h4>
              <p className="text-[10px]">Live updates from the field</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-secondary mx-auto mb-4 flex items-center justify-center">
                <RiHistoryLine className="text-brand-teal" />
              </div>
              <h4 className="text-xs font-bold uppercase mb-1">Full History</h4>
              <p className="text-[10px]">Complete journey visibility</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-surface-secondary mx-auto mb-4 flex items-center justify-center">
                <RiShieldCheckLine className="text-brand-teal" />
              </div>
              <h4 className="text-xs font-bold uppercase mb-1">Verified</h4>
              <p className="text-[10px]">Tamper-proof POD system</p>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-content-tertiary uppercase tracking-[0.2em]">Powered by OGUN Shipment Intelligence Layer</p>
          <p className="text-[9px] text-content-tertiary mt-2">© 2026 OGUN ECOSYSTEM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

// Internal icon fix if not imported correctly
const RiSearchLine = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fill="none" d="M0 0h24v24H0z"></path><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0111 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 01-1.969 5.617zm-2.006-.742A6.977 6.977 0 0018 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 004.875-1.975l.15-.15z"></path></svg>
);
