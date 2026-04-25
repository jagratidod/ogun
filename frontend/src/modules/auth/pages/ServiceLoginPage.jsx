import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiToolsLine, RiMailLine, RiLockPasswordLine,
  RiArrowRightLine, RiArrowLeftLine, RiEyeLine, RiEyeOffLine
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
    e.preventDefault();
    if (!form.email) return toast.error('Email is required');
    if (!form.password) return toast.error('Password is required');
    setLoading(true);
    const { success, user, message } = await loginTechnician(form.email, form.password);
    setLoading(false);
    if (success) {
      toast.success(`Welcome, ${user.name}`);
      navigate('/technician');
    } else {
      toast.error(message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">

      {/* Top wave */}
      <div className="relative h-[22vh] min-h-[150px] w-full bg-gradient-to-r from-brand-teal via-[#3FAFB0] to-brand-teal-dark overflow-visible flex items-center justify-center">
        <div className="absolute inset-0 flex items-start px-5 pt-8 z-20">
          <button onClick={() => navigate('/')}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all">
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
        </div>
        <div className="z-10">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
            <img src="/remove bg logo .png" alt="Ogun" className="h-9 w-9 object-contain" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </div>

      {/* Icon + title */}
      <div className="flex flex-col items-center mt-7 px-6">
        <div className="w-16 h-16 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mb-4">
          <RiToolsLine className="w-8 h-8 text-brand-teal" />
        </div>
        <h1 className="text-2xl font-black text-brand-teal tracking-tighter uppercase italic">Field Technician</h1>
        <p className="text-[10px] text-gray-300 font-black tracking-[0.2em] mt-1 uppercase">Service Portal Login</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-8 pt-8 pb-10 w-full max-w-[380px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="relative group">
            <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-brand-teal text-[11px] font-black z-20">
              Email Address
            </label>
            <div className="relative">
              <RiMailLine className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-teal/40 pointer-events-none" />
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-brand-teal focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal" />
            </div>
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-brand-teal text-[11px] font-black z-20">
              Password
            </label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-teal/40 pointer-events-none" />
              <input type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-brand-teal focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal" />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-teal transition-colors">
                {showPwd ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-3.5 mt-2 bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-[18px] flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-teal/15 active:scale-[0.98] transition-all group overflow-hidden relative ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
            {!loading && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-400">New technician?</p>
          <Link to="/technician/signup"
            className="text-[11px] font-black text-brand-teal uppercase tracking-[0.2em] border-b border-brand-teal/30 pb-0.5 hover:border-brand-teal transition-colors">
            Register your account
          </Link>
        </div>

        <p className="text-center text-[10px] text-gray-200 font-black tracking-[0.2em] uppercase mt-8 opacity-60">
          Authorized Technicians Only
        </p>
      </div>

      {/* Bottom wave */}
      <div className="relative h-[14vh] min-h-[90px] w-full bg-gradient-to-r from-brand-teal via-[#3FAFB0] to-brand-teal-dark overflow-hidden mt-auto">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
        <div className="h-full flex items-center justify-center opacity-10 pb-4">
          <img src="/remove bg logo .png" alt="Ogun" className="h-10 w-10 object-contain grayscale brightness-200" />
        </div>
      </div>
    </div>
  );
}
