import { useState } from 'react';
import { RiFileLockLine, RiSearchLine, RiShieldKeyholeLine, RiQuestionLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input } from '../../../core';
import rbacData from '../../../data/rbac.json';

export default function PermissionsPage() {
  const { permissions } = rbacData;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPermissions = permissions.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'id', label: 'ID', sortable: true, width: '150px' },
    { key: 'module', label: 'Module', sortable: true, render: (val) => (
      <span className="font-semibold text-content-primary">{val}</span>
    )},
    { key: 'action', label: 'Action', width: '120px', render: (val) => (
      <Badge variant={val === 'View' ? 'teal' : val === 'Delete' ? 'danger' : 'info'}>
        {val}
      </Badge>
    )},
    { key: 'description', label: 'Description' },
    { key: 'info', label: 'Info', align: 'center', width: '100px', render: () => (
      <div className="flex justify-center">
        <RiQuestionLine className="text-content-tertiary w-4 h-4 hover:text-brand-teal cursor-help" />
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Permission Matrix" 
        subtitle="Manage available granular actions across all system modules"
      >
        <div className="flex gap-3">
          <Input 
            icon={RiSearchLine} 
            placeholder="Filter permissions..." 
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" icon={RiShieldKeyholeLine}>Audit Log</Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>System Capabilities</CardTitle>
          <CardDescription>
            These are the core granular permissions defined for the OGUN system. You can assign these to custom roles.
          </CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={filteredPermissions} />
      </Card>
      
      <div className="mt-6 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-content-primary">Common Patterns (Role Presets)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Manager Template', 'Staff Template', 'Viewer Template'].map(tmpl => (
            <div key={tmpl} className="glass-card p-4 flex items-center justify-between group hover:border-brand-teal transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-surface-input flex items-center justify-center">
                  <RiFileLockLine className="text-brand-teal w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-content-primary">{tmpl}</span>
              </div>
              <Button variant="ghost" className="opacity-0 group-hover:opacity-100">Apply</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

