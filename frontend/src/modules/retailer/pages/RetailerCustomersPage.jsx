import { useState, useMemo } from 'react';
import { 
  RiUserHeartLine, RiSearchLine, RiFilterLine, RiUserAddLine, 
  RiEyeLine, RiHistoryLine, RiTrophyLine, RiMapPinLine, 
  RiPhoneLine, RiMailLine, RiPulseLine, RiCustomerService2Line,
  RiGroupLine, RiShoppingCartLine, RiArrowRightUpLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Avatar, Input, Select 
} from '../../../core';
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

  const statCards = [
    { label: 'Walk-ins', val: customers.length, icon: RiGroupLine, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Avg Basket', val: '₹14,500', icon: RiShoppingCartLine, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { label: 'Retention', val: '42%', icon: RiPulseLine, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { label: 'Growth', val: '+4.2%', icon: RiArrowRightUpLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  const columns = [
    { key: 'name', label: 'Consumer', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <Avatar name={val} size="xs" />
          <span className="text-[11px] font-black text-content-primary uppercase tracking-tight">{val}</span>
       </div>
    )},
    { key: 'city', label: 'Location', render: (val) => (
       <div className="flex items-center gap-1.5 opacity-70">
          <RiMapPinLine className="text-brand-teal w-3 h-3" />
          <span className="text-[10px] font-bold text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'orders', label: 'Purchases', align: 'center', render: (val) => (
       <span className="text-[10px] font-black text-brand-teal uppercase">{val} Invoices</span>
    )},
    { key: 'loyalty', label: 'Tier', render: (val) => (
       <Badge variant={val === 'Platinum' ? 'purple' : 'warning'} size="xs" className="text-[7px] font-black uppercase">
          {val}
       </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiPhoneLine} onClick={() => handleCall(row.name)}>Call</Button>
          <Button variant="secondary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiEyeLine}>View</Button>
       </div>
    )}
  ];

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      {/* Header */}
      <section className="flex justify-between items-center px-1 pt-2">
         <div>
            <h2 className="text-xl font-black text-content-primary tracking-tighter uppercase">Customers</h2>
            <p className="text-[9px] text-brand-teal font-black uppercase tracking-widest leading-none mt-1">Consumer Relations</p>
         </div>
         <Button size="sm" className="h-9 px-3 text-[9px] font-black uppercase" icon={RiUserAddLine}>Register</Button>
      </section>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="p-4 bg-white border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden rounded-[24px]"
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-none mb-1.5 opacity-60">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary tracking-tighter">
                {stat.val}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
         <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-teal">
               <RiSearchLine className="w-4 h-4" />
            </div>
            <input
               type="text"
               placeholder="Search consumers..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-11 pl-11 pr-4 bg-white border border-border shadow-sm outline-none focus:border-brand-teal/30 transition-all text-[10px] font-bold"
            />
         </div>
         <Select 
           value={tierFilter}
           onChange={(e) => setTierFilter(e.target.value)}
           options={[
             { label: 'All', value: 'all' },
             { label: 'Platinum', value: 'platinum' }, 
             { label: 'Gold', value: 'gold' }
           ]} 
           className="w-24 h-11 text-[9px] font-black uppercase"
         />
      </div>

      <Card className="rounded-[24px] overflow-hidden">
        <DataTable columns={columns} data={filteredCustomers} />
      </Card>
    </div>
  );
}
