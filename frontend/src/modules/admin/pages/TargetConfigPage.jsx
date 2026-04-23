import { RiTrophyLine, RiCalendarCheckLine, RiEditLine, RiDeleteBin7Line, RiFilterLine, RiSearchLine, RiInformationLine, RiCheckboxCircleLine, RiTimeLine, RiStackFill, RiTruckFill, RiStore2Fill, RiFlashlightFill } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, useModal, Modal } from '../../../core';
import rewardsData from '../../../data/rewards.json';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TargetConfigPage() {
  const [targets, setTargets] = useState(rewardsData.targets);
  const [earningRules, setEarningRules] = useState(rewardsData.earningRules);
  const { systemConfig } = rewardsData;

  const campaignModal = useModal();
  const rulesModal = useModal();

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTgt = {
      id: campaignModal.data?.id || `TGT-${Date.now()}`,
      name: formData.get('name'),
      type: formData.get('type'),
      value: Number(formData.get('value')),
      points: Number(formData.get('points')),
      deadline: formData.get('deadline'),
      status: campaignModal.data?.status || 'Active',
      current: campaignModal.data?.current || 0
    };

    if (campaignModal.data) {
      setTargets(targets.map(t => t.id === newTgt.id ? newTgt : t));
      toast.success('Campaign logic updated!');
    } else {
      setTargets([...targets, newTgt]);
      toast.success('New performance target initiated!');
    }
    campaignModal.close();
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setTargets(targets.filter(t => t.id !== id));
      toast.success('Campaign removed successfully');
    }
  };

  const handleSaveRules = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = rulesModal.data === 'retailer' ? 'retailer' : 'distributor';
    
    const updatedRules = { ...earningRules };
    if (type === 'retailer') {
      updatedRules.retailer = {
        perProductSale: Number(formData.get('perProductSale')),
        bulkBonus100Units: Number(formData.get('bulkBonus100Units')),
        monthlyTargetBonus: Number(formData.get('monthlyTargetBonus')),
        fastSellingBonus: Number(formData.get('fastSellingBonus'))
      };
    } else {
      updatedRules.distributor = {
        perOrderDispatched: Number(formData.get('perOrderDispatched')),
        sameDayDeliveryBonus: Number(formData.get('sameDayDeliveryBonus')),
        bulkSupplyBonus: Number(formData.get('bulkSupplyBonus')),
        monthlyTargetBonus: Number(formData.get('monthlyTargetBonus'))
      };
    }

    setEarningRules(updatedRules);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} earning rules synchronized!`);
    rulesModal.close();
  };

  const columns = [
    { key: 'name', label: 'Campaign Name', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'type', label: 'Entity Type', render: (val) => (
       <Badge variant={val === 'Distributor' ? 'purple' : val === 'Retailer' ? 'teal' : 'info'}>{val}</Badge>
    )},
    { key: 'value', label: 'Target Value', align: 'right', render: (val, row) => (
       <div className="flex flex-col items-end">
          <span className="font-black text-brand-teal text-base">{val.toLocaleString()}</span>
          <span className="text-[10px] text-content-tertiary font-bold uppercase">{row.type === 'Staff' ? 'Satisf. Score' : 'Revenue INR'}</span>
       </div>
    )},
    { key: 'points', label: 'Award Points', align: 'center', render: (val) => (
       <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-state-warning">
             <RiTrophyLine className="w-4 h-4" />
             <span className="font-black">{val.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-brand-teal font-black">Value: ₹{(val * systemConfig.pointToRupeeRatio).toLocaleString()}</span>
       </div>
    )},
    { key: 'deadline', label: 'Campaign Deadline', render: (val) => (
       <div className="flex items-center gap-2">
          <RiTimeLine className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="text-xs text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => campaignModal.open(row)}>
          <RiEditLine className="w-4 h-4" />
        </Button>
        <Button variant="icon" className="group" onClick={() => handleDeleteCampaign(row.id)}>
          <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Target Configuration" 
        subtitle="Define point-based logic and performance benchmarks for all entities"
      >
        <Button icon={RiTrophyLine} onClick={() => campaignModal.open(null)}>New Reward Component</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                  <RiStore2Fill className="text-brand-teal w-5 h-5" />
                  <CardTitle>Retailer Earning Rules</CardTitle>
               </div>
            </CardHeader>
            <div className="p-4 space-y-3">
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Per Product Sale</span>
                  <Badge variant="teal">{earningRules.retailer.perProductSale} Points</Badge>
               </div>
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Bulk Bonus (100 Units)</span>
                  <Badge variant="teal">{earningRules.retailer.bulkBonus100Units} Points</Badge>
               </div>
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Monthly Target Achievement</span>
                  <Badge variant="teal">{earningRules.retailer.monthlyTargetBonus} Points</Badge>
               </div>
               <Button variant="ghost" icon={RiEditLine} className="w-full h-8 text-[10px]" onClick={() => rulesModal.open('retailer')}>Modify Rule Logic</Button>
            </div>
         </Card>
         <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                  <RiTruckFill className="text-brand-purple w-5 h-5" />
                  <CardTitle>Distributor Earning Rules</CardTitle>
               </div>
            </CardHeader>
            <div className="p-4 space-y-3">
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Order Fulfillment</span>
                  <Badge variant="purple">{earningRules.distributor.perOrderDispatched} Points</Badge>
               </div>
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Same-Day Dispatch Bonus</span>
                  <Badge variant="purple">{earningRules.distributor.sameDayDeliveryBonus} Points</Badge>
               </div>
               <div className="flex justify-between items-center p-3 bg-surface-input border border-border">
                  <span className="text-xs font-bold text-content-secondary">Bulk Supply Multiplier</span>
                  <Badge variant="purple">{earningRules.distributor.bulkSupplyBonus} Points</Badge>
               </div>
               <Button variant="ghost" icon={RiEditLine} className="w-full h-8 text-[10px]" onClick={() => rulesModal.open('distributor')}>Modify Rule Logic</Button>
            </div>
         </Card>
      </div>

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
      <Modal 
        isOpen={campaignModal.isOpen} 
        onClose={campaignModal.close} 
        title={campaignModal.data ? `Update Reward Formula: ${campaignModal.data.name}` : 'Create New Performance Target'}
      >
        <form onSubmit={handleSaveCampaign} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Campaign Title" name="name" defaultValue={campaignModal.data?.name} className="md:col-span-2" placeholder="e.g. Q3 Sales Booster" required />
             <Select label="Entity Scope" name="type" defaultValue={campaignModal.data?.type || 'Retailer'} options={[
                { label: 'Retailer', value: 'Retailer' },
                { label: 'Distributor', value: 'Distributor' },
                { label: 'Service Staff', value: 'Staff' }
             ]} />
             <Select label="Target Metric" options={[
                { label: 'Gross Revenue (INR)', value: 'rev' },
                { label: 'Unit Sales (Qty)', value: 'qty' },
                { label: 'Service Satisfaction (%)', value: 'srv' }
             ]} />
             <Input label="Goal Target Value" name="value" type="number" defaultValue={campaignModal.data?.value} placeholder="e.g. 500000" required />
             <Input label="Point Awarding Logic" name="points" type="number" defaultValue={campaignModal.data?.points} placeholder="Points on achievement" required />
             <Input label="Expiry Date" name="deadline" type="date" defaultValue={campaignModal.data?.deadline} required />
             <div className="md:col-span-2">
                <Input label="Internal Success Notes" placeholder="Strategy details for this reward program..." />
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="secondary" onClick={campaignModal.close}>Cancel</Button>
              <Button type="submit">{campaignModal.data ? 'Sync Logic' : 'Initiate Program'}</Button>
          </div>
        </form>
      </Modal>

      {/* Earning Rules Modal */}
      <Modal
        isOpen={rulesModal.isOpen}
        onClose={rulesModal.close}
        title={`Modify ${rulesModal.data?.charAt(0).toUpperCase() + rulesModal.data?.slice(1)} Earning Logic`}
      >
        <form onSubmit={handleSaveRules} className="space-y-6">
          {rulesModal.data === 'retailer' ? (
            <div className="space-y-4">
              <Input label="Points Per Product Sale" name="perProductSale" type="number" defaultValue={earningRules.retailer.perProductSale} required />
              <Input label="Bulk Bonus (100 Units)" name="bulkBonus100Units" type="number" defaultValue={earningRules.retailer.bulkBonus100Units} required />
              <Input label="Monthly Target Bonus" name="monthlyTargetBonus" type="number" defaultValue={earningRules.retailer.monthlyTargetBonus} required />
              <Input label="Fast Selling Bonus" name="fastSellingBonus" type="number" defaultValue={earningRules.retailer.fastSellingBonus} required />
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Points Per Order Dispatch" name="perOrderDispatched" type="number" defaultValue={earningRules.distributor.perOrderDispatched} required />
              <Input label="Same-Day Dispatch Bonus" name="sameDayDeliveryBonus" type="number" defaultValue={earningRules.distributor.sameDayDeliveryBonus} required />
              <Input label="Bulk Supply Multiplier" name="bulkSupplyBonus" type="number" defaultValue={earningRules.distributor.bulkSupplyBonus} required />
              <Input label="Monthly Target Bonus" name="monthlyTargetBonus" type="number" defaultValue={earningRules.distributor.monthlyTargetBonus} required />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="secondary" onClick={rulesModal.close}>Cancel</Button>
              <Button type="submit">Synchronize Rules</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
