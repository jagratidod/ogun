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
    distributorId: '',
    coordinates: { lat: null, lng: null }
  });
  const [distributors, setDistributors] = useState([]);
  const [fetchingAddr, setFetchingAddr] = useState(false);

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

  const fetchAddress = async (lat, lng) => {
    try {
      setFetchingAddr(true);
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      
      console.log("Geocoding response:", data);
      
      if (data.status === 'OK' && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setFormData(p => ({ ...p, location: address }));
        toast.success("Address auto-filled from GPS!");
      } else if (data.status === 'ZERO_RESULTS') {
        toast.error("Google could not find a specific address for this GPS location. Please enter it manually.");
      } else if (data.status === 'REQUEST_DENIED') {
        console.error("Geocoding API not enabled:", data.error_message);
        toast.error("Geocoding API still restricted. Please ensure 'Geocoding API' is enabled in your Google Console.");
      } else {
        toast.error(`Geocoding issue: ${data.status}. Please enter address manually.`);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.error("Connection error while fetching address. Coordinates are pinned.");
    } finally {
      setFetchingAddr(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        return toast.error("Geolocation is not supported by your browser");
    }

    setFetchingAddr(true);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            setFormData(p => ({
                ...p,
                coordinates: { lat: latitude, lng: longitude }
            }));
            fetchAddress(latitude, longitude);
        },
        (err) => {
            setFetchingAddr(false);
            toast.error("Failed to get your current location. Please enable GPS.");
        },
        { enableHighAccuracy: true }
    );
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

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-content-tertiary uppercase tracking-widest ml-1">Pin Location on Map</label>
            <Button 
                type="button" 
                variant="secondary" 
                className="w-full border-dashed" 
                icon={RiMapPinLine}
                loading={fetchingAddr}
                onClick={handleGetLocation}
            >
                {formData.coordinates.lat ? 'Location Pinned ✅' : 'Use Current GPS Position'}
            </Button>
          </div>
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
