import { useState, useEffect } from 'react';
import {
  RiTrophyLine, RiTimeLine, RiStackFill, RiTruckFill,
  RiStore2Fill, RiEditLine, RiDeleteBin7Line, RiSearchLine,
  RiFilterLine, RiUserStarLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, DataTable,
  Badge, Button, Input, Select, useModal, Modal
} from '../../../core';
import rewardsData from '../../../data/rewards.json';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

const ROLE_META = {
  retailer: { label: 'Retailer', icon: RiStore2Fill, color: 'text-brand-teal', badge: 'teal', fields: [
    { key: 'perProductSale', label: 'Per Product Sale' },
    { key: 'bulkBonus100Units', label: 'Bulk Bonus (100 Units)' },
    { key: 'monthlyTargetBonus', label: 'Monthly Target Achievement' },
    { key: 'fastSellingBonus', label: 'Fast Selling Bonus' },
  ]},
  distributor: { label: 'Distributor', icon: RiTruckFill, color: 'text-brand-purple', badge: 'purple', fields: [
    { key: 'perOrderDispatched', label: 'Order Fulfillment' },
    { key: 'sameDayDeliveryBonus', label: 'Same-Day Dispatch Bonus' },
    { key: 'bulkSupplyBonus', label: 'Bulk Supply Multiplier' },
    { key: 'monthlyTargetBonus', label: 'Monthly Target Bonus' },
  ]},
  salesExecutive: { label: 'Sales Executive', icon: RiUserStarLine, color: 'text-brand-magenta', badge: 'pink', fields: [
    { key: 'perRetailerOnboarded', label: 'Per Retailer Onboarded' },
    { key: 'monthlySalesTargetBonus', label: 'Monthly Sales Target Bonus' },
    { key: 'perOrderPlaced', label: 'Per Order Placed' },
    { key: 'retailerActivationBonus', label: 'Retailer Activation Bonus' },
  ]},
};

const DEFAULT_RULES = {
  retailer: { perProductSale: 10, bulkBonus100Units: 500, monthlyTargetBonus: 2000, fastSellingBonus: 100 },
  distributor: { perOrderDispatched: 20, sameDayDeliveryBonus: 50, bulkSupplyBonus: 200, monthlyTargetBonus: 3000 },
  salesExecutive: { perRetailerOnboarded: 50, monthlySalesTargetBonus: 1000, perOrderPlaced: 10, retailerActivationBonus: 100 },
};

export default function TargetConfigPage() {
  const [targets, setTargets] = useState(rewardsData.targets);
  const [earningRules, setEarningRules] = useState(DEFAULT_RULES);
  const [loadingRules, setLoadingRules] = useState(true);
  const { systemConfig } = rewardsData;

  const campaignModal = useModal();
  const rulesModal = useModal(); // holds role key: 'retailer' | 'distributor' | 'salesExecutive'

  // Fetch earning rules and targets from backend
  useEffect(() => {
    api.get('/admin/reward-config')
      .then(res => {
        const rules = res.data?.data?.config?.earningRules;
        const tgts = res.data?.data?.targets;
        if (rules) setEarningRules(prev => ({ ...prev, ...rules }));
        if (tgts) setTargets(tgts);
      })
      .catch(() => {}) 
      .finally(() => setLoadingRules(false));
  }, []);

  const handleSaveRules = async (e) => {
    e.preventDefault();
    const role = rulesModal.data;
    const meta = ROLE_META[role];
    const formData = new FormData(e.target);
    const payload = {};
    meta.fields.forEach(f => { payload[f.key] = Number(formData.get(f.key)); });

    try {
      const res = await api.put(`/admin/reward-config/rules/${role}`, payload);
      setEarningRules(prev => ({ ...prev, [role]: res.data.data }));
      toast.success(`${meta.label} earning rules updated!`);
      rulesModal.close();
    } catch {
      toast.error('Failed to save rules');
    }
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      type: formData.get('type'),
      metric: formData.get('metric'),
      targetValue: Number(formData.get('targetValue')),
      awardPoints: Number(formData.get('awardPoints')),
      deadline: formData.get('deadline'),
      status: campaignModal.data?.status || 'Active',
    };

    try {
      if (campaignModal.data?._id) {
        const res = await api.put(`/admin/reward-config/targets/${campaignModal.data._id}`, payload);
        setTargets(targets.map(t => t._id === campaignModal.data._id ? res.data.data : t));
        toast.success('Campaign updated!');
      } else {
        const res = await api.post('/admin/reward-config/targets', payload);
        setTargets([res.data.data, ...targets]);
        toast.success('New campaign created!');
      }
      campaignModal.close();
    } catch {
      toast.error('Failed to save campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Delete this campaign?')) {
      try {
        await api.delete(`/admin/reward-config/targets/${id}`);
        setTargets(targets.filter(t => t._id !== id));
        toast.success('Campaign removed');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Campaign Name', sortable: true, render: (val) => <span className="font-bold text-content-primary">{val}</span> },
    { key: 'type', label: 'Entity Type', render: (val) => (
      <Badge variant={val === 'Distributor' ? 'purple' : val === 'Sales Executive' ? 'pink' : val === 'Retailer' ? 'teal' : 'info'}>{val}</Badge>
    )},
    { key: 'targetValue', label: 'Target Value', align: 'right', render: (val, row) => (
      <div className="flex flex-col items-end">
        <span className="font-black text-brand-teal text-base">{val?.toLocaleString()}</span>
        <span className="text-[10px] text-content-tertiary font-bold uppercase">{row.metric === 'rev' ? 'Revenue INR' : row.metric}</span>
      </div>
    )},
    { key: 'awardPoints', label: 'Award Points', align: 'center', render: (val) => (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 text-state-warning">
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">{val?.toLocaleString()}</span>
        </div>
      </div>
    )},
    { key: 'deadline', label: 'Campaign Deadline', render: (val) => (
      <div className="flex items-center gap-2">
        <RiTimeLine className="w-3.5 h-3.5 text-content-tertiary" />
        <span className="text-xs text-content-secondary">{val ? new Date(val).toLocaleDateString() : '—'}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (val) => <Badge status={val?.toLowerCase()}>{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => campaignModal.open(row)}><RiEditLine className="w-4 h-4" /></Button>
        <Button variant="icon" onClick={() => handleDeleteCampaign(row._id)}><RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70" /></Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader title="Target Configuration" subtitle="Define point-based logic and performance benchmarks for all entities">
        <Button icon={RiTrophyLine} onClick={() => campaignModal.open(null)}>New Reward Component</Button>
      </PageHeader>

      {/* Earning Rules — 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <meta.icon className={`w-5 h-5 ${meta.color}`} />
                <CardTitle>{meta.label} Earning Rules</CardTitle>
              </div>
            </CardHeader>
            <div className="p-4 space-y-3">
              {meta.fields.map(f => (
                <div key={f.key} className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">{f.label}</span>
                  <Badge variant={meta.badge}>
                    {loadingRules ? '—' : (earningRules[role]?.[f.key] ?? '—')} Points
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" icon={RiEditLine} className="w-full h-8 text-[10px]" onClick={() => rulesModal.open(role)}>
                Modify Rule Logic
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <RiStackFill className="text-brand-teal w-5 h-5" />
              <CardTitle>Performance Campaigns</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Input icon={RiSearchLine} placeholder="Search campaigns..." className="w-full md:w-64 h-9" />
              <Button variant="ghost" icon={RiFilterLine}>Filter</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={targets} />
      </Card>

      {/* Campaign Modal */}
      <Modal isOpen={campaignModal.isOpen} onClose={campaignModal.close}
        title={campaignModal.data ? `Update: ${campaignModal.data.name}` : 'Create New Performance Target'}>
        <form onSubmit={handleSaveCampaign} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Campaign Title" name="name" defaultValue={campaignModal.data?.name} className="md:col-span-2" placeholder="e.g. Q3 Sales Booster" required />
            <Select label="Entity Scope" name="type" defaultValue={campaignModal.data?.type || 'Retailer'} options={[
              { label: 'Retailer', value: 'Retailer' },
              { label: 'Distributor', value: 'Distributor' },
              { label: 'Sales Executive', value: 'Sales Executive' },
              { label: 'Service Staff', value: 'Staff' },
            ]} />
            <Select label="Target Metric" name="metric" defaultValue={campaignModal.data?.metric || 'rev'} options={[
              { label: 'Gross Revenue (INR)', value: 'rev' },
              { label: 'Unit Sales (Qty)', value: 'qty' },
              { label: 'Retailers Onboarded', value: 'retailers' },
              { label: 'Service Satisfaction (%)', value: 'srv' },
            ]} />
            <Input label="Goal Target Value" name="targetValue" type="number" defaultValue={campaignModal.data?.targetValue} placeholder="e.g. 500000" required />
            <Input label="Award Points" name="awardPoints" type="number" defaultValue={campaignModal.data?.awardPoints} placeholder="Points on achievement" required />
            <Input label="Expiry Date" name="deadline" type="date" defaultValue={campaignModal.data?.deadline ? new Date(campaignModal.data.deadline).toISOString().split('T')[0] : ''} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={campaignModal.close}>Cancel</Button>
            <Button type="submit">{campaignModal.data ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Earning Rules Modal */}
      <Modal isOpen={rulesModal.isOpen} onClose={rulesModal.close}
        title={`Modify ${ROLE_META[rulesModal.data]?.label || ''} Earning Rules`}>
        {rulesModal.data && (
          <form onSubmit={handleSaveRules} className="space-y-4">
            {ROLE_META[rulesModal.data].fields.map(f => (
              <Input
                key={f.key}
                label={`${f.label} (Points)`}
                name={f.key}
                type="number"
                defaultValue={earningRules[rulesModal.data]?.[f.key]}
                required
              />
            ))}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="secondary" onClick={rulesModal.close}>Cancel</Button>
              <Button type="submit">Save Rules</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
