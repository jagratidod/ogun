import { useNavigate } from 'react-router-dom';
import { RiShieldFlashFill, RiArrowLeftFill, RiCustomerService2Fill } from 'react-icons/ri';
import { Button } from '../../../core';

export default function UnauthorizedPage({ isAdmin = false }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-state-danger/10 text-state-danger rounded-none flex items-center justify-center mb-8 animate-pop">
        <RiShieldFlashFill className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-black text-content-primary tracking-tighter uppercase mb-4">Access Denied</h1>
      <p className="text-content-secondary max-w-md mx-auto mb-8 font-medium">
        Your current credentials do not have the required permissions to access this {isAdmin ? 'administrative section' : 'portal'}. Please contact your system administrator if you believe this is an error.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          icon={RiArrowLeftFill} 
          onClick={() => navigate(isAdmin ? '/admin' : '/')}
        >
          Return to Dashboard
        </Button>
        <Button 
          variant="secondary" 
          icon={RiCustomerService2Fill}
        >
          Contact Support
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-border w-full max-w-xs opacity-50">
        <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">
          ERROR_CODE: 403_FORBIDDEN_PERMISSIONS
        </p>
      </div>
    </div>
  );
}
