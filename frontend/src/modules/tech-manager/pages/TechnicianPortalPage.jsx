import React, { useState, useEffect } from 'react';
import {
  RiCustomerServiceLine, RiCheckDoubleLine, RiTimeLine,
  RiLoader4Line, RiUserLine, RiMapPinLine, RiPhoneLine,
  RiToolsLine, RiHistoryLine, RiArrowRightSLine,
  RiPlayCircleLine, RiSearchLine, RiInformationLine,
  RiBox3Line, RiImageAddLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, Badge, formatDateTime, 
  Avatar, Button, Modal, useModal, Input, Select 
} from '../../../core';
import { toast } from 'react-hot-toast';
import technicianService from '../../../core/services/technicianService';
import { useAuthContext } from '../../../core/context/AuthContext';

export default function TechnicianPortalPage() {
  const { user } = useAuthContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { isOpen, open, close } = useModal();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchMyTickets(); }, []);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const res = await technicianService.getMyTickets();
      setTickets(res.data || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status, note = '') => {
    try {
      setActionLoading(true);
      await technicianService.updateTicketStatus(ticketId, { status, note });
      toast.success(`Status updated to ${status}`);
      fetchMyTickets();
      if (selectedTicket?._id === ticketId) {
         setSelectedTicket(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = [
    { label: 'Assigned', val: tickets.length, icon: RiUserLine, bg: 'bg-brand-teal/10', color: 'text-brand-teal' },
    { label: 'Pending', val: tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length, icon: RiTimeLine, bg: 'bg-state-warning/10', color: 'text-state-warning' },
    { label: 'Resolved', val: tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length, icon: RiCheckDoubleLine, bg: 'bg-state-success/10', color: 'text-state-success' },
  ];

  const getStatusBadge = (status) => {
     switch(status) {
        case 'Open': return 'info';
        case 'Assigned': return 'info';
        case 'Reached Site': return 'teal';
        case 'Diagnosis': return 'warning';
        case 'Parts Pending': return 'danger';
        case 'In Progress': return 'teal';
        case 'Resolved': return 'success';
        default: return 'secondary';
     }
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6 pb-20">
      <section className="flex justify-between items-center px-1">
         <div>
            <h2 className="text-2xl font-black text-content-primary tracking-tight">Field Portal</h2>
            <p className="text-[10px] font-bold text-content-tertiary uppercase tracking-widest opacity-60">Service Ops Center</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-content-primary uppercase leading-none mb-1">{user?.name}</p>
               <p className="text-[9px] text-brand-teal font-bold uppercase tracking-widest">Technician #ID-0021</p>
            </div>
            <Avatar name={user?.name} size="md" className="border-2 border-brand-teal/20" />
         </div>
      </section>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-4">
         {stats.map((s, i) => (
            <div key={i} className="glass-card p-4 border-none shadow-sm flex flex-col items-center text-center gap-1">
               <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-1`}>
                  <s.icon className="w-4 h-4" />
               </div>
               <h4 className="text-xl font-black text-content-primary leading-none">{s.val}</h4>
               <p className="text-[9px] font-black text-content-tertiary uppercase tracking-tight">{s.label}</p>
            </div>
         ))}
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-content-primary uppercase tracking-widest">Active Assignments</h3>
            <RiPulseLine className="text-brand-teal w-4 h-4 animate-pulse" />
         </div>

         {loading ? (
            <div className="p-20 flex justify-center">
               <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
            </div>
         ) : tickets.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-2">
               <RiToolsLine className="w-12 h-12 text-content-tertiary mx-auto mb-4 opacity-40" />
               <p className="text-sm font-bold text-content-secondary">Standby Mode</p>
               <p className="text-xs text-content-tertiary mt-1">No tickets assigned to your region today.</p>
            </div>
         ) : (
            tickets.map((t) => (
               <Card 
                  key={t._id} 
                  className={`group active:scale-[0.98] transition-all cursor-pointer border-none shadow-sm ${selectedTicket?._id === t._id ? 'ring-2 ring-brand-teal bg-brand-teal/[0.02]' : 'bg-white'}`}
                  onClick={() => { setSelectedTicket(t); open(); }}
               >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${t.priority === 'High' ? 'bg-state-danger/10 text-state-danger' : 'bg-surface-secondary text-content-tertiary'}`}>
                           {t.issueCategory === 'mot' ? '⚙️' : t.issueCategory === 'elec' ? '⚡' : '🛠️'}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-content-primary">{t.ticketId}</span>
                              <Badge variant={getStatusBadge(t.status)} className="text-[8px] px-1.5 py-0">{t.status}</Badge>
                           </div>
                           <h4 className="text-sm font-bold text-content-primary group-hover:text-brand-teal transition-colors line-clamp-1">{t.registeredProduct?.productName}</h4>
                           <p className="text-[10px] text-content-tertiary font-bold flex items-center gap-1">
                              <RiMapPinLine className="w-3 h-3" /> {t.serviceAddress || 'Local Site'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                           <p className="text-[9px] text-content-tertiary font-black uppercase">Customer</p>
                           <p className="text-xs font-bold text-content-secondary">{t.customer?.name}</p>
                        </div>
                        <RiArrowRightSLine className="text-content-tertiary w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>

      {/* Ticket Detail Modal */}
      <Modal 
         isOpen={isOpen} 
         onClose={close} 
         title={`Ticket Detail — ${selectedTicket?.ticketId}`}
         size="lg"
      >
         {selectedTicket && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-secondary rounded-xl border border-border">
                     <p className="text-[9px] text-content-tertiary font-black uppercase mb-1">Product Details</p>
                     <p className="text-xs font-bold">{selectedTicket.registeredProduct?.productName}</p>
                     <p className="text-[10px] font-mono text-brand-teal mt-1">SN: {selectedTicket.registeredProduct?.serialNumber}</p>
                  </div>
                  <div className="p-3 bg-surface-secondary rounded-xl border border-border">
                     <p className="text-[9px] text-content-tertiary font-black uppercase mb-1">Issue Category</p>
                     <p className="text-xs font-bold uppercase">{selectedTicket.issueCategory}</p>
                     <Badge variant="danger" className="mt-1 text-[8px]">{selectedTicket.priority} Priority</Badge>
                  </div>
               </div>

               <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-xl">
                  <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-2 flex items-center gap-1">
                     <RiInformationLine /> Customer Report
                  </p>
                  <p className="text-sm font-medium text-content-primary italic">"{selectedTicket.issueDescription}"</p>
               </div>

               <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-content-primary">On-site Workflow</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <Button 
                        disabled={selectedTicket.status !== 'Assigned'} 
                        icon={RiMapPinLine} 
                        className="w-full h-11 text-[10px]" 
                        variant="secondary"
                        onClick={() => handleUpdateStatus(selectedTicket._id, 'Reached Site')}
                        loading={actionLoading}
                     >
                        REACHED SITE
                     </Button>
                     <Button 
                        disabled={selectedTicket.status !== 'Reached Site'} 
                        icon={RiToolsLine} 
                        className="w-full h-11 text-[10px]" 
                        variant="secondary"
                        onClick={() => handleUpdateStatus(selectedTicket._id, 'Diagnosis')}
                        loading={actionLoading}
                     >
                        START DIAGNOSIS
                     </Button>
                     <Button 
                        disabled={!['Diagnosis', 'Reached Site'].includes(selectedTicket.status)} 
                        icon={RiBox3Line} 
                        className="w-full h-11 text-[10px]" 
                        variant="secondary"
                        onClick={() => handleUpdateStatus(selectedTicket._id, 'Parts Pending')}
                        loading={actionLoading}
                     >
                        ORDER SPARES
                     </Button>
                     <Button 
                        disabled={['Resolved', 'Closed'].includes(selectedTicket.status)} 
                        icon={RiCheckDoubleLine} 
                        className="w-full h-11 text-[10px]" 
                        variant="teal"
                        onClick={() => handleUpdateStatus(selectedTicket._id, 'Resolved')}
                        loading={actionLoading}
                     >
                        MARK RESOLVED
                     </Button>
                  </div>
               </div>

               <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                        <RiPhoneLine className="text-brand-teal" />
                     </div>
                     <div>
                        <p className="text-[9px] text-content-tertiary font-black uppercase">Direct Contact</p>
                        <p className="text-xs font-bold">{selectedTicket.contactNumber}</p>
                     </div>
                  </div>
                  <Button variant="ghost" icon={RiHistoryLine}>View Logs</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Bottom Nav Simulation for Mobile Feel */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-6 z-40 lg:hidden">
         <div className="flex flex-col items-center gap-1 text-brand-teal">
            <RiDashboardLine className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Tasks</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-content-tertiary opacity-40">
            <RiHistoryLine className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">History</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-content-tertiary opacity-40">
            <RiUserLine className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Profile</span>
         </div>
      </div>
    </div>
  );
}

const RiPulseLine = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fill="none" d="M0 0h24v24H0z"></path><path d="M9 7.539L15 15.461V21h-2v-4.539L7 8.539V3h2v4.539zM19 3v11.539l-4 5.294V21h-2v-5.461l4-5.294V3h2zM5 3v5.461l4 5.294V21h2v-6.539L7 6.539V3H5z"></path></svg>
);
