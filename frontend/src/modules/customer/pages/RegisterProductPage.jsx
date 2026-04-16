import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeFill, RiPriceTag3Fill, RiInformationFill, RiAddCircleFill, RiSmartphoneFill, RiShieldFill, RiCalendarFill, RiStore2Fill, RiMapPinFill, RiHandHeartFill, RiCameraFill, RiShieldCheckFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, Combobox, PageHeader } from '../../../core';
import { toast } from 'react-hot-toast';

export default function RegisterProductPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   const [category, setCategory] = useState(null);

   const categories = [
      { label: 'Mixer Grinder', value: 'mix' },
      { label: 'Induction Cooktop', value: 'ind' },
      { label: 'Chimney', value: 'chi' },
      { label: 'Microwave Oven', value: 'micro' },
      { label: 'Dishwasher', value: 'dish' }
   ];

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
      <div className="page-container max-w-lg mx-auto flex flex-col gap-4">
         <div className="pt-1">
            <h2 className="text-lg font-black text-gray-800 tracking-tight">Warranty Activation</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Activate your official Ogun coverage</p>
         </div>

         <div className="bg-brand-teal/5 border border-brand-teal/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 pr-8 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal border border-brand-teal/10">
                  <RiShieldFill className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-brand-teal mb-0.5 uppercase tracking-wider leading-none">Ogun Protection</h4>
                  <p className="text-[9px] text-gray-500 font-bold leading-tight line-clamp-2">Register within 15 days for a +1 year additional warranty.</p>
               </div>
            </div>
            <RiVerifiedBadgeFill className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 text-brand-teal" />
         </div>

         <Card className="rounded-[28px] overflow-hidden border-gray-50 shadow-sm">
            <div className="p-5 space-y-4">
               <div className="space-y-1">
                  <Combobox
                     label="Appliance Category"
                     options={categories}
                     value={category}
                     onChange={setCategory}
                     placeholder="Search or Select..."
                  />
               </div>

               <div className="space-y-1">
                  <Input
                     label="Model Serial Number"
                     placeholder="e.g. MG-2024-X"
                     icon={RiPriceTag3Fill}
                  />
               </div>

               <div className="space-y-1">
                  <Input label="Purchase Date" type="date" icon={RiCalendarFill} />
               </div>
               <div className="space-y-1">
                  <Input label="Invoice Number" placeholder="e.g. SL-901" />
               </div>

               <div className="space-y-1">
                  <Input
                     label="Distributor / Store"
                     placeholder="Where did you buy it?"
                     icon={RiStore2Fill}
                  />
               </div>

               <div className="pt-2">
                  <input
                     type="file"
                     id="invoice-upload"
                     accept="image/*"
                     className="hidden"
                     onChange={handleFileChange}
                  />

                  {previewUrl ? (
                     <div className="relative group animate-fade-in">
                        <div className="w-full h-32 rounded-2xl border border-brand-teal bg-gray-50 overflow-hidden">
                           <img src={previewUrl} alt="Invoice Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                           onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                           className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl"
                        >
                           <span className="text-white text-[9px] font-black uppercase tracking-[2px]">Change Photo</span>
                        </button>
                     </div>
                  ) : (
                     <label
                        htmlFor="invoice-upload"
                        className="w-full h-24 rounded-[24px] border border-dashed border-gray-200 bg-white flex items-center gap-6 px-6 group hover:border-brand-teal/30 hover:bg-brand-teal/[0.02] transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden"
                     >
                        <div className="w-10 h-10 flex items-center justify-center text-gray-300 group-hover:text-brand-teal transition-all">
                           <RiCameraFill className="w-7 h-7" />
                        </div>

                        <div className="flex flex-col">
                           <p className="text-[12px] text-gray-800 font-bold uppercase tracking-wider">Upload Invoice</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tap to Scan or Choose File</p>
                        </div>

                        <div className="ml-auto pr-2">
                           <RiVerifiedBadgeFill className="w-4 h-4 text-brand-teal opacity-30" />
                        </div>

                        {/* Subtle background decoration */}
                        <RiShieldCheckFill className="absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.03] text-brand-teal group-hover:rotate-12 transition-transform duration-1000" />
                     </label>
                  )}
               </div>
            </div>
         </Card>

         <div className="pb-8 flex flex-col gap-3">
            <Button
               loading={loading}
               onClick={handleRegister}
               className="w-full h-12 rounded-full font-black text-[13px] shadow-lg shadow-brand-teal/5"
               icon={RiVerifiedBadgeFill}
            >
               Activate Registration
            </Button>
            <div className="flex items-center justify-center gap-2 pt-1 opacity-50">
               <RiHandHeartFill className="text-brand-pink w-3 h-3" />
               <p className="text-[8px] text-center font-bold text-gray-400 uppercase tracking-widest leading-none">Ogun Certified Warranty Process</p>
            </div>
         </div>
      </div>
   );
}

