import { useState, useEffect } from 'react';
import { RiFilterLine, RiSearchLine, RiMoneyDollarCircleLine, RiInformationLine, RiPulseLine, RiCheckboxCircleLine, RiAlertLine, RiAddLine, RiLoader4Line, RiCheckLine, RiHistoryLine, RiCloseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, Modal } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function DeductionsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ adjustments: [], stats: { totalAdjustments: 0, netChange: 0, pendingCount: 0, approvedCount: 0 } });
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Adjustment Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'deduction',
    category: 'loan_emi',
    amount: '',
    reason: '',
    applicableMonth: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  useEffect(() => {
    fetchAdjustments();
    fetchEmployees();
  }, []);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/adjustments');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch adjustments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees/list');
      setEmployees(res.data.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.amount) return toast.error('Please fill required fields');

    try {
      setSubmitting(true);
      await api.post('/admin/accounts/adjustments', formData);
      toast.success('Adjustment added successfully');
      setShowModal(false);
      fetchAdjustments();
      setFormData({
        employeeId: '',
        type: 'deduction',
        category: 'loan_emi',
        amount: '',
        reason: '',
        applicableMonth: new Date().toISOString().slice(0, 7)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
        toast.loading('Approving adjustment...');
        await api.patch(`/admin/accounts/adjustments/${id}/approve`, { status: 'approved' });
        toast.dismiss();
        toast.success('Adjustment approved');
        fetchAdjustments();
    } catch (error) {
        toast.dismiss();
        toast.error('Failed to approve');
    }
  };

  const filteredAdjustments = data.adjustments.filter(a => 
    a.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.adjustmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'adjustmentId', label: 'ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'employee', label: 'Employee', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-surface-hover flex items-center justify-center text-brand-teal font-bold border border-border">
          {val?.name?.charAt(0)}
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-content-primary">{val?.name || 'N/A'}</span>
            <span className="text-[10px] text-content-tertiary uppercase font-bold">{val?.role?.replace('_', ' ')}</span>
        </div>
      </div>
    )},
    { key: 'type', label: 'Type', render: (val) => (
      <Badge variant={val === 'bonus' ? 'success' : 'danger'}>{val.toUpperCase()}</Badge>
    )},
    { key: 'category', label: 'Reason', render: (val) => val.replace('_', ' ') },
    { key: 'amount', label: 'Value', align: 'right', render: (val, row) => (
      <span className={`font-bold ${row.type === 'bonus' ? 'text-state-success' : 'text-state-warning'}`}>
        {row.type === 'bonus' ? '+' : '-'}{formatCurrency(val)}
      </span>
    )},
    { key: 'status', label: 'Status', render: (val) => <Badge status={val}>{val.toUpperCase()}</Badge> },
    { key: 'applicableMonth', label: 'Month' },
    { key: 'actions', label: 'Actions', align: 'right', render: (val, row) => (
        <div className="flex justify-end gap-1">
            {row.status === 'pending' && (
                <Button variant="ghost" size="sm" icon={RiCheckLine} onClick={() => handleApprove(row._id)}>Approve</Button>
            )}
        </div>
    )}
  ];

  if (loading && !showModal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Deductions & Bonuses" 
        subtitle="Manage custom salary adjustments, performance bonuses, and loan recoveries"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchAdjustments}>Refresh</Button>
            <Button icon={RiAddLine} onClick={() => setShowModal(true)}>New Adjustment</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Adj. (Cycle)</p>
            <h4 className="text-xl font-black text-content-primary">{data.stats.totalAdjustments}</h4>
        </div>
        <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Net Change</p>
            <h4 className={`text-xl font-black ${data.stats.netChange >= 0 ? 'text-state-success' : 'text-state-warning'}`}>
                {data.stats.netChange >= 0 ? '+' : ''}{formatCurrency(data.stats.netChange)}
            </h4>
        </div>
        <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Pending Approval</p>
            <h4 className="text-xl font-black text-state-warning">{data.stats.pendingCount}</h4>
        </div>
        <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Approved/Applied</p>
            <h4 className="text-xl font-black text-state-success">{data.stats.approvedCount}</h4>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Select options={[{ label: 'All Adjustments', value: 'all' }]} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                icon={RiSearchLine} 
                placeholder="Search adjustment..." 
                className="w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary" icon={RiFilterLine} onClick={() => {setSearchTerm(''); toast.success('Filters cleared')}}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredAdjustments} />
      </Card>

      {/* NEW ADJUSTMENT MODAL */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md bg-surface-primary border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
                      <h3 className="text-lg font-bold">New Salary Adjustment</h3>
                      <button onClick={() => setShowModal(false)}><RiCloseLine className="w-6 h-6 text-content-tertiary" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Select Employee</label>
                          <select 
                            className="w-full bg-surface-input border border-border h-10 px-3 text-sm focus:border-brand-teal outline-none"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                            required
                          >
                              <option value="">-- Select Employee --</option>
                              {employees.map(emp => (
                                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Type</label>
                              <select 
                                className="w-full bg-surface-input border border-border h-10 px-3 text-sm outline-none"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                              >
                                  <option value="deduction">Deduction</option>
                                  <option value="bonus">Bonus</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Amount</label>
                              <input 
                                type="number" 
                                className="w-full bg-surface-input border border-border h-10 px-3 text-sm outline-none focus:border-brand-teal"
                                placeholder="Value in ₹"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                required
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Category</label>
                          <select 
                            className="w-full bg-surface-input border border-border h-10 px-3 text-sm outline-none"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                              <option value="loan_emi">Loan EMI</option>
                              <option value="advance_recovery">Advance Recovery</option>
                              <option value="performance_bonus">Performance Bonus</option>
                              <option value="referral_bonus">Referral Bonus</option>
                              <option value="fine">Fine / Deduction</option>
                              <option value="other">Other</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Applicable Month</label>
                          <input 
                            type="month" 
                            className="w-full bg-surface-input border border-border h-10 px-3 text-sm outline-none"
                            value={formData.applicableMonth}
                            onChange={(e) => setFormData({...formData, applicableMonth: e.target.value})}
                            required
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-content-tertiary uppercase mb-1 block">Reason / Note</label>
                          <textarea 
                            className="w-full bg-surface-input border border-border p-3 text-sm outline-none focus:border-brand-teal min-h-[80px]"
                            placeholder="Brief explanation..."
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                          />
                      </div>

                      <div className="pt-2 flex gap-3">
                          <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                          <Button variant="primary" className="flex-1" type="submit" disabled={submitting}>
                              {submitting ? 'Adding...' : 'Create Adjustment'}
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
