import { classNames } from '../../utils/helpers';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  icon: 'p-2 rounded-none text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-all duration-200',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-2.5',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', icon: Icon, iconPosition = 'left', disabled = false, loading = false, ...props }) {
  return (
    <button
      className={classNames(
        variants[variant],
        variant !== 'icon' && sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'opacity-70 cursor-wait',
        'inline-flex items-center justify-center gap-2',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
}
