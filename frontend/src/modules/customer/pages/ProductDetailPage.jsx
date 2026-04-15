import { useNavigate, useParams } from 'react-router-dom';
import { RiPriceTag3Line, RiShieldLine, RiSmartphoneLine, RiHistoryLine, RiInformationLine, RiPulseLine, RiArrowLeftSLine, RiShoppingBasketLine, RiVerifiedBadgeLine, RiCustomerServiceLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';

export default function ProductDetailPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const prod = customerData.products.find(p => p.id === id) || customerData.products[0];

   return (
      <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
         <div
            onClick={() => navigate('/customer/products')}
            className="flex items-center gap-4 py-2 opacity-50 group cursor-pointer hover:opacity-100 transition-all active:scale-95 outline-none"
         >
            <RiArrowLeftSLine className="w-6 h-6 text-content-primary group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Back to My Appliances</span>
         </div>

         <div className="glass-card p-6 border-0 shadow-glow bg-gradient-to-br from-brand-teal to-brand-purple flex flex-col items-center justify-center text-center text-white text-center gap-4">
            <div className="w-24 h-24 rounded-none bg-white/10 flex items-center justify-center border-4 border-white/20">
               <RiShoppingBasketLine className="w-12 h-12" />
            </div>
            <div className="flex flex-col items-center">
               <h3 className="text-xl font-black">{prod.name}</h3>
               <div className="flex items-center gap-2 mt-2">
                  <RiVerifiedBadgeLine className="text-yellow-400 w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{prod.status}</p>
               </div>
            </div>
         </div>

         <Card>
            <CardHeader>
               <CardTitle>Warranty Profile</CardTitle>
               <CardDescription>Official coverage details and expiration timeline</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
               {[
                  { icon: RiShieldLine, label: 'Coverage Active', val: 'Full Parts + Labor' },
                  { icon: RiHistoryLine, label: 'Expiry Date', val: prod.warrantyExp },
                  { icon: RiSmartphoneLine, label: 'Policy Serial', val: prod.id }
               ].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center text-brand-teal">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">{item.label}</p>
                        <h4 className="text-sm font-bold text-content-primary leading-none">{item.val}</h4>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <button
               onClick={() => navigate('/customer/service/raise')}
               className="glass-card p-6 flex flex-col items-center gap-3 border-brand-teal/20 group hover:border-brand-teal transition-all outline-none"
            >
               <div className="w-12 h-12 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:shadow-glow transition-all">
                  <RiCustomerServiceLine className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-content-primary leading-tight">Request Service</p>
            </button>
            <button
               onClick={() => toast.success('AMC Upgrade inquiry sent. Our representative will call you.')}
               className="glass-card p-6 flex flex-col items-center gap-3 border-brand-pink/20 group hover:border-brand-pink transition-all outline-none"
            >
               <div className="w-12 h-12 rounded-none bg-brand-pink/10 flex items-center justify-center text-brand-pink group-hover:shadow-glow transition-all">
                  <RiPulseLine className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-content-primary leading-tight">AMC Upgrade</p>
            </button>
         </div>

         <div className="space-y-4">
            <Button variant="secondary" className="w-full h-12 justify-start px-6 gap-4" icon={RiInformationLine} onClick={() => toast.success('Downloading Official User Manual...')}>
               Download Digital Manual (PDF)
            </Button>
            <Button variant="secondary" className="w-full h-12 justify-start px-6 gap-4" icon={RiShieldLine} onClick={() => toast.success('Fetching Warranty Certificate...')}>
               Policy Certificate & Terms
            </Button>
         </div>

         <div className="pb-8 space-y-4 pt-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-white border border-border opacity-60 italic">
               <RiInformationLine className="text-brand-teal w-4 h-4 flex-shrink-0" />
               <p className="text-[10px] text-center font-medium leading-relaxed">Genuine Ogun components are used in all certified repairs for this model.</p>
            </div>
         </div>
      </div>
   );
}

