import { useState } from 'react';
import { RiUserAddLine, RiSearchLine, RiMoreFill, RiEditLine, RiDeleteBin7Line, RiMailSendLine, RiShieldUserLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, useModal, Modal, Input, Select, StatusDot, formatRelativeTime } from '../../../core';
import rbacData from '../../../data/rbac.json';

export default function UsersPage() {
  const [users, setUsers] = useState(rbacData.users);
  const [searchTerm, setSearchTerm] = useState('');
  const { roles } = rbacData;
  const { isOpen, open, close, data: selectedUser } = useModal();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this user access?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const columns = [
    { key: 'name', label: 'User', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={val} size="sm" />
        <div>
          <p className="text-sm font-medium text-content-primary">{val}</p>
          <p className="text-xs text-content-tertiary">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', sortable: true, render: (val) => (
      <Badge variant="teal">{val}</Badge>
    )},
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', align: 'center', render: (val) => (
      <div className="flex items-center justify-center gap-1.5">
        <StatusDot status={val} pulse={val === 'active'} />
        <span className="capitalize text-xs font-medium text-content-secondary">{val}</span>
      </div>
    )},
    { key: 'lastLogin', label: 'Last Login', render: (val) => (
      <span className="text-xs text-content-tertiary">{formatRelativeTime(val)}</span>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" title="Resend Invite">
          <RiMailSendLine className="w-4 h-4 text-brand-teal" />
        </Button>
        <Button variant="icon" onClick={() => open(row)} title="Edit User">
          <RiEditLine className="w-4 h-4" />
        </Button>
        <Button variant="icon" className="group" onClick={() => handleDelete(row.id)} title="Delete User">
          <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Admin User Management" 
        subtitle="Manage sub-admins and internal staff access"
      >
        <Button icon={RiUserAddLine} onClick={() => open(null)}>Add New User</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <CardTitle>Internal Users</CardTitle>
              <CardDescription>Sub-admins with access to various modules</CardDescription>
            </div>
            <Input 
              icon={RiSearchLine} 
              placeholder="Search users by name, email or department..." 
              className="w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredUsers} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedUser ? `Modifying User: ${selectedUser.name}` : 'Invite New Admin User'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={close}>{selectedUser ? 'Save User' : 'Send Invite'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue={selectedUser?.name} placeholder="e.g. John Doe" />
          <Input label="Email Address" defaultValue={selectedUser?.email} placeholder="e.g. name@company.in" />
          <Select label="Assign Role" options={roles.map(r => ({ label: r.name, value: r.name }))} />
          <Select label="Department" options={[
            { label: 'Management', value: 'Management' },
            { label: 'Finance', value: 'Finance' },
            { label: 'Sales', value: 'Sales' },
            { label: 'Service', value: 'Service' },
            { label: 'HR', value: 'HR' }
          ]} />
          <div className="md:col-span-2">
             <Input label="Short Bio / Note" placeholder="A brief about this user for other admins" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

