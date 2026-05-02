import { useState, useEffect } from 'react';
import { 
  RiUserLine, RiSearchLine, RiAddLine, RiMapPinLine, 
  RiTruckLine, RiCheckboxCircleLine, RiErrorWarningLine, RiLoader4Line 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, DataTable, Badge, 
  Button, Input, useSearch, useSort, usePagination, useModal, Modal,
  Select
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function DeliveryAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, open, close } = useModal();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '2w',
    location: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.getAgents();
      if (res.success) setAgents(res.data);
    } catch (error) {
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      return toast.error('Please fill all required fields');
    }

    try {
      setSubmitting(true);
      const res = await logisticsService.onboardAgent(formData);
      if (res.success) {
        toast.success('Agent onboarded successfully');
        setFormData({ name: '', email: '', phone: '', vehicleType: '2w', location: '' });
        close();
        fetchAgents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to onboard agent');
    } finally {
      setSubmitting(false);
    }
  };

  const { query, setQuery, filteredData } = useSearch(agents, ['name', 'email', 'location', 'phone']);
  const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'name', 'asc');
  const { paginatedData, currentPage, totalPages, goToPage } = usePagination(sortedData, 10);

  const columns = [
    {
      key: 'name', label: 'Agent Identity', render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-teal/10 flex items-center justify-center font-black text-brand-teal text-sm uppercase">
            {row.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-content-primary uppercase tracking-tight">{row.name}</p>
            <p className="text-[10px] text-content-tertiary font-mono">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Contact', render: (val) => <span className="text-xs font-medium text-content-secondary">{val || 'No Phone'}</span> },
    { 
      key: 'location', label: 'Assigned Territory', render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-content-primary">
          <RiMapPinLine className="text-brand-teal" /> {val || 'Hub Area'}
        </div>
      )
    },
    {
      key: 'status', label: 'Status', render: (val) => {
        const variants = {
          'Active': 'success',
          'On Delivery': 'info',
          'Inactive': 'secondary'
        };
        return <Badge variant={variants[val] || 'success'}>{val || 'Active'}</Badge>;
      }
    },
    { key: 'deliveries', label: 'Fulfillment Count', align: 'center', render: (val) => <span className="font-black text-content-primary">{val || 0}</span> },
    { 
      key: 'actions', label: 'Actions', align: 'right', render: () => (
        <Button variant="secondary" size="xs">Profile</Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Last-Mile Fleet Management"
        subtitle="Coordinate field delivery agents and monitor service quality across territories"
      >
        <Button icon={RiAddLine} onClick={open}>Onboard Agent</Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Global Fleet</span>
                  <span className="text-lg font-black text-brand-teal">{agents.length} Registered Agents</span>
               </div>
            </div>
            <div className="relative group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
              <Input
                placeholder="Search Agent Name, Email or Area..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 w-72 h-10"
              />
            </div>
          </div>
        </CardHeader>

        <DataTable
          columns={columns}
          data={paginatedData}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={requestSort}
          loading={loading}
        />
        
        <div className="p-4 border-t border-border flex items-center justify-between bg-surface-secondary/20">
          <span className="text-[11px] font-medium text-content-tertiary">
            Managing {agents.length} delivery partners in current network
          </span>
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Back</Button>
            <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Agent Onboarding Portal"
        size="md"
      >
        <div className="space-y-6 py-4">
          <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 mb-6">
            <p className="text-[11px] text-brand-teal font-medium leading-relaxed italic">
              "Agents added here will be granted a 'Delivery' profile and can be assigned to shipments in the dispatch workflow."
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1.5">Full Name *</label>
              <Input 
                placeholder="Enter agent name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1.5">Email Address *</label>
              <Input 
                type="email"
                placeholder="agent@ogun.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1.5">Phone Number *</label>
                <Input 
                  placeholder="+91" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1.5">Vehicle Type</label>
                <Select 
                  value={formData.vehicleType}
                  onChange={(val) => setFormData({...formData, vehicleType: val})}
                  options={[
                    { label: 'Two Wheeler', value: '2w' },
                    { label: 'Three Wheeler', value: '3w' },
                    { label: 'Mini Truck', value: 'truck' },
                  ]} 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1.5">Assigned Territory</label>
              <Input 
                placeholder="Search city or area..." 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <Button variant="secondary" onClick={close} disabled={submitting}>Cancel</Button>
            <Button 
              onClick={handleOnboard} 
              loading={submitting}
              icon={submitting ? RiLoader4Line : RiCheckboxCircleLine}
            >
              Complete Onboarding
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
