import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCustomerServiceLine, RiTimeLine, RiInformationLine, RiCheckDoubleLine, RiUserLine, RiPhoneLine, RiSettings4Line, RiArrowRightSLine, RiShieldLine, RiCalendarLine, RiPriceTag3Line, RiSmartphoneLine, RiShieldStarLine, RiMapPinLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';
import { toast } from 'react-hot-toast';

export default function RaiseComplaintPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { products } = customerData;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Service ticket submitted successfully!');
      navigate('/customer/service');
    }, 1500);
  };

  return (
    <div className="page-container max-w-lg mx-auto flex flex-col gap-6">
      <PageHeader 
        title="Direct Service Desk" 
        subtitle="Report issues and request professional technician visits for your appliances"
      />

      <div className="bg-brand-pink/5 border border-brand-pink/20 p-6 rounded-none relative overflow-hidden group">
         <div className="flex items-start gap-4 pr-12 relative z-10">
            <div className="w-12 h-12 rounded-none bg-brand-pink/15 flex items-center justify-center text-brand-pink">
               <RiShieldStarLine className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-sm font-black text-brand-pink mb-1 tracking-tight">Express Ticketing Active</h4>
               <p className="text-[10px] text-content-secondary leading-normal">As a Gold Partner, your complaints are prioritized for technician assignment within 24 hours.</p>
            </div>
         </div>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Issue Specifications</CardTitle>
            <CardDescription>Select product and describe the service requirement</CardDescription>
         </CardHeader>
         <div className="p-6 space-y-4">
            <Select label="Registered Product" options={products.map(p => ({ label: p.name, value: p.id }))} />
            <Select label="Issue Type" options={[
               { label: 'Motor Issue / Not Working', value: 'mot' },
               { label: 'Unusual Noise / Vibration', value: 'noi' },
               { label: 'Spare Part Requirement', value: 'spa' },
               { label: 'Installation / Demo', value: 'ins' }
            ]} />
             <div className="space-y-1.5 px-1">
                <label className="text-[11px] text-content-tertiary font-bold uppercase tracking-widest leading-none pl-1">Detailed Observation</label>
                <textarea className="w-full h-32 rounded-none bg-surface-input border border-border p-4 text-xs text-content-primary focus:border-brand-pink outline-none transition-all placeholder:text-content-tertiary/50" placeholder="Please describe exactly what happened..." />
             </div>
             <Input label="Direct Contact Counter" defaultValue="+91 98765-43210" icon={RiPhoneLine} />
         </div>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle>Address Verification</CardTitle>
         </CardHeader>
         <div className="p-6">
            <div className="p-4 rounded-none border border-dashed border-border flex items-center justify-between group active:scale-95 transition-all outline-none">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center text-brand-pink">
                     <RiMapPinLine className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">Pick Current Registered</p>
                     <p className="text-[11px] text-content-primary font-bold line-clamp-1">Sakinaka, Andheri East, Mumbai...</p>
                  </div>
               </div>
               <RiArrowRightSLine className="w-5 h-5 text-content-tertiary" />
            </div>
         </div>
      </Card>

      <div className="pb-8 flex flex-col gap-3">
         <Button 
           loading={loading}
           onClick={handleSubmit}
           className="w-full h-14 rounded-none font-black text-sm shadow-glow" 
           variant="danger" 
           icon={RiCustomerServiceLine}
         >
           Submit Ticket
         </Button>
         <p className="text-[10px] text-center font-medium opacity-50 px-6">A service advisor will contact you within 2 working hours after successful submission.</p>
      </div>
    </div>
  );
}

