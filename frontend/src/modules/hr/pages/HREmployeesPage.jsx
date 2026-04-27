import { useState, useEffect } from 'react';
import { 
  RiUser3Line, 
  RiMapPinLine, 
  RiMailLine, 
  RiTimeLine, 
  RiSearchLine,
  RiFilter3Line,
  RiArrowRightSLine,
  RiShieldUserLine
} from 'react-icons/ri';
import { Card, Input, Badge, useNotification } from '../../../core';
import api from '../../../core/api';

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const { showNotification } = useNotification();


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get('/hr/employees');
        setEmployees(response.data.data);
      } catch (error) {
        showNotification({ title: 'Error', message: 'Failed to fetch employees', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [showNotification]);

  const departments = ['All', ...new Set(employees.map(e => e.department || 'Operations'))].sort();

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-primary tracking-tight flex items-center gap-3">
            <RiUser3Line className="text-brand-teal" />
            EMPLOYEE DIRECTORY
          </h1>
          <p className="text-sm text-content-tertiary mt-1">Manage and monitor all personnel within the organization</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-80">
          <div className="relative w-full">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-secondary border border-border/50 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-teal transition-all"
            />
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-secondary/50 border border-border/40 inline-flex rounded-none">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedDept === dept 
                ? 'bg-brand-teal text-white shadow-lg' 
                : 'text-content-tertiary hover:text-content-primary hover:bg-surface-secondary'
            }`}
          >
            {dept} ({dept === 'All' ? employees.length : employees.filter(e => e.department === dept).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Card key={i} className="h-16 animate-pulse bg-surface-secondary" />)}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mb-4 text-content-tertiary">
            <RiSearchLine size={32} />
          </div>
          <h3 className="text-lg font-bold text-content-primary">No employees found</h3>
          <p className="text-sm text-content-tertiary">Try adjusting your filters or search terms.</p>
        </Card>
      ) : (
        <div className="bg-surface-primary border border-border/40 rounded-sm divide-y divide-border/20">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="group flex items-center justify-between p-3 hover:bg-surface-secondary transition-colors">
              {/* User Info Section */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center border border-border/30 group-hover:border-brand-teal/30 transition-colors">
                    <RiUser3Line size={18} className="text-content-tertiary group-hover:text-brand-teal" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${emp.status === 'active' ? 'bg-state-success' : 'bg-state-danger'}`} />
                </div>
                
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-content-primary truncate">{emp.name}</h4>
                    <Badge variant={emp.department === 'Technician' ? 'teal' : emp.role === 'admin' ? 'purple' : 'teal'} size="xs" className="text-[8px] px-1 py-0 uppercase font-black">
                      {emp.department}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[11px] text-content-tertiary truncate">
                    <RiMailLine size={13} className="text-brand-teal/60 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 text-[11px] text-content-tertiary truncate">
                    <RiShieldUserLine size={13} className="text-brand-teal/60 flex-shrink-0" />
                    <span className="truncate uppercase tracking-tight font-bold opacity-70">{emp.subRole || emp.role}</span>
                  </div>
                </div>
              </div>

              {/* Status & Last Login */}
              <div className="flex items-center gap-6 text-right ml-4">
                <div className="hidden lg:block whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-content-tertiary font-bold uppercase tracking-tight">
                    <RiTimeLine size={12} className="text-brand-teal/40" />
                    <span>{emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
                
                <button className="text-content-tertiary hover:text-brand-teal p-1 transition-colors">
                  <RiArrowRightSLine size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


