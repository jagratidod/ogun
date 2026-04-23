import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiMailLine, RiLockPasswordFill, RiEyeLine, RiEyeOffLine, 
  RiArrowRightLine, RiShieldKeyholeLine, RiPulseFill,
  RiFingerprintLine, RiLayoutGridFill, RiArrowLeftLine,
  RiUserLine, RiPoliceBadgeLine, RiHashtag, RiGroupLine
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import { SUB_ROLES } from '../../../core/utils/constants';
import { validateEmail, validateOTP, validateName, validatePassword } from '../../../core/utils/validation';

export default function AdminSignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: Profile
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    subRole: '',
    password: '',
    confirmPassword: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!formData.email) return toast.error('Staff email required.');
      if (!validateEmail(formData.email)) return toast.error('Invalid staff email format.');
      toast.success('Security Token Sent');
      setStep(1);
    } else if (step === 1) {
      if (!validateOTP(formData.otp)) return toast.error('Check security token (6 digits).');
      toast.success('Identity Pre-Verified');
      setStep(2);
    } else {
      if (!validateName(formData.name)) return toast.error('Professional name too short.');
      if (!formData.subRole) return toast.error('Role selection required.');
      if (!validatePassword(formData.password)) return toast.error('Access key must be at least 8 characters.');
      if (formData.password !== formData.confirmPassword) return toast.error('Confirmation mismatch.');
      
      toast.success('Staff Account Initialized');
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
        <div className="w-full md:w-[45%] p-12 lg:p-16 flex flex-col justify-between relative bg-[#334155] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#334155] via-[#475569] to-[#E0128A] opacity-90" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ 
             backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
             filter: 'contrast(120%) brightness(120%)'
          }} />

          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/admin/login')}>
              <div className="w-12 h-12 p-2 bg-white flex items-center justify-center">
                <RiArrowLeftLine className="text-[#334155] w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Registration</p>
                <h3 className="text-xl font-black text-white tracking-[0.1em] uppercase italics leading-none">Onboarding.</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="w-10 h-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <h1 className="text-[56px] font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Staff<br />
                <span className="text-white/40">Enroll.</span>
              </h1>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                Create your unique administrative identity within the Ogun core ecosystem.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20">
                    <RiGroupLine className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Access Group B</span>
                </div>
             </div>
          </div>
        </div>

        {/* ─── Right Panel: Form Side ─── */}
        <div className="w-full md:w-[55%] p-10 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-[340px] mx-auto w-full space-y-8 py-8">
            
            {/* Header Content */}
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <RiPoliceBadgeLine className="text-[#334155] w-5 h-5" />
                 <span className="text-[10px] font-black text-[#334155] uppercase tracking-[0.5em]">Enrollment</span>
               </div>
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">
                 {step === 0 ? 'Initialize.' : step === 1 ? 'Unlock.' : 'Profiles.'}
               </h2>
               <p className="text-content-tertiary text-sm font-medium opacity-60">
                 {step === 0 ? 'Anchor your staff email to the system.' : step === 1 ? 'Validate your internal node identity.' : 'Finalize your core access parameters.'}
               </p>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleNext} className="space-y-6">
              
              {step === 0 && (
                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Staff Email</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                    <input 
                      type="email"
                      placeholder="staff@ogun.in"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2.5 group">
                   <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-pink transition-colors">Security Token</label>
                   <div className="relative">
                     <RiHashtag className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-pink transition-colors w-5 h-5" />
                     <input 
                       type="text"
                       placeholder="0 0 0 • 0 0 0"
                       maxLength={6}
                       value={formData.otp}
                       onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                       className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-pink transition-all text-base font-bold text-[#0F172A] outline-none tracking-[0.5em] placeholder:tracking-normal"
                       required
                     />
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Full Professional Name</label>
                    <div className="relative">
                      <RiUserLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="Vikram Singh"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[0-9]/g, '')})}
                        className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-teal transition-all text-base font-bold text-[#0F172A] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-magenta transition-colors">Staff Role Selection</label>
                    <div className="relative">
                      <RiShieldKeyholeLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-magenta transition-colors w-5 h-5" />
                      <select 
                        value={formData.subRole}
                        onChange={(e) => setFormData({...formData, subRole: e.target.value})}
                        className="w-full h-12 pl-8 border-b-2 border-gray-100 focus:border-brand-magenta transition-all text-base font-bold text-[#0F172A] outline-none bg-transparent appearance-none"
                        required
                      >
                        <option value="" disabled>Select Sub-Role</option>
                        {Object.values(SUB_ROLES).map(role => (
                          <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-black text-[#0F172A]/30 uppercase tracking-[0.3em] pl-1 group-focus-within:text-brand-teal transition-colors">Access Key</label>
                    <div className="relative">
                      <RiFingerprintLine className="absolute left-0 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors w-5 h-5" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                </div>
              )}

              <button 
                type="submit"
                className="w-full h-14 bg-[#0F172A] text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-between px-8 relative overflow-hidden group shadow-2xl active:scale-[0.98] transition-all"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-teal via-[#475569] to-brand-magenta" />
                <span className="relative z-10">{step === 2 ? 'Complete Enrollment' : 'Continue'}</span>
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
