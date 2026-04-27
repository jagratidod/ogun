import { useState, useEffect } from 'react';
import {
  RiToolsLine, RiUserAddLine, RiSearchLine, RiEyeLine,
  RiEditLine, RiDeleteBin7Line, RiCheckLine, RiCloseLine,
  RiLoader4Line, RiShieldCheckLine, RiTimeLine, RiMapPinLine,
  RiThumbUpLine, RiThumbDownLine, RiUserStarLine, RiSettings4Line,
  RiAddLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, DataTable, Badge, Button,
  Input, Modal, useModal, Avatar, formatDateTime
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', location: '' };

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const { isOpen: isFormOpen, open: openForm, close: closeForm, data: editingTech } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail, data: detailData } = useModal();
  const { isOpen: isDeleteOpen, open: openDelete, close: closeDelete, data: deletingTech } = useModal();

  // Service type config state
  const [serviceTypes, setServiceTypes] = useState([]);
  const [newServiceType, setNewServiceType] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchTechnicians();
    fetchServiceConfig();
  }, []);

  const fetchServiceConfig = async () => {
    try {
      const res = await api.get('/admin/service-config');
      setServiceTypes(res.data?.data?.serviceTypes || []);
    } catch {
      // silently fail
    }
  };

  const handleAddServiceType = () => {
    const val = newServiceType.trim();
    if (!val) return;
    if (serviceTypes.includes(val)) return toast.error('Already exists');
    setServiceTypes(prev => [...prev, val]);
    setNewServiceType('');
  };

  const handleRemoveServiceType = (svc) => {
    setServiceTypes(prev => prev.filter(s => s !== svc));
  };

  const handleSaveServiceConfig = async () => {
    if (serviceTypes.length === 0) return toast.error('Add at least one service type');
    setSavingConfig(true);
    const t = toast.loading('Saving service types...');
    try {
      await api.put('/admin/service-config', { serviceTypes });
      toast.success('Service types saved', { id: t });
    } catch {
      toast.error('Failed to save', { id: t });
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/technicians');
      setTechnicians(res.data?.data || []);
    } catch {
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (tech = null) => {
    setFormErrors({});
    setForm(tech
      ? { name: tech.name, email: tech.email, password: '', phone: tech.phone || '', location: tech.location || '' }
      : EMPTY_FORM
    );
    openForm(tech);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!editingTech && !form.password.trim()) errors.password = 'Password is required';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid 10-digit mobile number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const t = toast.loading(editingTech ? 'Updating technician...' : 'Creating technician...');
    try {
      const payload = { ...form };
      if (editingTech && !payload.password) delete payload.password;

      if (editingTech) {
        await api.put(`/admin/technicians/${editingTech._id}`, payload);
        toast.success('Technician updated', { id: t });
      } else {
        await api.post('/admin/technicians', payload);
        toast.success('Technician created', { id: t });
      }
      fetchTechnicians();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed', { id: t });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const t = toast.loading('Removing technician...');
    try {
      await api.delete(`/admin/technicians/${deletingTech._id}`);
      toast.success('Technician removed', { id: t });
      fetchTechnicians();
      closeDelete();
    } catch {
      toast.error('Delete failed', { id: t });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (tech) => {
    const t = toast.loading('Updating status...');
    try {
      await api.put(`/admin/technicians/${tech._id}`, { isActive: !tech.isActive });
      toast.success(`Technician ${tech.isActive ? 'deactivated' : 'activated'}`, { id: t });
      fetchTechnicians();
    } catch {
      toast.error('Status update failed', { id: t });
    }
  };

  const handleApproval = async (tech, status) => {
    const t = toast.loading(status === 'approved' ? 'Approving...' : 'Rejecting...');
    try {
      await api.patch(`/admin/technicians/${tech._id}/approval`, { status });
      toast.success(`Technician ${status}`, { id: t });
      fetchTechnicians();
    } catch {
      toast.error('Action failed', { id: t });
    }
  };

  const handlePromoteToManager = async (tech) => {
    if (!window.confirm(`Promote ${tech.name} to Technician Manager? They will get a dedicated portal to view and assign service requests.`)) return;
    const t = toast.loading('Promoting to manager...');
    try {
      await api.put(`/admin/technicians/${tech._id}`, { subRole: 'technician_manager' });
      toast.success(`${tech.name} is now a Technician Manager`, { id: t });
      fetchTechnicians();
    } catch {
      toast.error('Promotion failed', { id: t });
    }
  };

  const handleViewDetail = async (tech) => {
    const t = toast.loading('Loading details...');
    try {
      const res = await api.get(`/admin/technicians/${tech._id}`);
      toast.dismiss(t);
      openDetail(res.data?.data);
    } catch {
      toast.error('Failed to load details', { id: t });
    }
  };

  const filtered = technicians.filter(t =>
    t.approvalStatus === activeTab &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.location || '').toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      key: 'name', label: 'Technician', sortable: true, render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-content-primary">{val}</p>
              {row.subRole === 'technician_manager' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-sm uppercase tracking-wide">Manager</span>
              )}
            </div>
            <p className="text-xs text-content-tertiary">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'location', label: 'Location', render: (val) => (
        <div className="flex items-center gap-1.5">
          <RiMapPinLine className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="text-sm text-content-secondary">{val || '—'}</span>
        </div>
      )
    },
    {
      key: 'stats', label: 'Tickets', render: (val) => (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-content-tertiary">Total: <strong className="text-content-primary">{val?.total ?? 0}</strong></span>
          <span className="text-state-success">Done: <strong>{val?.resolved ?? 0}</strong></span>
          <span className="text-brand-teal">Active: <strong>{val?.inProgress ?? 0}</strong></span>
        </div>
      )
    },
    {
      key: 'isActive', label: 'Status', render: (val) => (
        <Badge variant={val ? 'success' : 'danger'}>{val ? 'Active' : 'Inactive'}</Badge>
      )
    },
    {
      key: 'lastLogin', label: 'Last Login', render: (val) => (
        <span className="text-xs text-content-tertiary">{val ? formatDateTime(val).split(',')[0] : 'Never'}</span>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
        <div className="flex justify-end gap-1">
          {row.approvalStatus === 'pending' ? (
            <>
              <Button variant="icon" title="Approve" onClick={() => handleApproval(row, 'approved')}>
                <RiThumbUpLine className="w-4 h-4 text-state-success" />
              </Button>
              <Button variant="icon" title="Reject" onClick={() => handleApproval(row, 'rejected')}>
                <RiThumbDownLine className="w-4 h-4 text-state-danger" />
              </Button>
              <Button variant="icon" title="View Details" onClick={() => handleViewDetail(row)}>
                <RiEyeLine className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="icon" title="View Details" onClick={() => handleViewDetail(row)}>
                <RiEyeLine className="w-4 h-4" />
              </Button>
              <Button variant="icon" title="Edit" onClick={() => handleOpenForm(row)}>
                <RiEditLine className="w-4 h-4 text-brand-teal" />
              </Button>
              <Button variant="icon" title={row.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(row)}>
                {row.isActive
                  ? <RiCloseLine className="w-4 h-4 text-state-danger" />
                  : <RiCheckLine className="w-4 h-4 text-state-success" />}
              </Button>
              {row.subRole !== 'technician_manager' && (
                <Button variant="icon" title="Promote to Manager" onClick={() => handlePromoteToManager(row)}>
                  <RiUserStarLine className="w-4 h-4 text-amber-500" />
                </Button>
              )}
              <Button variant="icon" title="Delete" onClick={() => openDelete(row)}>
                <RiDeleteBin7Line className="w-4 h-4 text-state-danger" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const totalActive = technicians.filter(t => t.isActive).length;
  const totalTickets = technicians.reduce((s, t) => s + (t.stats?.total || 0), 0);
  const totalResolved = technicians.reduce((s, t) => s + (t.stats?.resolved || 0), 0);

  return (
    <div className="page-container">
      <PageHeader title="Technicians" subtitle="Manage field technicians and track their service activity">
        <Button icon={RiUserAddLine} onClick={() => handleOpenForm()}>Add Technician</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Technicians', val: technicians.length },
          { label: 'Active', val: totalActive, color: 'text-state-success' },
          { label: 'Total Tickets Handled', val: totalTickets, color: 'text-brand-teal' },
          { label: 'Resolved', val: totalResolved, color: 'text-state-success' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h4 className={`text-xl font-bold ${s.color || 'text-content-primary'}`}>{s.val}</h4>
          </div>
        ))}
      </div>

      {/* Service Types Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <RiSettings4Line className="w-4 h-4 text-brand-teal" />
              <span className="text-sm font-bold text-content-primary">Service Types</span>
              <span className="text-[10px] text-content-tertiary ml-1">— shown to technicians during registration</span>
            </div>
            <Button size="sm" onClick={handleSaveServiceConfig} loading={savingConfig} icon={RiCheckLine}>
              Save
            </Button>
          </div>
        </CardHeader>
        <div className="p-4 space-y-3">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Washing Machine"
              value={newServiceType}
              onChange={e => setNewServiceType(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddServiceType()}
              className="flex-1 h-9 px-3 text-sm bg-surface-input border border-border outline-none focus:border-brand-teal rounded-none transition-colors"
            />
            <Button size="sm" icon={RiAddLine} onClick={handleAddServiceType}>Add</Button>
          </div>
          {/* Chips */}
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {serviceTypes.length === 0 && (
              <p className="text-xs text-content-tertiary italic">No service types yet. Add some above.</p>
            )}
            {serviceTypes.map(svc => (
              <span key={svc} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded-md">
                {svc}
                <button
                  type="button"
                  onClick={() => handleRemoveServiceType(svc)}
                  className="text-brand-teal/50 hover:text-state-danger transition-colors ml-0.5"
                >
                  <RiCloseLine className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'pending',  label: 'Pending Requests', count: technicians.filter(t => t.approvalStatus === 'pending').length },
          { key: 'approved', label: 'Approved',         count: technicians.filter(t => t.approvalStatus === 'approved').length },
          { key: 'rejected', label: 'Rejected',         count: technicians.filter(t => t.approvalStatus === 'rejected').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-content-tertiary hover:text-content-secondary'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                tab.key === 'pending' ? 'bg-amber-100 text-amber-600' :
                tab.key === 'approved' ? 'bg-brand-teal/10 text-brand-teal' :
                'bg-red-50 text-red-400'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <Input
              icon={RiSearchLine}
              placeholder="Search by name, email or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-72"
            />
          </div>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No technicians found" />
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTech ? `Edit: ${editingTech.name}` : 'Add New Technician'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button icon={RiCheckLine} onClick={handleSave} loading={saving}>
              {editingTech ? 'Save Changes' : 'Create Technician'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Full Name"
                placeholder="e.g. Ravi Kumar"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {formErrors.name && <p className="text-xs text-state-danger mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="technician@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {formErrors.email && <p className="text-xs text-state-danger mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Input
                label={editingTech ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {formErrors.password && <p className="text-xs text-state-danger mt-1">{formErrors.password}</p>}
            </div>
            <div>
              <Input
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={form.phone}
                inputMode="numeric"
                maxLength={10}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              />
              {formErrors.phone && <p className="text-xs text-state-danger mt-1">{formErrors.phone}</p>}
            </div>
          </div>
          <Input
            label="Service Area / Location"
            placeholder="e.g. Mumbai, Maharashtra"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          />
          <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
            <RiShieldCheckLine className="text-brand-teal w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-content-secondary leading-relaxed">
              Technician will be created with <strong>technician</strong> sub-role. They can log in via the Service portal and manage assigned tickets.
            </p>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title={`Technician: ${detailData?.technician?.name || ''}`}
        size="lg"
      >
        {detailData && (
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4 p-4 bg-surface-elevated border border-border">
              <Avatar name={detailData.technician.name} size="lg" />
              <div>
                <h3 className="font-bold text-content-primary">{detailData.technician.name}</h3>
                <p className="text-sm text-content-tertiary">{detailData.technician.email}</p>
                {detailData.technician.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <RiMapPinLine className="w-3.5 h-3.5 text-content-tertiary" />
                    <span className="text-xs text-content-tertiary">{detailData.technician.location}</span>
                  </div>
                )}
              </div>
              <div className="ml-auto">
                <Badge variant={detailData.technician.isActive ? 'success' : 'danger'}>
                  {detailData.technician.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total', val: detailData.serviceRequests.length },
                { label: 'Open', val: detailData.serviceRequests.filter(r => ['Open', 'Assigned'].includes(r.status)).length, color: 'text-state-warning' },
                { label: 'In Progress', val: detailData.serviceRequests.filter(r => r.status === 'In Progress').length, color: 'text-brand-teal' },
                { label: 'Resolved', val: detailData.serviceRequests.filter(r => ['Resolved', 'Closed'].includes(r.status)).length, color: 'text-state-success' },
              ].map(s => (
                <div key={s.label} className="glass-card p-3 text-center">
                  <p className="text-[10px] text-content-tertiary uppercase font-bold mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color || 'text-content-primary'}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Service History */}
            <div>
              {detailData.technician.services?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-content-tertiary uppercase tracking-wider mb-2">Services Provided</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailData.technician.services.map(svc => (
                      <span key={svc} className="px-2.5 py-1 text-[11px] font-bold bg-brand-teal/10 text-brand-teal rounded-md border border-brand-teal/20">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs font-bold text-content-tertiary uppercase tracking-wider mb-3">Service History</p>
              {detailData.serviceRequests.length === 0 ? (
                <p className="text-sm text-content-tertiary italic text-center py-6">No tickets assigned yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {detailData.serviceRequests.map(req => (
                    <div key={req._id} className="flex items-center justify-between p-3 bg-surface-elevated border border-border">
                      <div>
                        <p className="text-sm font-semibold text-content-primary">#{req.ticketId}</p>
                        <p className="text-xs text-content-tertiary">{req.customer?.name} · {req.registeredProduct?.productName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <RiTimeLine className="w-3 h-3 text-content-tertiary" />
                          <span className="text-[10px] text-content-tertiary">{formatDateTime(req.createdAt).split(',')[0]}</span>
                        </div>
                      </div>
                      <Badge variant={
                        req.status === 'Resolved' || req.status === 'Closed' ? 'success' :
                        req.status === 'In Progress' ? 'info' : 'warning'
                      }>{req.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        title="Remove Technician"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={closeDelete}>Cancel</Button>
            <Button variant="danger" icon={RiDeleteBin7Line} onClick={handleDelete} loading={deleting}>
              Yes, Remove
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-content-secondary">
            Are you sure you want to remove <strong className="text-content-primary">{deletingTech?.name}</strong>?
          </p>
          <div className="p-3 bg-state-danger/5 border border-state-danger/20 text-xs text-state-danger">
            All open tickets assigned to this technician will be unassigned and set back to <strong>Open</strong>.
          </div>
        </div>
      </Modal>
    </div>
  );
}
