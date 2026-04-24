import { useEffect, useMemo, useState } from 'react';
import {
  RiSearchLine, RiUserAddLine, RiMapPinLine, RiFocus3Line,
  RiArrowRightLine, RiStore2Line, RiShoppingCartLine,
  RiTrophyLine, RiCheckLine
} from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Avatar, Input, Select, Modal } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i, 1);
  return {
    label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
    value: `${d.getFullYear()}-${String(i + 1).padStart(2, '0')}`,
  };
});

export default function SalesRepsPage() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [targetModal, setTargetModal] = useState(null); // rep object
  const [detailModal, setDetailModal] = useState(null); // rep detail data

  // Forms
  const [addForm, setAddForm] = useState({ name: '', email: '', assignedArea: '' });
  const [targetForm, setTargetForm] = useState({ month: MONTHS[0].value, salesTarget: '', retailersTarget: '' });
  const [saving, setSaving] = useState(false);

  const fetchReps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sales-reps');
      setReps(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load sales representatives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReps(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reps
      .filter(r => statusFilter === 'all' || r.status === statusFilter)
      .filter(r => !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.assignedArea?.toLowerCase().includes(q));
  }, [reps, search, statusFilter]);

  const toggleStatus = async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/sales-reps/${row.id}`, { status: next });
      toast.success(`Rep ${next === 'active' ? 'activated' : 'deactivated'}`);
      fetchReps();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      await api.post('/admin/sales-reps', addForm);
      toast.success('Sales rep created');
      setAddModal(false);
      setAddForm({ name: '', email: '', assignedArea: '' });
      fetchReps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rep');
    } finally {
      setSaving(false);
    }
  };

  const handleSetTarget = async () => {
    if (!targetForm.salesTarget || !targetForm.retailersTarget) return toast.error('Fill all target fields');
    setSaving(true);
    try {
      await api.post(`/admin/sales-reps/${targetModal.id}/targets`, {
        month: targetForm.month,
        salesTarget: Number(targetForm.salesTarget),
        retailersTarget: Number(targetForm.retailersTarget),
      });
      toast.success('Target set successfully');
      setTargetModal(null);
      fetchReps();
    } catch {
      toast.error('Failed to set target');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (row) => {
    try {
      const res = await api.get(`/admin/sales-reps/${row.id}`);
      setDetailModal(res.data.data);
    } catch {
      toast.error('Failed to load details');
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name', label: 'Representative', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="font-bold text-content-primary text-sm">{val}</p>
            <p className="text-xs text-content-tertiary">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'assignedArea', label: 'Area',
      render: (val) => (
        <div className="flex items-center gap-1 text-sm text-content-secondary">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          {val || '—'}
        </div>
      )
    },
    {
      key: 'totalPoints', label: 'Points',
      render: (val) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-brand-magenta">
          <RiTrophyLine className="w-4 h-4" />
          {val}
        </div>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge status={val}>{val}</Badge>
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" icon={RiFocus3Line} onClick={() => { setTargetModal(row); setTargetForm({ month: MONTHS[0].value, salesTarget: '', retailersTarget: '' }); }}>
            Set Target
          </Button>
          <Button size="sm" variant="ghost" icon={RiArrowRightLine} onClick={() => openDetail(row)}>
            View
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toggleStatus(row)}>
            {row.status === 'active' ? 'Disable' : 'Activate'}
          </Button>
        </div>
      )
    }
  ]), [reps]);

  return (
    <div className="page-container">
      <PageHeader title="Sales Representatives" subtitle="Manage field executives, assign targets and track performance">
        <Button icon={RiUserAddLine} onClick={() => setAddModal(true)}>Add Rep</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <Select
              options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]}
              className="w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            />
            <Input icon={RiSearchLine} placeholder="Search name, email, area..." className="w-full md:w-64"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={loading ? [] : filtered.map(r => ({ ...r, joined: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' }))}
        />
      </Card>

      {/* ── Add Rep Modal ── */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Sales Representative">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Rahul Sharma" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Work Email" placeholder="rahul@ogun.in" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Assigned Area" placeholder="e.g. Mumbai North" value={addForm.assignedArea} onChange={e => setAddForm(p => ({ ...p, assignedArea: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button icon={RiCheckLine} loading={saving} onClick={handleAdd}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* ── Set Target Modal ── */}
      <Modal isOpen={!!targetModal} onClose={() => setTargetModal(null)} title={`Set Target — ${targetModal?.name}`}>
        <div className="space-y-4">
          <Select
            label="Month"
            options={MONTHS}
            value={targetForm.month}
            onChange={e => setTargetForm(p => ({ ...p, month: e.target.value }))}
          />
          <Input label="Sales Target (₹)" type="number" placeholder="e.g. 500000" value={targetForm.salesTarget}
            onChange={e => setTargetForm(p => ({ ...p, salesTarget: e.target.value }))} />
          <Input label="Retailers to Onboard" type="number" placeholder="e.g. 10" value={targetForm.retailersTarget}
            onChange={e => setTargetForm(p => ({ ...p, retailersTarget: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTargetModal(null)}>Cancel</Button>
            <Button icon={RiFocus3Line} loading={saving} onClick={handleSetTarget}>Save Target</Button>
          </div>
        </div>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`${detailModal?.rep?.name} — Overview`} size="lg">
        {detailModal && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Retailers (All)', val: detailModal.retailers?.length || 0, icon: RiStore2Line, color: 'text-brand-teal' },
                { label: 'Total Sales', val: `₹${(detailModal.totalSales || 0).toLocaleString()}`, icon: RiShoppingCartLine, color: 'text-indigo-500' },
                { label: 'Points Earned', val: detailModal.rep?.totalPoints || 0, icon: RiTrophyLine, color: 'text-brand-magenta' },
              ].map((s, i) => (
                <div key={i} className="border border-border rounded-lg p-3 text-center">
                  <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                  <p className="text-lg font-black text-content-primary">{s.val}</p>
                  <p className="text-xs text-content-tertiary">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Targets */}
            {detailModal.rep?.targets?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-content-tertiary mb-2">Monthly Targets</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailModal.rep.targets.slice().reverse().map((t, i) => {
                    const salesPct = t.salesTarget ? Math.min(100, Math.round(((t.achievedSales || 0) / t.salesTarget) * 100)) : 0;
                    const retailerPct = t.retailersTarget ? Math.min(100, Math.round(((t.achievedRetailers || 0) / t.retailersTarget) * 100)) : 0;
                    return (
                      <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-content-primary">{t.month}</span>
                          <span className="text-[10px] text-content-tertiary">Assigned by Admin</span>
                        </div>
                        {/* Sales target row */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-content-tertiary">Sales</span>
                            <span>
                              <span className="text-brand-teal">₹{(t.achievedSales || 0).toLocaleString()}</span>
                              <span className="text-content-tertiary"> / ₹{(t.salesTarget || 0).toLocaleString()}</span>
                              <span className="text-state-warning ml-2">Left: ₹{Math.max(0, (t.salesTarget || 0) - (t.achievedSales || 0)).toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                            <div className="h-full bg-brand-teal rounded-full transition-all" style={{ width: `${salesPct}%` }} />
                          </div>
                        </div>
                        {/* Retailers target row */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-content-tertiary">Retailers</span>
                            <span>
                              <span className="text-brand-magenta">{t.achievedRetailers || 0}</span>
                              <span className="text-content-tertiary"> / {t.retailersTarget || 0} shops</span>
                              <span className="text-state-warning ml-2">Left: {Math.max(0, (t.retailersTarget || 0) - (t.achievedRetailers || 0))}</span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                            <div className="h-full bg-brand-magenta rounded-full transition-all" style={{ width: `${retailerPct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Retailers */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-content-tertiary mb-2">
                Onboarded Retailers
                <span className="ml-2 text-brand-teal">({detailModal.retailers?.length || 0} total)</span>
              </p>
              {detailModal.retailers?.length === 0
                ? <p className="text-sm text-content-tertiary">No retailers onboarded yet.</p>
                : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {detailModal.retailers.map(r => (
                      <div key={r._id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-surface-secondary">
                        <div>
                          <span className="font-medium text-content-primary">{r.name}</span>
                          {r.shopName && <span className="text-content-tertiary ml-1">({r.shopName})</span>}
                          {r.location && <span className="text-xs text-content-tertiary ml-1">· {r.location}</span>}
                        </div>
                        <Badge status={r.isActive ? 'active' : 'pending'}>{r.isActive ? 'Active' : 'Pending'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Recent Orders */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-content-tertiary mb-2">Recent Orders</p>
              {detailModal.orders?.length === 0
                ? <p className="text-sm text-content-tertiary">No orders placed yet.</p>
                : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {detailModal.orders.slice(0, 10).map(o => (
                      <div key={o._id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-surface-secondary">
                        <span className="font-medium text-content-primary">{o.orderId}</span>
                        <span className="text-content-secondary">{o.buyer?.shopName || o.buyer?.name}</span>
                        <span className="font-bold text-brand-teal">₹{o.totalAmount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
