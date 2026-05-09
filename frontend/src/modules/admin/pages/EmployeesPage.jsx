import { useState, useMemo, useEffect } from 'react';
import { RiUserAddLine, RiSearchLine, RiFileEditLine, RiDeleteBin7Line, RiMailSendLine, RiPhoneLine, RiIdCardLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, useModal, Modal, Input, Select, StatusDot, formatCurrency } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, open, close, data: selectedEmp } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/departments')
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchDept = deptFilter === 'all' || emp.department === deptFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchStatus && matchSearch;
    });
  }, [employees, deptFilter, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const columns = [
    {
      key: 'name', label: 'Employee', sortable: true, render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="text-sm font-medium text-content-primary">{val}</p>
            <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-wider">
              {row.role} {row.subRole && `· ${row.subRole.replace('_', ' ')}`}
            </p>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department' },
    {
      key: 'status', label: 'Status', render: (val) => (
        <Badge size="xs" variant={val === 'active' ? 'success' : 'danger'}>{val}</Badge>
      )
    },
    {
      key: 'joined', label: 'Joined On', render: (_, row) => (
        <div className="flex items-center gap-2">
          <RiIdCardLine className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="text-xs text-content-secondary">{new Date(row.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="Send Email" onClick={() => window.location.href = `mailto:${row.email}`}>
            <RiMailSendLine className="w-4 h-4 text-brand-teal" />
          </Button>
          <Button variant="icon" onClick={() => open(row)} title="Edit Employee">
            <RiFileEditLine className="w-4 h-4" />
          </Button>
        </div>
      )
    }
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
          { label: 'Total Employees', val: employees.length },
          { label: 'Active Staff', val: employees.filter(e => e.status === 'active').length },
          { label: 'Departments', val: departments.length },
          { label: 'Recent Hires', val: employees.filter(e => {
            const joined = new Date(e.createdAt);
            const now = new Date();
            return (now - joined) < (30 * 24 * 60 * 60 * 1000);
          }).length }
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
                options={[
                  { label: 'All Departments', value: 'all' }, 
                  ...departments.map(d => ({ label: d.name, value: d.name }))
                ]}
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
          <Select 
            label="Allocate Department" 
            defaultValue={selectedEmp?.department} 
            options={departments.map(d => ({ label: d.name, value: d.name }))} 
          />
          <Input label="Salary per Month" type="number" defaultValue={selectedEmp?.salary} />
          <Input label="Joining Date" type="date" defaultValue={selectedEmp?.joined} />
          <Input label="Official Email" placeholder="e.g. name@ogun.in" defaultValue={selectedEmp?.email} />
          <Input label="Phone Number" placeholder="e.g. +91 99999 00000" />
          <div className="md:col-span-2">
            <Input label="Emergency Contact (Name & Phone)" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

