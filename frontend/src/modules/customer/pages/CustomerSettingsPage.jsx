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
  const { user, logout, updatePreferences } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { isOpen, open, close, data: activeTab } = useModal();

  // Local state for preferences in modal
  const [localPrefs, setLocalPrefs] = useState({
    theme: user?.preferences?.theme || 'light',
    compactMode: user?.preferences?.compactMode || false,
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      sms: user?.preferences?.notifications?.sms ?? true,
      push: user?.preferences?.notifications?.push ?? true
    }
  });

  const handleLogout = () => {
    toast.loading('Logging out...');
    setTimeout(logout, 800);
  };

  const handleSave = async () => {
    setLoading(true);
    const id = toast.loading('Updating your preferences...');
    
    try {
      const res = await updatePreferences(localPrefs);
      toast.dismiss(id);
      if (res.success) {
        toast.success('Settings updated successfully');
        close();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.dismiss(id);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Member Benefits',
      items: [
        { icon: RiShieldStarFill, label: 'Warranty Extensions', desc: 'Active Coverage & History', path: '/customer/warranty', color: '#10B981' },
        { icon: RiUserStarLine, label: 'Elite Membership', desc: 'Loyalty points & Rewards', color: '#E0128A' }
      ]
    },
    {
      title: 'Profile & Security',
      items: [
        { icon: RiUserLine, label: 'Identity Information', desc: 'Name, Email & Socials', color: '#3B82F6' },
        { icon: RiMapPinLine, label: 'Saved Localities', desc: 'Service Addresses', color: '#6366F1' },
        { icon: RiLockPasswordLine, label: 'Security & Access', desc: 'Passwords & Biometrics', color: '#F59E0B' }
      ]
    },
    {
      title: 'App Preferences',
      items: [
        { icon: RiPaletteLine, label: 'Visual Experience', desc: 'Theme & Theme Modes', color: '#8B5CF6' },
        { icon: RiNotification3Line, label: 'Communication Feed', desc: 'Alerts & Notifications', color: '#EC4899' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="max-w-2xl mx-auto min-h-screen bg-surface-card shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Summary Banner */}
          <div className="px-8 py-10 flex flex-col items-center text-center bg-surface-primary/50 border-b border-border mb-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-pink/10 transition-all duration-700" />
             <Avatar name={user?.name} size="xl" className="rounded-full border-4 border-white shadow-lg mb-4 relative z-10" />
             <h2 className="text-xl font-black text-content-primary relative z-10">{user?.name || "Premium Member"}</h2>
             <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.3em] mt-1 relative z-10">Verified Account #9422</p>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="mb-10 px-4">
              <h3 className="px-4 text-[10px] font-black text-brand-pink uppercase tracking-[0.2em] mb-4">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.path) navigate(item.path);
                      else {
                        setLocalPrefs({
                          theme: user?.preferences?.theme || 'light',
                          compactMode: user?.preferences?.compactMode || false,
                          notifications: {
                            email: user?.preferences?.notifications?.email ?? true,
                            sms: user?.preferences?.notifications?.sms ?? true,
                            push: user?.preferences?.notifications?.push ?? true
                          }
                        });
                        open(item);
                      }
                    }}
                    className="w-full flex items-center gap-5 px-5 py-4 hover:bg-surface-secondary transition-all group active:scale-[0.98]"
                  >
                    <div 
                       className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-primary group-hover:bg-white shadow-sm group-hover:shadow-md transition-all"
                       style={{ color: item.color }}
                    >
                       <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                       <p className="text-base font-bold text-content-primary group-hover:text-brand-pink transition-colors">{item.label}</p>
                       <p className="text-[10px] text-content-tertiary font-medium uppercase tracking-wider">{item.desc}</p>
                    </div>
                    <RiArrowRightSLine className="w-6 h-6 text-content-tertiary group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="px-8 pt-6">
            <button 
              onClick={handleLogout}
              className="w-full py-4 flex items-center justify-center gap-3 border-2 border-rose-100 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
            >
              <RiLogoutBoxRLine className="w-5 h-5" /> Logout Account
            </button>
            <p className="text-center text-[10px] text-content-tertiary font-bold mt-10 uppercase tracking-widest opacity-40">Secure Session • v4.2.0-C</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={activeTab?.label}
        variant="bottom"
        footer={
           <div className="flex flex-col w-full gap-3">
              <Button onClick={handleSave} loading={loading} className="w-full bg-brand-pink text-white font-black uppercase tracking-widest h-12">Apply Changes</Button>
              <Button variant="ghost" onClick={close} className="w-full text-xs font-black uppercase tracking-widest">Cancel</Button>
           </div>
        }
      >
        <div className="space-y-6 py-4">
           {activeTab?.label === 'Identity Information' && (
              <div className="space-y-4">
                 <Input label="Full Name" defaultValue={user?.name} />
                 <Input label="Contact Email" defaultValue={user?.email} />
                 <Input label="Phone Number" defaultValue={user?.phone || "+91 XXXXX-XXXXX"} disabled />
              </div>
           )}

           {activeTab?.label === 'Visual Experience' && (
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-3">Color Theme</p>
                    <div className="grid grid-cols-3 gap-2">
                       {['light', 'dark', 'system'].map(t => (
                          <button 
                             key={t}
                             onClick={() => setLocalPrefs(prev => ({ ...prev, theme: t }))}
                             className={`py-3 rounded-xl border-2 transition-all capitalize font-bold text-xs ${localPrefs.theme === t ? 'border-brand-pink bg-brand-pink/5 text-brand-pink' : 'border-border bg-surface-primary text-content-tertiary'}`}
                          >
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-2xl">
                    <div>
                       <p className="text-sm font-bold text-content-primary">Compact Interface</p>
                       <p className="text-[10px] text-content-tertiary uppercase font-medium">Reduce spacing and text sizes</p>
                    </div>
                    <input 
                       type="checkbox" 
                       checked={localPrefs.compactMode}
                       onChange={(e) => setLocalPrefs(prev => ({ ...prev, compactMode: e.target.checked }))}
                       className="w-10 h-6 rounded-full bg-border appearance-none cursor-pointer checked:bg-brand-pink relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-5 before:transition-all shadow-inner"
                    />
                 </div>
              </div>
           )}

           {activeTab?.label === 'Communication Feed' && (
              <div className="space-y-4">
                 {[
                    { key: 'email', label: 'Email Alerts', desc: 'Updates on orders & service' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Critical security & OTP alerts' },
                    { key: 'push', label: 'Push Notifications', desc: 'Direct app activity alerts' }
                 ].map(n => (
                    <div key={n.key} className="flex items-center justify-between p-4 bg-surface-secondary rounded-2xl">
                       <div>
                          <p className="text-sm font-bold text-content-primary">{n.label}</p>
                          <p className="text-[10px] text-content-tertiary uppercase font-medium">{n.desc}</p>
                       </div>
                       <input 
                          type="checkbox" 
                          checked={localPrefs.notifications[n.key]}
                          onChange={(e) => setLocalPrefs(prev => ({ 
                             ...prev, 
                             notifications: { ...prev.notifications, [n.key]: e.target.checked }
                          }))}
                          className="w-10 h-6 rounded-full bg-border appearance-none cursor-pointer checked:bg-brand-pink relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-5 before:transition-all shadow-inner"
                       />
                    </div>
                 ))}
              </div>
           )}

           {activeTab?.label === 'Security & Access' && (
              <div className="space-y-4">
                 <Input label="Current Password" type="password" placeholder="••••••••" />
                 <Input label="New Password" type="password" placeholder="Min 8 chars" />
              </div>
           )}

           {activeTab?.label !== 'Identity Information' && activeTab?.label !== 'Security & Access' && 
            activeTab?.label !== 'Visual Experience' && activeTab?.label !== 'Communication Feed' && (
              <div className="p-8 text-center bg-surface-elevated flex flex-col items-center">
                 <RiSettings4Line className="w-10 h-10 text-brand-pink/30 mb-2 animate-spin-slow" />
                 <p className="text-xs text-content-secondary">Synchronizing your {activeTab?.label.toLowerCase()} settings...</p>
              </div>
           )}
        </div>
      </Modal>
    </div>
  );
}
