import { NavLink, useLocation } from 'react-router-dom';
import { classNames } from '../../utils/helpers';
import { useEffect, useState } from 'react';

export default function BottomNav({ items }) {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = items.findIndex((item) => 
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    if (index !== -1) setActiveIndex(index);
  }, [location.pathname, items]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="relative w-full h-16 bg-brand-teal-dark shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex items-center pointer-events-auto px-2">
        
        {/* The Moving Active Indicator */}
        <div 
          className="absolute h-16 w-[20%] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
          style={{ transform: `translateX(${(activeIndex * 100)}%)` }}
        >
          {/* The Scoop Circle */}
          <div className="absolute -top-[20px] left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-full bg-surface-primary flex items-center justify-center border-[4px] border-surface-primary shadow-lg overflow-visible">
            {/* The Active Icon Circle */}
            <div className="w-full h-full rounded-full bg-brand-teal flex items-center justify-center shadow-inner">
               <div className="text-white">
                  {(() => {
                    const ActiveIcon = items[activeIndex]?.icon;
                    return ActiveIcon ? <ActiveIcon className="w-5 h-5" /> : null;
                  })()}
               </div>
            </div>
          </div>

          {/* Label under the scoop */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
             <span className="text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap animate-fade-in">
               {items[activeIndex]?.label}
             </span>
          </div>
        </div>

        {/* Nav Items */}
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 h-full flex flex-col items-center justify-center group relative z-10 outline-none"
            >
              <div className={classNames(
                "transition-all duration-500",
                isActive ? "opacity-0 -translate-y-4" : "text-white/40 group-hover:text-white"
              )}>
                <item.icon className="w-6 h-6" />
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

