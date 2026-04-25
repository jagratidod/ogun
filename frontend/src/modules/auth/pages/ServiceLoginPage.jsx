import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiCustomerService2Line, RiMailFill, RiShieldFlashFill,
  RiArrowRightFill, RiArrowLeftFill
} from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import toast from 'react-hot-toast';

const ServiceLoginPage = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useAuthContext();
  const [step, setStep] = useState(0); // 0: Name, 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: ''
  });

  const steps = [
    {
      id: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      icon: RiCustomerService2Line,
      type: 'text',
      field: 'name'
    },
    {
      id: 'email',
      label: 'Corporate Email',
      placeholder: 'service.head@ogun.in',
      icon: RiMailFill,
      type: 'email',
      field: 'email'
    },
    {
      id: 'otp',
      label: 'Security Token',
      placeholder: 'Enter 6-digit OTP',
      icon: RiShieldFlashFill,
      type: 'number',
      field: 'otp'
    }
  ];

  const handleNext = async () => {
    if (step === 0 && !formData.name) return toast.error('Please enter your name');
    
    if (step === 1) {
      if (!formData.email) return toast.error('Officer email required.');
      
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'admin');
      setLoading(false);
      
      if (success) {
        toast.success(message || 'OTP sent to your email!');
        setStep(2);
      } else {
        toast.error(message || 'Failed to send security token');
      }
      return;
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinalLogin();
    }
  };

  const handleFinalLogin = async () => {
    if (!formData.otp || formData.otp.length < 6) return toast.error('Enter valid 6-digit security token.');
    
    setLoading(true);
    const { success, role, message } = await verifyOTP(formData.email, formData.otp, 'admin', formData.name);
    setLoading(false);

    if (success && role === 'admin') {
      toast.success('Service Center Access Granted');
      navigate('/service-center');
    } else {
      toast.error(message || 'Verification failed');
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Header Section */}
      <div className="relative h-[20vh] min-h-[140px] w-full bg-gradient-to-r from-brand-teal via-[#3FAFB0] to-brand-teal-dark overflow-visible flex items-center justify-center">
        <div className="absolute inset-0 flex justify-between items-start px-5 pt-8 z-20">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
          >
            <RiArrowLeftFill className="w-5 h-5" />
          </button>
        </div>

        <div className="z-10 flex flex-col items-center -mt-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/30">
            <img src="/remove bg logo .png" alt="Ogun Logo" className="h-8 w-8 object-contain" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(130%+1.3px)] h-[35px] fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="flex flex-col items-center -mt-[25px] sm:-mt-[40px] px-6 relative z-30 transition-all duration-500">
        <div className="relative max-w-[340px] w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-brand-teal/5 blur-3xl rounded-full"></div>
          <img
            src="/init page .png"
            alt="Service Center"
            className="w-full h-auto object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]"
          />
        </div>

        <div className="mt-5 text-center px-4">
          <h1 className="text-xl font-black text-brand-teal tracking-tighter uppercase leading-none italic">DISPATCH HUB</h1>
          <p className="text-gray-300 text-[9px] font-black tracking-[0.2em] mt-1.5 opacity-60 uppercase">SERVICE CENTER LOGIN</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex flex-col px-8 pt-6 pb-10 w-full max-w-[360px] mx-auto relative z-10">
        <div className="relative">
          <div className="flex gap-1.5 mb-7 justify-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-teal' : 'w-2 bg-gray-100'
                  }`}
              />
            ))}
          </div>

          <div className="space-y-6 animate-fade-in text-left">
            <div className="relative group">
              <label className="absolute -top-2.5 left-7 px-1.5 bg-white text-brand-teal text-[11px] font-black z-20 group-focus-within:text-brand-magenta transition-colors">
                {currentStep.label}
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-teal/40 group-focus-within:text-brand-magenta transition-colors">
                  <currentStep.icon className="w-5 h-5" />
                </div>
                <input
                  type={currentStep.type}
                  placeholder={currentStep.placeholder}
                  value={formData[currentStep.field]}
                  onChange={(e) => setFormData({ ...formData, [currentStep.field]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full h-12 pl-14 pr-5 bg-white border border-gray-100 rounded-[18px] outline-none focus:border-brand-teal focus:shadow-[0_8px_20px_rgba(63,175,176,0.08)] transition-all text-[15px] font-bold placeholder:text-gray-100 placeholder:font-normal"
                />

                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-brand-teal transition-colors"
                  >
                    <RiArrowLeftFill className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                disabled={loading}
                className={`w-full h-12 bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-[18px] flex items-center justify-center gap-3 text-white font-black text-lg shadow-xl shadow-brand-teal/15 active:scale-[0.98] transition-all group overflow-hidden relative ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'PROCESSING...' : step === 2 ? 'ENTER' : 'CONTINUE'}
                  {!loading && step < 2 && <RiArrowRightFill className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
                {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>}
              </button>
            </div>

            <div className="text-center mt-4 space-y-2">
              <p className="text-gray-200 text-[10px] tracking-[0.2em] font-black uppercase opacity-70">
                Authorized Dispatch Personnel Only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Section */}
      <div className="relative h-[15vh] min-h-[100px] w-full bg-gradient-to-r from-brand-teal via-[#3FAFB0] to-brand-teal-dark overflow-hidden mt-auto">
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
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ServiceLoginPage;
