import { useState, useMemo } from 'react';
import { RiUserHeartLine, RiSearchLine, RiFilterLine, RiUserAddLine, RiEyeLine, RiHistoryLine, RiTrophyLine, RiMapPinLine, RiPhoneLine, RiMailLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import entities from '../../../data/entities.json';
import { toast } from 'react-hot-toast';

export default function RetailerCustomersPage() {
  const { customers } = entities;
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTier = tierFilter === 'all' || c.loyalty.toLowerCase() === tierFilter.toLowerCase();
      return matchSearch && matchTier;
    });
  }, [customers, searchTerm, tierFilter]);

  const handleCall = (name) => {
    toast(`Calling ${name}...`, { icon: '📞' });
  };

  const columns = [
    { key: 'name', label: 'Consumer Profile', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
       </div>
    )},
    { key: 'city', label: 'Local Address', render: (val) => (
       <div className="flex items-center gap-1">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'orders', label: 'Purchases', align: 'center', render: (val) => (
       <Badge variant="teal">
          {val} Invoices
       </Badge>
    )},
    { key: 'loyalty', label: 'Tier', render: (val) => (
       <Badge variant={val === 'Platinum' ? 'purple' : 'warning'}>
          {val}
       </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiPhoneLine} onClick={() => handleCall(row.name)}>Call</Button>
          <Button variant="icon" title="View Profile">
             <RiEyeLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Store Customers" 
        subtitle="Manage end-consumers and their purchasing habits at your retail store"
      >
        <Button icon={RiUserAddLine}>Register Consumer</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Total Walk-ins', val: customers.length },
           { label: 'Avg Basket Value', val: '₹14,500' },
           { label: 'Retention Rate', val: '42%' },
           { label: 'Monthly Growth', val: '+4.2%' }
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
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                options={[
                  { label: 'All Tiers', value: 'all' },
                  { label: 'Platinum Tiers', value: 'platinum' }, 
                  { label: 'Gold Tiers', value: 'gold' }
                ]} 
                className="w-48" 
              />
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search by name or contact..." 
                   className="w-full md:w-64"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredCustomers} />
      </Card>
    </div>
  );
}

