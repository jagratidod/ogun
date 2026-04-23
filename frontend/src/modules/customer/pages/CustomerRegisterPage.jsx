import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserFill, RiMailFill, RiPhoneFill,
  RiShieldFlashFill,
  RiArrowRightFill, RiArrowLeftFill, RiCheckFill
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../core/context/AuthContext';

const STEPS = [
  { id: 'name',    label: 'Full Name',          placeholder: 'Your full name',        icon: RiUserFill,         type: 'text',   field: 'name' },
  { id: 'phone',   label: 'Mobile Number',       placeholder: '10-digit mobile number',icon: RiPhoneFill,        type: 'tel',    field: 'phone' },
  { id: 'email',   label: 'Email Address',       placeholder: 'your@email.com',        icon: RiMailFill,         type: 'email',  field: 'email' },
  { id: 'otp',     label: 'Email Verification',  placeholder: 'Enter 6-digit OTP',     icon: RiShieldFlashFill,  type: 'number', field: 'otp' },
];

const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useAuthContext();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', otp: '' });

  const currentStep = STEPS[step];

  const handleNext = async () => {
    if (step === 0 && !formData.name.trim())  return toast.error('Please enter your full name');
    if (step === 1 && formData.phone.length < 10) return toast.error('Enter a valid 10-digit mobile number');
    if (step === 2) {
      if (!formData.email.includes('@')) return toast.error('Please enter a valid email');
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'customer');
      setLoading(false);
      if (success) {
        toast.success(message || 'OTP sent to ' + formData.email);
        setStep(3);
      } else {
        toast.error(message || 'Failed to send OTP');
      }
      return;
    }

    if (step === STEPS.length - 1) {
      if (!formData.otp || String(formData.otp).length !== 6) return toast.error('Enter valid 6-digit OTP');
      setLoading(true);
      const { success, message } = await verifyOTP(formData.email, formData.otp, 'customer', formData.name);
      setLoading(false);
      if (success) {
        toast.success('Account created successfully!');
        navigate('/customer');
      } else {
        toast.error(message || 'Verification failed');
      }
      return;
    }

    setStep(step + 1);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    const { success, message } = await requestOTP(formData.email, 'customer');
    setLoading(false);
    if (success) {
      toast.success('OTP resent!');
    } else {
      toast.error(message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* ─── Header Wave ─── */}
      <div className="relative h-[20vh] min-h-[140px] w-full bg-gradient-to-r from-[#5AC2B1] via-[#3FAFB0] to-[#2D8F9C] overflow-visible flex items-center justify-center">
        {/* Nav */}
        <div className="absolute inset-0 flex justify-between items-start px-5 pt-8 z-20">
          <button
            onClick={() => navigate('/customer/login')}
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
        <div className="relative max-w-[300px] w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-[#3FAFB0]/5 blur-3xl rounded-full" />
          <img
            src="/init page .png"
            alt="Register"
            className="w-full h-auto object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
            style={{ maxHeight: '200px' }}
          />
        </div>
        <div className="mt-3 text-center px-4">
          <h1 className="text-xl font-black text-[#2D8F9C] tracking-tighter uppercase leading-none">CREATE ACCOUNT</h1>
          <p className="text-gray-300 text-[9px] font-black tracking-[0.2em] mt-1.5 opacity-60 uppercase">Join Ogun Smart Service</p>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-10 w-full max-w-[360px] mx-auto relative z-10">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? 'w-4 bg-[#3FAFB0]/60' :
                i === step ? 'w-8 bg-[#E0128A]' : 'w-2 bg-gray-100'
              }`}
            />
          ))}
        </div>

        <div className="space-y-5 animate-fade-in">
          {/* Completed steps summary */}
          {step > 0 && (
            <div className="space-y-2">
              {STEPS.slice(0, step).map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 bg-[#3FAFB0]/5 rounded-2xl border border-[#3FAFB0]/15">
                  <RiCheckFill className="w-4 h-4 text-[#3FAFB0] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-[#3FAFB0]/60 uppercase tracking-widest">{s.label}</p>
                    <p className="text-sm font-bold text-[#2D8F9C]">{formData[s.field]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current input */}
          <div className="relative group">
            <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-[#5AC2B1] text-[11px] font-black z-20 group-focus-within:text-[#E0128A] transition-colors">
              {currentStep.label}
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3FAFB0]/40 group-focus-within:text-[#E0128A] transition-colors">
                <currentStep.icon className="w-5 h-5" />
              </div>
              <input
                key={step}
                type={currentStep.type}
                placeholder={currentStep.placeholder}
                value={formData[currentStep.field]}
                maxLength={currentStep.id === 'otp' ? 6 : currentStep.id === 'phone' ? 10 : undefined}
                onChange={(e) => setFormData({ ...formData, [currentStep.field]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
                className="w-full h-12 pl-14 pr-5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-[#3FAFB0] focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal"
              />
            </div>
          </div>

          {/* OTP helper */}
          {step === STEPS.length - 1 && (
            <div className="text-center">
              <p className="text-[11px] text-gray-300 font-semibold">OTP sent to <span className="text-[#3FAFB0] font-black">{formData.email}</span></p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="mt-1 text-[10px] font-black text-[#E0128A] uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#2D8F9C] to-[#5AC2B1] rounded-[18px] flex items-center justify-center gap-3 text-white font-black text-base shadow-xl shadow-[#3FAFB0]/15 active:scale-[0.98] transition-all group overflow-hidden relative disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'PROCESSING...' : step === STEPS.length - 1 ? 'CREATE ACCOUNT' : 'CONTINUE'}
              {!loading && step < STEPS.length - 1 && <RiArrowRightFill className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>

          {/* Already have account */}
          <div className="text-center pt-2">
            <span className="text-gray-300 text-[11px] font-semibold">Already have an account? </span>
            <button
              onClick={() => navigate('/customer/login')}
              className="text-[11px] font-black text-[#E0128A] hover:underline uppercase tracking-widest"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer Wave ─── */}
      <div className="relative h-[15vh] min-h-[100px] w-full bg-gradient-to-r from-[#5AC2B1] via-[#3FAFB0] to-[#2D8F9C] overflow-hidden mt-auto">
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

export default CustomerRegisterPage;
