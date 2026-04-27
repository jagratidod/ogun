import { useState, Fragment } from 'react';
import { Combobox as HeadlessCombobox, Transition } from '@headlessui/react';
import { RiExpandUpDownLine, RiCheckLine, RiSearchLine, RiArrowDownSLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export default function Combobox({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...', 
  error, 
  className = '' 
}) {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1 opacity-70">
          {label}
        </label>
      )}

      <HeadlessCombobox value={value} onChange={onChange}>
        <div className="relative group">
          <div className="relative w-full">
            <HeadlessCombobox.Input
              className={classNames(
                'w-full h-11 pl-11 pr-10 bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand-teal/40 transition-all shadow-sm placeholder:text-gray-300',
                error ? 'border-state-danger' : 'hover:border-brand-teal/20'
              )}
              displayValue={(opt) => opt?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-brand-teal transition-colors">
               <RiSearchLine className="w-4 h-4" />
            </div>
            <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 group-focus-within:text-brand-teal transition-all duration-300">
              <RiArrowDownSLine
                className="w-5 h-5"
                aria-hidden="true"
              />
            </HeadlessCombobox.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            afterLeave={() => setQuery('')}
          >
            <HeadlessCombobox.Options className="absolute z-50 mt-2 max-h-60 w-full min-w-[200px] right-0 overflow-auto rounded-[24px] bg-white p-1.5 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm border border-border scrollbar-hide origin-top-right">

              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-6 px-4 text-gray-400 text-center font-black text-[10px] uppercase tracking-widest">
                  No results found
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <HeadlessCombobox.Option
                    key={opt.value}
                    className={({ active }) =>
                      classNames(
                        'relative cursor-pointer select-none py-3.5 pl-9 pr-4 rounded-2xl transition-all duration-200',
                        active ? 'bg-brand-teal/10 text-brand-teal' : 'text-content-primary'
                      )
                    }
                    value={opt}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames('block font-black text-[10px] uppercase tracking-widest whitespace-nowrap', selected ? 'text-brand-teal' : 'text-content-secondary')}>
                          {opt.label}
                        </span>
                        {selected ? (
                          <span
                            className="absolute inset-y-0 left-3 flex items-center text-brand-teal"
                          >
                            <RiCheckLine className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </HeadlessCombobox.Option>
                ))
              )}
            </HeadlessCombobox.Options>
          </Transition>

        </div>
      </HeadlessCombobox>
      {error && <p className="text-[10px] font-bold text-state-danger mt-1 px-1">{error}</p>}
    </div>
  );
}
