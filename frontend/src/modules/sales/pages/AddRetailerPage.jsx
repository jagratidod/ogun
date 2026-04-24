import { useState, useEffect } from 'react';
import { RiArrowLeftLine, RiStore2Line, RiUserLine, RiMailLine, RiMapPinLine, RiPhoneLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import executiveService from '../../../core/services/executiveService';
import partnerService from '../../../core/services/partnerService';
import { toast } from 'react-hot-toast';
import { Button, Input, Select, Card } from '../../../core';

export default function AddRetailerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shopName: '',
    location: '',
    phone: '',
    distributorId: ''
  });
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const res = await partnerService.getDistributors();
      setDistributors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await executiveService.onboardRetailer(formData);
      toast.success('Retailer onboarded! Awaiting approval.');
      navigate('/sales/retailers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to onboard retailer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-elevated">
          <RiArrowLeftLine />
        </button>
        <div>
          <h2 className="text-xl font-black text-content-primary">Onboard</h2>
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mt-0.5">Register New Shop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-5 space-y-4">
          <Input
            label="Shop Name"
            placeholder="e.g. Agarwal Electronics"
            icon={RiStore2Line}
            required
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          />
          <Input
            label="Owner Name"
            placeholder="Full Name"
            icon={RiUserLine}
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Mobile Number"
            placeholder="10-digit number"
            icon={RiPhoneLine}
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="owner@example.com"
            icon={RiMailLine}
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Shop Address"
            placeholder="Full address"
            icon={RiMapPinLine}
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Select
            label="Assign Distributor"
            required
            value={formData.distributorId}
            onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
            options={[
              { label: 'Select Distributor', value: '' },
              ...distributors.map(d => ({ label: d.businessName || d.name, value: d._id }))
            ]}
          />
        </Card>

        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-12 text-sm uppercase tracking-widest font-black"
            loading={loading}
          >
            Submit for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}
