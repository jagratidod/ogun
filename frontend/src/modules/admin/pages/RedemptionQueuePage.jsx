import { RiHandHeartLine, RiCheckLine, RiCloseLine, RiTimeLine, RiBankLine, RiUserLine, RiSearchLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, useModal, Modal } from '../../../core';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function RedemptionQueuePage() {
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState([]);
  const processModal = useModal();
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const res = await api.get('/rewards/redemptions/admin/all');
      setRedemptions(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch redemption queue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await api.patch(`/rewards/redemptions/admin/${processModal.data._id}`, {
        status,
        adminNote
      });
      toast.success(`Request ${status} successfully`);
      processModal.close();
      setAdminNote('');
      fetchRedemptions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'createdAt', label: 'Requested Date', render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{new Date(val).toLocaleDateString()}</span>
          <span className="text-[10px] text-content-tertiary">{new Date(val).toLocaleTimeString()}</span>
       </div>
    )},
    { key: 'user', label: 'Partner Profile', render: (val) => (
      <div className="flex items-center gap-3">
         <Avatar name={val?.name} size="xs" />
         <div>
            <p className="text-sm font-bold text-content-primary">{val?.name}</p>
            <p className="text-[10px] text-content-tertiary uppercase font-black">{val?.role} • {val?.shopName || 'N/A'}</p>
         </div>
      </div>
    )},
    { key: 'pointsRequested', label: 'Points to Redeem', align: 'center', render: (val) => (
       <div className="flex flex-col items-center">
          <span className="font-black text-brand-teal text-lg">{val.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-content-tertiary uppercase">Points</span>
       </div>
    )},
    { key: 'cashValue', label: 'Cash Amount', align: 'right', render: (val) => (
       <div className="flex flex-col items-end">
          <span className="font-black text-state-success text-lg">₹{val.toLocaleString()}</span>
          <Badge size="xs" variant="success">READY</Badge>
       </div>
    )},
    { key: 'status', label: 'Status', render: (val) => <Badge status={val}>{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-2">
          {row.status === 'pending' ? (
            <Button size="sm" onClick={() => processModal.open(row)}>Process</Button>
          ) : (
            <Button variant="ghost" size="sm" icon={RiSearchLine}>View</Button>
          )}
       </div>
    )}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Redemption Queue" 
        subtitle="Manage cash-out requests from retailers and distributors"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
          <div className="glass-card p-6 border-l-4 border-state-warning">
             <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Pending Requests</p>
             <h2 className="text-3xl font-black text-content-primary">{redemptions.filter(r => r.status === 'pending').length}</h2>
          </div>
          <div className="glass-card p-6 border-l-4 border-brand-teal">
             <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Points Held</p>
             <h2 className="text-3xl font-black text-brand-teal">{redemptions.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.pointsRequested, 0).toLocaleString()}</h2>
          </div>
          <div className="glass-card p-6 border-l-4 border-state-success">
             <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Liability</p>
             <h2 className="text-3xl font-black text-state-success">₹{redemptions.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.cashValue, 0).toLocaleString()}</h2>
          </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <CardTitle>Partner Requests</CardTitle>
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search partner name..." className="w-full md:w-64 h-9" />
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={redemptions} />
      </Card>

      <Modal isOpen={processModal.isOpen} onClose={processModal.close} title="Process Redemption Request">
          <div className="space-y-6">
             <div className="p-4 bg-surface-primary border border-border">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                      <Avatar name={processModal.data?.user?.name} size="sm" />
                      <div>
                         <p className="text-sm font-bold text-content-primary">{processModal.data?.user?.name}</p>
                         <p className="text-xs text-content-secondary">{processModal.data?.user?.email}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-state-success">₹{processModal.data?.cashValue.toLocaleString()}</p>
                      <p className="text-[10px] text-content-tertiary font-bold uppercase">{processModal.data?.pointsRequested} POINTS</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                   <p className="text-[10px] text-content-tertiary font-bold uppercase mb-2">Bank Details</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[9px] text-content-tertiary uppercase">Bank Name</p>
                         <p className="text-xs font-bold text-content-primary">{processModal.data?.bankDetails?.bankName || 'N/A'}</p>
                      </div>
                      <div>
                         <p className="text-[9px] text-content-tertiary uppercase">Account Number</p>
                         <p className="text-xs font-bold text-content-primary">{processModal.data?.bankDetails?.accountNumber || 'N/A'}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-content-secondary block mb-2">Admin Note (Internal)</label>
                <textarea 
                  className="w-full h-24 p-3 bg-surface-input border border-border outline-none focus:border-brand-teal text-sm"
                  placeholder="Payment reference number, etc."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
             </div>

             <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="secondary" className="flex-1" icon={RiCloseLine} onClick={() => handleUpdateStatus('rejected')}>Reject & Refund</Button>
                <Button className="flex-1" icon={RiCheckLine} onClick={() => handleUpdateStatus('processed')}>Approve & Process</Button>
             </div>
          </div>
      </Modal>
    </div>
  );
}
