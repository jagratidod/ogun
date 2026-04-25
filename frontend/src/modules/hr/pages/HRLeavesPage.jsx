import { useState, useEffect } from 'react';
import { 
  RiCalendarEventLine, 
  RiCheckFill, 
  RiCloseFill, 
  RiTimeLine, 
  RiUser3Line, 
  RiFileList3Line,
  RiFilter3Line,
  RiChat3Line
} from 'react-icons/ri';
import { Card, Button, Input, Badge, useNotification } from '../../../core';
import api from '../../../core/api';

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [remarks, setRemarks] = useState({});
  const { showNotification } = useNotification();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to fetch leave requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/hr/leaves/${id}/review`, {
        status,
        hrRemarks: remarks[id] || ''
      });
      showNotification({ title: 'Success', message: `Leave ${status} successfully`, type: 'success' });
      fetchLeaves();
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to review leave', type: 'error' });
    }
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  const filteredLeaves = leaves.filter(l => filterStatus === 'all' || l.status === filterStatus);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-primary tracking-tight flex items-center gap-3">
            <RiCalendarEventLine className="text-brand-teal" />
            LEAVE MANAGEMENT
          </h1>
          <p className="text-sm text-content-tertiary mt-1">Review and process employee leave applications</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surface-secondary p-1 rounded-sm border border-border/50">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xs text-[10px] font-black uppercase tracking-wider transition-all ${
                filterStatus === s 
                  ? 'bg-brand-teal text-white shadow-md' 
                  : 'text-content-tertiary hover:text-content-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Card key={i} className="h-64 animate-pulse bg-surface-secondary" />)}
        </div>
      ) : filteredLeaves.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
            <RiCalendarEventLine size={32} className="text-content-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-content-primary">No leave requests found</h3>
          <p className="text-sm text-content-tertiary">There are no leave applications matching your current filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaves.map((leave) => (
            <Card key={leave._id} className="overflow-hidden border-border/60 hover:border-brand-teal/40 transition-all flex flex-col">
              {/* Card Header */}
              <div className="p-4 border-b border-border/40 bg-surface-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center font-black text-brand-teal">
                    {leave.employee?.name?.substring(0, 1).toUpperCase() || 'E'}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-content-primary leading-tight">{leave.employee?.name}</h4>
                    <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-tighter">
                      {leave.employee?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}
                  className="uppercase text-[8px] font-black"
                >
                  {leave.status}
                </Badge>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-content-tertiary uppercase tracking-widest block">Type</span>
                    <p className="text-xs font-bold text-brand-teal uppercase">{leave.type} Leave</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-content-tertiary uppercase tracking-widest block">Applied On</span>
                    <p className="text-xs font-medium text-content-secondary">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-surface-secondary/50 rounded-xs border border-border/30">
                  <RiTimeLine className="text-brand-teal" size={16} />
                  <div className="text-[11px] font-black text-content-primary">
                    {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-black text-content-tertiary uppercase tracking-widest block">Reason</span>
                  <p className="text-xs text-content-secondary leading-relaxed bg-surface-primary p-2 border border-border/20 rounded-xs">
                    "{leave.reason}"
                  </p>
                </div>

                {leave.status === 'pending' ? (
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <RiChat3Line className="absolute left-3 top-3 text-content-tertiary" size={14} />
                      <textarea
                        placeholder="Add HR remarks..."
                        value={remarks[leave._id] || ''}
                        onChange={(e) => handleRemarkChange(leave._id, e.target.value)}
                        className="w-full bg-surface-secondary border border-border/40 rounded-xs p-2 pl-9 text-xs min-h-[60px] focus:outline-none focus:border-brand-teal/50 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        icon={RiCloseFill} 
                        className="text-state-danger border-state-danger/30 hover:bg-state-danger/5 font-black uppercase text-[10px]"
                        onClick={() => handleReview(leave._id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={RiCheckFill} 
                        className="bg-state-success hover:bg-state-success-dark text-white font-black uppercase text-[10px] shadow-lg shadow-state-success/20"
                        onClick={() => handleReview(leave._id, 'approved')}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ) : leave.hrRemarks && (
                  <div className="pt-2">
                    <span className="text-[8px] font-black text-content-tertiary uppercase tracking-widest block mb-1">HR Remarks</span>
                    <p className="text-xs italic text-content-tertiary bg-surface-secondary/30 p-2 rounded-xs border-l-2 border-brand-teal">
                      {leave.hrRemarks}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
