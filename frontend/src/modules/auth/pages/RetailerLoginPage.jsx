import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserFill, RiMailFill, RiShieldFlashFill, RiArrowRightFill } from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import toast from 'react-hot-toast';
import { validateEmail, validateOTP, validateName } from '../../../core/utils/validation';

const RetailerLoginPage = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useAuthContext();
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', otp: '' });

  const steps = [
    { id: 'name', label: 'Retailer Name', placeholder: 'Enter your shop name', icon: RiUserFill, field: 'name' },
    { id: 'email', label: 'Corporate Email', placeholder: 'Enter corporate email', icon: RiMailFill, field: 'email' },
    { id: 'otp', label: '6-Digit Token', placeholder: 'Enter security token', icon: RiShieldFlashFill, field: 'otp' }
  ];

  const handleNext = async () => {
    if (step === 0) {
      if (!validateName(formData.name)) return toast.error('Valid shop name required.');
    }
    
    if (step === 1) {
      if (!formData.email) return toast.error('Enterprise contact required.');
      if (!validateEmail(formData.email)) return toast.error('Invalid corporate email format.');
      
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'retailer');
      setLoading(false);
      
      if (success) {
        toast.success(message);
        setStep(2);
      } else {
        toast.error(message);
      }
      return;
    }

    if (step < 2) setStep(step + 1);
    else handleFinalLogin();
  };

  const handleFinalLogin = async () => {
    if (!validateOTP(formData.otp)) return toast.error('Enter valid 6-digit security token.');
    
    setLoading(true);
    const { success, role, message } = await verifyOTP(formData.email, formData.otp, 'retailer', formData.name);
    setLoading(false);

    if (success && role === 'retailer') {
      toast.success(`Welcome RETAILER, ${formData.name}`);
      navigate(`/retailer`);
    } else if (success) {
      toast.error('Unauthorized access. This portal is for Retailers only.');
    } else {
      toast.error(message || 'Identity mismatch. Verification failed.');
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-[450px] min-h-screen bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* ─── Ultra-Compact Header ─── */}
        <div className="relative h-[100px] w-full bg-[#3FAFB0] shrink-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-[45px] z-50">
             <div className="bg-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border border-slate-50">
                   <img src="/remove bg logo .png" alt="Ogun" className="w-10 h-10 object-contain" />
                </div>
             </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[30px] bg-white translate-y-1/2 border-t-[2px] border-[#3FAFB0]"></div>
        </div>

        {/* ─── Centered High-Density Content Area ─── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 z-10 w-full">
          
          <div className="w-[180px]">
             <img 
               src="/init page .png" 
               alt="Showcase" 
               className="w-full h-auto object-contain drop-shadow-sm"
             />
          </div>

          <div className="mt-4 text-center">
             <h1 className="text-xl font-black text-[#2D8F9C] tracking-tighter uppercase italic">RETAILER LOGIN</h1>
             <p className="text-[#94A3B8] text-[8px] font-black tracking-[0.2em] uppercase opacity-70">RETAIL HUB</p>
          </div>

          <div className="flex items-center justify-center gap-2 my-5">
             <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 0 ? 'w-6 bg-[#E0128A]' : 'w-1.5 bg-[#F1F3F5]'}`}></div>
             <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-6 bg-[#E0128A]' : 'w-1.5 bg-[#F1F3F5]'}`}></div>
             <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-6 bg-[#E0128A]' : 'w-1.5 bg-[#F1F3F5]'}`}></div>
          </div>

          <div className="w-full space-y-6">
            <div className="relative group">
              <div className="absolute -top-[9px] left-8 bg-white px-2 z-20">
                 <span className="text-[#3FAFB0] text-[10px] font-black uppercase tracking-wider">{currentStep.label}</span>
              </div>
              
              <div className="relative flex items-center h-12 bg-white border border-[#F1F3F5] rounded-full px-6 shadow-sm group-focus-within:border-[#3FAFB0] transition-all">
                <currentStep.icon className="text-[#3FAFB0]/40 w-4 h-4 mr-3 group-focus-within:text-[#3FAFB0] transition-colors" />
                <input
                  type="text"
                  placeholder={currentStep.placeholder}
                  value={formData[currentStep.field]}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (currentStep.field === 'name') {
                      val = val.replace(/[0-9]/g, '');
                    }
                    setFormData({ ...formData, [currentStep.field]: val });
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full outline-none text-[15px] font-bold text-[#455A64] placeholder:text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={loading}
              className={`w-full h-12 bg-gradient-to-r from-[#2D8F9C] to-[#5AC2B1] rounded-full flex items-center justify-center gap-2 text-white font-black text-base shadow-md active:scale-[0.98] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'PROCESSING...' : 'CONTINUE'}
              {!loading && <RiArrowRightFill className="w-5 h-5" />}
            </button>

            <div className="text-center pt-4">
              <span className="text-slate-400 text-xs">New to business? </span>
              <button onClick={() => navigate('/retailer/signup')} className="text-[#E0128A] text-xs font-bold hover:underline">Apply Now</button>
            </div>
          </div>
        </div>

        <div className="relative h-[120px] w-full bg-[#3FAFB0] mt-auto shrink-0">
          <div className="absolute top-0 left-0 w-full h-[30px] bg-white border-b-[2px] border-[#3FAFB0]"></div>
          <div className="h-full flex items-center justify-center pt-8 opacity-10">
             <img src="/remove bg logo .png" alt="Ogun" className="h-10 w-10 object-contain grayscale brightness-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerLoginPage;
