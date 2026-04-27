import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiToolsLine, RiMailLine, RiLockPasswordLine,
  RiArrowRightLine, RiArrowLeftLine, RiEyeLine, RiEyeOffLine, RiArrowRightFill, RiArrowLeftFill
} from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import toast from 'react-hot-toast';

export default function ServiceLoginPage() {
  const navigate = useNavigate();
  const { loginTechnician } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email) return toast.error('Email is required');
    if (!form.password) return toast.error('Password is required');
    setLoading(true);
    const { success, user, message } = await loginTechnician(form.email, form.password);
    setLoading(false);
    if (success) {
      toast.success(`Welcome, ${user.name}`);
      if (user.subRole === 'technician_manager') navigate('/tech-manager');
      else navigate('/tech-portal');
    } else {
      toast.error(message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Header Section - Matching Splash Page Wave Style */}
      <div className="relative h-[20vh] min-h-[140px] w-full bg-gradient-to-r from-[#5AC2B1] via-[#3FAFB0] to-[#2D8F9C] overflow-visible flex items-center justify-center">
        {/* Navigation Bar */}
        <div className="absolute inset-0 flex justify-between items-start px-5 pt-8 z-20">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftFill className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 flex items-center justify-center opacity-0 pointer-events-none">
            <RiToolsLine className="w-5 h-5" />
          </div>
        </div>

        {/* Logo - Centered in Header */}
        <div className="z-10 flex flex-col items-center -mt-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
            <img src="/remove bg logo .png" alt="Ogun Logo" className="h-8 w-8 object-contain" />
          </div>
        </div>

        {/* Curved Header Bottom (Splash Page Style Wave) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Hero Image Section - Enlarged but Header Compact */}
      <div className="flex flex-col items-center -mt-[25px] sm:-mt-[40px] px-6 relative z-30 transition-all duration-500">
        <div className="relative max-w-[340px] w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#3FAFB0]/5 blur-3xl rounded-full"></div>
          <img
            src="/init page .png"
            alt="Appliances"
            className="w-full h-auto object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
          />
        </div>

        <div className="mt-5 text-center px-4">
          <h1 className="text-xl font-black text-[#2D8F9C] tracking-tighter uppercase leading-none">SERVICE PORTAL</h1>
          <p className="text-gray-300 text-[9px] font-black tracking-[0.2em] mt-1.5 opacity-60 uppercase">FIELD TECHNICIAN ACCESS</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-10 w-full max-w-[360px] mx-auto relative z-10">
        <div className="relative">
          {/* Progress Indicator (Fixed for single step) */}
          <div className="flex gap-1.5 mb-7 justify-center">
            <div className="h-1.5 rounded-full w-12 bg-[#E0128A]" />
          </div>

          {/* Form Content */}
          <div className="space-y-5 animate-fade-in text-left">
            <div className="relative group">
              <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#5AC2B1] text-[11px] font-black z-20 group-focus-within:text-[#E0128A] transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3FAFB0]/40 group-focus-within:text-[#E0128A] transition-colors">
                  <RiMailLine className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full h-12 pl-14 pr-5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#3FAFB0] focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-100 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#5AC2B1] text-[11px] font-black z-20 group-focus-within:text-[#E0128A] transition-colors">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3FAFB0]/40 group-focus-within:text-[#E0128A] transition-colors">
                  <RiLockPasswordLine className="w-5 h-5" />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full h-12 pl-14 pr-12 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#3FAFB0] focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-100 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#3FAFB0] transition-colors"
                >
                  {showPwd ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Compact Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full h-12 bg-gradient-to-r from-[#2D8F9C] to-[#5AC2B1] rounded-[18px] flex items-center justify-center gap-3 text-white font-black text-lg shadow-xl shadow-[#3FAFB0]/15 active:scale-[0.98] transition-all group overflow-hidden relative ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'SIGNING IN...' : 'CONTINUE'}
                  {!loading && <RiArrowRightFill className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
                {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
              </button>
            </div>

            <div className="text-center mt-4 space-y-2">
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/technician/signup"
                  className="text-[11px] font-black text-[#E0128A] hover:underline uppercase tracking-widest"
                >
                  New technician? Register
                </Link>
              </div>
              <p className="text-gray-200 text-[9px] tracking-[0.2em] font-black uppercase opacity-70">
                Authorized Access • Service Portal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Section - Mirroring Header Style */}
      <div className="relative h-[15vh] min-h-[100px] w-full bg-gradient-to-r from-[#5AC2B1] via-[#3FAFB0] to-[#2D8F9C] overflow-hidden mt-auto">
        {/* Wave at the top of footer */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        {/* Centered Logo in Footer (Subtle) */}
        <div className="h-full flex items-center justify-center opacity-10 pb-4">
          <img src="/remove bg logo .png" alt="Ogun Logo" className="h-12 w-12 object-contain grayscale brightness-200" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
