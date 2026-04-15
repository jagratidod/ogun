import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowRightUpLine, RiSearchLine, RiExpandDiagonalLine } from 'react-icons/ri';

const SplashPage = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      onClick={() => navigate('/login')}
      className="relative h-screen w-full bg-white flex flex-col font-sans overflow-hidden select-none cursor-pointer"
    >
      {/* Top Section - Teal Gradient with Wave */}
      <div className="relative h-[22vh] min-h-[140px] w-full bg-gradient-to-r from-[#5AC2B1] via-[#3FAFB0] to-[#2D8F9C] flex items-center justify-center overflow-hidden">
        <div className="z-10 flex flex-col items-center">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30 animate-scale-in">
            <img src="/remove bg logo .png" alt="Ogun Logo" className="h-12 w-12 object-contain" />
          </div>
          <div className="mt-3 text-white font-black tracking-[0.3em] text-[10px] uppercase drop-shadow-md">
            OGUN APPLIANCES
          </div>
        </div>

        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[40px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6 py-4 overflow-hidden">
        {/* Dot Pattern Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#3FAFB0 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        {/* Appliance Cluster */}
        <div className="relative w-full max-w-[320px] sm:max-w-md aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 to-brand-pink/5 rounded-full blur-3xl opacity-50"></div>
          <img
            src="/init page .png"
            alt="Appliances"
            className="w-full h-full object-contain relative z-10"
          />

        </div>

        {/* Tagline */}
        <div className="mt-0 text-center space-y-1 relative z-10">
          <h2 className="text-base font-black text-[#2D8F9C] leading-tight">
            Home&Kitchen appliances,
          </h2>
          <h2 className="text-xl font-black text-[#2D8F9C] leading-tight">
            One-stop service
          </h2>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative h-[18vh] min-h-[150px] w-full bg-gradient-to-tr from-[#2D8F9C] via-[#3FAFB0] to-[#5AC2B1] flex items-center justify-center overflow-hidden px-8">
        {/* Top Curve */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[40px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        {/* Floating Pink Accent */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#E0128A] to-[#7A2E8E] blur-3xl opacity-30 transform rotate-45"></div>
      </div>

      <style>{`
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }
        @keyframes scale-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        .animate-scale-in {
            animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashPage;
