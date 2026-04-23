import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiShieldUserLine, RiEditLine, RiDeleteBin7Line, RiLockLine,
  RiGroupLine, RiCheckLine, RiAddLine, RiEyeLine, RiShieldCheckLine,
  RiAlertLine, RiTimeLine
} from 'react-icons/ri';
import { PageHeader, DataTable, Badge, Button, useModal, Modal, Input, Avatar } from '../../../core';
import { toast } from 'react-hot-toast';
import initialData from '../../../data/rbac.json';

// ─── Shared permission sections ───────────────────────────────────────────────
const ALL_SECTIONS = [
  { key: 'hr',           label: 'HR',            category: 'People' },
  { key: 'payroll',      label: 'Payroll',        category: 'People' },
  { key: 'leaves',       label: 'Leaves',         category: 'People' },
  { key: 'inventory',    label: 'Inventory',      category: 'Operations' },
  { key: 'orders',       label: 'Orders',         category: 'Operations' },
  { key: 'distributors', label: 'Distributors',   category: 'Operations' },
  { key: 'retailers',    label: 'Retailers',      category: 'Operations' },
  { key: 'customers',    label: 'Customers',      category: 'Operations' },
  { key: 'accounts',     label: 'Accounts',       category: 'Finance' },
  { key: 'reports',      label: 'Reports',        category: 'Finance' },
  { key: 'rewards',      label: 'Rewards',        category: 'Finance' },
  { key: 'service',      label: 'Service',        category: 'Support' },
  { key: 'content',      label: 'Content',        category: 'System' },
  { key: 'rbac',         label: 'Access Control', category: 'System' },
];
const CATEGORIES = ['People', 'Operations', 'Finance', 'Support', 'System'];

const SECTION_COLOR = { People: 'teal', Operations: 'info', Finance: 'warning', Support: 'purple', System: 'danger' };

// ─── Permission Toggle Grid ───────────────────────────────────────────────────
export function PermissionToggleGrid({ selected, onChange, disabled = false }) {
  const toggle = (key) => {
    if (disabled) return;
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };
  return (
    <div className="space-y-4">
      {CATEGORIES.map(cat => {
        const sections = ALL_SECTIONS.filter(s => s.category === cat);
        return (
          <div key={cat}>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em] mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {sections.map(section => {
                const isOn = selected.includes(section.key);
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => toggle(section.key)}
                    disabled={disabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-none transition-all border ${
                      isOn
                        ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30'
                        : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal/30'
                    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`w-3 h-3 flex items-center justify-center rounded-none border text-[9px] ${
                      isOn ? 'bg-brand-teal border-brand-teal text-white' : 'border-content-tertiary/40'
                    }`}>
                      {isOn && <RiCheckLine />}
                    </span>
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(initialData.roles);
  const [users] = useState(initialData.users);
  const { isOpen, open, close, data: selectedRole } = useModal();
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [rolePermissions, setRolePermissions] = useState([]);
  const [viewUsersFor, setViewUsersFor] = useState(null); // role to show users for

  const openModal = (role) => {
    if (role) {
      setRoleForm({ name: role.name, description: role.description || '' });
      setRolePermissions(role.permissions || []);
    } else {
      setRoleForm({ name: '', description: '' });
      setRolePermissions([]);
    }
    open(role);
  };

  const handleSave = () => {
    if (!roleForm.name.trim()) return toast.error('Role name is required.');
    if (selectedRole) {
      setRoles(prev => prev.map(r =>
        r.id === selectedRole.id
          ? { ...r, name: roleForm.name, description: roleForm.description, permissions: rolePermissions, permissionsCount: rolePermissions.length }
          : r
      ));
      toast.success(`Role "${roleForm.name}" updated.`);
    } else {
      const newRole = {
        id: `ROL${String(Date.now()).slice(-4)}`,
        name: roleForm.name,
        description: roleForm.description,
        userCount: 0,
        permissionsCount: rolePermissions.length,
        isSystem: false,
        color: 'teal',
        permissions: rolePermissions,
      };
      setRoles(prev => [...prev, newRole]);
      toast.success(`Role "${roleForm.name}" created.`);
    }
    close();
  };

  const handleDelete = (role) => {
    if (role.isSystem) return toast.error('System roles cannot be deleted.');
    if (role.userCount > 0) return toast.error(`Cannot delete: ${role.userCount} user(s) assigned to this role.`);
    setRoles(prev => prev.filter(r => r.id !== role.id));
    toast.success(`Role "${role.name}" deleted.`);
  };

  const roleUsers = viewUsersFor ? users.filter(u => u.roleId === viewUsersFor) : [];

  const columns = [
    {
      key: 'name', label: 'Role Name', sortable: true, render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
            <RiShieldUserLine className="text-brand-teal w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-content-primary text-sm">{val}</span>
            {row.isSystem && <span className="ml-2 text-[9px] font-black text-brand-magenta uppercase tracking-widest">System</span>}
            <p className="text-xs text-content-tertiary mt-0.5 line-clamp-1">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'permissionsCount', label: 'Sections', align: 'center', render: (val, row) => (
        <button
          onClick={() => navigate('/admin/rbac/permissions')}
          className="flex items-center justify-center gap-1.5 text-brand-teal hover:underline"
        >
          <RiShieldCheckLine className="w-4 h-4" />
          <span className="text-sm font-semibold">{val}</span>
        </button>
      )
    },
    {
      key: 'userCount', label: 'Users', align: 'center', render: (val, row) => (
        <button
          onClick={() => setViewUsersFor(viewUsersFor === row.id ? null : row.id)}
          className="flex items-center justify-center gap-1.5 text-content-secondary hover:text-brand-teal transition-colors"
        >
          <RiGroupLine className="w-4 h-4" />
          <span className="text-sm font-semibold">{val}</span>
        </button>
      )
    },
    {
      key: 'permissions', label: 'Access Scope', render: (val = []) => (
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {val.slice(0, 4).map(p => (
            <span key={p} className="text-[10px] font-bold bg-brand-teal/8 text-brand-teal border border-brand-teal/20 px-1.5 py-0.5 uppercase">
              {p}
            </span>
          ))}
          {val.length > 4 && (
            <span className="text-[10px] font-bold bg-surface-hover text-content-tertiary border border-border px-1.5 py-0.5">
              +{val.length - 4}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="Edit Role" onClick={() => openModal(row)}>
            <RiEditLine className="w-4 h-4" />
          </Button>
          {!row.isSystem ? (
            <Button variant="icon" className="group" title="Delete Role" onClick={() => handleDelete(row)}>
              <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
            </Button>
          ) : (
            <RiLockLine className="w-4 h-4 text-content-tertiary mx-2" title="System role — cannot be deleted" />
          )}
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Role Management" subtitle="Define access levels and assign section permissions to each role">
        <Button icon={RiAddLine} onClick={() => openModal(null)}>Create New Role</Button>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, icon: RiShieldUserLine, color: 'text-brand-teal' },
          { label: 'System Roles', value: roles.filter(r => r.isSystem).length, icon: RiLockLine, color: 'text-brand-magenta' },
          { label: 'Custom Roles', value: roles.filter(r => !r.isSystem).length, icon: RiAddLine, color: 'text-state-info' },
          { label: 'Total Users', value: roles.reduce((a, r) => a + r.userCount, 0), icon: RiGroupLine, color: 'text-state-success' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
            <div>
              <p className="text-xl font-black text-content-primary leading-none">{stat.value}</p>
              <p className="text-[11px] text-content-tertiary mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={roles} />

      {/* Inline user drawer */}
      {viewUsersFor && (
        <div className="glass-card p-5 border-t-2 border-brand-teal">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">
              Users in "{roles.find(r => r.id === viewUsersFor)?.name}"
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/admin/rbac/users')}>Manage Users</Button>
              <button onClick={() => setViewUsersFor(null)} className="text-content-tertiary hover:text-content-primary transition-colors text-xs uppercase tracking-widest">Close</button>
            </div>
          </div>
          {roleUsers.length === 0 ? (
            <p className="text-sm text-content-tertiary">No users assigned to this role.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-surface-input border border-border">
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{u.name}</p>
                    <p className="text-xs text-content-tertiary">{u.email}</p>
                  </div>
                  <span className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 ${u.status === 'active' ? 'bg-state-success' : 'bg-state-danger'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={handleSave}>{selectedRole ? 'Save Changes' : 'Create Role'}</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Role Identity */}
          <div>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em] mb-3">Role Definition</p>
            <div className="space-y-3">
              <Input
                label="Role Name"
                placeholder="e.g. Regional Manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm(f => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="Briefly describe what this role does"
                value={roleForm.description}
                onChange={(e) => setRoleForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Section Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em]">Section Permissions</p>
                <p className="text-xs text-content-tertiary mt-0.5">{rolePermissions.length} of {ALL_SECTIONS.length} sections enabled</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setRolePermissions(ALL_SECTIONS.map(s => s.key))} className="text-[10px] font-bold text-brand-teal hover:underline uppercase tracking-wide">Grant All</button>
                <button type="button" onClick={() => setRolePermissions([])} className="text-[10px] font-bold text-state-danger hover:underline uppercase tracking-wide">Revoke All</button>
              </div>
            </div>
            {selectedRole?.isSystem && (
              <div className="flex items-center gap-2 p-3 bg-brand-magenta/5 border border-brand-magenta/20 mb-3 text-xs text-brand-magenta">
                <RiAlertLine className="w-4 h-4 flex-shrink-0" />
                System roles have full access by default and cannot be restricted.
              </div>
            )}
            <div className="p-4 bg-surface-input/50 border border-border">
              <PermissionToggleGrid
                selected={rolePermissions}
                onChange={setRolePermissions}
                disabled={selectedRole?.isSystem}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
