import { useState, useEffect } from 'react';
import {
  RiCustomerServiceLine, RiCheckDoubleLine, RiTimeLine,
  RiLoader4Line, RiUserLine, RiMapPinLine, RiPhoneLine,
  RiToolsLine, RiHistoryLine
} from 'react-icons/ri';
import { PageHeader, Card, CardHeader, Badge, formatDateTime, Avatar } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';
import { useAuthContext } from '../../../core/context/AuthContext';

export default function TechnicianPortalPage() {
  const { user } = useAuthContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyTickets(); }, []);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technician/my-tickets');
      setTickets(res.data?.data || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Assigned to Me', val: tickets.length },
    { label: 'Open', val: tickets.filter(t => t.status === 'Open' || t.status === 'Assigned').length, color: 'text-state-warning' },
    { label: 'In Progress', val: tickets.filter(t => t.status === 'In Progress').length, color: 'text-brand-teal' },
    { label: 'Resolved', val: tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length, color: 'text-state-success' },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title={`Welcome, ${user?.name}`}
        subtitle="Your assigned service tickets"
      />

      {/* Profile card */}
      <div className="glass-card p-4 flex items-center gap-4">
        <Avatar name={user?.name} size="lg" />
        <div>
          <p className="font-bold text-content-primary">{user?.name}</p>
          <p className="text-xs text-content-tertiary">{user?.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="teal">Technician</Badge>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h4 className={`text-xl font-bold ${s.color || 'text-content-primary'}`}>{s.val}</h4>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RiCustomerServiceLine className="w-4 h-4 text-brand-teal" />
            <span className="text-sm font-bold text-content-primary">My Tickets</span>
          </div>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <RiToolsLine className="w-10 h-10 text-content-tertiary mb-3" />
            <p className="text-sm font-bold text-content-secondary">No tickets assigned yet</p>
            <p className="text-xs text-content-tertiary mt-1">You'll see your service tickets here once assigned</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map(ticket => (
              <div key={ticket._id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-content-primary">#{ticket.ticketId}</span>
                    <Badge variant={ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'info'}>
                      {ticket.priority}
                    </Badge>
                    <Badge status={ticket.status?.toLowerCase().replace(' ', '_')}>{ticket.status}</Badge>
                  </div>
                  <p className="text-xs text-content-secondary">{ticket.issueCategory} — <span className="italic">"{ticket.issueDescription}"</span></p>
                  <div className="flex items-center gap-4 text-[11px] text-content-tertiary mt-1">
                    <span className="flex items-center gap-1"><RiUserLine className="w-3 h-3" />{ticket.customer?.name}</span>
                    {ticket.serviceAddress && <span className="flex items-center gap-1"><RiMapPinLine className="w-3 h-3" />{ticket.serviceAddress}</span>}
                    <span className="flex items-center gap-1"><RiPhoneLine className="w-3 h-3" />{ticket.contactNumber}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-content-tertiary">{formatDateTime(ticket.createdAt).split(',')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
