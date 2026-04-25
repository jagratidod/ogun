import { useState, useEffect } from 'react';
import { 
  RiSearchLine, RiUserAddFill, RiMapPinFill, 
  RiPhoneFill, RiStore2Fill, RiMore2Fill, RiShoppingBagFill 
} from 'react-icons/ri';
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
    <div className="p-3 space-y-4 bg-surface-primary min-h-screen pb-24">
      <div className="flex items-center justify-between px-1 pt-2">
        <div>
          <h2 className="text-xl font-black text-content-primary tracking-tighter">Retailers</h2>
          <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest opacity-70">Assigned Network</p>
        </div>
        <Button 
          variant="primary" 
          className="h-9 px-3 text-[10px] font-black rounded-xl"
          icon={RiUserAddFill}
          onClick={() => navigate('/sales/retailers/add')}
        >
          ONBOARD
        </Button>
      </div>

      <div className="px-1">
        <Input
          icon={RiSearchLine}
          placeholder="Search by shop or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border-none shadow-sm rounded-2xl h-10 text-xs"
        />
      </div>

      <div className="space-y-2.5">
        {loading ? (
           <div className="text-center py-10 text-content-tertiary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning Network...</div>
        ) : filteredRetailers.length === 0 ? (
           <div className="text-center py-16 bg-white border border-dashed border-border rounded-[24px]">
              <RiStore2Fill className="w-10 h-10 text-content-tertiary mx-auto mb-2 opacity-10" />
              <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">No Retailers Found</p>
           </div>
        ) : (
          filteredRetailers.map((retailer) => (
            <Card key={retailer._id} className="p-3 rounded-[20px] shadow-sm border-none bg-white relative overflow-hidden group active:scale-[0.98] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal/5 flex items-center justify-center rounded-xl text-brand-teal">
                    <RiStore2Fill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-content-primary leading-tight tracking-tight">{retailer.shopName}</h4>
                    <p className="text-[9px] font-black text-content-tertiary mt-0.5 uppercase tracking-tighter">{retailer.name}</p>
                  </div>
                </div>
                <Badge variant={retailer.isActive ? 'success' : 'warning'} className="text-[8px] px-1.5 py-0 font-black">
                  {retailer.isActive ? 'ACTIVE' : 'PENDING'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 p-2 bg-surface-elevated rounded-xl">
                  <RiMapPinFill className="text-brand-pink w-3 h-3 flex-shrink-0" />
                  <span className="text-[9px] font-bold text-content-secondary truncate">{retailer.location || 'No Location'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-surface-elevated rounded-xl">
                  <RiPhoneFill className="text-brand-teal w-3 h-3 flex-shrink-0" />
                  <span className="text-[9px] font-bold text-content-secondary truncate">{retailer.phone || 'No Phone'}</span>
                </div>
              </div>
              
              <div className="absolute right-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <RiShoppingBagFill className="text-brand-teal/20 w-4 h-4" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
