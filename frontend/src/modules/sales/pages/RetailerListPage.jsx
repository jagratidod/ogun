import { useState, useEffect } from 'react';
import { RiSearchLine, RiUserAddLine, RiMapPinLine, RiPhoneLine, RiStore2Line, RiMore2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import executiveService from '../../../core/services/executiveService';
import { Card, Button, Input, Badge } from '../../../core';

export default function RetailerListPage() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getMyRetailers();
      setRetailers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRetailers = retailers.filter(r => 
    r.shopName?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-content-primary">Retailers</h2>
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mt-0.5">Assigned Network</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          icon={RiUserAddLine}
          onClick={() => navigate('/sales/retailers/add')}
        >
          Add
        </Button>
      </div>

      <Input
        icon={RiSearchLine}
        placeholder="Search shop or owner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-surface-primary"
      />

      <div className="space-y-3">
        {loading ? (
           <div className="text-center py-10 text-content-tertiary text-xs font-bold uppercase animate-pulse">Scanning Network...</div>
        ) : filteredRetailers.length === 0 ? (
           <div className="text-center py-20 bg-surface-elevated/30 border border-dashed border-border rounded-none">
              <RiStore2Line className="w-10 h-10 text-content-tertiary mx-auto mb-3 opacity-20" />
              <p className="text-xs text-content-tertiary font-bold uppercase">No Retailers Found</p>
           </div>
        ) : (
          filteredRetailers.map((retailer) => (
            <Card key={retailer._id} className="p-4 hover:border-brand-teal transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10">
                    <RiStore2Line className="text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-content-primary leading-tight">{retailer.shopName}</h4>
                    <p className="text-[10px] font-bold text-content-tertiary mt-1">{retailer.name}</p>
                  </div>
                </div>
                <Badge variant={retailer.isActive ? 'success' : 'warning'} size="xs">
                  {retailer.isActive ? 'Active' : 'Pending'}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-bold text-content-tertiary">
                <div className="flex items-center gap-1">
                  <RiMapPinLine className="text-brand-magenta" />
                  <span className="truncate max-w-[120px]">{retailer.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RiPhoneLine className="text-brand-teal" />
                  <span>{retailer.phone || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
