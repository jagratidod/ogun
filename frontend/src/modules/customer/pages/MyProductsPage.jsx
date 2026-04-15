import { useNavigate } from 'react-router-dom';
import { RiShoppingBasketLine, RiVerifiedBadgeLine, RiPriceTag3Line, RiInformationLine, RiAddCircleLine, RiSmartphoneLine, RiHeartLine, RiCustomerServiceLine, RiArrowRightSLine, RiShieldStarLine, RiTimeLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';

export default function MyProductsPage() {
   const navigate = useNavigate();
   const { products } = customerData;

   return (
      <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
         <PageHeader
            title="My Appliances"
            subtitle="Manage and track warranty status for all your registered Ogun products"
         />

         <div className="grid grid-cols-1 gap-4 mt-2">
            {products.map(prod => (
               <Card
                  key={prod.id}
                  onClick={() => navigate(`/customer/products/${prod.id}`)}
                  className="group active:scale-95 transition-all outline-none border-brand-teal/20 overflow-hidden hover:border-brand-teal cursor-pointer"
               >
                  <div className="p-4 flex items-center gap-4">
                     <div className="w-16 h-16 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:shadow-glow transition-all">
                        <RiShoppingBasketLine className="w-8 h-8" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                           <h4 className="text-sm font-black text-content-primary">{prod.name}</h4>
                           <Badge variant="teal" size="xs">Active</Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <RiTimeLine className="text-content-tertiary w-3 h-3" />
                           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest leading-none">Exp: {prod.warrantyExp}</p>
                        </div>
                     </div>
                     <div className="flex items-center justify-center w-8 h-8 rounded-none bg-white border border-border group-hover:bg-brand-teal group-hover:text-white transition-all">
                        <RiArrowRightSLine className="w-5 h-5 text-content-tertiary group-hover:text-white" />
                     </div>
                  </div>
               </Card>
            ))}
         </div>

         <div className="mt-8 text-center glass-card p-6 border-dashed border-2 border-border opacity-60">
            <RiVerifiedBadgeLine className="w-12 h-12 text-content-tertiary mx-auto mb-2" />
            <p className="text-sm text-content-tertiary font-bold uppercase tracking-widest mb-1 leading-none">Add New Appliance</p>
            <p className="text-[10px] text-content-tertiary mb-3">Did you purchase something recently?</p>
            <Button
               variant="secondary"
               className="w-full text-xs"
               icon={RiAddCircleLine}
               onClick={() => navigate('/customer/products/register')}
            >
               Register Now
            </Button>
         </div>

         <div className="pb-8 space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-brand-pink/5 border border-brand-pink/10 opacity-70">
               <RiHeartLine className="w-4 h-4 text-brand-pink" />
               <p className="text-[10px] font-medium text-center">Extended warranty plans are now available for Mixer Grinders!</p>
            </div>
         </div>
      </div>
   );
}

