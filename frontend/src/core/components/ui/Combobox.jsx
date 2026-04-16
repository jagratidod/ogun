import { useState, Fragment } from 'react';
import { Combobox as HeadlessCombobox, Transition } from '@headlessui/react';
import { RiExpandUpDownLine, RiCheckLine, RiSearchLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export default function Combobox({ label, options = [], value, onChange, placeholder = 'Select option...', error, className = '' }) {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-content-secondary px-1">
          {label}
        </label>
      )}

      <HeadlessCombobox value={value} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full">
            <HeadlessCombobox.Input
              className={classNames(
                'input-field w-full pr-10 pl-10 bg-white border border-gray-100 rounded-xl focus:border-brand-teal transition-all text-sm font-bold placeholder:text-gray-300',
                error && 'border-state-danger'
              )}
              displayValue={(opt) => opt?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <RiSearchLine className="w-4 h-4 text-gray-300" />
            </div>
            <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <RiExpandUpDownLine
                className="w-5 h-5 text-gray-300 hover:text-brand-teal transition-colors"
                aria-hidden="true"
              />
            </HeadlessCombobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <HeadlessCombobox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white p-2 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-200">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-4 px-4 text-gray-500 text-center font-bold text-[11px] uppercase tracking-widest">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <HeadlessCombobox.Option
                    key={opt.value}
                    className={({ active }) =>
                      classNames(
                        'relative cursor-pointer select-none py-3 pl-10 pr-4 rounded-xl transition-all duration-200',
                        active ? 'bg-brand-teal/10 text-brand-teal' : 'text-gray-900'
                      )
                    }
                    value={opt}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames('block truncate font-bold', selected ? 'text-brand-teal' : 'text-gray-700')}>
                          {opt.label}
                        </span>
                        {selected ? (
                          <span
                            className={classNames(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-brand-teal' : 'text-brand-teal'
                            )}
                          >
                            <RiCheckLine className="w-5 h-5" aria-hidden="true" />
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
      {error && <p className="text-xs text-state-danger px-1">{error}</p>}
    </div>
  );
}
