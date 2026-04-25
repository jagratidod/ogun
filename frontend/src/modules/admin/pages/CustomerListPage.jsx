import { useState, useEffect } from 'react';
import { RiUserLine, RiSearchLine, RiFilterLine, RiIdCardLine, RiEyeLine, RiHistoryLine, RiTrophyLine, RiMapPinLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select, useNotification } from '../../../core';
import api from '../../../core/api';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/customers');
      setCustomers(response.data.data);
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to fetch customer list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || c.loyalty.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const stats = [
    { label: 'Total Consumers', val: customers.length },
    { label: 'Platinum Members', val: customers.filter(c => c.loyalty === 'Platinum').length },
    { label: 'Avg Purchases', val: customers.length ? (customers.reduce((acc, c) => acc + c.orders, 0) / customers.length).toFixed(1) : 0 },
    { label: 'Active Status', val: customers.filter(c => c.status === 'active').length }
  ];

  const columns = [
    {
      key: 'name', label: 'End Consumer', sortable: true, render: (val, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <Avatar name={val} size="sm" />
            <div className="flex flex-col">
              <span className="font-bold text-content-primary">{val}</span>
              <span className="text-[10px] text-content-tertiary">{row.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'location', label: 'Location', render: (val) => (
        <div className="flex items-center gap-2">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
        </div>
      )
    },
    {
      key: 'orders', label: 'Total Purchases', align: 'center', render: (val) => (
        <Badge variant="teal">
          {val} Orders
        </Badge>
      )
    },
    {
      key: 'loyalty', label: 'Loyalty Class', render: (val) => (
        <Badge variant={val === 'Platinum' ? 'purple' : val === 'Gold' ? 'warning' : 'default'}>
          {val}
        </Badge>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: () => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Details">
            <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Loyalty Profile">
            <RiTrophyLine className="w-4 h-4 text-brand-teal" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Consumer Base"
        subtitle="Insights and direct access to end-customers using OGUN appliances"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <Card key={stat.label} className="p-4 border-border/40 hover:border-brand-teal/30 transition-colors">
            <p className="text-[10px] text-content-tertiary font-black uppercase tracking-wider mb-1">{stat.label}</p>
            <h4 className="text-xl font-bold text-content-primary">{stat.val}</h4>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full p-2">
            <Select 
              options={[
                { label: 'All Tiers', value: 'all' }, 
                { label: 'Platinum', value: 'platinum' }, 
                { label: 'Gold', value: 'gold' },
                { label: 'Silver', value: 'silver' }
              ]} 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-48" 
            />
            <div className="flex items-center gap-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
                <input 
                  type="text"
                  placeholder="Search consumer..." 
                  className="input-field pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="secondary" icon={RiFilterLine}>Export</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredCustomers} loading={loading} />
      </Card>
    </div>
  );
}
