import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiMailLine, RiLockPasswordFill, RiEyeLine, RiEyeOffLine, 
  RiArrowRightLine, RiShieldKeyholeLine, RiPulseFill,
  RiFingerprintLine, RiLayoutGridFill, RiArrowLeftLine,
  RiShieldCheckLine, RiHashtag
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import { validateEmail, validateOTP, validatePassword } from '../../../core/utils/validation';

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: Reset Password
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!formData.email) return toast.error('Enter registered email.');
      if (!validateEmail(formData.email)) return toast.error('Invalid corporate email format.');
      toast.success('Security Token Sent');
      setStep(1);
    } else if (step === 1) {
      if (!validateOTP(formData.otp)) return toast.error('Check security token (6 digits).');
      toast.success('Identity Verified');
      setStep(2);
    } else {
      if (!validatePassword(formData.newPassword)) return toast.error('New access key must be at least 8 characters.');
      if (formData.newPassword !== formData.confirmPassword) return toast.error('Confirmation mismatch.');
      toast.success('Access Key Updated');
      navigate('/admin/login');
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
        
        {/* ─── Left Panel: Theme Side ─── */}
        <div className="w-full md:w-[45%] p-12 lg:p-16 flex flex-col justify-between relative bg-brand-teal overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3FAFB0] via-[#E0128A] to-[#2D8F9C] opacity-90" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ 
             backgroundImage: 'url("/noise.svg")',
             filter: 'contrast(120%) brightness(120%)'
          }} />

          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/admin/login')}>
              <div className="w-12 h-12 p-2 bg-white flex items-center justify-center">
                <RiArrowLeftLine className="text-brand-magenta w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Recovery</p>
                <h3 className="text-xl font-black text-white tracking-[0.1em] uppercase italics leading-none">Back to Link.</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="w-10 h-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <h1 className="text-[56px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Reset<br />
                <span className="text-white/40">Secure.</span>
              </h1>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                Initiate security protocols to recover your administrative console access.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20">
                    <RiShieldKeyholeLine className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Protocol Layer 02</span>
                </div>
             </div>
          </div>
        </div>

        {/* ─── Right Panel: Form Side ─── */}
        <div className="w-full md:w-[55%] p-10 sm:p-16 lg:p-24 flex flex-col justify-center bg-white">
          <div className="max-w-[340px] mx-auto w-full space-y-12">
            
            {/* Header Content */}
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <RiShieldCheckLine className="text-brand-magenta w-5 h-5" />
                 <span className="text-[10px] font-black text-brand-magenta uppercase tracking-[0.5em]">Recovery Mode</span>
               </div>
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">
                 {step === 0 ? 'Anchor.' : step === 1 ? 'Verify.' : 'Relink.'}
               </h2>
               <p className="text-content-tertiary text-sm font-medium opacity-60">
                 {step === 0 ? 'Link your staff email to continue.' : step === 1 ? 'Check your internal inbox for the token.' : 'Configure your new administrative key.'}
               </p>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleNext} className="space-y-8">
              
              {step === 0 && (
                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Staff Identification</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                    <input 
                      type="email"
                      placeholder="staff@ogun.in"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none placeholder:text-gray-200"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2.5 group">
                   <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-magenta transition-colors">Security Token</label>
                   <div className="relative">
                     <RiHashtag className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-magenta transition-colors w-5 h-5" />
                     <input 
                       type="text"
                       placeholder="0 0 0 • 0 0 0"
                       maxLength={6}
                       value={formData.otp}
                       onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                       className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-magenta transition-all text-base font-bold text-[#0F172A] outline-none tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal"
                       required
                     />
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">New Access Key</label>
                    <div className="relative">
                      <RiFingerprintLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full h-12 pl-8 pr-12 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-brand-teal transition-colors px-2"
                      >
                        {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-pink transition-colors">Confirm Key</label>
                    <div className="relative">
                      <RiLockPasswordFill className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-pink transition-colors w-5 h-5" />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-pink transition-all text-base font-bold text-[#0F172A] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full h-14 bg-[#0F172A] text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-between px-8 relative overflow-hidden group shadow-2xl active:scale-[0.98] transition-all"
              >
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${step === 1 ? 'from-brand-magenta to-brand-pink' : 'from-brand-teal to-brand-magenta'}`} />
                <span className="relative z-10">{step === 2 ? 'Update Access' : 'Continue'}</span>
                <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Back Button */}
            <div className="pt-8 flex flex-col items-center gap-6 border-t border-gray-50">
               <button 
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 text-[10px] font-black text-content-tertiary uppercase tracking-[0.3em] hover:text-brand-teal transition-all group"
               >
                  <RiLayoutGridFill className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Back to Console
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
