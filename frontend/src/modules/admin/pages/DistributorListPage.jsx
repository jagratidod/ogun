import { useEffect, useMemo, useState } from 'react';
import { RiSearchLine, RiFilterLine, RiUserAddLine, RiMapPinLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function DistributorListPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/distributors');
      setDistributors(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (distributors || [])
      .filter(d => statusFilter === 'all' ? true : (d.status === statusFilter))
      .filter(d => {
        if (!q) return true;
        return (
          (d.name || '').toLowerCase().includes(q) ||
          (d.email || '').toLowerCase().includes(q) ||
          (d.businessName || '').toLowerCase().includes(q) ||
          (d.location || '').toLowerCase().includes(q)
        );
      });
  }, [distributors, search, statusFilter]);

  const toggleStatus = async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/distributors/${row.id}/status`, { status: next });
      toast.success(next === 'active' ? 'Distributor activated' : 'Distributor disabled');
      await fetchDistributors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name', label: 'Distributor Name', sortable: true, render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
        </div>
      )
    },
    {
      key: 'region', label: 'Region', render: (val) => (
        <div className="flex items-center gap-2">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
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
        title="Distributor Network"
        subtitle="Manage regional distributor nodes and their logistics activity"
      >
        <Button icon={RiUserAddLine} variant="secondary" onClick={fetchDistributors}>
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
                placeholder="Search distributor name/email..."
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
          data={loading ? [] : filteredData.map(d => ({
            ...d,
            region: d.location || '—',
            joined: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—',
          }))}
        />
      </Card>
    </div>
  );
}
