import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeLine, RiPriceTag3Line, RiInformationLine, RiAddCircleLine, RiSmartphoneLine, RiShieldLine, RiCalendarLine, RiStore2Line, RiMapPinLine, RiHandHeartLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, PageHeader } from '../../../core';
import { toast } from 'react-hot-toast';

export default function RegisterProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      <PageHeader 
        title="Warranty Activation" 
        subtitle="Register your appliance to activate your official Ogun warranty coverage"
      />

      <div className="bg-brand-teal/5 border border-brand-teal/20 p-6 rounded-none relative overflow-hidden group">
         <div className="flex items-start gap-4 pr-12 relative z-10">
            <div className="w-12 h-12 rounded-none bg-brand-teal/15 flex items-center justify-center text-brand-teal">
               <RiShieldLine className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-sm font-black text-brand-teal mb-1 tracking-tight">Ogun Assured Protection</h4>
               <p className="text-[10px] text-content-secondary leading-normal">Register within 15 days of purchase to get 1 year additional engine warranty on all Mixer Grinders.</p>
            </div>
         </div>
         <RiVerifiedBadgeLine className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-brand-teal group-hover:scale-110 transition-all duration-700" />
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Product Configuration</CardTitle>
            <CardDescription>Enter appliance SKU and purchase details from the invoice</CardDescription>
         </CardHeader>
         <div className="p-6 space-y-4">
            <Select label="Select Appliance Category" options={[
               { label: 'Mixer Grinder', value: 'mix' },
               { label: 'Induction Cooktop', value: 'ind' },
               { label: 'Chimney', value: 'chi' }
            ]} />
             <Input label="Model Serial Number" placeholder="Found on the appliance base..." icon={RiPriceTag3Line} />
             <div className="grid grid-cols-2 gap-4">
                <Input label="Purchase Date" type="date" icon={RiCalendarLine} />
                <Input label="Invoice Number" placeholder="e.g. SL-998" />
             </div>
             <Input label="Purchased Store" placeholder="Store or Distributor name..." icon={RiStore2Line} />
         </div>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle>Attach Proof</CardTitle>
            <CardDescription>Upload clear photo of the physical invoice for verification</CardDescription>
         </CardHeader>
         <div className="p-6">
            <div className="w-full h-32 rounded-none border-2 border-dashed border-border bg-surface-elevated/40 flex flex-col items-center justify-center gap-3 group hover:border-brand-teal transition-all cursor-pointer">
               <div className="w-10 h-10 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:shadow-glow transition-all">
                  <RiSmartphoneLine className="w-5 h-5" />
               </div>
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Click to Camera or Choose File</p>
            </div>
         </div>
      </Card>

      <div className="pb-8 flex flex-col gap-3">
         <Button 
           loading={loading}
           onClick={handleRegister}
           className="w-full h-14 rounded-none font-black text-sm shadow-glow" 
           icon={RiVerifiedBadgeLine}
         >
           Activate Warranty
         </Button>
         <div className="flex items-center justify-center gap-3 py-4 opacity-50">
            <RiHandHeartLine className="text-brand-pink w-4 h-4" />
            <p className="text-[10px] text-center font-medium">By activating, you agree to the Ogun Warranty Terms of Service.</p>
         </div>
      </div>
    </div>
  );
}

