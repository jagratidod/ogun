import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../core/context/AuthContext';
import { ROLES, APP_NAME } from '../../../core/utils/constants';
import {
  RiShieldKeyholeLine, RiTruckLine, RiStore2Line, RiUserLine, RiArrowRightLine
} from 'react-icons/ri';

const roleCards = [
  {
    role: ROLES.ADMIN,
    label: 'Admin',
    description: 'Full system control — manage all operations, users, and reports',
    icon: RiShieldKeyholeLine,
    color: 'from-brand-teal to-brand-teal-dark',
    bgGlow: 'shadow-glow',
    redirect: '/admin',
  },
  {
    role: ROLES.DISTRIBUTOR,
    label: 'Distributor',
    description: 'Manage stock, dispatch orders, and track retailer network',
    icon: RiTruckLine,
    color: 'from-state-info to-blue-600',
    bgGlow: 'shadow-[0_0_20px_rgba(88,166,255,0.15)]',
    redirect: '/distributor',
  },
  {
    role: ROLES.RETAILER,
    label: 'Retailer',
    description: 'Sell products, manage inventory, and request restocks',
    icon: RiStore2Line,
    color: 'from-brand-pink to-brand-magenta',
    bgGlow: 'shadow-glow-pink',
    redirect: '/retailer',
  },
  {
    role: ROLES.CUSTOMER,
    label: 'Customer',
    description: 'Register products, track warranty, and raise service requests',
    icon: RiUserLine,
    color: 'from-brand-purple to-purple-700',
    bgGlow: 'shadow-[0_0_20px_rgba(122,46,142,0.15)]',
    redirect: '/customer',
  },
];

export default function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleLogin = (role, redirect) => {
    login(role);
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-teal/5 rounded-none blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-pink/5 rounded-none blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="OGUN Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-content-primary mb-2">{APP_NAME}</h1>
          <p className="text-content-secondary">Kitchen Appliance Business Management System</p>
          <p className="text-sm text-content-tertiary mt-2">Select your role to continue</p>
        </div>

        {/* Role cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleCards.map((card) => (
            <button
              key={card.role}
              onClick={() => handleLogin(card.role, card.redirect)}
              onMouseEnter={() => setHoveredRole(card.role)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`group relative overflow-hidden bg-surface-card border border-border rounded-none p-6 text-left transition-all duration-300 hover:border-border-light hover:-translate-y-1 ${
                hoveredRole === card.role ? card.bgGlow : ''
              }`}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-none bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-content-primary">{card.label}</h3>
                    <RiArrowRightLine className="w-5 h-5 text-content-tertiary group-hover:text-content-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <p className="text-sm text-content-secondary mt-1">{card.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-content-tertiary mt-8">
          Demo mode — No authentication required
        </p>
      </div>
    </div>
  );
}
