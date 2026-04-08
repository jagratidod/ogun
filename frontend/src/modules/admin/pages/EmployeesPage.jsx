import { useState, useMemo } from 'react';
import { RiUserAddLine, RiSearchLine, RiFileEditLine, RiDeleteBin7Line, RiMailSendLine, RiPhoneLine, RiIdCardLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, useModal, Modal, Input, Select, StatusDot, formatCurrency } from '../../../core';
import hrData from '../../../data/hr.json';

export default function EmployeesPage() {
  const { employees, departments } = hrData;
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, open, close, data: selectedEmp } = useModal();

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchDept = deptFilter === 'all' || emp.department === deptFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchStatus && matchSearch;
    });
  }, [employees, deptFilter, statusFilter, searchTerm]);

  const columns = [
    { key: 'name', label: 'Employee', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={val} size="sm" />
        <div>
          <p className="text-sm font-medium text-content-primary">{val}</p>
          <p className="text-xs text-content-tertiary">{row.id} · {row.role}</p>
        </div>
      </div>
    )},
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status', render: (val) => (
      <Badge size="xs" variant={val === 'active' ? 'success' : 'danger'}>{val}</Badge>
    )},
    { key: 'joined', label: 'Joined On', render: (val) => (
       <div className="flex items-center gap-2">
          <RiIdCardLine className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="text-xs text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'salary', label: 'Net Monthly', align: 'right', render: (val) => (
       <span className="text-sm font-semibold text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" title="Send Email">
          <RiMailSendLine className="w-4 h-4 text-brand-teal" />
        </Button>
        <Button variant="icon" onClick={() => open(row)} title="Edit Employee">
          <RiFileEditLine className="w-4 h-4" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Employee Directory" 
        subtitle="Manage payroll profiles and personal records for all staff"
      >
        <Button icon={RiUserAddLine} onClick={() => open(null)}>Recruit Employee</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Employees', val: 52 },
           { label: 'New This Month', val: 6 },
           { label: 'Retention Rate', val: '94%' },
           { label: 'Active Depts', val: 5 }
         ].map(stat => (
            <div key={stat.label} className="glass-card p-4">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
               <h4 className="text-xl font-bold text-content-primary">{stat.val}</h4>
            </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex gap-2">
                 <Select 
                   value={deptFilter}
                   onChange={(e) => setDeptFilter(e.target.value)}
                   options={[{ label: 'All Departments', value: 'all' }, ...departments.map(d => ({ label: d.name, value: d.name }))]} 
                   className="w-40" 
                 />
                 <Select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   options={[{ label: 'All Staff', value: 'all' }, { label: 'Active Staff', value: 'active' }, { label: 'Former Staff', value: 'inactive' }]} 
                   className="w-40" 
                 />
              </div>
              <Input 
                icon={RiSearchLine} 
                placeholder="Search name, ID or role..." 
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredEmployees} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedEmp ? `Update Profile: ${selectedEmp.name}` : 'Create Employee Profile'}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={close}>{selectedEmp ? 'Save Profile' : 'Complete Onboarding'}</Button>
           </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input label="Full Name" defaultValue={selectedEmp?.name} className="md:col-span-2" />
           <Input label="Designation / Role" defaultValue={selectedEmp?.role} />
           <Select label="Allocate Department" defaultValue={selectedEmp?.department} options={departments.map(d => ({ label: d.name, value: d.name }))} />
           <Input label="Salary per Month" type="number" defaultValue={selectedEmp?.salary} />
           <Input label="Joining Date" type="date" defaultValue={selectedEmp?.joined} />
           <Input label="Official Email" placeholder="e.g. name@ogun.in" />
           <Input label="Phone Number" placeholder="e.g. +91 99999 00000" />
           <div className="md:col-span-2">
              <Input label="Emergency Contact (Name & Phone)" />
           </div>
        </div>
      </Modal>
    </div>
  );
}

