import { useState, useEffect } from 'react';
import { RiOrganizationChart, RiGroupLine, RiArrowRightSLine, RiInformationLine, RiEditLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Modal, useModal } from '../../../core';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isOpen, open, close, data: selectedDept } = useModal();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hr/departments');
      setDepartments(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Department Name', sortable: true, render: (val) => (
      <div className="flex items-center gap-2">
         <RiOrganizationChart className="text-brand-teal w-4 h-4" />
         <span className="font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'employees', label: 'Total Members', align: 'center', render: (val) => (
       <Badge variant="info">
          <RiGroupLine className="mr-1 inline" /> {val?.length || 0}
       </Badge>
    )},
    { key: 'head', label: 'Department Head', render: (val) => (
       <div className="flex items-center gap-2">
          <Avatar name={val} size="xs" />
          <span className="text-sm font-medium text-content-primary">{val}</span>
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiEditLine} onClick={() => open(row)}>View Employees</Button>
          <Button variant="icon" onClick={() => open(row)}>
             <RiArrowRightSLine className="w-5 h-5 text-content-tertiary" />
          </Button>
       </div>
    )}
  ];

  const employeeColumns = [
    { key: 'name', label: 'Employee', render: (val, row) => (
      <div className="flex items-center gap-2">
        <Avatar name={val} size="sm" />
        <div>
          <p className="font-semibold text-content-primary text-sm">{val}</p>
          <p className="text-xs text-content-secondary">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (val) => <Badge variant="teal">{val}</Badge> },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val}>{val}</Badge> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  // Calculate some stats based on the dynamic data
  const totalEmployees = departments.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0);

  return (
    <div className="page-container">
      <PageHeader 
        title="Department Structures" 
        subtitle="Manage nested organizational hierarchy and reporting lines"
      />

      <Card>
        <CardHeader>
           <CardTitle>Core Clusters</CardTitle>
           <CardDescription>Major operational departments within OGUN Kitchen CRM</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={departments} />
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-card p-6">
            <h4 className="section-title mb-4">Organizational Health</h4>
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-none border-8 border-brand-teal border-t-state-warning flex items-center justify-center text-xl font-bold">
                  85%
               </div>
               <div className="space-y-2 flex-1">
                  <p className="text-sm text-content-secondary line-clamp-2">Efficiency based on departmental target achievement across {departments.length} active clusters.</p>
                  <Button variant="ghost" size="sm" icon={RiInformationLine}>System Diagnostics</Button>
               </div>
            </div>
         </div>
         <div className="glass-card p-6">
            <h4 className="section-title mb-4">Staff Distribution</h4>
            <div className="space-y-3">
               {departments.map(dept => {
                 const count = dept.employees?.length || 0;
                 const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                 return (
                 <div key={dept.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-content-tertiary uppercase">
                       <span>{dept.name}</span>
                       <span>{percentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-surface-input rounded-none overflow-hidden">
                       <div className="h-full bg-brand-teal rounded-none" style={{ width: `${percentage}%` }} />
                    </div>
                 </div>
                 );
               })}
            </div>
         </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`${selectedDept?.name || 'Department'} Employees`}
        size="lg"
      >
        {selectedDept && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border">
               <div>
                  <p className="text-xs text-content-secondary uppercase tracking-wider font-bold">Department Head</p>
                  <p className="text-sm font-semibold text-content-primary mt-1">{selectedDept.head}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-content-secondary uppercase tracking-wider font-bold">Total Members</p>
                  <Badge variant="info" className="mt-1">{selectedDept.employees?.length || 0}</Badge>
               </div>
            </div>
            
            <DataTable 
              columns={employeeColumns} 
              data={selectedDept.employees || []} 
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
