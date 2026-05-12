import { useState, useEffect } from 'react';
import {
  RiTeamLine, RiNodeTree, RiMapPinLine, RiAddLine,
  RiMore2Fill, RiDeleteBin7Line, RiUserAddLine, RiArrowRightSLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, DataTable,
  Badge, Button, Input, Select, useModal, Modal, MetricCard
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';
import { SERVICE_ROLES, SERVICE_ROLE_LABELS, SERVICE_REGIONS } from '../../../core/utils/constants';

export default function ServiceTeamPage() {
  const [view, setView] = useState('list'); // 'list' | 'tree'
  const [hierarchy, setHierarchy] = useState([]);
  const [members, setMembers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controlled form state
  const [formData, setFormData] = useState({
    userId: '',
    serviceRole: '',
    serviceRegion: '',
    serviceArea: '',
    reportsTo: ''
  });
  
  const assignModal = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  // Update form data when modal opens with existing data
  useEffect(() => {
    if (assignModal.isOpen && assignModal.data) {
      setFormData({
        userId: assignModal.data._id,
        serviceRole: assignModal.data.serviceRole || '',
        serviceRegion: assignModal.data.serviceRegion || '',
        serviceArea: assignModal.data.serviceArea || '',
        reportsTo: assignModal.data.reportsTo?._id || ''
      });
    } else if (assignModal.isOpen) {
      setFormData({
        userId: '',
        serviceRole: '',
        serviceRegion: '',
        serviceArea: '',
        reportsTo: ''
      });
    }
  }, [assignModal.isOpen, assignModal.data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, mRes, uRes] = await Promise.all([
        api.get('/admin/service-team/hierarchy'),
        api.get('/admin/service-team/members'),
        api.get('/admin/users')
      ]);
      setHierarchy(hRes.data.data);
      setMembers(mRes.data.data);
      setAllStaff(uRes.data.data.filter(u => !u.serviceRole));
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    
    const userId = assignModal.data?._id || formData.userId;

    if (!userId || userId === 'null') {
      toast.error('Please select a staff member');
      return;
    }

    if (!formData.serviceRole || !formData.serviceRegion) {
      toast.error('Please select role and region');
      return;
    }

    const payload = {
      serviceRole: formData.serviceRole,
      serviceRegion: formData.serviceRegion,
      serviceArea: formData.serviceArea,
      reportsTo: formData.reportsTo || null
    };

    try {
      await api.patch(`/admin/service-team/members/${userId}/assign`, payload);
      toast.success('Member assigned to service team');
      assignModal.close();
      fetchData();
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this member from service hierarchy?')) return;
    try {
      await api.patch(`/admin/service-team/members/${id}/remove`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const TreeItem = ({ item, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="flex flex-col">
        <div 
          className={`flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border hover:bg-surface-muted transition-all group cursor-pointer ${depth === 0 ? 'bg-surface-submerged font-bold' : ''}`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren ? (
              <RiArrowRightSLine className={`w-4 h-4 text-content-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <div className="w-4" />
            )}
            <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center text-[10px]">
              {item.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-content-primary">{item.name}</p>
              <p className="text-[9px] text-content-tertiary uppercase tracking-wider">{SERVICE_ROLE_LABELS[item.serviceRole]}</p>
            </div>
          </div>
          <Badge variant="ghost" className="text-[9px]">{item.serviceRegion}</Badge>
          <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); assignModal.open(item); }}>
            <RiMore2Fill className="w-3.5 h-3.5" />
          </Button>
        </div>
        {hasChildren && isExpanded && (
          <div className="relative mt-1">
            <div className="absolute left-4 top-0 bottom-4 w-px bg-border ml-[2px]" style={{ marginLeft: `${depth * 24 + 10}px` }} />
            {item.children.map(child => <TreeItem key={child._id} item={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-xs">
          {val.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-content-primary">{val}</p>
          <p className="text-[10px] text-content-tertiary">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'serviceRole', label: 'Role', render: (val) => (
      <Badge variant="info">{SERVICE_ROLE_LABELS[val] || val}</Badge>
    )},
    { key: 'serviceRegion', label: 'Region', render: (val) => (
      <div className="flex items-center gap-1 text-content-secondary">
        <RiMapPinLine className="w-3.5 h-3.5" />
        <span>{val || '—'}</span>
      </div>
    )},
    { key: 'reportsTo', label: 'Reporting To', render: (val) => (
      <span className="text-xs text-content-secondary">{val?.name || '—'}</span>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => assignModal.open(row)}>
          <RiMore2Fill className="w-4 h-4" />
        </Button>
        <Button variant="icon" onClick={() => handleRemove(row._id)}>
          <RiDeleteBin7Line className="w-4 h-4 text-state-danger" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Team Hierarchy" 
        subtitle="Manage reporting lines and regional assignments for the service department"
      >
        <Button icon={RiUserAddLine} onClick={() => assignModal.open(null)}>
          Assign New Member
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Members" value={members.length} icon={RiTeamLine} color="teal" />
        <MetricCard title="Regions" value={4} icon={RiMapPinLine} color="purple" />
        <MetricCard title="Hierarchies" value={5} icon={RiNodeTree} color="blue" />
        <MetricCard title="Open Tickets" value={0} icon={RiAddLine} color="pink" />
      </div>

      <div className="flex gap-2 mb-4 bg-surface-muted p-1 rounded-xl w-fit">
        <button 
          onClick={() => setView('list')}
          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-brand-teal' : 'text-content-tertiary'}`}
        >
          List View
        </button>
        <button 
          onClick={() => setView('tree')}
          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === 'tree' ? 'bg-white shadow-sm text-brand-teal' : 'text-content-tertiary'}`}
        >
          Tree View
        </button>
      </div>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiTeamLine className="w-5 h-5 text-brand-teal" />
              <CardTitle>Team Directory</CardTitle>
            </div>
          </CardHeader>
          <DataTable columns={columns} data={members} loading={loading} />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiNodeTree className="w-5 h-5 text-brand-teal" />
              <CardTitle>Organizational Structure</CardTitle>
            </div>
          </CardHeader>
          <div className="p-4 space-y-2">
            {hierarchy.length > 0 ? (
              hierarchy.map(root => <TreeItem key={root._id} item={root} />)
            ) : (
              <div className="p-12 text-center text-content-tertiary italic">No hierarchy established. Assign a Head of Service to start.</div>
            )}
          </div>
        </Card>
      )}

      <Modal 
        isOpen={assignModal.isOpen} 
        onClose={assignModal.close}
        title={assignModal.data ? `Edit Assignment: ${assignModal.data.name}` : 'Assign Member to Service Team'}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          {!assignModal.data && (
            <Select 
              label="Select Staff" 
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              placeholder="Select a staff member"
              required
              options={allStaff.map(u => ({ 
                label: `${u.name} (${u.email})`, 
                value: String(u.id || u._id) 
              }))} 
            />
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Service Role" 
              value={formData.serviceRole}
              onChange={(e) => setFormData({...formData, serviceRole: e.target.value})}
              required
              options={Object.entries(SERVICE_ROLE_LABELS).map(([val, label]) => ({ label, value: val }))}
            />
            <Select 
              label="Region" 
              value={formData.serviceRegion}
              onChange={(e) => setFormData({...formData, serviceRegion: e.target.value})}
              required
              options={SERVICE_REGIONS.map(r => ({ label: r, value: r }))}
            />
          </div>

          <Input 
            label="Area / City" 
            value={formData.serviceArea} 
            onChange={(e) => setFormData({...formData, serviceArea: e.target.value})}
            placeholder="e.g. Mumbai South"
          />

          <Select 
            label="Reports To (Manager)" 
            value={formData.reportsTo}
            onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
            options={[
              { label: 'None (Root)', value: '' },
              ...members.filter(m => String(m.id || m._id) !== (assignModal.data?.id || assignModal.data?._id || formData.userId)).map(m => ({ 
                label: `${m.name} (${SERVICE_ROLE_LABELS[m.serviceRole]})`, 
                value: String(m.id || m._id) 
              }))
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={assignModal.close}>Cancel</Button>
            <Button type="submit">{assignModal.data ? 'Update' : 'Assign'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
