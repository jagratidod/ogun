import { useState, useMemo } from 'react';
import {
  RiSearchLine, RiFilterLine, RiGridLine, RiShieldKeyholeLine,
  RiCheckLine, RiLockLine, RiEyeLine, RiCloseLine
} from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input } from '../../../core';
import initialData from '../../../data/rbac.json';

const SECTION_ICONS = {
  Dashboard: '📊', HR: '👥', Payroll: '💰', Leaves: '📅',
  Inventory: '📦', Orders: '🛒', Distributors: '🚛', Retailers: '🏪',
  Customers: '🤝', Accounts: '🏦', Reports: '📈', Rewards: '🏆',
  Service: '🔧', Content: '📝', 'Access Control': '🛡️',
};

const ACTION_VARIANT = {
  View: 'teal', Manage: 'info', Delete: 'danger', Approve: 'warning',
};

export default function PermissionsPage() {
  const [permissions] = useState(initialData.permissions);
  const [roles] = useState(initialData.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Unique modules and actions for filters
  const modules = useMemo(() => [...new Set(permissions.map(p => p.module))], [permissions]);
  const actions = useMemo(() => [...new Set(permissions.map(p => p.action))], [permissions]);

  const filtered = permissions.filter(p => {
    const matchSearch = !searchTerm ||
      p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = !filterModule || p.module === filterModule;
    const matchAction = !filterAction || p.action === filterAction;
    return matchSearch && matchModule && matchAction;
  });

  const getRoleNames = (roleIds = []) =>
    roleIds.map(rid => roles.find(r => r.id === rid)?.name).filter(Boolean);

  const columns = [
    {
      key: 'id', label: 'ID', sortable: true, render: (val) => (
        <span className="font-mono text-xs text-content-tertiary">{val}</span>
      )
    },
    {
      key: 'module', label: 'Module', sortable: true, render: (val) => (
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{SECTION_ICONS[val] || '📌'}</span>
          <span className="font-semibold text-content-primary text-sm">{val}</span>
        </div>
      )
    },
    {
      key: 'action', label: 'Action', render: (val) => (
        <Badge variant={ACTION_VARIANT[val] || 'info'}>{val}</Badge>
      )
    },
    {
      key: 'description', label: 'Description', render: (val) => (
        <span className="text-sm text-content-secondary">{val}</span>
      )
    },
    {
      key: 'roles', label: 'Assigned To', render: (val = []) => (
        <div className="flex flex-wrap gap-1">
          {getRoleNames(val).slice(0, 3).map(name => (
            <span key={name} className="text-[10px] font-bold bg-surface-input text-content-secondary border border-border px-1.5 py-0.5">
              {name}
            </span>
          ))}
          {val.length > 3 && (
            <span className="text-[10px] font-bold text-content-tertiary px-1.5 py-0.5">+{val.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: 'actions', label: '', align: 'right', render: (_, row) => (
        <Button variant="icon" title="View Details" onClick={() => setSelectedPermission(row)}>
          <RiEyeLine className="w-4 h-4 text-brand-teal" />
        </Button>
      )
    },
  ];

  // Matrix: Roles × Sections
  const matrixSections = [...new Set(initialData.permissions.map(p => p.module))];

  return (
    <div className="page-container">
      <PageHeader
        title="Permission Matrix"
        subtitle="Granular access map across all modules and roles"
      >
        <div className="flex gap-2">
          <Input
            icon={RiSearchLine}
            placeholder="Search permissions..."
            className="w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Permissions', value: permissions.length, color: 'text-brand-teal' },
          { label: 'Modules Covered', value: modules.length, color: 'text-state-info' },
          { label: 'Manage Actions', value: permissions.filter(p => p.action === 'Manage').length, color: 'text-state-warning' },
          { label: 'View-Only Perms', value: permissions.filter(p => p.action === 'View').length, color: 'text-state-success' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <p className={`text-2xl font-black leading-none ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-content-tertiary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <RiFilterLine className="w-4 h-4 text-content-tertiary" />
        <span className="text-xs font-semibold text-content-secondary uppercase tracking-widest">Filter:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterModule('')}
            className={`text-xs font-bold px-3 py-1.5 border transition-all ${!filterModule ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30' : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal/20'}`}
          >
            All Modules
          </button>
          {modules.map(m => (
            <button
              key={m}
              onClick={() => setFilterModule(filterModule === m ? '' : m)}
              className={`text-xs font-bold px-3 py-1.5 border transition-all ${filterModule === m ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/30' : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal/20'}`}
            >
              {SECTION_ICONS[m]} {m}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        {actions.map(a => (
          <button
            key={a}
            onClick={() => setFilterAction(filterAction === a ? '' : a)}
            className={`text-xs font-bold px-3 py-1.5 border transition-all ${filterAction === a ? 'bg-brand-magenta/10 text-brand-magenta border-brand-magenta/30' : 'bg-surface-input text-content-tertiary border-border hover:border-brand-magenta/20'}`}
          >
            {a}
          </button>
        ))}
        {(filterModule || filterAction || searchTerm) && (
          <button
            onClick={() => { setFilterModule(''); setFilterAction(''); setSearchTerm(''); }}
            className="flex items-center gap-1 text-xs font-bold text-state-danger hover:underline"
          >
            <RiCloseLine className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-content-tertiary">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Permissions table ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>System Permissions</CardTitle>
          <CardDescription>Each permission defines a specific capability within a module.</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={filtered} />
      </Card>

      {/* ── Role × Module Access Matrix ─────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <RiGridLine className="w-5 h-5 text-brand-teal" />
          <div>
            <h3 className="section-title">Role Access Matrix</h3>
            <p className="text-xs text-content-tertiary mt-0.5">Visual map of which roles can access which modules</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-black text-content-tertiary uppercase tracking-widest bg-surface-elevated sticky left-0">Module</th>
                {roles.map(role => (
                  <th key={role.id} className="p-3 text-center text-xs font-black text-content-tertiary uppercase tracking-widest whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      {role.isSystem && <RiLockLine className="w-3 h-3 text-brand-magenta" />}
                      {role.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialData.permissions.map((perm, idx) => (
                <tr key={perm.id} className={`border-b border-border/50 hover:bg-surface-hover/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-elevated/30'}`}>
                  <td className="p-3 sticky left-0 bg-surface-primary">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{SECTION_ICONS[perm.module] || '📌'}</span>
                      <div>
                        <p className="text-sm font-semibold text-content-primary">{perm.module}</p>
                        <Badge variant={ACTION_VARIANT[perm.action] || 'info'} className="text-[9px]">{perm.action}</Badge>
                      </div>
                    </div>
                  </td>
                  {roles.map(role => {
                    const hasAccess = role.isSystem || (perm.roles || []).includes(role.id);
                    return (
                      <td key={role.id} className="p-3 text-center">
                        {hasAccess ? (
                          <div className="flex justify-center">
                            <span className={`w-6 h-6 flex items-center justify-center ${role.isSystem ? 'bg-brand-magenta/10 text-brand-magenta' : 'bg-brand-teal/10 text-brand-teal'}`}>
                              <RiCheckLine className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        ) : (
                          <span className="text-content-tertiary/30 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Permission Detail Drawer ─────────────────────────── */}
      {selectedPermission && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPermission(null)} />
          <div className="ml-auto w-full max-w-sm bg-surface-card border-l border-border h-full overflow-y-auto z-10 relative">
            <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-surface-card">
              <h3 className="font-black text-content-primary uppercase tracking-wider text-sm">Permission Detail</h3>
              <button onClick={() => setSelectedPermission(null)} className="p-1.5 hover:bg-surface-hover rounded-none transition-colors">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-input border border-border">
                <span className="text-4xl">{SECTION_ICONS[selectedPermission.module] || '📌'}</span>
                <div>
                  <p className="font-black text-content-primary text-lg leading-tight">{selectedPermission.module}</p>
                  <Badge variant={ACTION_VARIANT[selectedPermission.action] || 'info'}>{selectedPermission.action}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Description</p>
                <p className="text-sm text-content-secondary">{selectedPermission.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Permission ID</p>
                <p className="font-mono text-sm text-brand-teal bg-brand-teal/5 border border-brand-teal/20 px-3 py-2">{selectedPermission.id}</p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Roles with Access</p>
                <div className="space-y-2">
                  {roles.map(role => {
                    const hasAccess = role.isSystem || (selectedPermission.roles || []).includes(role.id);
                    return (
                      <div key={role.id} className={`flex items-center justify-between p-3 border ${hasAccess ? 'bg-brand-teal/5 border-brand-teal/20' : 'bg-surface-input border-border opacity-50'}`}>
                        <div className="flex items-center gap-2">
                          {role.isSystem && <RiLockLine className="w-3.5 h-3.5 text-brand-magenta" />}
                          <span className="text-sm font-semibold text-content-primary">{role.name}</span>
                        </div>
                        {hasAccess ? (
                          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Granted</span>
                        ) : (
                          <span className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Denied</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
