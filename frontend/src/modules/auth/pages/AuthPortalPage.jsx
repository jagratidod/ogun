import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiShieldUserFill,
  RiTruckFill,
  RiStore2Fill,
  RiUserHeartFill,
  RiSettings4Fill,
  RiLayoutGridFill
} from 'react-icons/ri';

const AuthPortalPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'admin',
      title: 'Console',
      role: 'Master Admin',
      description: 'Management Hub',
      icon: RiShieldUserFill,
      path: '/admin/login',
      theme: 'from-slate-900 to-slate-800',
    },
    {
      id: 'distributor',
      title: 'Logistics',
      role: 'Distributor',
      description: 'Supply Chain Ops',
      icon: RiTruckFill,
      path: '/distributor/login',
      theme: 'from-brand-teal-dark to-brand-teal',
    },
    {
      id: 'retailer',
      title: 'Commerce',
      role: 'Retail Partner',
      description: 'Retail Network',
      icon: RiStore2Fill,
      path: '/retailer/login',
      theme: 'from-rose-600 to-rose-500',
    },
    {
      id: 'sales_executive',
      title: 'Intelligence',
      role: 'Field Executive',
      description: 'Market Sales',
      icon: RiLayoutGridFill,
      path: '/sales/login',
      theme: 'from-brand-teal to-brand-teal-dark',
    },
    {
      id: 'hr',
      title: 'People',
      role: 'HR Manager',
      description: 'Employee Lifecycle',
      icon: RiUserHeartFill,
      path: '/hr/login',
      theme: 'from-brand-teal to-brand-teal-dark',
    },
    {
      id: 'service',
      title: 'Support',
      role: 'Service Manager',
      description: 'Service & Tickets',
      icon: RiSettings4Fill,
      path: '/technician/login',
      theme: 'from-brand-teal to-brand-teal-dark',
    },
    {
      id: 'customer',
      title: 'Experience',
      role: 'Customer',
      description: 'Consumer Portal',
      icon: RiUserHeartFill,
      path: '/customer/login',
      theme: 'from-purple-700 to-purple-500',
    }
  ];

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col font-sans transition-colors duration-500">
      {/* ─── Compact Header ─── */}
      <nav className="h-16 bg-surface-card border-b border-border flex items-center justify-between px-6 md:px-12 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-teal p-1.5 rounded-lg shadow-lg">
            <img src="/remove bg logo .png" alt="Ogun" className="h-5 w-5 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black text-brand-teal tracking-tighter uppercase italic">OGUN</h1>
            <p className="text-[7px] font-black tracking-[0.4em] text-content-tertiary uppercase leading-none">Intelligence Gateway</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[9px] font-black text-content-tertiary uppercase tracking-widest">
          <span className="hover:text-brand-teal cursor-pointer transition-colors">Docs</span>
          <span className="hover:text-brand-teal cursor-pointer transition-colors">Support</span>
          <span className="text-content-primary px-3 py-1 bg-surface-hover rounded-full">V 2.4.1</span>
        </div>
      </nav>

      {/* ─── Minimalist Hero ─── */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-12 flex-1 flex flex-col">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-teal/10 rounded-full border border-brand-teal/20">
            <span className="text-[9px] font-black text-brand-teal uppercase tracking-[0.2em]">Select Identity</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-content-primary leading-none tracking-tighter uppercase italic">
            IDENTITY<br />
            <span className="text-brand-teal">PORTAL.</span>
          </h2>
        </div>

        {/* ─── Compact Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portals.map((portal) => (
            <button
              key={portal.id}
              onClick={() => navigate(portal.path)}
              className="group h-[240px] relative overflow-hidden bg-surface-card rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col p-6 border border-border hover:border-brand-teal/30 active:scale-[0.98]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${portal.theme} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10 w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center mb-auto group-hover:bg-white/20 group-hover:backdrop-blur-md transition-all duration-500">
                <portal.icon className="w-6 h-6 text-content-primary group-hover:text-white transition-colors duration-500" />
              </div>

              <div className="relative z-10 space-y-1">
                <p className="text-[8px] font-black text-content-tertiary group-hover:text-white/60 uppercase tracking-[0.2em]">
                  {portal.role}
                </p>
                <h3 className="text-xl font-black text-content-primary group-hover:text-white uppercase italic tracking-tighter leading-none transition-colors">
                  {portal.title}
                </h3>
                <p className="text-[10px] text-content-tertiary group-hover:text-white/80 font-medium leading-tight opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  {portal.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="py-6 px-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 opacity-40 text-content-tertiary">
        <p className="text-[9px] font-black uppercase tracking-widest">© 2026 OGUN CORE SYSTEM</p>
        <div className="flex items-center gap-4">
          <RiSettings4Fill className="w-4 h-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Ready for Operations</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPortalPage;
