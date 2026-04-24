import { RiArrowLeftLine, RiLogoutCircleLine, RiUserLine, RiMapPinLine, RiPhoneLine, RiMailLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../core/context/AuthContext';
import { Card, Button, Badge } from '../../../core';

export default function SalesProfilePage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-content-primary">Profile</h2>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center border-2 border-brand-teal mb-4 relative">
          <span className="text-4xl font-black text-brand-teal">{user?.name?.charAt(0)}</span>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-state-success rounded-full border-4 border-surface-primary" />
        </div>
        <h3 className="text-lg font-black text-content-primary leading-none">{user?.name}</h3>
        <Badge variant="teal" size="xs" className="mt-2 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</Badge>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Details</h4>
        <Card className="p-4 space-y-4">
           <div className="flex items-center gap-3">
              <RiMapPinLine className="text-brand-magenta" />
              <div>
                 <p className="text-[8px] text-content-tertiary font-black uppercase tracking-widest">Assigned Area</p>
                 <p className="text-xs font-bold text-content-secondary">{user?.salesExecutiveData?.assignedArea || 'Global Field Force'}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <RiPhoneLine className="text-brand-teal" />
              <div>
                 <p className="text-[8px] text-content-tertiary font-black uppercase tracking-widest">Contact</p>
                 <p className="text-xs font-bold text-content-secondary">{user?.email || '—'}</p>
              </div>
           </div>
        </Card>

        <Card className="p-4 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-content-secondary">App Version</span>
              <span className="text-[10px] font-black text-content-tertiary uppercase">v2.4.0 (Stable)</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-content-secondary">Sync Status</span>
              <Badge variant="success" size="xs">Online</Badge>
           </div>
        </Card>

        <Button 
          variant="secondary" 
          className="w-full text-state-danger border-state-danger/20 hover:bg-state-danger/5 font-black uppercase tracking-widest text-xs h-12"
          icon={RiLogoutCircleLine}
          onClick={handleLogout}
        >
          Logout Session
        </Button>
      </div>
    </div>
  );
}
