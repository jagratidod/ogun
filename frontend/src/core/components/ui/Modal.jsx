import { useEffect, useRef } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer, variant = 'center' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={classNames(
        "fixed inset-0 z-[100] flex p-0 bg-black/60 backdrop-blur-sm animate-fade-in",
        variant === 'bottom' ? "items-end" : "items-center justify-center p-4"
      )}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={classNames(
        'w-full bg-surface-card border-x border-t border-border shadow-dropdown overflow-hidden transition-all duration-500',
        variant === 'bottom' ? "rounded-t-[40px] animate-slide-from-bottom max-w-2xl mx-auto" : "rounded-3xl animate-scale-in",
        sizes[size]
      )}>
        {/* Drag Handle for Bottom Sheet */}
        {variant === 'bottom' && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-content-tertiary/30" />
          </div>
        )}

        {/* Header */}
        <div className={classNames(
          "flex items-center justify-between px-6 py-5",
          variant !== 'bottom' && "border-b border-border"
        )}>
          <div>
            <h2 className="text-lg font-black text-content-primary tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-all active:scale-95">
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>
        {/* Body */}
        <div className={classNames(
          "px-6 pb-10 overflow-y-auto",
          variant === 'bottom' ? "max-h-[85vh]" : "max-h-[60vh] py-5"
        )}>
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-6 border-t border-border bg-surface-elevated/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
