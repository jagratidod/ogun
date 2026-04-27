import { useState, useEffect } from 'react';
import { RiSaveLine, RiLoader4Line, RiSettings4Line, RiEditLine, RiBankLine, RiCheckLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, formatCurrency } from '../../../core';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function HRSalarySetupPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/payroll/employees');
      setEmployees(res.data.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Derive unique departments
  const departments = ['All', ...new Set(employees.map(e => e.department || 'Unassigned'))].sort();

  const filteredEmployees = employees.filter(e => {
    const matchesDept = selectedDept === 'All' || (e.department || 'Unassigned') === selectedDept;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      salary: emp.salary || '',
      department: emp.department || '',
      bankName: emp.bankDetails?.bankName || '',
      accountNumber: emp.bankDetails?.accountNumber || '',
      ifscCode: emp.bankDetails?.ifscCode || '',
      accountHolder: emp.bankDetails?.accountHolder || ''
    });
  };

  const cancelEdit = () => { setEditingId(null); setForm({}); };

  const saveEmployee = async (empId) => {
    setSaving(true);
    try {
      await api.patch(`/hr/payroll/employees/${empId}`, {
        salary: Number(form.salary),
        department: form.department,
        bankDetails: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          accountHolder: form.accountHolder
        }
      });
      toast.success('Employee details saved');
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
    </div>
  );

  const totalMonthly = employees.reduce((a, e) => a + (e.salary || 0), 0);

  return (
    <div className="page-container">
      <PageHeader
        title="Salary Setup"
        subtitle="Configure base salaries and bank details for each employee"
      >
        <div className="relative w-64">
          <RiSettings4Line className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary w-4 h-4" />
          <input 
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-elevated border border-border text-sm focus:outline-none focus:border-brand-teal transition-all"
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 border-l-4 border-brand-teal bg-gradient-to-br from-brand-teal/5 to-transparent">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Monthly CTC</p>
          <h3 className="text-2xl font-black text-content-primary">{formatCurrency(totalMonthly)}</h3>
        </div>
        <div className="glass-card p-5 border-l-4 border-state-warning bg-gradient-to-br from-state-warning/5 to-transparent">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Employees Configured</p>
          <h3 className="text-2xl font-black text-content-primary">{employees.filter(e => e.salary > 0).length} / {employees.length}</h3>
        </div>
        <div className="glass-card p-5 border-l-4 border-state-danger bg-gradient-to-br from-state-danger/5 to-transparent">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Missing Salary</p>
          <h3 className="text-2xl font-black text-state-danger">{employees.filter(e => !e.salary || e.salary === 0).length}</h3>
        </div>
      </div>

      {/* Department Selector */}
      <div className="mb-8">
        <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-3 ml-1">Filter by Department</p>
        <div className="flex flex-wrap gap-2 p-1 bg-surface-elevated/50 border border-border inline-flex rounded-none backdrop-blur-sm">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => { setSelectedDept(dept); setEditingId(null); }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group ${
                selectedDept === dept 
                  ? 'text-white' 
                  : 'text-content-tertiary hover:text-content-primary'
              }`}
            >
              {selectedDept === dept && (
                <div className="absolute inset-0 bg-brand-teal animate-in fade-in zoom-in duration-300" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {dept} 
                <span className={`px-1.5 py-0.5 rounded-none text-[8px] ${selectedDept === dept ? 'bg-white/20' : 'bg-surface-secondary'}`}>
                  {dept === 'All' ? employees.length : employees.filter(e => (e.department || 'Unassigned') === dept).length}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>


      <div className="space-y-3">
        {filteredEmployees.map(emp => (
          <Card key={emp.id} className={editingId === emp.id ? 'border-brand-teal' : ''}>
            <div className="p-5">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={emp.name} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-content-primary">{emp.name}</p>
                      <Badge variant="teal" className="text-[8px] uppercase">{emp.department || 'Unassigned'}</Badge>
                    </div>
                    <p className="text-xs text-content-secondary">{emp.email}</p>
                  </div>
                  <Badge variant="ghost" className="ml-2 border border-border text-[9px] uppercase">{emp.role}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  {emp.salary > 0 ? (
                    <span className="text-sm font-black text-brand-teal">{formatCurrency(emp.salary)}/mo</span>
                  ) : (
                    <Badge variant="warning">Not Set</Badge>
                  )}
                  {editingId === emp.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                      <Button size="sm" icon={RiCheckLine} onClick={() => saveEmployee(emp.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" icon={RiEditLine} onClick={() => startEdit(emp)}>Edit</Button>
                  )}
                </div>
              </div>

              {editingId === emp.id && (
                <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Base Salary (₹/month)</label>
                    <input
                      type="number"
                      value={form.salary}
                      onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="e.g. Sales"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={form.accountHolder}
                      onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="Full name on bank account"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Account Number</label>
                    <input
                      type="text"
                      value={form.accountNumber}
                      onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="e.g. 001234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={form.ifscCode}
                      onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))}
                      className="w-full h-9 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                </div>
              )}

              {editingId !== emp.id && emp.bankDetails?.accountNumber && (
                <div className="flex items-center gap-2 mt-2 text-xs text-content-tertiary">
                  <RiBankLine className="w-3.5 h-3.5" />
                  <span>{emp.bankDetails.bankName} · ••••{emp.bankDetails.accountNumber.slice(-4)} · {emp.bankDetails.ifscCode}</span>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="glass-card p-12 text-center text-content-tertiary">
            <RiSettings4Line className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold uppercase">No employees in this department</p>
          </div>
        )}
      </div>
    </div>
  );
}

