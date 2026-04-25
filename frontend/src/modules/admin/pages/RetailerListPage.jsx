import { useEffect, useMemo, useState } from 'react';
import { RiSearchLine, RiFilterLine, RiUserAddLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function RetailerListPage() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/retailers');
      setRetailers(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load retailers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (retailers || [])
      .filter(r => statusFilter === 'all' ? true : (r.status === statusFilter))
      .filter(r => {
        if (!q) return true;
        return (
          (r.name || '').toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q) ||
          (r.shopName || '').toLowerCase().includes(q) ||
          (r.location || '').toLowerCase().includes(q)
        );
      });
  }, [retailers, search, statusFilter]);

  const toggleStatus = async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/retailers/${row.id}/status`, { status: next });
      toast.success(next === 'active' ? 'Retailer activated' : 'Retailer disabled');
      await fetchRetailers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name', label: 'Retailer Store', sortable: true, render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email', render: (val) => <span className="text-xs font-semibold text-content-secondary">{val}</span> },
    {
      key: 'joined', label: 'Onboarded', render: (val) => (
        <span className="text-xs text-content-tertiary">{val}</span>
      )
    },
    {
      key: 'status', label: 'Status', render: (val) => (
        <Badge status={val.toLowerCase()}>{val}</Badge>
      )
    },
    {
      key: 'rewardPoints', label: 'Reward Points', align: 'center', render: (val) => (
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-1 text-brand-teal font-black">
              <span className="text-sm">{(val || 0).toLocaleString()}</span>
           </div>
        </div>
      )
    },
    {
      key: 'distributor', label: 'Assigned Distributor', render: (val) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-brand-teal">{val?.businessName || val?.name || 'Independent'}</span>
          {val?.name && val?.businessName && <span className="text-[10px] text-content-tertiary">{val.name}</span>}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_val, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" onClick={() => toggleStatus(row)}>
            {row.status === 'active' ? 'Disable' : 'Activate'}
          </Button>
        </div>
      )
    }
  ]), []);

  return (
    <div className="page-container">
      <PageHeader
        title="Retailer Stores"
        subtitle="Manage end-point retail stores and their order frequency"
      >
        <Button icon={RiUserAddLine} variant="secondary" onClick={fetchRetailers}>
          Refresh
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <Select options={[
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Pending', value: 'pending' },
            ]} className="w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            <div className="flex items-center gap-2">
              <Input
                icon={RiSearchLine}
                placeholder="Search retailer name/email..."
                className="w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="secondary" icon={RiFilterLine} onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <DataTable
          columns={columns}
          data={loading ? [] : filteredData.map(r => ({
            ...r,
            joined: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
          }))}
        />
      </Card>
    </div>
  );
}
