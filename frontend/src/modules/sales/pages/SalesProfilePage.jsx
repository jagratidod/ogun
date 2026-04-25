import { RiArrowLeftLine, RiLogoutCircleLine, RiUserLine, RiMapPinFill, RiPhoneFill, RiMailFill, RiShieldFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../core/context/AuthContext';
import { Card, Button, Badge } from '../../../core';
import HRSection from './HRSection';

export default function SalesProfilePage() {
   const { user, logout } = useAuthContext();
   const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   return (
      <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
         <div className="flex items-center gap-3 pt-2">
            <h2 className="text-xl font-black text-content-primary tracking-tighter">My Profile</h2>
         </div>

         <div className="flex flex-col items-center py-4 bg-white rounded-[24px] border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal" />
            <div className="w-20 h-20 rounded-full bg-brand-teal/5 flex items-center justify-center border-2 border-brand-teal/20 mb-3 relative">
               <span className="text-3xl font-black text-brand-teal">{user?.name?.charAt(0)}</span>
               <div className="absolute bottom-0 right-0 w-5 h-5 bg-state-success rounded-full border-4 border-white shadow-sm" />
            </div>
            <h3 className="text-base font-black text-content-primary leading-tight">{user?.name}</h3>
            <Badge variant="teal" className="mt-1.5 uppercase tracking-widest text-[8px] font-black">{user?.role?.replace('_', ' ')}</Badge>
         </div>

         <div className="space-y-3">
            <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Executive Details</h4>
            <div className="grid grid-cols-1 gap-2">
               <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-2xl shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                     <RiMapPinFill className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[8px] text-content-tertiary font-black uppercase tracking-widest">Assigned Area</p>
                     <p className="text-xs font-bold text-content-secondary">{user?.salesExecutiveData?.assignedArea || 'Field Territory'}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3 p-3 bg-white border border-border rounded-2xl shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                     <RiPhoneFill className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[8px] text-content-tertiary font-black uppercase tracking-widest">Login Identity</p>
                     <p className="text-xs font-bold text-content-secondary">{user?.email || '—'}</p>
                  </div>
               </div>
            </div>

            {/* HR Section - Compacted internally */}
            <HRSection />

            <div className="grid grid-cols-2 gap-2">
               <div className="p-3 bg-white border border-border rounded-2xl flex flex-col gap-1 shadow-sm">
                  <span className="text-[9px] font-black text-content-tertiary uppercase">Version</span>
                  <span className="text-[10px] font-black text-content-primary">v2.4.0 Stable</span>
               </div>
               <div className="p-3 bg-white border border-border rounded-2xl flex flex-col gap-1 shadow-sm">
                  <span className="text-[9px] font-black text-content-tertiary uppercase">Status</span>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse" />
                     <span className="text-[10px] font-black text-state-success uppercase">Online</span>
                  </div>
               </div>
            </div>

            <Button
               variant="secondary"
               className="w-full text-state-danger border-state-danger/10 bg-state-danger/5 hover:bg-state-danger/10 font-black uppercase tracking-[0.2em] text-[10px] h-11 rounded-2xl mt-2"
               icon={RiLogoutCircleLine}
               onClick={handleLogout}
            >
               Logout Session
            </Button>
         </div>
      </div>
   );
}
