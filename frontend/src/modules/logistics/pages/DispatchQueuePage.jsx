import React, { useState, useEffect } from 'react';
import { 
  RiTruckLine, 
  RiPrinterLine, 
  RiFilePaperLine, 
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiInformationLine,
  RiTimeLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Modal, useModal 
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function DispatchQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: activeShipment } = useModal();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.getDispatchQueue();
      if (res.success) setQueue(res.data);
    } catch (error) {
      toast.error('Failed to load dispatch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      toast.loading('Confirming dispatch handover...');
      const res = await logisticsService.dispatchShipment(id);
      if (res.success) {
        toast.dismiss();
        toast.success('Shipment dispatched and tracking activated');
        fetchQueue();
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Dispatch failed');
    }
  };

  const columns = [
    { key: 'podNumber', label: 'POD Number', render: (val) => <span className="font-mono font-bold text-brand-teal">{val}</span> },
    { key: 'recipient', label: 'Recipient', render: (val) => (
      <div>
        <p className="text-sm font-bold text-content-primary">{val?.businessName || val?.name}</p>
        <p className="text-[10px] text-content-tertiary">{val?.location}</p>
      </div>
    )},
    { key: 'carrierId', label: 'Carrier', render: (val) => (
      <div>
        <p className="text-xs font-bold text-content-primary">{val?.name || 'N/A'}</p>
        <Badge variant="secondary" className="text-[8px] py-0 mt-1">Ready</Badge>
      </div>
    )},
    { key: 'freightCost', label: 'Freight', render: (val) => (
      <span className="text-sm font-black text-content-primary">₹ {val?.toFixed(2)}</span>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="xs" icon={RiPrinterLine} onClick={() => toast.success('Sending to printer...')}>Label</Button>
        <Button variant="secondary" size="xs" icon={RiFilePaperLine} onClick={() => open(row)}>POD</Button>
        <Button size="xs" icon={RiTruckLine} onClick={() => handleDispatch(row._id)}>Handover</Button>
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Dispatch Operations Queue" 
        subtitle="Final document verification and carrier handover desk"
      >
        <RiTruckLine className="w-8 h-8 text-brand-teal opacity-50" />
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <CardTitle>Ready for Handover</CardTitle>
              <CardDescription>Shipments that are packed and carrier-assigned</CardDescription>
            </div>
            <Button size="sm" variant="secondary" icon={RiPrinterLine}>Bulk Print Labels</Button>
          </div>
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
        size="md"
        title="Proof of Delivery (POD) Document"
      >
        <div className="p-6 border-2 border-dashed border-border bg-white text-black font-sans">
          {/* Mock POD Document */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">OGUN LOGISTICS</h2>
              <p className="text-[8px] font-bold">SHIPMENT INTELLIGENCE NETWORK</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase">POD NUMBER</p>
              <h3 className="text-xl font-black">{activeShipment?.podNumber}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Sender</p>
              <p className="text-xs font-black uppercase">Central Logistics Hub</p>
              <p className="text-[10px]">Admin Authority HQ</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Recipient</p>
              <p className="text-xs font-black uppercase">{activeShipment?.recipient?.businessName}</p>
              <p className="text-[10px]">{activeShipment?.recipient?.location}</p>
            </div>
          </div>

          <div className="border-2 border-black p-4 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase">Weight</p>
                <p className="text-sm font-black">{activeShipment?.billedWeight?.toFixed(2)} KG</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase">Carrier</p>
                <p className="text-sm font-black uppercase">{activeShipment?.carrierId?.name}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase">Date</p>
                <p className="text-sm font-black">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12">
            <div className="border-t border-black pt-2">
              <p className="text-[8px] font-bold text-center uppercase">Carrier Signature</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="text-[8px] font-bold text-center uppercase">Recipient Seal & Sign</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" icon={RiPrinterLine}>Print POD</Button>
          <Button onClick={close}>Close</Button>
        </div>
      </Modal>

      <div className="mt-8 grid grid-cols-3 gap-6 opacity-60">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center text-content-tertiary">
            <RiTimeLine />
          </div>
          <div>
            <p className="text-[10px] font-bold text-content-tertiary uppercase">Avg Dispatch Lag</p>
            <p className="text-sm font-black">1.2 Hrs</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center text-content-tertiary">
            <RiFilePaperLine />
          </div>
          <div>
            <p className="text-[10px] font-bold text-content-tertiary uppercase">PODs Generated</p>
            <p className="text-sm font-black">1,240</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center text-content-tertiary">
            <RiInformationLine />
          </div>
          <p className="text-[10px] text-content-tertiary leading-tight italic">Always verify recipient seal before closing the POD in the digital system.</p>
        </div>
      </div>
    </div>
  );
}
