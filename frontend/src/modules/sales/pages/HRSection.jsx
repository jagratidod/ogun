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
    { id: 'offer', label: 'Offer Letter', icon: RiFileTextLine },
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">My HR Portal</h4>
        <Badge variant="purple" size="xs" className="animate-pulse">HR Sync Active</Badge>
      </div>

      {/* Tab Switcher - Styled for Premium Feel */}
      <div className="flex p-1 bg-surface-input rounded-sm border border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1.5 transition-all duration-300 relative ${
              activeTab === tab.id 
                ? 'text-brand-teal' 
                : 'text-content-tertiary hover:text-content-secondary'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'animate-pop' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
            {activeTab === tab.id && (
               <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-teal rounded-full shadow-[0_0_8px_var(--color-brand-teal)]" />
            )}
          </button>
        ))}
      </div>

      <Card className="p-4 overflow-hidden border-border/60 shadow-sm">
        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Combobox 
                  label="Leave Type" 
                  options={[
                    { label: 'Casual Leave', value: 'casual' },
                    { label: 'Sick Leave', value: 'sick' },
                    { label: 'Emergency Leave', value: 'emergency' }
                  ]} 
                  value={leaveType}
                  onChange={setLeaveType}
                  placeholder="Select Leave Type..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="From Date" 
                    type="date" 
                    icon={RiCalendarTodoLine}
                    required 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <Input 
                    label="To Date" 
                    type="date" 
                    icon={RiCalendarTodoLine}
                    required 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                </div>
                <Input 
                  label="Reason for Leave" 
                  placeholder="Tell HR why you need leave..." 
                  icon={RiFileList3Line}
                  required 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                className="w-full h-12 uppercase tracking-widest text-[11px] font-black shadow-lg shadow-brand-teal/20" 
                icon={RiSendPlane2Line}
              >
                Request Approval
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-border/30">
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest flex items-center gap-2">
                <RiTimeLine /> Leave History
              </p>
              <div className="space-y-2.5">
                {leaves.length === 0 ? (
                  <p className="text-[10px] text-center py-4 text-content-tertiary font-bold uppercase">No history found</p>
                ) : (
                  leaves.map((leave) => (
                    <div key={leave._id} className="flex flex-col p-3 bg-surface-primary border border-border/40 hover:border-brand-teal/30 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-8 rounded-full ${
                            leave.status === 'approved' ? 'bg-state-success' : 
                            leave.status === 'rejected' ? 'bg-state-danger' : 'bg-state-warning'
                          }`} />
                          <div>
                            <p className="text-[11px] font-bold text-content-primary uppercase">{leave.type} Leave</p>
                            <p className="text-[9px] text-content-tertiary flex items-center gap-1">
                              {new Date(leave.fromDate).toLocaleDateString()} <RiArrowLeftLine className="rotate-180 scale-75" /> {new Date(leave.toDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'} 
                          size="xs" 
                          className="text-[8px] px-2 uppercase"
                        >
                          {leave.status}
                        </Badge>
                      </div>
                      {leave.hrRemarks && (
                        <div className="mt-2 text-[8px] bg-surface-secondary p-1.5 rounded-xs border-l-2 border-brand-teal italic text-content-secondary">
                          HR: {leave.hrRemarks}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <Input label="Issue Title" placeholder="Subject of your concern..." icon={RiAlertLine} required />
              <Combobox 
                label="Priority Level" 
                options={[
                  { label: 'Low - General Inquiry', value: 'low' },
                  { label: 'Medium - Follow up', value: 'medium' },
                  { label: 'High - Immediate Attention', value: 'high' },
                  { label: 'Urgent - Critical Issue', value: 'urgent' }
                ]} 
                value={priority}
                onChange={setPriority}
                placeholder="Select Priority..."
              />
              <Input label="Detailed Description" placeholder="Explain the issue in detail..." icon={RiMessage2Line} required />
              <Button type="submit" variant="secondary" className="w-full h-12 border-brand-magenta/30 text-brand-magenta uppercase tracking-widest text-[11px] font-black hover:bg-brand-magenta/5" icon={RiSendPlane2Line}>
                Submit to HR Desk
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-border/30">
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest flex items-center gap-2">
                <RiCheckDoubleLine /> Logged Concerns
              </p>
              <div className="space-y-2.5">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-surface-primary border border-border/40 hover:border-brand-magenta/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${issue.priority === 'high' ? 'bg-state-danger' : 'bg-brand-teal'}`} />
                      <div>
                        <p className="text-[11px] font-bold text-content-primary">{issue.title}</p>
                        <p className="text-[9px] text-content-tertiary uppercase tracking-tighter">{issue.date} • {issue.priority} Priority</p>
                      </div>
                    </div>
                    <Badge variant={issue.status === 'resolved' ? 'success' : 'info'} size="xs" className="text-[8px] px-2">
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OFFER LETTER TAB */}
        {activeTab === 'offer' && (
          <div className="space-y-5 py-2">
            <div className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/10 via-transparent to-brand-magenta/5 rounded-sm" />
              <div className="relative aspect-[1/1.4] w-full border border-border/60 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-6 ring-8 ring-brand-teal/5">
                  <RiFileTextLine size={32} className="text-brand-teal" />
                </div>
                <h5 className="text-[13px] font-black text-content-primary uppercase tracking-widest">OFFER_LETTER_2024.pdf</h5>
                <p className="text-[10px] text-content-tertiary mt-2 font-bold uppercase tracking-tighter">
                  Verified Digital Document <br/>
                  <span className="text-brand-teal opacity-60">Status: Active & Signed</span>
                </p>
                
                <div className="mt-10 grid grid-cols-2 gap-6 w-full text-[9px] font-black text-left uppercase text-content-secondary">
                    <div className="bg-surface-primary/50 p-2 border-l-2 border-brand-teal">
                      <span className="text-[8px] text-content-tertiary block mb-1">Position</span>
                      Field Sales Exec.
                    </div>
                    <div className="bg-surface-primary/50 p-2 border-l-2 border-brand-magenta">
                      <span className="text-[8px] text-content-tertiary block mb-1">Employee ID</span>
                      #OGN-SE-882
                    </div>
                </div>
              </div>
            </div>
            
            <Button variant="primary" className="w-full h-14 uppercase tracking-widest text-[11px] font-black shadow-xl shadow-brand-teal/10" icon={RiDownloadLine}>
              Download Official Letter
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
