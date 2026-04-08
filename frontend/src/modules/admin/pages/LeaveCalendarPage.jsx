import { RiCalendarEventLine, RiArrowLeftSLine, RiArrowRightSLine, RiFilterLine, RiUserLine, RiInformationLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, Button, Avatar } from '../../../core';

export default function LeaveCalendarPage() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const staffOnLeave = [
    { day: 6, name: "Sneha Kapoor", type: "Sick" },
    { day: 7, name: "Sneha Kapoor", type: "Sick" },
    { day: 10, name: "Amit Goel", type: "Casual" },
    { day: 11, name: "Amit Goel", type: "Casual" },
    { day: 12, name: "Amit Goel", type: "Casual" },
    { day: 15, name: "Rajesh Varma", type: "Privileged" }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Leave Calendar" 
        subtitle="High-level visibility of staff availability and upcoming vacation plans"
      >
        <Button variant="secondary" icon={RiFilterLine}>Departments</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between w-full">
              <CardTitle>April 2026</CardTitle>
              <div className="flex bg-surface-input p-1 rounded-none border border-border">
                <button className="p-1.5 rounded-none hover:bg-surface-hover text-content-secondary transition-colors">
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>
                <button className="p-1.5 rounded-none hover:bg-surface-hover text-content-secondary transition-colors">
                   <RiArrowRightSLine className="w-5 h-5" />
                </button>
              </div>
           </div>
        </CardHeader>
        <div className="p-6 overflow-x-auto scrollbar-hide">
           <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-none overflow-hidden min-w-[700px]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                 <div key={day} className="bg-surface-elevated py-3 text-center text-xs font-bold text-content-tertiary uppercase tracking-widest">
                    {day}
                 </div>
              ))}
              {days.map(d => {
                 const leaves = staffOnLeave.filter(l => l.day === d);
                 return (
                    <div key={d} className="bg-surface-card min-h-[120px] p-2 hover:bg-surface-hover transition-colors">
                       <span className={`text-sm font-bold ${d === 6 ? 'text-brand-teal' : 'text-content-tertiary'}`}>{d}</span>
                       <div className="mt-2 space-y-1">
                          {leaves.map((l, i) => (
                             <div key={i} className="px-2 py-1 rounded-none bg-brand-teal/10 border-l-2 border-brand-teal flex items-center gap-1">
                                <span className="text-[10px] font-bold text-brand-teal truncate">{l.name}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </Card>

      <div className="mt-8 flex justify-center">
         <div className="glass-card flex items-center gap-4 px-6 py-4">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-brand-teal" />
               <span className="text-xs text-content-secondary font-medium">Sick Leave</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-state-warning" />
               <span className="text-xs text-content-secondary font-medium">Casual Leave</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-none bg-purple-500" />
               <span className="text-xs text-content-secondary font-medium">Privileged Leave</span>
            </div>
         </div>
      </div>
    </div>
  );
}
