import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCustomerService2Fill, RiTimeFill, RiInformationFill, RiCheckDoubleFill, RiUserFill, RiPhoneFill, RiSettings4Fill, RiArrowRightSLine, RiShieldFill, RiCalendarFill, RiPriceTag3Fill, RiSmartphoneFill, RiShieldStarFill, RiMapPinFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, Combobox, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';
import { toast } from 'react-hot-toast';

export default function RaiseComplaintPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const { products } = customerData;

   const [product, setProduct] = useState(null);
   const [issueType, setIssueType] = useState(null);

   const issueTypes = [
      { label: 'Motor Issue / Not Working', value: 'mot' },
      { label: 'Unusual Noise / Vibration', value: 'noi' },
      { label: 'Spare Part Requirement', value: 'spa' },
      { label: 'Installation / Demo', value: 'ins' }
   ];

   const handleSubmit = () => {
      setLoading(true);
      setTimeout(() => {
         setLoading(false);
         toast.success('Service ticket submitted successfully!');
         navigate('/customer/service');
      }, 1500);
   };

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-4">
         <div className="pt-1">
            <h2 className="text-lg font-black text-gray-800 tracking-tight leading-none">Priority Ticket</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest opacity-60">Professional Support Desk</p>
         </div>

         <div className="bg-brand-pink/5 border border-brand-pink/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 pr-10 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink border border-brand-pink/10">
                  <RiShieldStarFill className="w-5 h-5 transition-transform group-hover:scale-110 duration-500" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-brand-pink mb-0.5 uppercase tracking-wider leading-none">Express Ticketing Active</h4>
                  <p className="text-[9px] text-gray-500 font-bold leading-tight">Gold Partner: Priority assignment within 24 hours.</p>
               </div>
            </div>
         </div>

         <Card className="rounded-[28px] overflow-hidden border-gray-50">
            <div className="p-5 space-y-4">
               <Combobox 
                  label="Registered Product" 
                  options={products.map(p => ({ label: p.name, value: p.id }))} 
                  value={product}
                  onChange={setProduct}
                  placeholder="Select Appliance..."
               />
               
               <Combobox 
                  label="Issue Category" 
                  options={issueTypes}
                  value={issueType}
                  onChange={setIssueType}
                  placeholder="What's wrong?"
               />

               <div className="space-y-1">
                  <label className="text-sm font-medium text-content-secondary px-1">Observation</label>
                  <textarea 
                     className="w-full h-24 rounded-2xl bg-white border border-gray-100 p-3.5 text-[13px] font-bold text-gray-700 focus:border-brand-pink/30 focus:shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-normal" 
                     placeholder="Describe the issue briefly..." 
                  />
               </div>
               
               <Input label="Direct Contact" defaultValue="+91 98765-43210" icon={RiPhoneFill} />
            </div>
         </Card>

         <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm" onClick={() => toast.success('Address confirmed')}>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-pink border border-gray-100 group-hover:bg-brand-pink/5 transition-all">
                  <RiMapPinFill className="w-5 h-5" />
               </div>
               <div className="flex flex-col">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Service Location</p>
                  <p className="text-[12px] text-gray-800 font-black tracking-tight line-clamp-1">Sakinaka, Andheri East, Mumbai...</p>
               </div>
            </div>
            <RiArrowRightSLine className="w-4 h-4 text-gray-300 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
         </div>

         <div className="pb-8 flex flex-col gap-3">
            <Button
               loading={loading}
               onClick={handleSubmit}
               className="w-full h-12 rounded-full font-black text-sm shadow-xl shadow-brand-pink/20 bg-brand-pink text-white hover:bg-brand-pink/90 border-none"
               icon={RiCustomerService2Fill}
            >
               Request Technician
            </Button>
            <div className="flex items-center justify-center gap-2 opacity-40">
               <RiTimeFill className="w-3 h-3 text-brand-pink" />
               <p className="text-[8px] text-center font-bold text-gray-400 uppercase tracking-widest">Callback within 2 working hours</p>
            </div>
         </div>
      </div>
   );
}

