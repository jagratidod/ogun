import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCustomerService2Fill, RiTimeFill, RiInformationFill, RiCheckDoubleFill, RiUserFill, RiPhoneFill, RiSettings4Fill, RiArrowRightSLine, RiShieldFill, RiCalendarFill, RiPriceTag3Fill, RiSmartphoneFill, RiShieldStarFill, RiMapPinFill } from 'react-icons/ri';
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
         <div className="pt-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Direct Service Desk</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">Report issues and request professional technician visits</p>
         </div>

         <div className="bg-brand-pink/5 border border-brand-pink/10 p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-start gap-4 pr-12 relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink border border-brand-pink/10">
                  <RiShieldStarFill className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-[13px] font-black text-brand-pink mb-1 uppercase tracking-wider">Express Ticketing Active</h4>
                  <p className="text-[10px] text-gray-500 font-bold leading-normal">As a Gold Partner, your complaints are prioritized for technician assignment within 24 hours.</p>
               </div>
            </div>
         </div>

         <Card className="rounded-[32px] overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle>Issue Specifications</CardTitle>
               <CardDescription>Select product and describe the service requirement</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
               <Select label="Registered Product" options={products.map(p => ({ label: p.name, value: p.id }))} />
               <Select label="Issue Type" options={[
                  { label: 'Motor Issue / Not Working', value: 'mot' },
                  { label: 'Unusual Noise / Vibration', value: 'noi' },
                  { label: 'Spare Part Requirement', value: 'spa' },
                  { label: 'Installation / Demo', value: 'ins' }
               ]} />
               <div className="space-y-1.5 px-0.5">
                  <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Detailed Observation</label>
                  <textarea className="w-full h-32 rounded-2xl bg-gray-50 border border-gray-100 p-4 text-[13px] font-bold text-gray-700 focus:border-brand-pink/30 focus:bg-white focus:shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-normal" placeholder="Please describe exactly what happened..." />
               </div>
               <Input label="Direct Contact Counter" defaultValue="+91 98765-43210" icon={RiPhoneFill} />
            </div>
         </Card>

         <div className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md" onClick={() => toast.success('Address verification complete')}>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-brand-pink border border-gray-100">
                  <RiMapPinFill className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Pick Current Registered</p>
                  <p className="text-[13px] text-gray-800 font-black tracking-tight line-clamp-1">Sakinaka, Andheri East, Mumbai...</p>
               </div>
            </div>
            <RiArrowRightSLine className="w-5 h-5 text-gray-300 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
         </div>

         <div className="pb-8 flex flex-col gap-3 mt-2">
            <Button
               loading={loading}
               onClick={handleSubmit}
               className="w-full h-14 rounded-full font-black text-sm shadow-xl shadow-brand-pink/10"
               variant="danger"
               icon={RiCustomerService2Fill}
            >
               Submit Ticket
            </Button>
            <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest opacity-50 px-6 mt-2">A service advisor will contact you within 2 working hours</p>
         </div>
      </div>
   );
}

