import { useState, useEffect, useCallback } from 'react';
import { 
  RiCalendarEventLine, 
  RiMessage2Line, 
  RiFileTextLine, 
  RiSendPlane2Line, 
  RiDownloadLine, 
  RiCheckDoubleLine, 
  RiTimeLine,
  RiAlertLine,
  RiCalendarTodoLine,
  RiFileList3Line,
  RiUserFollowLine,
  RiArrowLeftLine
} from 'react-icons/ri';
import { Card, Button, Input, Combobox, Badge, useNotification } from '../../../core';
import api from '../../../core/api';

export default function HRSection() {
  const [activeTab, setActiveTab] = useState('leaves');
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const [leaveType, setLeaveType] = useState(null);
  const [priority, setPriority] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  // Real data state
  const [leaves, setLeaves] = useState([]);
  const [issues, setIssues] = useState([
    { id: 1, title: 'Salary Delay', priority: 'high', status: 'resolved', date: '2026-04-05' },
    { id: 2, title: 'Incentive calculation error', priority: 'medium', status: 'pending', date: '2026-04-15' },
  ]);

  const fetchLeaveHistory = useCallback(async () => {
    try {
      const response = await api.get('/sales-executive/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Failed to fetch leaves', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'leaves') {
      fetchLeaveHistory();
    }
  }, [activeTab, fetchLeaveHistory]);

  const tabs = [
    { id: 'leaves', label: 'Leaves', icon: RiCalendarEventLine },
    { id: 'issues', label: 'Issues', icon: RiMessage2Line },
  ];


  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!leaveType) {
      return showNotification({ title: 'Error', message: 'Please select a leave type', type: 'error' });
    }

    setLoading(true);
    try {
      await api.post('/sales-executive/leaves', {
        type: leaveType.value,
        fromDate,
        toDate,
        reason
      });
      showNotification({ title: 'Success', message: 'Leave request submitted to HR', type: 'success' });
      setFromDate('');
      setToDate('');
      setReason('');
      setLeaveType(null);
      fetchLeaveHistory();
    } catch (error) {
      showNotification({ 
        title: 'Error', 
        message: error.response?.data?.message || 'Failed to submit leave', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    showNotification({ title: 'Submitted', message: 'Your issue has been logged with HR', type: 'info' });
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Tab Switcher - Compact & Modern */}
      <div className="flex p-1 bg-white rounded-2xl border border-border shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-300 relative ${
              activeTab === tab.id 
                ? 'text-brand-teal' 
                : 'text-content-tertiary hover:text-content-secondary'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'scale-110' : 'opacity-60'} />
            <span className="text-[8px] font-black uppercase tracking-tight leading-none">{tab.label}</span>
            {activeTab === tab.id && (
               <div className="absolute -bottom-1 left-1/3 right-1/3 h-1 bg-brand-teal rounded-full shadow-[0_0_8px_rgba(50,141,142,0.3)]" />
            )}
          </button>
        ))}
      </div>

      <Card className="p-3.5 rounded-[24px] border-none bg-white shadow-lg shadow-gray-200/40">
        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmitLeave} className="space-y-3">
              <Combobox 
                label="Type" 
                options={[
                  { label: 'Casual', value: 'casual' },
                  { label: 'Sick', value: 'sick' },
                  { label: 'Emergency', value: 'emergency' }
                ]} 
                value={leaveType}
                onChange={setLeaveType}
                className="scale-95 origin-left"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  label="From" 
                  type="date" 
                  required 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input 
                  label="To" 
                  type="date" 
                  required 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <Input 
                label="Reason" 
                placeholder="Brief reason..." 
                required 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-xs"
              />
              <Button 
                type="submit" 
                loading={loading}
                className="w-full h-10 uppercase tracking-widest text-[10px] font-black rounded-xl" 
                icon={RiSendPlane2Line}
              >
                Submit Request
              </Button>
            </form>

            <div className="space-y-2 pt-3 border-t border-border/30">
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest">Recent History</p>
              <div className="space-y-1.5">
                {leaves.length === 0 ? (
                  <p className="text-[9px] text-center py-2 text-content-tertiary font-bold italic">No requests yet.</p>
                ) : (
                  leaves.slice(0, 3).map((leave) => (
                    <div key={leave._id} className="flex items-center justify-between p-2 bg-surface-primary/50 border border-border/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-6 rounded-full ${
                          leave.status === 'approved' ? 'bg-state-success' : 
                          leave.status === 'rejected' ? 'bg-state-danger' : 'bg-state-warning'
                        }`} />
                        <div>
                          <p className="text-[10px] font-bold text-content-primary uppercase leading-none">{leave.type}</p>
                          <p className="text-[8px] text-content-tertiary mt-1">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'} 
                        size="xs" 
                        className="text-[7px] px-1.5 py-0 uppercase"
                      >
                        {leave.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmitIssue} className="space-y-3">
              <Input label="Title" placeholder="Issue title..." required className="h-9 text-xs" />
              <Combobox 
                label="Priority" 
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' }
                ]} 
                value={priority}
                onChange={setPriority}
                className="scale-95 origin-left"
              />
              <Input label="Description" placeholder="Explain details..." required className="h-9 text-xs" />
              <Button type="submit" variant="secondary" className="w-full h-10 border-brand-pink/20 text-brand-pink uppercase tracking-widest text-[10px] font-black rounded-xl" icon={RiSendPlane2Line}>
                Log Issue
              </Button>
            </form>

            <div className="space-y-2 pt-3 border-t border-border/30">
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest">Logged Cases</p>
              <div className="space-y-1.5">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-2 bg-surface-primary/50 border border-border/30 rounded-xl">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${issue.priority === 'high' ? 'bg-state-danger' : 'bg-brand-teal'}`} />
                       <span className="text-[10px] font-bold text-content-primary">{issue.title}</span>
                    </div>
                    <Badge variant={issue.status === 'resolved' ? 'success' : 'info'} size="xs" className="text-[7px] px-1.5 py-0">
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </Card>
    </div>
  );
}
