import { RiUserLine, RiMailLine, RiPhoneLine, RiMapPinLine, RiToolsLine, RiLogoutBoxRLine, RiShieldCheckLine } from 'react-icons/ri';
import { Avatar, Badge } from '../../../core';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function TechnicianProfilePage() {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    toast.loading('Signing out...');
    setTimeout(logout, 600);
  };

  const infoRows = [
    { icon: RiUserLine,   label: 'Full Name',  value: user?.name },
    { icon: RiMailLine,   label: 'Email',       value: user?.email },
    { icon: RiPhoneLine,  label: 'Phone',       value: user?.phone || '—' },
    { icon: RiMapPinLine, label: 'City',        value: user?.location || '—' },
  ];

  return (
    <div className="page-container max-w-lg mx-auto">

      {/* Avatar hero */}
      <div className="flex flex-col items-center py-8 gap-3">
        <Avatar name={user?.name} size="xl" />
        <div className="text-center">
          <h2 className="text-xl font-black text-content-primary">{user?.name}</h2>
          <p className="text-xs text-content-tertiary mt-0.5">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="teal">
            {user?.subRole === 'technician_manager' ? 'Technician Manager' : 'Technician'}
          </Badge>
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      {/* Info card */}
      <div className="glass-card divide-y divide-border">
        {infoRows.map(row => (
          <div key={row.label} className="flex items-center gap-4 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
              <row.icon className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <p className="text-[10px] font-black text-content-tertiary uppercase tracking-wider">{row.label}</p>
              <p className="text-sm font-semibold text-content-primary mt-0.5">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Services */}
      {user?.services?.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <RiToolsLine className="w-4 h-4 text-brand-teal" />
            <p className="text-xs font-black text-content-tertiary uppercase tracking-wider">Services Provided</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.services.map(svc => (
              <span key={svc} className="px-3 py-1.5 text-[11px] font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded-lg">
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Account status */}
      <div className="glass-card p-5 flex items-center gap-3">
        <RiShieldCheckLine className="w-5 h-5 text-state-success flex-shrink-0" />
        <div>
          <p className="text-xs font-black text-content-tertiary uppercase tracking-wider">Account Status</p>
          <p className="text-sm font-semibold text-state-success mt-0.5">Approved & Active</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-state-danger/30 text-state-danger text-sm font-bold hover:bg-state-danger/5 transition-colors"
      >
        <RiLogoutBoxRLine className="w-4 h-4" />
        Sign Out
      </button>

    </div>
  );
}
