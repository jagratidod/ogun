import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserFill, RiMailFill, RiShieldFlashFill, RiArrowRightFill } from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import toast from 'react-hot-toast';
import { validateEmail, validateOTP, validateName } from '../../../core/utils/validation';

const SalesLoginPage = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useAuthContext();
  const [step, setStep] = useState(1); // Starting from email for simplicity in field force
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: 'Executive', email: '', otp: '' });

  const steps = [
    { id: 'email', label: 'Field ID (Email)', placeholder: 'Enter your work email', icon: RiMailFill, field: 'email' },
    { id: 'otp', label: 'Security Token', placeholder: 'Enter 6-digit OTP', icon: RiShieldFlashFill, field: 'otp' }
  ];

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email) return toast.error('Work email required.');
      if (!validateEmail(formData.email)) return toast.error('Invalid email format.');
      
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'sales_executive');
      setLoading(false);
      
      if (success) {
        toast.success(message);
        setStep(2);
      } else {
        toast.error(message);
      }
      return;
    }

    handleFinalLogin();
  };

  const handleFinalLogin = async () => {
    if (!validateOTP(formData.otp)) return toast.error('Enter valid 6-digit security token.');
    
    setLoading(true);
    const { success, role, message } = await verifyOTP(formData.email, formData.otp, 'sales_executive', formData.name);
    setLoading(false);

    if (success && role === 'sales_executive') {
      toast.success(`Welcome back, ${formData.name}`);
      navigate(`/sales`);
    } else if (success) {
      toast.error('Access denied. Please use the correct portal.');
    } else {
      toast.error(message || 'Identity mismatch.');
    }
  };

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-[450px] min-h-screen bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="relative h-[120px] w-full bg-[#2D8F9C] shrink-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-[55px] z-50">
             <div className="bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center border border-slate-50">
                   <img src="/remove bg logo .png" alt="Ogun" className="w-12 h-12 object-contain" />
                </div>
             </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[40px] bg-white translate-y-1/2 border-t-2 border-[#2D8F9C]"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 z-10 w-full">
          <div className="mt-8 text-center space-y-2">
             <h1 className="text-2xl font-black text-[#2D8F9C] tracking-tighter uppercase italic">FIELD INTELLIGENCE</h1>
             <p className="text-[#94A3B8] text-[9px] font-black tracking-[0.3em] uppercase opacity-70">Sales Force Authentication</p>
          </div>

          <div className="flex items-center justify-center gap-2 my-8">
             <div className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-[#E0128A]' : 'w-2 bg-[#F1F3F5]'}`}></div>
             <div className={`h-2 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-[#E0128A]' : 'w-2 bg-[#F1F3F5]'}`}></div>
          </div>

          <div className="w-full space-y-8">
            <div className="relative group">
              <div className="absolute -top-[10px] left-8 bg-white px-2 z-20">
                 <span className="text-[#3FAFB0] text-[11px] font-black uppercase tracking-widest">{currentStep.label}</span>
              </div>
              
              <div className="relative flex items-center h-14 bg-white border border-[#F1F3F5] rounded-xl px-6 shadow-sm group-focus-within:border-[#3FAFB0] group-focus-within:ring-4 group-focus-within:ring-[#3FAFB0]/5 transition-all">
                <currentStep.icon className="text-[#3FAFB0]/40 w-5 h-5 mr-3 group-focus-within:text-[#3FAFB0]" />
                <input
                  type={step === 2 ? "number" : "text"}
                  placeholder={currentStep.placeholder}
                  value={formData[currentStep.field]}
                  onChange={(e) => setFormData({ ...formData, [currentStep.field]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full outline-none text-base font-bold text-[#455A64] placeholder:text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={loading}
              className={`w-full h-14 bg-gradient-to-r from-[#2D8F9C] to-[#3FAFB0] rounded-xl flex items-center justify-center gap-2 text-white font-black text-lg shadow-xl shadow-[#2D8F9C]/20 active:scale-[0.98] transition-all ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? 'VERIFYING...' : 'GET STARTED'}
              {!loading && <RiArrowRightFill className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="p-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
           Assigned for Internal Intelligence Suite Only
        </div>
      </div>
    </div>
  );
};

export default SalesLoginPage;
