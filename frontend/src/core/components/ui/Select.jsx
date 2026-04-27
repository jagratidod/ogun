import { useState, Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export default function Select({ 
  label, 
  options = [], 
  value: controlledValue, 
  onChange, 
  defaultValue,
  error, 
  className = '', 
  icon: Icon,
  placeholder = 'Select option...',
  ...props 
}) {
  const [internalValue, setInternalValue] = useState(controlledValue || defaultValue || '');
  
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Find the current selected option label
  const selectedOption = options.find(opt => opt.value === value) || null;


  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1 opacity-70">
          {label}
        </label>
      )}

      <Listbox 
        value={value} 
        onChange={(val) => {
          if (controlledValue === undefined) {
            setInternalValue(val);
          }
          if (onChange) {
            onChange({ target: { value: val, name: props.name } });
          }
        }}
      >


        <div className="relative group">
          <Listbox.Button
            className={classNames(
              'relative w-full h-11 flex items-center bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-teal/40 transition-all text-left shadow-sm hover:border-brand-teal/20',
              Icon ? 'pl-11' : 'pl-4',
              'pr-10',
              error && 'border-state-danger'
            )}
          >
            {Icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-teal transition-colors">
                <Icon className="w-4 h-4" />
              </div>
            )}
            
            <span className={classNames('block truncate', !selectedOption ? 'text-gray-300' : 'text-content-primary')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-brand-teal transition-all duration-300">
              <RiArrowDownSLine className="w-5 h-5" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full min-w-[180px] right-0 overflow-auto rounded-[24px] bg-white p-1.5 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm border border-border scrollbar-hide origin-top-right">

              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-pointer select-none py-3 pl-9 pr-4 rounded-2xl transition-all duration-200',
                      active ? 'bg-brand-teal/10 text-brand-teal' : 'text-content-primary'
                    )
                  }
                  value={opt.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={classNames('block font-black text-[10px] uppercase tracking-widest whitespace-nowrap', selected ? 'text-brand-teal' : 'text-content-secondary')}>
                        {opt.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-3 flex items-center text-brand-teal">
                          <RiCheckLine className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>

        </div>
      </Listbox>

      {error && <p className="text-[10px] font-bold text-state-danger mt-1 px-1">{error}</p>}
    </div>
  );
}
