import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeFill, RiPriceTag3Fill, RiInformationFill, RiAddCircleFill, RiSmartphoneFill, RiShieldFill, RiCalendarFill, RiStore2Fill, RiMapPinFill, RiHandHeartFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, PageHeader } from '../../../core';
import { toast } from 'react-hot-toast';

export default function RegisterProductPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setSelectedFile(file);
         const url = URL.createObjectURL(file);
         setPreviewUrl(url);
      }
   };

   const handleRegister = () => {
      setLoading(true);
      setTimeout(() => {
         setLoading(false);
         toast.success('Warranty activated successfully!');
         navigate('/customer/products');
      }, 1500);
   };

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-6">
         <div className="pt-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Warranty Activation</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">Register your appliance to activate coverage</p>
         </div>

         <div className="bg-brand-teal/5 border border-brand-teal/10 p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-start gap-4 pr-12 relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal border border-brand-teal/10">
                  <RiShieldFill className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-[13px] font-black text-brand-teal mb-1 uppercase tracking-wider">Ogun Assured Protection</h4>
                  <p className="text-[10px] text-gray-500 font-bold leading-normal">Register within 15 days of purchase to get 1 year additional engine warranty on all Mixer Grinders.</p>
               </div>
            </div>
            <RiVerifiedBadgeFill className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-brand-teal group-hover:scale-110 transition-all duration-700" />
         </div>

         <Card className="rounded-[32px] overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg">Product Details</CardTitle>
               <CardDescription className="text-xs">Fill in your appliance information exactly as shown on the invoice</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
               <div className="space-y-1.5">
                  <Select 
                     label="Appliance Category" 
                     options={[
                        { label: 'Select Category...', value: '' },
                        { label: 'Mixer Grinder', value: 'mix' },
                        { label: 'Induction Cooktop', value: 'ind' },
                        { label: 'Chimney', value: 'chi' }
                     ]} 
                  />
               </div>

               <div className="space-y-1.5">
                  <Input 
                     label="Model Serial Number" 
                     placeholder="Base of appliance (e.g. MG-2024-X)" 
                     icon={RiPriceTag3Fill} 
                  />
               </div>

               <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <Input label="Purchase Date" type="date" icon={RiCalendarFill} />
                  </div>
                  <div className="space-y-1.5">
                     <Input label="Invoice Number" placeholder="e.g. SL-901" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Input 
                     label="Distributor / Store Name" 
                     placeholder="Where did you buy it?" 
                     icon={RiStore2Fill} 
                  />
               </div>
            </div>
         </Card>


         <Card className="rounded-[32px] overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle>Attach Proof</CardTitle>
               <CardDescription>Upload clear photo of the physical invoice for verification</CardDescription>
            </CardHeader>
            <div className="p-6">
               <input 
                  type="file" 
                  id="invoice-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
               />
               
               {previewUrl ? (
                  <div className="relative group animate-fade-in">
                     <div className="w-full h-48 rounded-2xl border-2 border-brand-teal bg-gray-50 overflow-hidden shadow-sm">
                        <img src={previewUrl} alt="Invoice Preview" className="w-full h-full object-cover" />
                     </div>
                     <button 
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl"
                     >
                        <span className="text-white text-[10px] font-black uppercase tracking-[3px]">Change Photo</span>
                     </button>
                  </div>
               ) : (
                  <label 
                     htmlFor="invoice-upload"
                     className="w-full h-32 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-3 group hover:border-brand-teal/30 transition-all cursor-pointer active:scale-[0.98]"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-brand-teal transition-all">
                        <RiSmartphoneFill className="w-6 h-6" />
                     </div>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                        Click to Camera or <br/> Choose File
                     </p>
                  </label>
               )}
            </div>
         </Card>


         <div className="pb-8 flex flex-col gap-3 mt-2">
            <Button
               loading={loading}
               onClick={handleRegister}
               className="w-full h-14 rounded-full font-black text-sm shadow-xl shadow-brand-teal/10"
               icon={RiVerifiedBadgeFill}
            >
               Activate Warranty
            </Button>
            <div className="flex items-center justify-center gap-3 py-4 opacity-50">
               <RiHandHeartFill className="text-brand-pink w-4 h-4" />
               <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest leading-none">Agreement to Ogun Warranty Terms</p>
            </div>
         </div>
      </div>
   );
}

