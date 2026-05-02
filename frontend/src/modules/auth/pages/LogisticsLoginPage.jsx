import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiMailLine, RiShieldKeyholeLine, RiPulseFill,
  RiFingerprintLine, RiLayoutGridFill, RiArrowRightLine, RiTruckLine
} from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';
import { validateEmail, validateOTP } from '../../../core/utils/validation';

export default function LogisticsLoginPage() {
  const { requestOTP, verifyOTP } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Email, 1: OTP
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });

  const [emailError, setEmailError] = useState('');

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!formData.email) {
        setEmailError('Email is required.');
        return;
      }
      if (!validateEmail(formData.email)) {
        setEmailError('Enter a valid registered email');
        return;
      }
      setEmailError('');
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'admin');
      setLoading(false);
      
      if (success) {
        toast.success(message || 'Verification key sent to your mail');
        setStep(1);
      } else {
        toast.error(message || 'Failed to request access');
      }
    } else {
      if (!formData.otp) {
        return toast.error('OTP required.');
      }
      if (!validateOTP(formData.otp)) {
        return toast.error('OTP must be 6 digits.');
      }
      
      setLoading(true);
      const { success, user: userData, message } = await verifyOTP(formData.email, formData.otp, 'admin');
      setLoading(false);
      
      if (success) {
        if (userData?.subRole === 'logistics_manager' || userData?.subRole === 'super_admin') {
            toast.success('Logistics Authentication Successful');
            navigate('/logistics');
        } else {
            toast.error('Identity Conflict: Account lacks Logistics clearance.');
        }
      } else {
        toast.error(message || 'Authentication Failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 lg:p-12 relative overflow-hidden font-sans bg-white text-content-primary">
      {/* ─── Light Background Decoration ─── */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-teal/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(#3FAFB0 0.5px, transparent 0.5px)`,
          backgroundSize: '30px 30px' 
        }} />
      </div>

      {/* ─── Main Content Frame ─── */}
      <div className="relative z-10 w-full max-w-[1040px] h-full md:h-auto flex flex-col md:flex-row bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
        
        {/* ─── Left Panel: Logistics Theme Side ─── */}
        <div className="w-full md:w-[45%] p-12 lg:p-16 flex flex-col justify-between relative bg-[#0F172A] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-brand-teal/30" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 p-3 bg-white shadow-2xl flex items-center justify-center">
                <img src="/logo.png" alt="Ogun" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.4em]">Global Operations</p>
                <h3 className="text-xl font-black text-white tracking-[0.1em] uppercase leading-none">Logistics.</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="w-10 h-1.5 bg-brand-teal shadow-[0_0_15px_rgba(63,175,176,0.5)]" />
              <h1 className="text-[56px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Supply<br />
                <span className="text-brand-teal">Chain.</span>
              </h1>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                Enter the specialized control plane for regional fulfillment and transit logic.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10">
                    <RiPulseFill className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.3em]">{step === 0 ? 'Protocol Standby' : 'Verification Active'}</span>
                </div>
             </div>
             <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">LOGS.ENGINE_v4.2</p>
          </div>
        </div>

        {/* ─── Right Panel: Login Form ─── */}
        <div className="w-full md:w-[55%] p-10 sm:p-16 lg:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-[340px] mx-auto w-full space-y-12">
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <RiTruckLine className="text-brand-teal w-5 h-5" />
                 <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.5em]">Network Login</span>
               </div>
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Access.</h2>
               <p className="text-content-tertiary text-sm font-medium opacity-60 italic">Secure entry for logistics managers.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-8">
              {step === 0 ? (
                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Personnel ID (Email)</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="logistics@ogun.com"
                      value={formData.email}
                      onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailError(''); }}
                      className={`w-full h-12 pl-8 border-b-2 transition-all text-base font-bold text-[#0F172A] outline-none placeholder:text-gray-200 placeholder:font-normal ${emailError ? 'border-red-400' : 'border-gray-100 focus:border-brand-teal'}`}
                    />
                  </div>
                  {emailError && <p className="text-[11px] text-red-400 font-medium pl-1 mt-1">{emailError}</p>}
                </div>
              ) : (
                <div className="space-y-2.5 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] group-focus-within:text-brand-teal transition-colors">Security Key (OTP)</label>
                    <button 
                      type="button" 
                      onClick={() => setStep(0)}
                      className="text-[10px] font-black text-brand-teal uppercase tracking-widest border-b border-brand-teal/20 pb-0.5"
                    >
                      Reset Email
                    </button>
                  </div>
                  <div className="relative">
                    <RiFingerprintLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="XXXXXX"
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none placeholder:text-gray-200 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-14 bg-[#0F172A] text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-between px-8 relative overflow-hidden group shadow-2xl shadow-gray-200 transition-all ${loading ? 'opacity-80' : 'active:scale-[0.98]'}`}
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-teal to-[#1E293B]" />
                <span className="relative z-10">{loading ? 'AUTHENTICATING...' : (step === 0 ? 'VALIDATE IDENTITY' : 'ACCESS CONTROL PLANE')}</span>
                {!loading && <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="pt-8 flex flex-col items-center gap-4 border-t border-gray-50">
               <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-[10px] font-black text-content-tertiary uppercase tracking-[0.3em] hover:text-brand-teal transition-all group opacity-60"
               >
                  <RiLayoutGridFill className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Exit to Root Portal
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
