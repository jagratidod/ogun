import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCustomerService2Fill, RiTimeFill, RiShieldStarFill, RiArrowRightSLine, RiMapPinFill, RiPhoneFill, RiLoader4Line } from 'react-icons/ri';
import { Button, Card, Input, Select, Combobox } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function RaiseComplaintPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [productsLoading, setProductsLoading] = useState(true);
   const [products, setProducts] = useState([]);

   const [productId, setProductId] = useState(null);
   const [issueType, setIssueType] = useState(null);
   const [description, setDescription] = useState('');
   const [contactNumber, setContactNumber] = useState('');
   const [serviceAddress, setServiceAddress] = useState('');
   const [priority, setPriority] = useState('Medium');

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         const res = await api.get('/customer/products');
         const prods = res.data?.data || [];
         setProducts(prods);
         if (prods.length > 0 && prods[0].mobileNumber) {
            setContactNumber(prods[0].mobileNumber);
            setServiceAddress(`${prods[0].city || ''}, ${prods[0].state || ''}`);
         }
      } catch (err) {
         console.error('Failed to fetch products:', err);
      } finally {
         setProductsLoading(false);
      }
   };

   const issueTypes = [
      { label: 'Motor Issue / Not Working', value: 'mot' },
      { label: 'Unusual Noise / Vibration', value: 'noi' },
      { label: 'Spare Part Requirement', value: 'spa' },
      { label: 'Installation / Demo', value: 'ins' },
      { label: 'Electrical / Power Issue', value: 'elec' },
      { label: 'Physical Damage', value: 'dmg' },
      { label: 'Other', value: 'other' }
   ];

   const handleSubmit = async () => {
      if (!productId) return toast.error('Please select a registered product');
      if (!issueType) return toast.error('Please select an issue category');
      if (!description.trim()) return toast.error('Please describe the issue');
      if (!contactNumber.trim()) return toast.error('Please enter a contact number');

      setLoading(true);
      try {
         await api.post('/customer/service-requests', {
            registeredProductId: typeof productId === 'object' ? productId.value : productId,
            issueCategory: typeof issueType === 'object' ? issueType.value : issueType,
            issueDescription: description,
            contactNumber,
            serviceAddress,
            priority
         });
         toast.success('Service ticket submitted successfully!');
         navigate('/customer/service');
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to submit request');
      } finally {
         setLoading(false);
      }
   };

   if (productsLoading) {
      return (
         <div className="page-container max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
         </div>
      );
   }

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-4">
         <div className="pt-1">
            <h2 className="text-lg font-black text-gray-800 tracking-tight leading-none">Priority Ticket</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest opacity-60">Professional Support Desk</p>
         </div>

         <div className="bg-brand-pink/5 border border-brand-pink/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-4 pr-10 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink border border-brand-pink/10">
                  <RiShieldStarFill className="w-5 h-5 transition-transform group-hover:scale-110 duration-500" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-brand-pink mb-0.5 uppercase tracking-wider leading-none">Express Ticketing Active</h4>
                  <p className="text-[9px] text-gray-500 font-bold leading-tight">Priority assignment within 24 hours.</p>
               </div>
            </div>
         </div>

         {products.length === 0 ? (
            <Card className="rounded-[28px] overflow-hidden border-gray-50 p-8 text-center">
               <p className="text-sm font-bold text-gray-500 mb-4">No registered products found.</p>
               <Button onClick={() => navigate('/customer/products/register')} className="mx-auto">
                  Register a Product First
               </Button>
            </Card>
         ) : (
            <>
               <Card className="rounded-[28px] overflow-hidden border-gray-50">
                  <div className="p-5 space-y-4">
                     <Combobox 
                        label="Registered Product" 
                        options={products.map(p => ({ label: `${p.productName} (SN: ${p.serialNumber})`, value: p._id }))} 
                        value={productId}
                        onChange={setProductId}
                        placeholder="Select Appliance..."
                     />
                     
                     <Combobox 
                        label="Issue Category" 
                        options={issueTypes}
                        value={issueType}
                        onChange={setIssueType}
                        placeholder="What's wrong?"
                     />

                     <Select
                        label="Priority Level"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        options={[
                           { label: 'Low — Minor issue', value: 'Low' },
                           { label: 'Medium — Needs attention', value: 'Medium' },
                           { label: 'High — Urgent / Safety', value: 'High' }
                        ]}
                     />

                     <div className="space-y-1">
                        <label className="text-sm font-medium text-content-secondary px-1">Describe the Issue</label>
                        <textarea 
                           className="w-full h-24 rounded-2xl bg-white border border-gray-100 p-3.5 text-[13px] font-bold text-gray-700 focus:border-brand-pink/30 focus:shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-normal" 
                           placeholder="Explain what happened in detail..."
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                        />
                     </div>
                     
                     <Input 
                        label="Contact Number" 
                        value={contactNumber} 
                        onChange={(e) => setContactNumber(e.target.value)}
                        icon={RiPhoneFill} 
                        placeholder="+91 98765-43210"
                     />
                  </div>
               </Card>

               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-pink border border-gray-100 group-hover:bg-brand-pink/5 transition-all">
                        <RiMapPinFill className="w-5 h-5" />
                     </div>
                     <div className="flex flex-col">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Service Location</p>
                        <input 
                           className="text-[12px] text-gray-800 font-black tracking-tight bg-transparent outline-none w-full"
                           value={serviceAddress}
                           onChange={(e) => setServiceAddress(e.target.value)}
                           placeholder="Enter your address..."
                        />
                     </div>
                  </div>
                  <RiArrowRightSLine className="w-4 h-4 text-gray-300" />
               </div>

               <div className="pb-8 flex flex-col gap-3">
                  <Button
                     loading={loading}
                     onClick={handleSubmit}
                     className="w-full h-12 rounded-full font-black text-sm shadow-xl shadow-brand-pink/20 bg-brand-pink text-white hover:bg-brand-pink/90 border-none"
                     icon={RiCustomerService2Fill}
                  >
                     Request Technician
                  </Button>
                  <div className="flex items-center justify-center gap-2 opacity-40">
                     <RiTimeFill className="w-3 h-3 text-brand-pink" />
                     <p className="text-[8px] text-center font-bold text-gray-400 uppercase tracking-widest">Callback within 2 working hours</p>
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
