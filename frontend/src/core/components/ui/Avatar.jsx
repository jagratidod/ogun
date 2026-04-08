import { getInitials, classNames } from '../../utils/helpers';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const bgColors = [
  'bg-brand-teal/20 text-brand-teal',
  'bg-brand-pink/20 text-brand-pink',
  'bg-brand-purple/20 text-brand-purple',
  'bg-state-info/20 text-state-info',
  'bg-state-warning/20 text-state-warning',
  'bg-state-success/20 text-state-success',
];

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const initials = getInitials(name);
  const colorIndex = name ? name.charCodeAt(0) % bgColors.length : 0;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={classNames(sizes[size], 'rounded-none object-cover', className)}
      />
    );
  }

  return (
    <div
      className={classNames(
        sizes[size],
        bgColors[colorIndex],
        'rounded-none flex items-center justify-center font-semibold',
        className
      )}
    >
      {initials}
    </div>
  );
}
