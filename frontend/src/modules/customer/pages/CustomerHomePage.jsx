import { useNavigate } from 'react-router-dom';
import { RiPriceTag3Line, RiTrophyLine, RiAddCircleLine, RiShoppingBasketLine, RiCustomerServiceLine, RiArrowRightSLine, RiShieldStarLine } from 'react-icons/ri';
import Badge from '../../../core/components/ui/Badge';
import Button from '../../../core/components/ui/Button';
import Avatar from '../../../core/components/ui/Avatar';
import Card from '../../../core/components/ui/Card';

import customerData from '../../../data/customer.json';

export default function CustomerHomePage() {
   const navigate = useNavigate();
   const { profile, banners, products } = customerData;

   return (
      <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
         {/* Profile Header */}
         <div className="flex items-center justify-between p-4 glass-card bg-gradient-to-r from-brand-teal to-brand-purple text-white border-0 shadow-glow animate-slide-up">
            <div className="flex items-center gap-4">
               <Avatar name={profile.name} size="md" className="border-2 border-white/50" />
               <div>
                  <h3 className="text-lg font-black leading-none">{profile.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                     <RiShieldStarLine className="text-yellow-400 w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{profile.loyalty}</span>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Ogun Points</p>
               <h4 className="text-xl font-black">{profile.points}</h4>
            </div>
         </div>

         {/* Hero Banners / Promotions */}
         <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x p-1 -mx-1">
            {banners.map(b => (
               <div key={b.id} className={`snap-center min-w-[280px] p-6 rounded-none relative overflow-hidden bg-gradient-to-br ${b.color === 'teal' ? 'from-brand-teal/20 to-brand-teal/10 border-brand-teal/20' : 'from-brand-pink/20 to-brand-pink/10 border-brand-pink/20'} border`}>
                  <h4 className="text-lg font-black text-content-primary leading-tight">{b.title}</h4>
                  <p className="text-xs text-content-secondary mt-1 max-w-[180px]">{b.subtitle}</p>
                  <Button size="sm" className="mt-4" variant={b.color === 'teal' ? 'teal' : 'danger'}>Check Offer</Button>
                  <div className="absolute -bottom-2 -right-2 opacity-10">
                     <RiPriceTag3Line className="w-24 h-24" />
                  </div>
               </div>
            ))}
         </div>

         {/* Main Quick Actions Grid */}
         <div className="grid grid-cols-2 gap-4">
            <button
               onClick={() => navigate('/customer/products/register')}
               className="glass-card p-5 flex flex-col items-center justify-center text-center group active:scale-95 transition-all outline-none"
            >
               <div className="w-12 h-12 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-3 group-hover:shadow-glow transition-all">
                  <RiAddCircleLine className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-content-primary">Warranty<br />Registration</p>
            </button>
            <button
               onClick={() => navigate('/customer/service/raise')}
               className="glass-card p-5 flex flex-col items-center justify-center text-center group active:scale-95 transition-all outline-none border-brand-pink/30 bg-brand-pink/5"
            >
               <div className="w-12 h-12 rounded-none bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-3 group-hover:shadow-glow transition-all">
                  <RiCustomerServiceLine className="w-6 h-6" />
               </div>
               <p className="text-xs font-black text-content-primary">Raise<br />Complaint</p>
            </button>
         </div>

         {/* Registered Products List */}
         <div>
            <div className="flex items-center justify-between px-1 mb-4">
               <h4 className="section-title text-sm">My Appliances</h4>
               <button
                  onClick={() => navigate('/customer/products')}
                  className="text-[10px] font-black text-brand-teal uppercase tracking-widest underline decoration-2 underline-offset-4"
               >
                  View All ({profile.registeredProducts})
               </button>
            </div>
            <div className="space-y-3">
               {products.map(prod => (
                  <div
                     key={prod.id}
                     onClick={() => navigate(`/customer/products/${prod.id}`)}
                     className="p-4 rounded-none bg-white border border-border flex items-center gap-4 group active:bg-white/80 transition-all cursor-pointer"
                  >
                     <div className="w-12 h-12 rounded-none bg-white flex items-center justify-center text-brand-teal group-hover:bg-brand-teal/10 transition-colors">
                        <RiShoppingBasketLine className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-bold text-content-primary leading-none mb-1">{prod.name}</h4>
                        <p className="text-[10px] text-content-tertiary">Warranty Exp: {prod.warrantyExp}</p>
                     </div>
                     <Badge variant="teal" size="xs">Active</Badge>
                     <RiArrowRightSLine className="text-content-tertiary w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
               ))}
            </div>
         </div>

         {/* Rewards Teaser */}
         <Card className="bg-white/50 border-dashed border-2">
            <div className="p-6 flex items-center gap-6">
               <div className="w-14 h-14 rounded-none bg-brand-teal/5 flex items-center justify-center shadow-glow border border-brand-teal/20">
                  <RiTrophyLine className="text-brand-teal w-7 h-7" />
               </div>
               <div className="flex-1">
                  <h4 className="text-xs font-black text-content-primary">Tier Milestones</h4>
                  <p className="text-[10px] text-content-secondary mt-1">Earn 240 more points to unlock Platinum membership!</p>
                  <div className="w-full h-1 bg-white overflow-hidden rounded-none mt-3">
                     <div className="h-full bg-brand-pink" style={{ width: '80%' }} />
                  </div>
               </div>
            </div>
         </Card>

      </div>
   );
}

