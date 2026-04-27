import { useNavigate } from 'react-router-dom';
import { RiAddLine, RiHistoryLine, RiHandCoinLine, RiUserStarLine, RiFileChartLine, RiArrowRightSLine } from 'react-icons/ri';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '../../../core';

export default function RetailerSalesPage() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'POS Terminal',
      description: 'Create new invoices for walk-in customers',
      icon: RiAddLine,
      path: '/retailer/sales/new',
      color: 'bg-brand-teal',
      badge: 'Boutique POS'
    },
    {
      title: 'Sales History',
      description: 'View and manage previous transactions',
      icon: RiHistoryLine,
      path: '/retailer/sales/history',
      color: 'bg-brand-pink',
      badge: 'Audit Ready'
    },
    {
      title: 'Store Network',
      description: 'Analyze your customer base and loyalty',
      icon: RiUserStarLine,
      path: '/retailer/customers',
      color: 'bg-brand-purple',
      badge: 'CRM'
    },
    {
      title: 'Revenue Reports',
      description: 'Daily, weekly and monthly earnings',
      icon: RiFileChartLine,
      path: '/retailer/analytics',
      color: 'bg-brand-teal-dark',
      badge: 'Growth'
    }
  ];

  return (
    <div className="page-container flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-content-primary tracking-tight uppercase">Sales Center</h1>
        <p className="text-sm text-content-tertiary">Manage your point-of-sale, customer records, and financial growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="group relative flex items-center gap-4 p-5 bg-white border border-gray-100/50 hover:border-brand-teal/30 hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`w-12 h-12 ${action.color} flex items-center justify-center text-white rounded-none shadow-lg group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-teal/70">{action.badge}</span>
              </div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{action.title}</h3>
              <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{action.description}</p>
            </div>

            <RiArrowRightSLine className="w-5 h-5 text-gray-200 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />

            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${action.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`}></div>
          </button>
        ))}
      </div>

      {/* Quick Summary Card */}
      <Card className="bg-gradient-to-br from-brand-teal-dark to-brand-teal text-white border-none shadow-glow mt-2">
         <div className="p-6 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-1">Today's Performance</p>
               <h2 className="text-3xl font-black tracking-tight leading-none">Ready for Business</h2>
               <p className="text-xs text-white/80 mt-2">Create your first bill of the day to see live stats here.</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
               <RiHandCoinLine className="w-8 h-8" />
            </div>
         </div>
      </Card>
    </div>
  );
}
