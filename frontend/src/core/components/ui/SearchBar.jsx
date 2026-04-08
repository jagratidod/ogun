import { classNames } from '../../utils/helpers';
import { RiSearchLine } from 'react-icons/ri';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={classNames('relative', className)}>
      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field w-full pl-10 pr-4"
      />
    </div>
  );
}
