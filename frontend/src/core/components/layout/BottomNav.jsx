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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6 pb-6 pointer-events-none">
      <nav className="relative w-full max-w-sm h-14 bg-brand-teal-dark/95 backdrop-blur-md rounded-2xl shadow-[0_15px_35px_rgba(45,143,156,0.4)] flex items-center pointer-events-auto">
        
        {/* The Moving Scoop / Active Indicator */}
        <div 
          className="absolute h-14 w-[20%] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          {/* The Scoop Shape (Inverted corners) */}
          <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 w-[54px] h-[54px] rounded-full bg-surface-primary flex items-center justify-center border-[4px] border-surface-primary shadow-md overflow-visible">
            {/* The Light Floating Circle */}
            <div className="w-full h-full rounded-full bg-brand-teal flex items-center justify-center shadow-lg">
               <div className="text-white">
                  {(() => {
                    const ActiveIcon = items[activeIndex]?.icon;
                    return ActiveIcon ? <ActiveIcon className="w-6 h-6" /> : null;
                  })()}
               </div>
            </div>
          </div>

          {/* Label under the scoop */}
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2">
             <span className="text-[8px] font-black text-white/90 uppercase tracking-widest whitespace-nowrap animate-fade-in scale-90">
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
                isActive ? "opacity-0 -translate-y-4" : "text-white/30 group-hover:text-white/60"
              )}>
                <item.icon className="w-5.5 h-5.5" />
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

