import { useState, useEffect } from 'react';
import {
  RiCustomerServiceLine, RiSearchLine, RiUserLine,
  RiSettings4Line, RiCheckDoubleLine, RiToolsLine,
  RiInformationLine, RiLoader4Line, RiEyeLine,
  RiMapPinLine, RiPhoneLine, RiTimeLine, RiHistoryLine,
  RiArrowLeftLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, Badge, Button, Input,
  DataTable, Modal, useModal, Select, formatDateTime, Avatar
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';
import { useNavigate } from 'react-router-dom';

export default function TechManagerDashboardPage() {
  const navigate = useNavigate();
  const { isOpen, open, close, data: selectedTicket } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail, data: detailTicket } = useModal();

  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technician/all-tickets');
      setRequests(res.data?.data || []);
    } catch {
      toast.error('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/technician/technicians');
      setTechnicians(
        (res.data?.data || []).map(t => ({ label: t.name, value: t._id }))
      );
    } catch {
      console.error('Failed to load technicians');
    }
  };

  const handleOpenAssign = (row) => {
    setSelectedTech(row.assignedTechnician?._id || '');
    open(row);
  };

  const handleAssign = async () => {
    if (!selectedTech) return toast.error('Please select a technician');
    setIsAssigning(true);
    const t = toast.loading('Assigning technician...');
    try {
      await api.patch(`/technician/all-tickets/${selectedTicket._id}/assign`, {
        assignedTechnician: selectedTech,
        note: 'Technician assigned by service manager.',
      });
      toast.success(`Technician assigned to #${selectedTicket.ticketId}`, { id: t });
      fetchRequests();
      close();
    } catch {
      toast.error('Assignment failed', { id: t });
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.ticketId?.toLowerCase().includes(q) ||
      r.customer?.name?.toLowerCase().includes(q) ||
      r.registeredProduct?.productName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = [
    { label: 'Total Tickets', val: requests.length },
    { label: 'Open', val: requests.filter(r => r.status === 'Open').length, color: 'text-state-warning' },
    { label: 'Unassigned', val: requests.filter(r => !r.assignedTechnician).length, color: 'text-state-danger' },
    { label: 'In Progress', val: requests.filter(r => r.status === 'In Progress').length, color: 'text-brand-teal' },
    { label: 'Resolved', val: requests.filter(r => ['Resolved', 'Closed'].includes(r.status)).length, color: 'text-state-success' },
  ];

  const columns = [
    {
      key: 'ticketId', label: 'Ticket', sortable: true,
      render: (val) => <span className="font-bold text-content-primary">#{val}</span>
    },
    {
      key: 'createdAt', label: 'Date',
      render: (val) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
        </div>
      )
    },
    {
      key: 'customer', label: 'Customer',
      render: (val) => (
        <div className="flex items-center gap-2">
          <Avatar name={val?.name} size="xs" />
          <span className="text-sm">{val?.name || '—'}</span>
        </div>
      )
    },
    {
      key: 'registeredProduct', label: 'Product',
      render: (val) => <span className="text-sm text-content-secondary">{val?.productName || '—'}</span>
    },
    {
      key: 'priority', label: 'Priority',
      render: (val) => (
        <Badge variant={val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'info'}>{val}</Badge>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge status={val.toLowerCase().replace(' ', '_')}>{val}</Badge>
    },
    {
      key: 'assignedTechnician', label: 'Assigned To',
      render: (val) => val
        ? <div className="flex items-center gap-1.5"><RiUserLine className="w-3.5 h-3.5 text-brand-teal" /><span className="text-sm">{val.name}</span></div>
        : <span className="text-xs text-state-danger italic">Unassigned</span>
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Details" onClick={() => openDetail(row)}>
            <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Assign Technician" onClick={() => handleOpenAssign(row)}>
            <RiSettings4Line className="w-4 h-4 text-brand-teal" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Service Requests"
        subtitle="View and assign technicians to service complaints"
      >
        <Button icon={RiLoader4Line} variant="secondary" onClick={fetchRequests}>Refresh</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h4 className={`text-xl font-bold ${s.color || 'text-content-primary'}`}>{s.val}</h4>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
            <div className="flex gap-1 flex-wrap">
              {['all', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-none border transition-all ${
                    statusFilter === s
                      ? 'bg-brand-teal text-white border-brand-teal'
                      : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal/30'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
            <Input
              icon={RiSearchLine}
              placeholder="Search ticket, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </CardHeader>
        {loading
          ? <div className="flex items-center justify-center p-20"><RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" /></div>
          : <DataTable columns={columns} data={filtered} emptyMessage="No service requests found" />
        }
      </Card>

      {/* Assign Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Assign Technician — #${selectedTicket?.ticketId}`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button icon={RiCheckDoubleLine} onClick={handleAssign} loading={isAssigning}>Confirm Assignment</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-surface-elevated border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Issue</p>
              <h4 className="text-sm font-bold text-content-primary">{selectedTicket?.issueCategory}</h4>
              <p className="text-xs text-content-tertiary mt-1 italic">"{selectedTicket?.issueDescription}"</p>
            </div>
            <Badge variant={selectedTicket?.priority === 'High' ? 'danger' : 'warning'}>{selectedTicket?.priority}</Badge>
          </div>

          <Select
            label="Select Technician"
            value={selectedTech}
            onChange={e => setSelectedTech(e.target.value)}
            options={[{ label: '— Select a technician —', value: '' }, ...technicians]}
          />

          <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
            <RiToolsLine className="text-brand-teal w-5 h-5 flex-shrink-0" />
            <p className="text-[11px] text-content-secondary leading-normal">
              Only approved and active technicians are listed. The technician will be notified immediately.
            </p>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title={`Ticket #${detailTicket?.ticketId}`}
        size="lg"
      >
        {detailTicket && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-elevated border border-border space-y-3">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-wider">Customer</p>
                <div className="flex items-center gap-2">
                  <Avatar name={detailTicket.customer?.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{detailTicket.customer?.name}</p>
                    <p className="text-xs text-content-tertiary">{detailTicket.customer?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-content-secondary">
                  <RiPhoneLine className="w-3.5 h-3.5" />
                  {detailTicket.contactNumber}
                </div>
                {detailTicket.serviceAddress && (
                  <div className="flex items-start gap-2 text-xs text-content-secondary">
                    <RiMapPinLine className="w-3.5 h-3.5 mt-0.5" />
                    {detailTicket.serviceAddress}
                  </div>
                )}
              </div>
              <div className="p-4 bg-surface-elevated border border-border space-y-3">
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-wider">Issue</p>
                <p className="text-sm font-bold">{detailTicket.issueCategory}</p>
                <p className="text-xs text-content-secondary italic">"{detailTicket.issueDescription}"</p>
                <div className="flex gap-2">
                  <Badge variant={detailTicket.priority === 'High' ? 'danger' : 'warning'}>{detailTicket.priority}</Badge>
                  <Badge status={detailTicket.status?.toLowerCase().replace(' ', '_')}>{detailTicket.status}</Badge>
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-elevated border border-border">
              <p className="text-[10px] font-black text-content-tertiary uppercase tracking-wider mb-2">Assigned Technician</p>
              {detailTicket.assignedTechnician
                ? <div className="flex items-center gap-2"><RiUserLine className="w-4 h-4 text-brand-teal" /><span className="text-sm font-bold">{detailTicket.assignedTechnician.name}</span></div>
                : <span className="text-sm text-state-danger italic">Not yet assigned</span>
              }
            </div>
            <div className="flex justify-end">
              <Button icon={RiSettings4Line} onClick={() => { closeDetail(); handleOpenAssign(detailTicket); }}>
                Assign / Reassign Technician
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
