import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
   RiPriceTag3Line, RiTrophyLine, RiAddCircleLine, RiShoppingBasketLine,
   RiCustomerServiceLine, RiArrowRightSLine, RiShieldStarLine,
   RiMapPin2Line, RiNotification3Line, RiSearchLine, RiArrowDownSLine,
   RiShieldCheckFill, RiHandCoinFill, RiMagicFill, RiMicLine, RiInboxFill
} from 'react-icons/ri';
import Badge from '../../../core/components/ui/Badge';
import Button from '../../../core/components/ui/Button';
import Avatar from '../../../core/components/ui/Avatar';
import Card from '../../../core/components/ui/Card';

import customerData from '../../../data/customer.json';
import { useAuthContext } from '../../../core/context/AuthContext';

export default function CustomerHomePage() {
   const navigate = useNavigate();
   const { user } = useAuthContext();
   const { profile, banners, products } = customerData;
   const scrollRef = useRef(null);
   const [currentIndex, setCurrentIndex] = useState(0);

   const [greeting, setGreeting] = useState('');

   useEffect(() => {
      const getGreeting = () => {
         const hour = new Date().getHours();
         if (hour < 12) return "Good Morning";
         if (hour < 17) return "Good Afternoon";
         if (hour < 21) return "Good Evening";
         return "Good Night";
      };
      setGreeting(getGreeting());
   }, []);

   useEffect(() => {
      const interval = setInterval(() => {
         if (scrollRef.current) {
            const nextIndex = (currentIndex + 1) % banners.length;
            const scrollAmount = scrollRef.current.offsetWidth * nextIndex;
            scrollRef.current.scrollTo({
               left: scrollAmount,
               behavior: 'smooth'
            });
            setCurrentIndex(nextIndex);
         }
      }, 4000);
      return () => clearInterval(interval);
   }, [currentIndex, banners.length]);

   const displayName = user?.name?.split(' ')[0] || profile.name.split(' ')[0];

   return (
      <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
         {/* Top Section - Boutique Header - Ultra Compact Theme */}
         <div className="-mx-6 -mt-6 px-6 pt-3.5 pb-2.5 bg-gradient-to-b from-brand-teal/40 via-brand-teal/15 to-white flex flex-col gap-2.5 border-b border-gray-50/50">
            <div className="flex items-center justify-between">
               {/* Greeting & Logo Group - Ultra Compact */}
               <div className="flex items-center gap-3 flex-1 pr-2">
                  <div className="w-10 h-10 flex-shrink-0">
                     <img src="/remove bg logo .png" alt="Ogun Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                     <p className="text-[7px] text-brand-pink font-black uppercase tracking-[0.4em] leading-none mb-1">{greeting},</p>
                     <h3 className="text-[13px] font-black text-gray-800 tracking-tight leading-none">{displayName}</h3>
                  </div>
               </div>

               {/* Right Side - Identity / Stats Group - Ultra Compact */}
               <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end pr-2 border-r border-gray-100 h-7 justify-center">
                     <div className="flex items-center gap-1 mb-0.5">
                        <RiShieldStarLine className="text-yellow-500 w-2.5 h-2.5" />
                        <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.15em] leading-none">{profile.loyalty}</span>
                     </div>
                     <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-black text-gray-800 leading-none">{profile.points}</span>
                        <span className="text-[6px] text-gray-400 font-bold uppercase tracking-wider">pts</span>
                     </div>
                  </div>

                  <div className="relative cursor-pointer hover:scale-110 active:scale-95 transition-all p-1.5 group">
                     <RiNotification3Line className="text-gray-400 w-5 h-5 group-hover:text-brand-pink transition-colors" />
                     <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-pink rounded-full border border-white"></span>
                  </div>
               </div>
            </div>

            {/* Smart Search Bar - Ultra Compact */}
            <div className="relative group mx-0.5">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-pink transition-all">
                  <RiSearchLine className="w-4 h-4" />
               </div>
               <input
                  type="text"
                  placeholder="What can we help you find?"
                  className="w-full h-9 pl-10 pr-10 bg-white border border-gray-100/40 rounded-full shadow-sm outline-none focus:border-brand-pink/30 transition-all text-[10px] font-bold text-gray-700 placeholder:text-gray-300"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-300">
                  <RiMicLine className="w-4 h-4 cursor-pointer hover:text-brand-pink" />
               </div>
            </div>
         </div>

         {/* Hero Banners / Promotions - Full Width Breakout (Moved Up) */}
         <div className="-mx-6 -mt-3 relative">
            <div
               ref={scrollRef}
               className="flex overflow-x-auto scrollbar-hide snap-x"
               style={{ scrollSnapType: 'x mandatory' }}
            >
               {banners.map(b => (
                  <div
                     key={b.id}
                     className="snap-center min-w-full aspect-[21/9] sm:aspect-[3/1] relative overflow-hidden group border-y border-border"
                  >
                     {/* Banner Image Background */}
                     <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                     {/* Gradient Overlay for Text Legibility */}
                     <div className={`absolute inset-0 bg-gradient-to-r ${b.color === 'teal' ? 'from-brand-teal/80 via-brand-teal/40 to-transparent' : 'from-brand-pink/80 via-brand-pink/40 to-transparent'}`}></div>

                     {/* Content - Adjusted for wider layout */}
                     <div className="relative z-10 h-full px-8 flex flex-col justify-center">
                        <div className="max-w-xs">
                           <h4 className="text-2xl font-black text-white leading-tight drop-shadow-md">{b.title}</h4>
                           <p className="text-[11px] text-white/95 mt-1.5 font-medium drop-shadow-sm uppercase tracking-wider">{b.subtitle}</p>
                           <div className="mt-5">
                              <Button size="sm" variant="white" className="shadow-lg !rounded-full px-6">Explore Offer</Button>
                           </div>
                        </div>
                     </div>

                     <div className="absolute -bottom-4 -right-4 opacity-10 text-white">
                        <RiPriceTag3Line className="w-32 h-32" />
                     </div>
                  </div>
               ))}
            </div>

            {/* Scroll Indication Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
               {banners.map((_, i) => (
                  <div
                     key={i}
                     className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  />
               ))}
            </div>
         </div>

         {/* Services / Compact Quick Actions Grid */}
         <div>
            <div className="flex items-center justify-between px-1 mb-3">
               <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-wider">Services</h4>
               <button onClick={() => navigate('/customer/service')} className="text-[10px] font-bold text-gray-400 hover:text-brand-pink transition-colors">
                  View all
               </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
               <button
                  onClick={() => navigate('/customer/products/register')}
                  className="bg-white py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-95 group/btn"
               >
                  <div className="text-brand-teal group-hover/btn:scale-110 transition-transform duration-300">
                     <RiShieldCheckFill className="w-9 h-9" />
                  </div>
                  <p className="text-[9px] font-black text-gray-700 leading-tight">Register</p>
               </button>

               <button
                  onClick={() => navigate('/customer/service/raise')}
                  className="bg-white py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-95 group/btn"
               >
                  <div className="text-brand-pink group-hover/btn:scale-110 transition-transform duration-300">
                     <RiHandCoinFill className="w-9 h-9" />
                  </div>
                  <p className="text-[9px] font-black text-gray-700 leading-tight">Service</p>
               </button>

               <button
                  onClick={() => navigate('/customer/service')}
                  className="bg-white py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-95 group/btn"
               >
                  <div className="text-brand-purple group-hover/btn:scale-110 transition-transform duration-300">
                     <RiMagicFill className="w-9 h-9" />
                  </div>
                  <p className="text-[9px] font-black text-gray-700 leading-tight">Expert</p>
               </button>
            </div>
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
            <div className="space-y-2.5">
               {products.map(prod => (
                  <div
                     key={prod.id}
                     onClick={() => navigate(`/customer/products/${prod.id}`)}
                     className="py-2 px-3 rounded-xl bg-white border border-gray-50 flex items-center gap-4 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                     <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-teal/30 transition-all flex-shrink-0">
                        {prod.image ? (
                           <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                           <RiInboxFill className="w-6 h-6 text-brand-teal/30" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-black text-gray-800 leading-tight mb-1 truncate">{prod.name}</h4>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest bg-teal-50/50 px-1.5 py-0.5 border border-brand-teal/10">
                              EXP: {prod.warrantyExp}
                           </span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1.5 bg-green-50/50 px-2 py-1 rounded-md border border-green-100/50">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Active</span>
                     </div>
                     
                     <RiArrowRightSLine className="text-gray-300 w-5 h-5 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
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

