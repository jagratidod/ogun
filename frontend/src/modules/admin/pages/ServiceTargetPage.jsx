import { useState, useEffect } from 'react';
import {
  RiTrophyLine, RiEditLine, RiSaveLine, RiUserLine,
  RiFocus2Line, RiCalendarLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, DataTable,
  Badge, Button, Select, Input, Modal, useModal
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';
import { SERVICE_ROLE_LABELS, SERVICE_ROLES } from '../../../core/utils/constants';

export default function ServiceTargetPage() {
  const [targets, setTargets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  
  // Controlled form state
  const [formData, setFormData] = useState({
    assignedTo: '',
    revenue: '',
    csat: '',
    tat: '',
    ticketVolume: ''
  });
  
  const targetModal = useModal();

  useEffect(() => {
    fetchData();
  }, [period]);

  // Update form data when modal opens
  useEffect(() => {
    if (targetModal.isOpen && targetModal.data) {
      setFormData({
        assignedTo: targetModal.data.assignedTo?._id || '',
        revenue: targetModal.data.targets?.revenue || '',
        csat: targetModal.data.targets?.csat || '',
        tat: targetModal.data.targets?.tat || '',
        ticketVolume: targetModal.data.targets?.ticketVolume || ''
      });
    } else if (targetModal.isOpen) {
      setFormData({
        assignedTo: '',
        revenue: '',
        csat: '',
        tat: '',
        ticketVolume: ''
      });
    }
  }, [targetModal.isOpen, targetModal.data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
        api.get(`/admin/service-team/targets?period=${period}`),
        api.get('/admin/service-team/members')
      ]);
      setTargets(tRes.data.data);
      setMembers(mRes.data.data);
    } catch (err) {
      toast.error('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTarget = async (e) => {
    e.preventDefault();
    
    const assignedTo = targetModal.data?.assignedTo?._id || formData.assignedTo;

    if (!assignedTo || assignedTo === 'null') {
      toast.error('Please select a staff member');
      return;
    }

    const member = members.find(m => m._id === assignedTo);

    const payload = {
      assignments: [{
        assignedTo,
        serviceRole: member?.serviceRole,
        period,
        targets: {
          revenue: Number(formData.revenue),
          csat: Number(formData.csat),
          tat: Number(formData.tat),
          ticketVolume: Number(formData.ticketVolume)
        }
      }]
    };

    try {
      await api.post('/admin/service-team/targets', payload);
      toast.success('Target assigned successfully');
      targetModal.close();
      fetchData();
    } catch (err) {
      toast.error('Failed to set target');
    }
  };

  const columns = [
    { key: 'assignedTo', label: 'Member', render: (val) => (
      <div className="flex flex-col">
        <span className="font-bold text-content-primary">{val?.name || 'Unknown'}</span>
        <span className="text-[10px] text-content-tertiary uppercase">{SERVICE_ROLE_LABELS[val?.serviceRole] || val?.serviceRole}</span>
      </div>
    )},
    { key: 'targets', label: 'Revenue Target', align: 'right', render: (val) => (
      <span className="font-bold text-brand-teal">₹{val.revenue?.toLocaleString()}</span>
    )},
    { key: 'targets', label: 'CSAT Target', align: 'center', render: (val) => (
      <span className="text-sm font-medium">{val.csat}%</span>
    )},
    { key: 'targets', label: 'TAT Goal', align: 'center', render: (val) => (
      <span className="text-sm font-medium">{val.tat}h</span>
    )},
    { key: 'targets', label: 'Vol. Goal', align: 'center', render: (val) => (
      <span className="text-sm font-bold">{val.ticketVolume}</span>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <Button variant="icon" onClick={() => targetModal.open(row)}>
        <RiEditLine className="w-4 h-4" />
      </Button>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Target Configuration" 
        subtitle="Set performance benchmarks and revenue goals for all service levels"
      >
        <div className="flex gap-2">
          <input 
            type="month" 
            className="input h-9 w-40 text-xs" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <Button icon={RiFocus2Line} onClick={() => targetModal.open(null)}>
            Assign New Target
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RiTrophyLine className="w-5 h-5 text-brand-teal" />
            <CardTitle>Performance Targets — {period}</CardTitle>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={targets} loading={loading} />
      </Card>

      <Modal 
        isOpen={targetModal.isOpen} 
        onClose={targetModal.close}
        title={targetModal.data ? `Edit Target: ${targetModal.data.assignedTo?.name}` : 'Create Performance Target'}
      >
        <form onSubmit={handleSetTarget} className="space-y-4">
          {!targetModal.data && (
            <Select 
              label="Select Member" 
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
              placeholder="Select a member"
              required
              options={members.map(m => ({ 
                label: `${m.name} (${SERVICE_ROLE_LABELS[m.serviceRole]})`, 
                value: String(m.id || m._id) 
              }))} 
            />
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Revenue Target (₹)" 
              value={formData.revenue}
              onChange={(e) => setFormData({...formData, revenue: e.target.value})}
              type="number"
              required
            />
            <Input 
              label="CSAT Goal (%)" 
              value={formData.csat}
              onChange={(e) => setFormData({...formData, csat: e.target.value})}
              type="number"
              required
            />
            <Input 
              label="TAT Goal (Hours)" 
              value={formData.tat}
              onChange={(e) => setFormData({...formData, tat: e.target.value})}
              type="number"
              required
            />
            <Input 
              label="Ticket Volume Goal" 
              value={formData.ticketVolume}
              onChange={(e) => setFormData({...formData, ticketVolume: e.target.value})}
              type="number"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={targetModal.close}>Cancel</Button>
            <Button type="submit" icon={RiSaveLine}>{targetModal.data ? 'Update' : 'Save'} Target</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
