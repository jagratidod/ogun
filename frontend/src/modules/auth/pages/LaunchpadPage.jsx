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

const LaunchpadPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'admin',
      title: 'Console',
      role: 'Master Admin',
      description: 'Management & Operations Hub',
      icon: RiShieldUserFill,
      path: '/admin/login',
      theme: 'from-[#0F172A] to-[#334155]',
      accent: 'text-white'
    },
    {
      id: 'distributor',
      title: 'Logistics',
      role: 'Distributor',
      description: 'Supply Chain & Distribution',
      icon: RiTruckFill,
      path: '/distributor/login',
      theme: 'from-[#2D8F9C] to-[#5AC2B1]',
      accent: 'text-white'
    },
    {
      id: 'retailer',
      title: 'Commerce',
      role: 'Retail Partner',
      description: 'Direct Sales & Retail Network',
      icon: RiStore2Fill,
      path: '/retailer/login',
      theme: 'from-[#E0128A] to-[#FF4B91]',
      accent: 'text-white'
    },
    {
      id: 'customer',
      title: 'Experience',
      role: 'Customer',
      description: 'Consumer Portal & Services',
      icon: RiUserHeartFill,
      path: '/customer/login',
      theme: 'from-[#7A2E8E] to-[#A855F7]',
      accent: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* ─── Premium Navigation Bar ─── */}
      <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 md:px-16 z-50 sticky top-0">
        <div className="flex items-center gap-4">
           <div className="bg-[#3FAFB0] p-2 rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              <img src="/remove bg logo .png" alt="Ogun" className="h-6 w-6 object-contain" />
           </div>
           <div>
              <h1 className="text-xl font-black text-[#2D8F9C] tracking-tighter uppercase italic">OGUN</h1>
              <p className="text-[8px] font-black tracking-[0.4em] text-slate-400 uppercase leading-none">Intelligence Suite</p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <span className="hover:text-[#2D8F9C] cursor-pointer transition-colors">Documentation</span>
           <span className="hover:text-[#2D8F9C] cursor-pointer transition-colors">Support</span>
           <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
           <span className="text-slate-900">V 2.4.0</span>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <div className="max-w-[1400px] mx-auto w-full px-6 py-12 md:py-20 flex-1">
        <div className="max-w-3xl mb-16 space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3FAFB0]/10 rounded-full border border-[#3FAFB0]/20">
              <RiLayoutGridFill className="text-[#3FAFB0] w-3 h-3" />
              <span className="text-[10px] font-black text-[#3FAFB0] uppercase tracking-[0.2em]">Launchpad Control</span>
           </div>
           <h2 className="text-[56px] md:text-[80px] font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic">
              ENTER THE<br />
              <span className="text-[#2D8F9C]">ECOSYSTEM.</span>
           </h2>
           <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl">
              Access your specific operational department from our unified intelligence gateway. Secure, modular, and performant.
           </p>
        </div>

        {/* ─── Grid Systems ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {portals.map((portal) => (
             <button
               key={portal.id}
               onClick={() => navigate(portal.path)}
               className={`group h-[450px] relative overflow-hidden bg-white rounded-[40px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.15)] transition-all duration-700 flex flex-col p-10 border border-slate-100 hover:border-transparent active:scale-[0.98]`}
             >
                {/* Hover Background Accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${portal.theme} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                {/* Icon Container */}
                <div className="relative z-10 w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-auto group-hover:bg-white/20 group-hover:backdrop-blur-md transition-all duration-700 group-hover:scale-110">
                   <portal.icon className={`w-10 h-10 text-slate-800 group-hover:text-white transition-colors duration-700`} />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-2 mt-20">
                   <p className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.3em] transition-colors">
                      {portal.role}
                   </p>
                   <h3 className="text-4xl font-black text-slate-900 group-hover:text-white uppercase italic tracking-tighter leading-none transition-colors">
                      {portal.title}.
                   </h3>
                   <div className="h-1 w-10 bg-[#3FAFB0] group-hover:bg-white transition-all group-hover:w-full duration-700" />
                   <p className="pt-4 text-slate-500 group-hover:text-white/80 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                      {portal.description}
                   </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-black/10" />
             </button>
           ))}
        </div>
      </div>

      {/* ─── Footer Section ─── */}
      <footer className="py-10 px-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 OGUN APPLIANCES CORE SYSTEM</p>
         <div className="flex items-center gap-6">
            <RiSettings4Fill className="w-4 h-4 text-slate-400 hover:text-slate-900 cursor-pointer" />
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Concierge Service Ready</p>
         </div>
      </footer>

      {/* Global Style Inject */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LaunchpadPage;
