import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiMailFill, RiShieldFlashFill, RiLockPasswordFill,
  RiEyeLine, RiEyeOffLine, RiArrowRightFill, RiArrowLeftFill,
  RiCheckFill, RiRefreshLine
} from 'react-icons/ri';
import toast from 'react-hot-toast';

// Step 0: Enter email → Step 1: Enter OTP → Step 2: Set new password
const STEPS = [
  { label: 'Your Email',         sub: 'We\'ll send a reset OTP to this address.' },
  { label: 'Verify OTP',         sub: 'Check your inbox for the 6-digit code.' },
  { label: 'New Password',       sub: 'Set a strong new password for your account.' },
];

const CustomerForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', confirm: '' });

  const handleNext = () => {
    if (step === 0) {
      if (!formData.email.includes('@')) return toast.error('Enter a valid email address');
      toast.success('OTP sent to ' + formData.email);
      setStep(1);
    } else if (step === 1) {
      if (String(formData.otp).length !== 6) return toast.error('Enter the 6-digit OTP from your email');
      setStep(2);
    } else {
      if (formData.password.length < 8) return toast.error('Password must be at least 8 characters');
      if (formData.password !== formData.confirm) return toast.error('Passwords do not match');
      toast.success('Password reset successful!');
      navigate('/customer/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* ─── Header Wave ─── */}
      <div className="relative h-[20vh] min-h-[140px] w-full bg-gradient-to-r from-[#E0128A] via-[#d01577] to-[#b0106a] overflow-visible flex items-center justify-center">
        {/* Nav */}
        <div className="absolute inset-0 flex justify-between items-start px-5 pt-8 z-20">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/customer/login')}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftFill className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">Step</span>
            <span className="text-lg font-black text-white/90 leading-none">{step + 1}/{STEPS.length}</span>
          </div>
        </div>

        {/* Logo */}
        <div className="z-10 flex flex-col items-center -mt-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
            <img src="/remove bg logo .png" alt="Ogun Logo" className="h-8 w-8 object-contain" />
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* ─── Hero Image ─── */}
      <div className="flex flex-col items-center -mt-[25px] sm:-mt-[40px] px-6 relative z-30">
        <div className="relative max-w-[280px] w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#E0128A]/5 blur-3xl rounded-full" />
          <img
            src="/init page .png"
            alt="Forgot Password"
            className="w-full h-auto object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
            style={{ maxHeight: '180px' }}
          />
        </div>

        <div className="mt-3 text-center px-4">
          <h1 className="text-xl font-black text-[#E0128A] tracking-tighter uppercase leading-none">
            {STEPS[step].label}
          </h1>
          <p className="text-gray-300 text-[9px] font-black tracking-[0.2em] mt-1.5 opacity-70 uppercase">
            {STEPS[step].sub}
          </p>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-10 w-full max-w-[360px] mx-auto relative z-10">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-7 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? 'w-4 bg-[#E0128A]/40' :
                i === step ? 'w-8 bg-[#E0128A]' : 'w-2 bg-gray-100'
              }`}
            />
          ))}
        </div>

        <div className="space-y-5 animate-fade-in">

          {/* Step 0: Email */}
          {step === 0 && (
            <div className="relative group">
              <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#E0128A] text-[11px] font-black z-20 group-focus-within:text-[#2D8F9C] transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E0128A]/40 group-focus-within:text-[#2D8F9C] transition-colors">
                  <RiMailFill className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  autoFocus
                  className="w-full h-12 pl-14 pr-5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#E0128A] focus:shadow-[0_8px_20px_rgba(224,18,138,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal"
                />
              </div>
            </div>
          )}

          {/* Step 1: OTP */}
          {step === 1 && (
            <>
              {/* Email confirmed chip */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-[#E0128A]/5 rounded-2xl border border-[#E0128A]/15">
                <RiCheckFill className="w-4 h-4 text-[#E0128A] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-[#E0128A]/60 uppercase tracking-widest">Sending to</p>
                  <p className="text-sm font-bold text-[#E0128A]">{formData.email}</p>
                </div>
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#E0128A] text-[11px] font-black z-20 group-focus-within:text-[#3FAFB0] transition-colors">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E0128A]/40 group-focus-within:text-[#3FAFB0] transition-colors">
                    <RiShieldFlashFill className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    placeholder="000000"
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.slice(0, 6) })}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                    className="w-full h-12 pl-14 pr-5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#E0128A] focus:shadow-[0_8px_20px_rgba(224,18,138,0.08)] transition-all text-[20px] font-black tracking-[0.4em] placeholder:text-gray-200 placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => toast.success('OTP resent!')}
                  className="flex items-center gap-1.5 mx-auto text-[10px] font-black text-[#E0128A] uppercase tracking-widest hover:underline"
                >
                  <RiRefreshLine className="w-3.5 h-3.5" /> Resend OTP
                </button>
              </div>
            </>
          )}

          {/* Step 2: New Password */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="relative group">
                <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#E0128A] text-[11px] font-black z-20 group-focus-within:text-[#3FAFB0] transition-colors">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E0128A]/40 group-focus-within:text-[#3FAFB0] transition-colors">
                    <RiLockPasswordFill className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoFocus
                    className="w-full h-12 pl-14 pr-12 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#E0128A] focus:shadow-[0_8px_20px_rgba(224,18,138,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#E0128A] transition-colors"
                  >
                    {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#E0128A] text-[11px] font-black z-20 group-focus-within:text-[#3FAFB0] transition-colors">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E0128A]/40 group-focus-within:text-[#3FAFB0] transition-colors">
                    <RiLockPasswordFill className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirm}
                    onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full h-12 pl-14 pr-12 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#E0128A] focus:shadow-[0_8px_20px_rgba(224,18,138,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#E0128A] transition-colors"
                  >
                    {showConfirm ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              {formData.password && (
                <div className="flex gap-1 px-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        formData.password.length > i * 3
                          ? i < 2 ? 'bg-[#E0128A]' : 'bg-[#3FAFB0]'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 whitespace-nowrap">
                    {formData.password.length < 6 ? 'Weak' : formData.password.length < 10 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="w-full h-12 bg-gradient-to-r from-[#E0128A] to-[#b0106a] rounded-[18px] flex items-center justify-center gap-3 text-white font-black text-base shadow-xl shadow-[#E0128A]/15 active:scale-[0.98] transition-all group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-2">
              {step === 2 ? 'RESET PASSWORD' : 'CONTINUE'}
              {step < 2 && <RiArrowRightFill className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>

          {/* Back to login */}
          <div className="text-center pt-1">
            <button
              onClick={() => navigate('/customer/login')}
              className="text-[11px] font-black text-[#3FAFB0] hover:underline uppercase tracking-widest"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer Wave ─── */}
      <div className="relative h-[15vh] min-h-[100px] w-full bg-gradient-to-r from-[#E0128A] via-[#d01577] to-[#b0106a] overflow-hidden mt-auto">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
        <div className="h-full flex items-center justify-center opacity-10 pb-4">
          <img src="/remove bg logo .png" alt="Ogun Logo" className="h-12 w-12 object-contain grayscale brightness-200" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CustomerForgotPasswordPage;
