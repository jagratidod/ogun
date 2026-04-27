import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiMailLine, RiShieldKeyholeLine, RiPulseFill,
  RiFingerprintLine, RiLayoutGridFill, RiArrowRightLine, RiUserLine
} from 'react-icons/ri';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';
import { validateEmail, validateOTP } from '../../../core/utils/validation';

export default function AdminLoginPage() {
  const { requestOTP, verifyOTP } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Email, 1: OTP
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Optionally used if required, usually admin exists so name is fetched
    email: '',
    otp: ''
  });

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!formData.email) {
        return toast.error('Identification required.');
      }
      if (!validateEmail(formData.email)) {
        return toast.error('Invalid corporate email format.');
      }
      setLoading(true);
      const { success, message } = await requestOTP(formData.email, 'admin');
      setLoading(false);
      
      if (success) {
        toast.success(message || 'Access key sent to your mail');
        setStep(1);
      } else {
        toast.error(message || 'Failed to request access key');
      }
    } else {
      if (!formData.otp) {
        return toast.error('Access key required.');
      }
      if (!validateOTP(formData.otp)) {
        return toast.error('Access key must be 6 digits.');
      }
      
      setLoading(true);
      const { success, role, user: userData, message } = await verifyOTP(formData.email, formData.otp, 'admin', formData.name);
      setLoading(false);
      
      if (success && role === 'admin') {
        toast.success('System Access Granted');
        // Check subRole to redirect to the correct panel
        if (userData?.subRole === 'hr_manager') {
           navigate('/hr');
        } else if (userData?.subRole === 'service_manager') {
           navigate('/technician');
        } else {
           navigate('/admin');
        }
      } else {
        toast.error(message || 'Identity Mismatch');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 lg:p-12 relative overflow-hidden font-sans bg-white">
      {/* ─── Light Background Decoration ─── */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-teal/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-pink/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(#3FAFB0 0.5px, transparent 0.5px)`,
          backgroundSize: '30px 30px' 
        }} />
      </div>

      {/* ─── Main Content Frame ─── */}
      <div className="relative z-10 w-full max-w-[1040px] h-full md:h-auto flex flex-col md:flex-row bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
        
        {/* ─── Left Panel: Vibrant Theme Side (Stays Colorful) ─── */}
        <div className="w-full md:w-[45%] p-12 lg:p-16 flex flex-col justify-between relative bg-brand-teal overflow-hidden">
          {/* Intense Theme Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal via-[#3FAFB0] to-brand-magenta" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ 
             backgroundImage: 'url("/noise.svg")',
             filter: 'contrast(120%) brightness(120%)'
          }} />

          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 p-3 bg-white shadow-2xl flex items-center justify-center">
                <img src="/logo.png" alt="Ogun" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Unit Identity</p>
                <h3 className="text-xl font-black text-white tracking-[0.1em] uppercase italics leading-none">Staff Portal.</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="w-10 h-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <h1 className="text-[56px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Ogun<br />
                <span className="text-white/40">Core.</span>
              </h1>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                Enter the industrial analytics engine of Ogun ecosystem.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20">
                    <RiPulseFill className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">{step === 0 ? 'Network Active' : 'Awaiting OTP Check'}</span>
                </div>
             </div>
             <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em]">Session.ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>

        {/* ─── Right Panel: Clean White Form Side ─── */}
        <div className="w-full md:w-[55%] p-10 sm:p-16 lg:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-[340px] mx-auto w-full space-y-12">
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <RiShieldKeyholeLine className="text-brand-teal w-5 h-5" />
                 <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.5em]">Auth Service</span>
               </div>
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Console.</h2>
               <p className="text-content-tertiary text-sm font-medium opacity-60">Initialize your administrative session.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-8">
              
              {step === 0 ? (
                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Staff Identification</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                    <input 
                      type="email"
                      placeholder="staff@ogun.in"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none placeholder:text-gray-200 placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] group-focus-within:text-brand-pink transition-colors">Security Key (OTP)</label>
                    <button 
                      type="button" 
                      onClick={() => setStep(0)}
                      className="text-[10px] font-black text-brand-teal uppercase tracking-widest border-b border-brand-teal/20 pb-0.5"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <RiFingerprintLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-pink transition-colors w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                      className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-pink transition-all text-base font-bold text-[#0F172A] outline-none placeholder:text-gray-200 placeholder:font-normal"
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
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-teal to-brand-magenta" />
                <span className="relative z-10">{loading ? 'PROCESSING...' : (step === 0 ? 'REQUEST ACCESS' : 'VERIFY & ENTER')}</span>
                {!loading && <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="pt-8 flex flex-col items-center gap-4 border-t border-gray-50">
               <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-[10px] font-black text-content-tertiary uppercase tracking-[0.3em] hover:text-brand-teal transition-all group opacity-60"
               >
                  <RiLayoutGridFill className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Exit to Business Portal
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
