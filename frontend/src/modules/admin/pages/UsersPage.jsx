import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserAddLine, RiSearchLine, RiEditLine, RiDeleteBin7Line,
  RiMailSendLine, RiRefreshLine, RiEyeLine, RiEyeOffLine, RiCheckLine,
  RiCloseLine, RiTimeLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, CardDescription,
  DataTable, Badge, Button, Avatar, useModal, Modal, Input, StatusDot, formatRelativeTime
} from '../../../core';
import { ROLE_PERMISSIONS } from '../../../core/utils/constants';
import { toast } from 'react-hot-toast';
import api from '../../../core/api'; // Added API import

// Maps display role name → system sub-role key → permission preset
const ROLE_NAME_TO_SUBROLE = {
  'Super Admin':    'super_admin',
  'Sales Manager':  'sales_manager',
  'Accountant':     'accounts_manager',
  'Service Head':   'sales_manager',
  'HR Manager':     'hr_manager',
};

// ─── All toggleable admin sections ───────────────────────────────────────────
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

const ROLES_LIST = [
  { id: 'R1', name: 'Super Admin' },
  { id: 'R2', name: 'Sales Manager' },
  { id: 'R3', name: 'Accountant' },
  { id: 'R4', name: 'Service Head' },
  { id: 'R5', name: 'HR Manager' }
];

// ─── Permission Toggle Grid ───────────────────────────────────────────────────
function PermissionToggleGrid({ selected, onChange }) {
  const toggle = (key) => {
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-none transition-all border ${
                      isOn
                        ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30'
                        : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal/30'
                    }`}
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
export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles] = useState(ROLES_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { isOpen, open, close, data: selectedUser } = useModal();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', subRole: '', roleId: '', status: 'active', department: '' });
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users?role=admin');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // When modal opens, pre-populate if editing
  useEffect(() => {
    if (isOpen) {
      if (selectedUser) {
        const foundRole = roles.find(r => ROLE_NAME_TO_SUBROLE[r.name] === selectedUser.subRole);
        setFormData({
          name: selectedUser.name || '',
          email: selectedUser.email || '',
          roleId: foundRole ? foundRole.id : '',
          status: selectedUser.status || 'active',
          department: selectedUser.department || '',
        });
        setSelectedPermissions(selectedUser.permissions || []);
      } else {
        setFormData({ name: '', email: '', roleId: '', status: 'active', department: '' });
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, selectedUser]);

  // When role changes, auto-derive sub-role and load permission preset
  const handleRoleIdChange = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setFormData(f => ({ ...f, roleId }));
    if (role) {
      // Derive system sub-role from the role name
      const subRole = ROLE_NAME_TO_SUBROLE[role.name] || '';
      const preset = ROLE_PERMISSIONS[subRole] || role.permissions || [];
      setSelectedPermissions(preset.includes?.('all') ? ALL_SECTIONS.map(s => s.key) : preset);
    }
  };

  const filtered = useMemo(() => users.filter(user => {
    const matchSearch = !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !filterRole || user.subRole === filterRole;
    const matchStatus = !filterStatus || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  }), [users, searchTerm, filterRole, filterStatus]);

  const handleDelete = async (user) => {
    if (user.subRole === 'super_admin') return toast.error('Cannot delete the Super Admin.');
    if (window.confirm(`Remove access for ${user.name}?`)) {
      try {
        await api.delete(`/admin/users/${user.id}`);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast.success(`${user.name} removed.`);
      } catch (error) {
        toast.error('Failed to remove user');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/users/${userId}`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`${user?.name} is now ${newStatus}.`);
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error('Name is required.');
    if (!formData.email.trim()) return toast.error('Email is required.');
    if (!formData.roleId) return toast.error('Please assign a role.');

    const role = roles.find(r => r.id === formData.roleId);
    const subRole = ROLE_NAME_TO_SUBROLE[role?.name] || '';
    
    try {
      if (selectedUser) {
        const res = await api.put(`/admin/users/${selectedUser.id}`, {
          name: formData.name,
          email: formData.email,
          role: 'admin',
          subRole,
          permissions: selectedPermissions,
          status: formData.status
        });
        if (res.data.success) {
          setUsers(prev => prev.map(u => u.id === selectedUser.id ? res.data.data : u));
          toast.success(`${formData.name} updated.`);
        }
      } else {
        const res = await api.post(`/admin/users`, {
          name: formData.name,
          email: formData.email,
          role: 'admin',
          subRole,
          department: formData.department,
          permissions: selectedPermissions,
          isActive: formData.status === 'active'
        });
        if (res.data.success) {
          setUsers(prev => [...prev, res.data.data]);
          toast.success(`${formData.name} created. They can login via OTP.`);
        }
      }
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleResendInvite = (user) => {
    toast.success(`Access instructions sent to ${user.email} (Email logic simulated)`);
  };

  const uniqueRoles = [...new Set(users.map(u => u.subRole).filter(Boolean))];

  const columns = [
    {
      key: 'name', label: 'User', sortable: true, render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="text-sm font-semibold text-content-primary">{val}</p>
            <p className="text-xs text-content-tertiary">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subRole', label: 'Role', sortable: true, render: (val) => {
        const displayRole = Object.keys(ROLE_NAME_TO_SUBROLE).find(key => ROLE_NAME_TO_SUBROLE[key] === val) || val;
        return <Badge variant="teal">{displayRole || 'Admin'}</Badge>
      }
    },
    {
      key: 'permissions', label: 'Access', render: (val = []) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-content-primary">{val.length}</span>
          <span className="text-xs text-content-tertiary">/ {ALL_SECTIONS.length} sections</span>
        </div>
      )
    },
    {
      key: 'status', label: 'Status', align: 'center', render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className="flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
          title="Click to toggle status"
          disabled={row.subRole === 'super_admin'}
        >
          <StatusDot status={val} pulse={val === 'active'} />
          <span className="capitalize text-xs font-semibold text-content-secondary">{val}</span>
        </button>
      )
    },
    {
      key: 'lastLogin', label: 'Last Login', render: (val) => (
        <div className="flex items-center gap-1.5 text-content-tertiary">
          <RiTimeLine className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{val ? formatRelativeTime(val) : 'Never'}</span>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="Resend Invite" onClick={() => handleResendInvite(row)}>
            <RiMailSendLine className="w-4 h-4 text-brand-teal" />
          </Button>
          <Button variant="icon" onClick={() => open(row)} title="Edit User">
            <RiEditLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" className="group" onClick={() => handleDelete(row)} title="Remove User" disabled={row.subRole === 'super_admin'}>
            <RiDeleteBin7Line className={`w-4 h-4 ${row.subRole === 'super_admin' ? 'text-gray-300' : 'text-state-danger opacity-70 group-hover:opacity-100'}`} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Admin User Management" subtitle="Manage sub-admins, their roles, and section access">
        <Button icon={RiUserAddLine} onClick={() => open(null)}>Add New User</Button>
      </PageHeader>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-brand-teal' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'text-state-success' },
          { label: 'Inactive', value: users.filter(u => u.status === 'inactive').length, color: 'text-state-danger' },
          { label: 'Roles Used', value: uniqueRoles.length, color: 'text-state-info' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <p className={`text-2xl font-black leading-none ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-content-tertiary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <CardTitle>Internal Users</CardTitle>
              <CardDescription>Sub-admins with granular section access</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                icon={RiSearchLine}
                placeholder="Search..."
                className="w-52"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Role filter pills */}
              {uniqueRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(filterRole === r ? '' : r)}
                  className={`text-xs font-bold px-2.5 py-1.5 border transition-all ${filterRole === r ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30' : 'bg-surface-input text-content-tertiary border-border'}`}
                >
                  {r}
                </button>
              ))}
              {['active', 'inactive'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                  className={`text-xs font-bold px-2.5 py-1.5 border capitalize transition-all ${filterStatus === s ? 'bg-surface-hover text-content-primary border-border' : 'bg-surface-input text-content-tertiary border-border'}`}
                >
                  {s}
                </button>
              ))}
              {(searchTerm || filterRole || filterStatus) && (
                <button onClick={() => { setSearchTerm(''); setFilterRole(''); setFilterStatus(''); }} className="text-xs text-state-danger flex items-center gap-1 hover:underline">
                  <RiCloseLine className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </Card>

      {/* ── Create / Edit Modal ──────────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={selectedUser ? `Edit: ${selectedUser.name}` : 'Create New Staff User'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={handleSave}>{selectedUser ? 'Save Changes' : 'Create User'}</Button>
          </div>
        }
      >
        <div className="space-y-6">

          {/* Identity */}
          <div>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em] mb-3">Identity</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Vikram Singh"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Staff Email"
                placeholder="staff@ogun.in"
                value={formData.email}
                disabled={selectedUser}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                helpText={!selectedUser ? "Used to receive OTP access keys." : ""}
              />
            </div>
          </div>

          {/* Role & Department */}
          <div>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em] mb-3">Role & Department</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Assign Role</label>
                <select
                  className="input-field"
                  value={formData.roleId}
                  onChange={(e) => handleRoleIdChange(e.target.value)}
                >
                  <option value="">Select a role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {formData.roleId && (
                  <p className="text-[10px] text-content-tertiary">
                    System key: <span className="font-mono text-brand-teal">{ROLE_NAME_TO_SUBROLE[roles.find(r => r.id === formData.roleId)?.name] || '—'}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Status</label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  disabled={selectedUser?.subRole === 'super_admin'}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Department"
                  placeholder="e.g. Sales, Finance, HR"
                  value={formData.department}
                  onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Permission Toggles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em]">Section Access</p>
                <p className="text-xs text-content-tertiary mt-0.5">
                  {selectedPermissions.length} of {ALL_SECTIONS.length} sections enabled
                  {formData.subRole && ` · Loaded from ${formData.subRole.replace(/_/g, ' ')}`}
                  {formData.roleId && !formData.subRole && ` · Loaded from role`}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedPermissions(ALL_SECTIONS.map(s => s.key))} className="text-[10px] font-bold text-brand-teal hover:underline uppercase">Select All</button>
                <button type="button" onClick={() => setSelectedPermissions([])} className="text-[10px] font-bold text-state-danger hover:underline uppercase">Clear All</button>
              </div>
            </div>
            <div className="p-4 bg-surface-input/50 border border-border">
              <PermissionToggleGrid selected={selectedPermissions} onChange={setSelectedPermissions} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
