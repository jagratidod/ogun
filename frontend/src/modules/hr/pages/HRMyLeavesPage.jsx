import { useState, useEffect } from 'react';
import { RiCalendarCheckLine, RiTimeLine, RiInformationLine, RiHistoryLine, RiCheckDoubleLine, RiCloseCircleLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Input, Select, Badge, useNotification, Combobox } from '../../../core';
import api from '../../../core/api';

export default function HRMyLeavesPage() {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  
  // Form State
  const [leaveType, setLeaveType] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get('/hr/my-leaves');
      setLeaves(response.data.data);
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to load leave history', type: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType) {
      return showNotification({ title: 'Error', message: 'Select leave type', type: 'error' });
    }

    setLoading(true);
    try {
      await api.post('/hr/my-leaves', {
        type: leaveType.value,
        fromDate,
        toDate,
        reason
      });
      showNotification({ title: 'Success', message: 'Leave application submitted to Admin', type: 'success' });
      // Reset form
      setLeaveType(null);
      setFromDate('');
      setToDate('');
      setReason('');
      // Refresh history
      fetchMyLeaves();
    } catch (error) {
      showNotification({ title: 'Error', message: error.response?.data?.message || 'Failed to submit', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="My Leaves" 
        subtitle="Apply for personal time-off and track your application status"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Request Time-Off</CardTitle>
              <CardDescription>Applications are reviewed by the Super Admin</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Combobox 
                label="Leave Type" 
                options={[
                  { label: 'Casual Leave', value: 'casual' },
                  { label: 'Sick Leave', value: 'sick' },
                  { label: 'Emergency Leave', value: 'emergency' }
                ]} 
                value={leaveType}
                onChange={setLeaveType}
                placeholder="Select Type..."
              />

              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="From Date" 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required 
                />
                <Input 
                  label="To Date" 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary uppercase tracking-wider px-1">Reason</label>
                <textarea 
                  className="input-field min-h-[100px] py-3 resize-none"
                  placeholder="Explain why you need leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
                icon={RiCalendarCheckLine}
              >
                Submit Application
              </Button>
            </form>
          </Card>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>Status and feedback on your requests</CardDescription>
            </CardHeader>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {historyLoading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-surface-secondary animate-pulse rounded-sm" />)
              ) : leaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-content-tertiary opacity-60">
                  <RiHistoryLine size={48} className="mb-2" />
                  <p className="text-sm font-bold uppercase tracking-widest">No history found</p>
                </div>
              ) : (
                leaves.map((leave) => (
                  <div 
                    key={leave._id} 
                    className="p-4 bg-surface-primary border border-border/40 hover:border-brand-teal/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-teal/5 flex items-center justify-center text-brand-teal">
                          <RiTimeLine size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-brand-teal uppercase tracking-tighter leading-none mb-1">
                            {leave.type} Leave
                          </p>
                          <p className="text-sm font-bold text-content-primary">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}
                        className="uppercase font-black text-[9px] tracking-widest"
                      >
                        {leave.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-content-secondary line-clamp-2 italic mb-3">
                      "{leave.reason}"
                    </p>

                    {leave.status !== 'pending' && (
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-content-tertiary">
                          <span className="font-black uppercase">Reviewed By:</span>
                          <span className="font-bold text-content-primary">{leave.reviewedBy?.name || 'Admin'}</span>
                        </div>
                        {leave.hrRemarks && (
                          <div className="flex items-center gap-1 text-[10px] text-brand-teal font-black italic">
                            <RiInformationLine size={12} />
                            <span>Remark: {leave.hrRemarks}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
