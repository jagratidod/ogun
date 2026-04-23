import { useMemo, useState, useEffect } from 'react';
import { RiSearchLine, RiFilterLine, RiUserAddLine, RiEyeLine, RiPhoneLine, RiMailFill, RiUserFill, RiShoppingBag3Fill, RiMapPinFill } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Avatar, Input, Select, Modal, useModal } from '../../../core';
import partnerService from '../../../core/services/partnerService';
import { toast } from 'react-hot-toast';

export default function MyRetailersPage() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, open, close } = useModal();
  const [onboardingData, setOnboardingData] = useState({ name: '', email: '', shopName: '', location: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getMyRetailers();
      setRetailers(res.data || []);
    } catch (error) {
      toast.error('Failed to load your retailer network');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    if (!onboardingData.name || !onboardingData.email || !onboardingData.shopName) {
      return toast.error('Please fill required fields');
    }

    try {
      setSubmitting(true);
      await partnerService.onboardRetailer(onboardingData);
      toast.success('Retailer onboarded successfully');
      fetchRetailers();
      close();
      setOnboardingData({ name: '', email: '', shopName: '', location: '', phone: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  const myRetailers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (retailers || [])
      .filter((r) => statusFilter === 'all' ? true : (r.isActive ? 'active' : 'inactive') === statusFilter)
      .filter((r) => {
        if (!q) return true;
        return String(r.name || '').toLowerCase().includes(q) || String(r.shopName || '').toLowerCase().includes(q);
      })
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [retailers, search, statusFilter]);

  const columns = [
    { key: 'name', label: 'Retailer Store', sortable: true, render: (val, row) => (
       <div className="flex items-center gap-3">
          <Avatar name={row.shopName || val} size="sm" />
          <div>
            <p className="text-sm font-bold text-content-primary">{row.shopName || val}</p>
            <p className="text-xs text-content-tertiary">{val}</p>
          </div>
       </div>
    )},
    { key: 'email', label: 'Contact', render: (val) => (
       <span className="text-xs text-content-secondary font-medium">{val}</span>
    )},
    { key: 'location', label: 'Region', render: (val) => (
       <span className="text-xs text-content-tertiary">{val || 'Not set'}</span>
    )},
    { key: 'isActive', label: 'Status', render: (val) => (
       <Badge status={val ? 'success' : 'warning'}>{val ? 'Active' : 'Pending Approval'}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiPhoneLine} onClick={() => window.location.href = `tel:${row.phone}`}>Call</Button>
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="My Retailer Network" 
        subtitle="Manage and track retail stores in your regional territory"
      >
        <Button icon={RiUserAddLine} onClick={open}>Add Retailer</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Active Partners', val: myRetailers.filter(r => r.isActive).length },
           { label: 'Pending Approval', val: myRetailers.filter(r => !r.isActive).length },
           { label: 'Network Reach', val: 'Regional' },
           { label: 'Target Alignment', val: '84%' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className="text-xl font-bold text-content-primary">{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select
                className="w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
              <div className="flex items-center gap-2">
                 <Input
                   icon={RiSearchLine}
                   placeholder="Search store name..."
                   className="w-full md:w-64"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine} onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={myRetailers} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Onboard New Retailer"
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={handleOnboard} disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Retailer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest border-b border-brand-teal/20 pb-1">Store Information</p>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Shop / Boutique Name"
                icon={RiShoppingBag3Fill}
                placeholder="Enter store name"
                value={onboardingData.shopName}
                onChange={(e) => setOnboardingData({ ...onboardingData, shopName: e.target.value })}
              />
              <Input
                label="Region / Location"
                icon={RiMapPinFill}
                placeholder="e.g. Bandra West, Mumbai"
                value={onboardingData.location}
                onChange={(e) => setOnboardingData({ ...onboardingData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest border-b border-brand-teal/20 pb-1">Proprietor Contact</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name"
                icon={RiUserFill}
                placeholder="e.g. Rahul Sharma"
                value={onboardingData.name}
                onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
              />
              <Input
                label="Corporate Email"
                icon={RiMailFill}
                placeholder="retail@store.com"
                value={onboardingData.email}
                onChange={(e) => setOnboardingData({ ...onboardingData, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                icon={RiPhoneLine}
                placeholder="+91 00000 00000"
                value={onboardingData.phone}
                onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
              />
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
              "By onboarding this retailer, they will be mapped to your distribution node. 
              The retailer will be able to log in using their email immediately."
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
