import { useState } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiUserLine, RiStore2Line, RiMapPinLine, 
  RiPhoneLine, RiHeartLine, RiLockPasswordLine, RiUserStarLine, 
  RiCheckDoubleLine, RiShieldStarFill
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Avatar, Input, Select, Modal, useModal 
} from '../../../core';
import { useAuthContext } from '../../../core/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CustomerSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
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
    { icon: RiShieldStarFill, label: 'Warranty Extensions', desc: 'View history and extend coverage', path: '/customer/warranty' },
    { icon: RiUserLine, label: 'Identity Information', desc: 'Name, email, and social profiles' },
    { icon: RiMapPinLine, label: 'Saved Localities', desc: 'Direct service addresses' },
    { icon: RiLockPasswordLine, label: 'Security & Access', desc: 'Passwords and biometric' },
    { icon: RiPaletteLine, label: 'Visual Experience', desc: 'Theme and compact modes' },
    { icon: RiNotification3Line, label: 'Communication Feed', desc: 'Emails and SMS' }
  ];

  return (
    <div className="page-container max-w-lg mx-auto flex flex-col gap-6">
      <PageHeader 
        title="Account Preferences" 
        subtitle="Manage your personal profile, security configuration, and app experience"
      >
        <Button icon={RiLogoutBoxRLine} variant="danger" size="sm" onClick={handleLogout}>Logout</Button>
      </PageHeader>

      <div className="flex items-center gap-6 p-6 glass-card border-brand-teal/20 animate-slide-up relative overflow-hidden group">
         <Avatar name={user?.name || "Rahul Verma"} size="lg" className="border-2 border-brand-teal ring-4 ring-brand-teal/5 shadow-glow" />
         <div className="flex-1">
            <p className="text-[7px] text-brand-pink font-black uppercase tracking-[0.4em] mb-1">Authenticated,</p>
            <h4 className="text-lg font-black text-content-primary leading-tight">{user?.name || "Rahul Verma"}</h4>
            <p className="text-[10px] text-brand-teal font-black uppercase tracking-widest leading-none mt-1">Verified Member #9422</p>
            <div className="flex items-center gap-2 mt-3 cursor-pointer group/link" onClick={() => toast('Request received. Our team will review your eligibility.')}>
               <RiUserStarLine className="text-[#E0128A] w-4 h-4" />
               <p className="text-[10px] text-content-tertiary font-bold underline decoration-1 group-hover/link:text-brand-teal transition-all">Request Pro Profile Upgrade</p>
            </div>
         </div>
      </div>

      <div className="space-y-4">
         {menuItems.map(item => (
            <Card key={item.label} className="group active:scale-95 transition-all outline-none border-border overflow-hidden hover:border-brand-teal cursor-pointer" onClick={() => item.path ? navigate(item.path) : open(item)}>
               <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center text-brand-teal group-hover:shadow-glow transition-all">
                     <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-xs font-black text-content-primary">{item.label}</h4>
                     <p className="text-[9px] text-content-tertiary font-bold uppercase tracking-widest">{item.desc}</p>
                  </div>
                  <RiArrowRightSLine className="w-5 h-5 text-content-tertiary group-hover:translate-x-1 transition-transform" />
               </div>
            </Card>
         ))}
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={activeTab?.label}
        variant="bottom"
        footer={
           <div className="flex flex-col w-full gap-3">
              <Button onClick={handleSave} loading={loading} className="w-full bg-[#E0128A] text-white">Save Changes</Button>
              <Button variant="ghost" onClick={close} className="w-full">Cancel</Button>
           </div>
        }
      >
        <div className="space-y-4">
           {activeTab?.label === 'Identity Information' && (
              <>
                 <Input label="Full Name" defaultValue={user?.name || "Rahul Verma"} />
                 <Input label="Contact Email" defaultValue={user?.email || "rahul.v@gmail.com"} />
                 <Input label="Phone Number" defaultValue="+91 9876543210" disabled />
              </>
           )}
           {activeTab?.label === 'Security & Access' && (
              <>
                 <Input label="Current Password" type="password" placeholder="••••••••" />
                 <Input label="New Password" type="password" placeholder="Min 8 chars" />
              </>
           )}
           {activeTab?.label !== 'Identity Information' && activeTab?.label !== 'Security & Access' && (
              <div className="p-8 text-center bg-surface-elevated flex flex-col items-center">
                 <RiSettings4Line className="w-10 h-10 text-brand-teal/30 mb-2 animate-spin-slow" />
                 <p className="text-xs text-content-secondary">Synchronizing your {activeTab?.label.toLowerCase()} settings with the secure cloud...</p>
              </div>
           )}
        </div>
      </Modal>

      <div className="pb-8 space-y-4">
         <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-surface-elevated border border-border opacity-70">
            <RiInformationLine className="text-brand-teal w-4 h-4 flex-shrink-0" />
            <p className="text-[10px] text-center font-medium leading-relaxed">Changes to registered data may take up to 24 hours to sync with service nodes.</p>
         </div>
      </div>
    </div>
  );
}
