import { useState } from 'react';
import {
   RiSettings4Fill, RiShieldKeyholeFill, RiNotification3Fill,
   RiPaletteFill, RiGlobalFill, RiSmartphoneFill,
   RiDatabaseFill, RiInformationFill, RiArrowRightSLine,
   RiLogoutBoxRFill, RiUserFill, RiStore2Fill, RiMapPinFill,
   RiPhoneFill, RiHeartFill, RiLockPasswordFill, RiUserStarFill,
   RiCheckDoubleFill
} from 'react-icons/ri';
import {
   PageHeader, Card, CardHeader, CardTitle, CardDescription,
   Badge, Button, Avatar, Input, Select, Tabs, Modal, useModal
} from '../../../core';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CustomerSettingsPage() {
   const { logout } = useAuthContext();
   const [loading, setLoading] = useState(false);
   const { isOpen, open, close, data: activeTab } = useModal();

   const handleLogout = () => {
      toast.loading('Logging out...');
      setTimeout(logout, 800);
   };

   const handleSave = () => {
      setLoading(true);
      toast.loading('Updating user preferences...');
      setTimeout(() => {
         toast.dismiss();
         toast.success('Settings updated successfully');
         setLoading(false);
         close();
      }, 1500);
   };

   const menuItems = [
      { icon: RiUserFill, label: 'Identity Profile', desc: 'Secure contact & naming', color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
      { icon: RiMapPinFill, label: 'Service Locations', desc: 'Manage registered addresses', color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
      { icon: RiLockPasswordFill, label: 'Security & Access', desc: 'Encryption & passwords', color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
      { icon: RiPaletteFill, label: 'App Experience', desc: 'Themes & density modes', color: 'text-brand-purple', bg: 'bg-brand-purple/5' },
      { icon: RiNotification3Fill, label: 'Alert Protocols', desc: 'Email & SMS preferences', color: 'text-brand-pink', bg: 'bg-brand-pink/5' }
   ];

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-3.5 py-4">
         <div className="flex items-center justify-between px-1">
            <div>
               <h2 className="text-lg font-black text-gray-800 tracking-tight leading-none uppercase font-heading">Account Hub</h2>
               <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase font-secondary tracking-[0.1em] opacity-60">Identity Portal</p>
            </div>
            <button 
               onClick={handleLogout}
               className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
            >
               <RiLogoutBoxRFill className="w-4 h-4" />
            </button>
         </div>

         {/* Ultra-Compact Vertical Profile */}
         <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-3xl border border-gray-100 animate-fade-in">
            <div className="relative">
               <div className="w-16 h-16 rounded-2xl p-0.5 bg-white border border-gray-100 shadow-sm transition-transform active:scale-95 cursor-pointer">
                  <div className="w-full h-full rounded-[14px] overflow-hidden border border-white shadow-inner">
                     <img 
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                     />
                  </div>
               </div>
               <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 active:scale-90 transition-all">
                  <RiCheckDoubleFill className="w-3.5 h-3.5" />
               </button>
            </div>
            
            <div className="flex-1">
               <h4 className="text-lg font-black text-gray-800 tracking-tighter leading-none font-heading">Rahul Verma</h4>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 font-secondary opacity-70">Elite Tier Partner</p>
            </div>
         </div>

         <div className="space-y-2.5">
            {menuItems.map(item => (
               <div 
                  key={item.label} 
                  className="p-3 rounded-2xl bg-white border border-gray-50 flex items-center gap-3.5 group active:scale-[0.98] transition-all cursor-pointer hover:border-brand-teal/20 hover:shadow-sm" 
                  onClick={() => open(item)}
               >
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-all duration-300`}>
                     <item.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-[12px] font-black text-gray-800 tracking-tight">{item.label}</h4>
                     <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">{item.desc}</p>
                  </div>
                  <RiArrowRightSLine className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
               </div>
            ))}
         </div>

         <Modal
            isOpen={isOpen}
            onClose={close}
            variant="bottom"
            title={activeTab?.label}
            footer={
               <div className="flex gap-3 w-full">
                  <Button variant="secondary" onClick={close} className="flex-1 rounded-full text-xs font-black uppercase">Cancel</Button>
                  <Button onClick={handleSave} loading={loading} className="flex-1 rounded-full text-xs font-black uppercase bg-brand-teal text-white border-none shadow-lg shadow-brand-teal/20">Sync Settings</Button>
               </div>
            }
         >
            <div className="space-y-5 pt-2">
               {activeTab?.label === 'Identity Profile' && (
                  <>
                     <Input label="Boutique Member Name" defaultValue="Rahul Verma" />
                     <Input label="Primary Global Email" defaultValue="rahul.v@gmail.com" />
                     <Input label="Encrypted Phone" defaultValue="+91 9876543210" disabled />
                  </>
               )}
               {activeTab?.label === 'Security & Access' && (
                  <>
                     <Input label="Standard Password" type="password" placeholder="••••••••" />
                     <Input label="Enhanced Security Key" type="password" placeholder="Min 8 chars" />
                  </>
               )}
               {(activeTab?.label !== 'Identity Profile' && activeTab?.label !== 'Security & Access') && (
                  <div className="py-10 text-center flex flex-col items-center">
                     <div className="w-16 h-16 rounded-full bg-brand-teal/5 flex items-center justify-center mb-4">
                        <RiSettings4Fill className="w-8 h-8 text-brand-teal/30 animate-spin-slow" />
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-gray-800">Synchronizing Vault</p>
                     <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight">Applying your {activeTab?.label.toLowerCase()} preferences...</p>
                  </div>
               )}
            </div>
         </Modal>

         <div className="mt-auto py-8">
            <div className="flex items-center justify-center gap-2.5 opacity-30">
               <RiHeartFill className="text-brand-pink w-3 h-3" />
               <p className="text-[8px] text-center font-black uppercase tracking-[0.3em] text-gray-400">Ogun Craftsmanship Design</p>
            </div>
         </div>
      </div>
   );
}
