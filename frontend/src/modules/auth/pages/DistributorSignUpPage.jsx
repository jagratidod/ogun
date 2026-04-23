import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserFill, RiMailFill, RiArrowRightFill, RiStore2Fill, RiMapPinUserFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../core/context/AuthContext';
import { validateEmail, validateName, validateBusinessName } from '../../../core/utils/validation';

const DistributorSignUpPage = () => {
  const navigate = useNavigate();
  const { registerPartner } = useAuthContext();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', businessName: '', location: '' });

  const steps = [
    { id: 'business', label: 'Business Identity', placeholder: 'Legal Entity Name', icon: RiStore2Fill, field: 'businessName' },
    { id: 'location', label: 'Operating Region', placeholder: 'City / State', icon: RiMapPinUserFill, field: 'location' },
    { id: 'contact', label: 'Enterprise Email', placeholder: 'corp@distributor.com', icon: RiMailFill, field: 'email' },
    { id: 'final', label: 'Point of Contact', placeholder: 'Your Full Name', icon: RiUserFill, field: 'name' },
  ];

  const handleNext = async () => {
    const current = steps[step];
    const val = formData[current.field];

    if (!val) return toast.error(`${current.label} required.`);

    if (current.field === 'email' && !validateEmail(val)) {
      return toast.error('Invalid enterprise email format.');
    }
    if (current.field === 'name' && !validateName(val)) {
      return toast.error('Contact name too short.');
    }
    if (current.field === 'businessName' && !validateBusinessName(val)) {
      return toast.error('Legal entity name too short.');
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleFinalSignUp();
    }
  };

  const handleFinalSignUp = async () => {
    setLoading(true);
    const { success, message } = await registerPartner({
      role: 'distributor',
      email: formData.email,
      name: formData.name,
      businessName: formData.businessName,
      location: formData.location,
    });
    setLoading(false);

    if (success) {
      toast.success(message || 'Distributor application submitted');
      navigate('/distributor/login');
      return;
    }

    toast.error(message || 'Registration failed');
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-[450px] min-h-screen bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="relative h-[100px] w-full bg-[#E0128A] shrink-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-[45px] z-50">
             <div className="bg-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border border-slate-50">
                   <img src="/remove bg logo .png" alt="Ogun" className="w-10 h-10 object-contain" />
                </div>
             </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[30px] bg-white translate-y-1/2 border-t-[2px] border-[#E0128A]"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 z-10 w-full">
          <div className="w-[150px] mb-4">
             <img src="/init page .png" alt="Showcase" className="w-full h-auto object-contain opacity-80" />
          </div>

          <div className="text-center mb-6">
             <h1 className="text-xl font-black text-[#E0128A] tracking-tighter uppercase italic">PARTNER ENROLL</h1>
             <p className="text-[#94A3B8] text-[8px] font-black tracking-[0.2em] uppercase opacity-70">DISTRIBUTION CHANNEL</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-6 bg-[#E0128A]' : 'w-1.5 bg-[#F1F3F5]'}`}></div>
            ))}
          </div>

          <div className="w-full space-y-6">
            <div className="relative group">
              <div className="absolute -top-[9px] left-8 bg-white px-2 z-20">
                 <span className="text-[#E0128A] text-[10px] font-black uppercase tracking-wider">{currentStep.label}</span>
              </div>
              
              <div className="relative flex items-center h-12 bg-white border border-[#F1F3F5] rounded-full px-6 shadow-sm group-focus-within:border-[#E0128A] transition-all">
                <currentStep.icon className="text-[#E0128A]/40 w-4 h-4 mr-3 group-focus-within:text-[#E0128A] transition-colors" />
                <input
                  type="text"
                  placeholder={currentStep.placeholder}
                  value={formData[currentStep.field]}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (currentStep.field === 'name' || currentStep.field === 'businessName') {
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
              className="w-full h-12 bg-gradient-to-r from-[#E0128A] to-[#FF4B91] rounded-full flex items-center justify-center gap-2 text-white font-black text-base shadow-md active:scale-[0.98] transition-all"
            >
              {loading ? 'PROCESSING...' : (step === steps.length - 1 ? 'RESERVE SPOT' : 'CONTINUE')}
              <RiArrowRightFill className="w-5 h-5" />
            </button>

            <div className="text-center pt-4">
              <span className="text-slate-400 text-xs">Already partnered? </span>
              <button onClick={() => navigate('/distributor/login')} className="text-[#3FAFB0] text-xs font-bold hover:underline">Log In</button>
            </div>
          </div>
        </div>

        <div className="relative h-[120px] w-full bg-[#E0128A] mt-auto shrink-0 opacity-10">
          <div className="h-full flex items-center justify-center pt-8">
             <img src="/remove bg logo .png" alt="Ogun" className="h-10 w-10 object-contain grayscale brightness-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorSignUpPage;
