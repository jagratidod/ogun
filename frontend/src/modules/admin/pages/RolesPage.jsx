import { useState } from 'react';
import { RiShieldUserLine, RiEditLine, RiDeleteBin7Line, RiLockLine, RiGroupLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, useModal, Modal, Input, Select } from '../../../core';
import rbacData from '../../../data/rbac.json';

export default function RolesPage() {
  const [roles, setRoles] = useState(rbacData.roles);
  const { isOpen, open, close, data: selectedRole } = useModal();

  const handleDelete = (id) => {
    if (window.confirm('Delete this role? Users assigned to this role will lose access.')) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const columns = [
    { key: 'name', label: 'Role Name', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-2">
        <RiShieldUserLine className="text-brand-teal w-4 h-4" />
        <span className="font-medium text-content-primary">{val}</span>
      </div>
    )},
    { key: 'description', label: 'Description' },
    { key: 'userCount', label: 'Users', align: 'center', render: (val) => (
      <div className="flex items-center justify-center gap-1.5 text-content-secondary">
        <RiGroupLine className="w-4 h-4" />
        {val}
      </div>
    )},
    { key: 'permissionsCount', label: 'Permissions', align: 'center' },
    { key: 'isSystem', label: 'Type', render: (val) => (
      <Badge variant={val ? 'purple' : 'teal'}>
        {val ? 'System' : 'Custom'}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => open(row)}>
          <RiEditLine className="w-4 h-4" />
        </Button>
        {!row.isSystem && (
          <Button variant="icon" className="group" onClick={() => handleDelete(row.id)}>
            <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
          </Button>
        )}
        {row.isSystem && (
          <RiLockLine className="w-4 h-4 text-content-tertiary mx-2" title="Locked Role" />
        )}
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Role Management" 
        subtitle="Define, manage, and assign system access levels"
      >
        <Button icon={RiShieldUserLine} onClick={() => open(null)}>Create New Role</Button>
      </PageHeader>

      <DataTable columns={columns} data={roles} />

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={close}>{selectedRole ? 'Save Changes' : 'Create Role'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Role Name" placeholder="e.g. Regional Manager" defaultValue={selectedRole?.name} />
          <Input label="Description" placeholder="Briefly describe what this role does" defaultValue={selectedRole?.description} />
          <div className="pt-2">
            <p className="text-sm font-medium text-content-secondary mb-3">Inherit Template Permissions From:</p>
            <Select options={roles.map(r => ({ label: r.name, value: r.id }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

