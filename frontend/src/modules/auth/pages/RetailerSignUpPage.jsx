import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiUserFill, RiMailFill, RiArrowRightFill, RiShoppingBag3Fill, RiBuildingFill, RiSearchLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../../core/context/AuthContext';
import partnerService from '../../../core/services/partnerService';
import { validateEmail, validateName, validateBusinessName } from '../../../core/utils/validation';

const RetailerSignUpPage = () => {
  const navigate = useNavigate();
  const { registerPartner } = useAuthContext();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [distSearch, setDistSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', shopName: '', distributorId: '' });

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await partnerService.getDistributors();
        setDistributors(res.data || []);
      } catch (error) {
        toast.error('Failed to load distributor list');
      }
    };
    fetchDistributors();
  }, []);

  const steps = [
    { id: 'shop', label: 'Commercial Entity', placeholder: 'Store / Boutique Name', icon: RiShoppingBag3Fill, field: 'shopName' },
    { id: 'distributor', label: 'Preferred Distributor', placeholder: 'Select your distributor', icon: RiBuildingFill, field: 'distributorId' },
    { id: 'contact', label: 'Corporate Email', placeholder: 'retail@store.com', icon: RiMailFill, field: 'email' },
    { id: 'final', label: 'Proprietor Name', placeholder: 'Your Full Name', icon: RiUserFill, field: 'name' }
  ];

  const filteredDistributors = distributors.filter(d => 
    d.name.toLowerCase().includes(distSearch.toLowerCase()) || 
    d.businessName?.toLowerCase().includes(distSearch.toLowerCase())
  );

  const handleNext = async () => {
    const current = steps[step];
    const val = formData[current.field];

    if (!val) return toast.error(`${current.label} required.`);

    if (current.field === 'email' && !validateEmail(val)) {
      return toast.error('Invalid corporate email format.');
    }
    if (current.field === 'name' && !validateName(val)) {
      return toast.error('Proprietor name too short.');
    }
    if (current.field === 'shopName' && !validateBusinessName(val)) {
      return toast.error('Store / Boutique name too short.');
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
      role: 'retailer',
      email: formData.email,
      name: formData.name,
      shopName: formData.shopName,
      distributorId: formData.distributorId
    });
    setLoading(false);

    if (success) {
      toast.success(message || 'Retailer application submitted');
      navigate('/retailer/login');
      return;
    }

    toast.error(message || 'Registration failed');
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-[450px] min-h-screen bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 z-10 w-full">
          <div className="w-[150px] mb-4">
             <img src="/init page .png" alt="Showcase" className="w-full h-auto object-contain opacity-80" />
          </div>

          <div className="text-center mb-6">
             <h1 className="text-xl font-black text-[#2D8F9C] tracking-tighter uppercase italic">RETAIL ENROLL</h1>
             <p className="text-[#94A3B8] text-[8px] font-black tracking-[0.2em] uppercase opacity-70">DIRECT SALES NETWORK</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-6 bg-[#E0128A]' : 'w-1.5 bg-[#F1F3F5]'}`}></div>
            ))}
          </div>

          <div className="w-full space-y-6">
            <div className="relative group">
              <div className="absolute -top-[9px] left-8 bg-white px-2 z-20">
                 <span className="text-[#3FAFB0] text-[10px] font-black uppercase tracking-wider">{currentStep.label}</span>
              </div>
              
              {currentStep.id === 'distributor' ? (
                <div className="space-y-2">
                  <div className="relative flex items-center h-12 bg-white border border-[#F1F3F5] rounded-full px-6 shadow-sm group-focus-within:border-[#3FAFB0] transition-all">
                    <RiSearchLine className="text-[#3FAFB0]/40 w-4 h-4 mr-3 group-focus-within:text-[#3FAFB0] transition-colors" />
                    <input
                      type="text"
                      placeholder="Search distributor..."
                      value={distSearch}
                      onChange={(e) => setDistSearch(e.target.value)}
                      className="w-full outline-none text-[15px] font-bold text-[#455A64] placeholder:text-slate-200"
                    />
                  </div>
                  <div className="max-h-[150px] overflow-y-auto border border-[#F1F3F5] rounded-2xl p-2 space-y-1">
                    {filteredDistributors.length > 0 ? (
                      filteredDistributors.map(d => (
                        <button
                          key={d._id}
                          onClick={() => {
                            setFormData({ ...formData, distributorId: d._id });
                            setDistSearch(d.businessName || d.name);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-[13px] transition-colors ${formData.distributorId === d._id ? 'bg-[#3FAFB0] text-white' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                        >
                          <div className="font-black">{d.businessName || d.name}</div>
                          <div className="text-[10px] opacity-70 uppercase tracking-tighter">{d.location || 'Pan India'}</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[10px] text-slate-400 font-bold uppercase">No distributors found</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center h-12 bg-white border border-[#F1F3F5] rounded-full px-6 shadow-sm group-focus-within:border-[#3FAFB0] transition-all">
                  <currentStep.icon className="text-[#3FAFB0]/40 w-4 h-4 mr-3 group-focus-within:text-[#3FAFB0] transition-colors" />
                  <input
                    type="text"
                    placeholder={currentStep.placeholder}
                    value={formData[currentStep.field]}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (currentStep.field === 'name' || currentStep.field === 'shopName') {
                        val = val.replace(/[0-9]/g, '');
                      }
                      setFormData({ ...formData, [currentStep.field]: val });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full outline-none text-[15px] font-bold text-[#455A64] placeholder:text-slate-200"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#2D8F9C] to-[#5AC2B1] rounded-full flex items-center justify-center gap-2 text-white font-black text-base shadow-md active:scale-[0.98] transition-all"
            >
              {loading ? 'PROCESSING...' : (step === steps.length - 1 ? 'ACTIVATE NODE' : 'CONTINUE')}
              <RiArrowRightFill className="w-5 h-5" />
            </button>

            <div className="text-center pt-4">
              <span className="text-slate-400 text-xs">Retail node active? </span>
              <button onClick={() => navigate('/retailer/login')} className="text-[#E0128A] text-xs font-bold hover:underline">Log In</button>
            </div>
          </div>
        </div>

        <div className="relative h-[120px] w-full bg-[#3FAFB0] mt-auto shrink-0 opacity-10">
          <div className="h-full flex items-center justify-center pt-8">
             <img src="/remove bg logo .png" alt="Ogun" className="h-10 w-10 object-contain grayscale brightness-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerSignUpPage;
