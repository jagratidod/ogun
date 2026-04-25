import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiToolsLine, RiUserLine, RiMailLine, RiLockPasswordLine,
  RiPhoneLine, RiMapPinLine, RiArrowRightLine, RiArrowLeftLine,
  RiEyeLine, RiEyeOffLine, RiCheckLine, RiTimeLine
} from 'react-icons/ri';
import api from '../../../core/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'personal', label: 'Personal Info', fields: ['name', 'email'] },
  { id: 'contact',  label: 'Contact',       fields: ['phone', 'location'] },
  { id: 'security', label: 'Security',      fields: ['password', 'confirmPassword'] },
];

const EMPTY = { name: '', email: '', phone: '', location: '', password: '', confirmPassword: '' };

export default function TechnicianSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    }
    if (step === 1) {
      if (!form.phone.trim()) e.phone = 'Phone is required';
      if (!form.location.trim()) e.location = 'Location is required';
    }
    if (step === 2) {
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Min 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    // Final submit
    setLoading(true);
    try {
      await api.post('/auth/technician/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        location: form.location,
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 font-sans">
        <div className="w-20 h-20 rounded-full bg-brand-teal/10 border-2 border-brand-teal/30 flex items-center justify-center mb-6">
          <RiCheckLine className="w-10 h-10 text-brand-teal" />
        </div>
        <h2 className="text-2xl font-black text-brand-teal uppercase italic tracking-tight mb-2">Request Submitted!</h2>
        <p className="text-sm text-gray-400 text-center max-w-xs mb-2">
          Your technician account has been created and is pending admin approval.
        </p>
        <div className="flex items-center gap-2 mt-2 mb-8 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <RiTimeLine className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">You'll be able to log in once an admin approves your account.</p>
        </div>
        <Link
          to="/technician/login"
          className="w-full max-w-xs h-12 bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-[18px] flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-teal/15"
        >
          Go to Login <RiArrowRightLine className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">

      {/* Top wave */}
      <div className="relative h-[22vh] min-h-[150px] w-full bg-gradient-to-r from-brand-teal via-[#3FAFB0] to-brand-teal-dark overflow-visible flex items-center justify-center">
        <div className="absolute inset-0 flex items-start px-5 pt-8 z-20">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/technician/login')}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
        </div>
        <div className="z-10 flex flex-col items-center">
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
      <div className="flex flex-col items-center mt-6 px-6">
        <div className="w-14 h-14 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center mb-3">
          <RiToolsLine className="w-7 h-7 text-brand-teal" />
        </div>
        <h1 className="text-xl font-black text-brand-teal tracking-tighter uppercase italic">Technician Registration</h1>
        <p className="text-[10px] text-gray-300 font-black tracking-[0.2em] mt-1 uppercase">Create your service account</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mt-5 px-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                i < step ? 'bg-brand-teal text-white' :
                i === step ? 'bg-brand-teal text-white ring-4 ring-brand-teal/20' :
                'bg-gray-100 text-gray-300'
              }`}>
                {i < step ? <RiCheckLine className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ${i === step ? 'text-brand-teal' : 'text-gray-300'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-all ${i < step ? 'bg-brand-teal' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form fields */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-10 w-full max-w-[380px] mx-auto">
        <div className="space-y-5 animate-fade-in">

          {step === 0 && (
            <>
              <Field icon={RiUserLine} label="Full Name" error={errors.name}>
                <input type="text" placeholder="e.g. Ravi Kumar" value={form.name} onChange={set('name')}
                  className={inputCls} />
              </Field>
              <Field icon={RiMailLine} label="Email Address" error={errors.email}>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')}
                  className={inputCls} />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field icon={RiPhoneLine} label="Phone Number" error={errors.phone}>
                <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')}
                  className={inputCls} />
              </Field>
              <Field icon={RiMapPinLine} label="Service Area / City" error={errors.location}>
                <input type="text" placeholder="e.g. Mumbai, Maharashtra" value={form.location} onChange={set('location')}
                  className={inputCls} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field icon={RiLockPasswordLine} label="Password" error={errors.password}
                action={<button type="button" onClick={() => setShowPwd(s => !s)} className="text-gray-300 hover:text-brand-teal transition-colors">
                  {showPwd ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>}>
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')}
                  className={inputCls} />
              </Field>
              <Field icon={RiLockPasswordLine} label="Confirm Password" error={errors.confirmPassword}
                action={<button type="button" onClick={() => setShowConfirm(s => !s)} className="text-gray-300 hover:text-brand-teal transition-colors">
                  {showConfirm ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>}>
                <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={inputCls} />
              </Field>
            </>
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className={`w-full h-13 py-3.5 mt-2 bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-[18px] flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-teal/15 active:scale-[0.98] transition-all group overflow-hidden relative ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Submitting...' : step < STEPS.length - 1 ? 'Continue' : 'Submit Registration'}
              {!loading && <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
            {!loading && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Already have an account?{' '}
            <Link
            to="/technician/login"
            className="inline-flex items-center gap-2 text-[11px] font-black text-brand-teal uppercase tracking-[0.2em] border-b border-brand-teal/30 pb-0.5 hover:border-brand-teal transition-colors"
          >
            Sign In
          </Link>
          </p>
        </div>
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

      <style>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fade-in 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
}

const inputCls = "w-full h-13 pl-12 pr-10 py-3.5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-brand-teal focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-200 placeholder:font-normal";

function Field({ icon: Icon, label, error, action, children }) {
  return (
    <div className="relative group">
      <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-brand-teal text-[11px] font-black z-20 group-focus-within:text-brand-teal transition-colors">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-teal/40 group-focus-within:text-brand-teal transition-colors pointer-events-none" />
        {children}
        {action && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{action}</div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400 font-medium mt-1 pl-2">{error}</p>}
    </div>
  );
}
