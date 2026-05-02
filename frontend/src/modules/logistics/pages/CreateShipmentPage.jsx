import { useState, useEffect } from 'react';
import {
   RiTruckLine, RiArrowLeftLine, RiAddLine, RiDeleteBinLine, RiArrowRightLine
} from 'react-icons/ri';
import {
   PageHeader, Card, Button, Input, Select, formatCurrency
} from '../../../core';
import inventoryService from '../../../core/services/inventoryService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CreateShipmentPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [distributors, setDistributors] = useState([]);
   const [products, setProducts] = useState([]);
   
   // Form State
   const [formData, setFormData] = useState({
      recipientId: '',
      carrier: '',
      trackingNumber: '',
      notes: '',
      items: [{ product: '', quantity: 1 }]
   });

   useEffect(() => {
      fetchInitialData();
   }, []);

   const fetchInitialData = async () => {
      try {
         const [distRes, prodRes] = await Promise.all([
            inventoryService.getDistributors(),
            inventoryService.getProducts()
         ]);
         setDistributors(distRes.data || []);
         setProducts(prodRes.data || []);
      } catch (error) {
         toast.error('Failed to load form data');
      }
   };

   const handleAddItem = () => {
      setFormData({
         ...formData,
         items: [...formData.items, { product: '', quantity: 1 }]
      });
   };

   const handleRemoveItem = (index) => {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
   };

   const handleItemChange = (index, field, value) => {
      const newItems = [...formData.items];
      newItems[index][field] = value;
      setFormData({ ...formData, items: newItems });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.recipientId || formData.items.some(i => !i.product)) {
         return toast.error('Please fill all required fields');
      }

      try {
         setLoading(true);
         // Adapting to existing admin shipment API
         const payload = {
            recipientId: formData.recipientId,
            carrier: formData.carrier,
            trackingNumber: formData.trackingNumber,
            notes: formData.notes,
            products: formData.items
         };
         
         await inventoryService.createShipment(payload);
         toast.success('Shipment dispatched successfully');
         navigate('/logistics/shipments');
      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to create shipment');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="page-container max-w-4xl mx-auto">
         <PageHeader
            title="Initiate Network Dispatch"
            subtitle="Securely route inventory across the supply chain network"
         >
            <Button variant="secondary" icon={RiArrowLeftLine} onClick={() => navigate(-1)}>Back</Button>
         </PageHeader>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="md:col-span-2 p-6 space-y-6">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2">Logistics Manifest</h3>
                     
                     <div className="space-y-3">
                        {formData.items.map((item, idx) => (
                           <div key={idx} className="flex gap-3 items-end bg-surface-secondary p-3 border border-border">
                              <div className="flex-1">
                                 <label className="block text-[10px] font-bold text-content-tertiary mb-1 uppercase">Product SKU</label>
                                 <Select
                                    value={item.product}
                                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                                    options={[
                                       { label: 'Select Product', value: '' },
                                       ...products.map(p => ({ label: `${p.sku} - ${p.name}`, value: p._id }))
                                    ]}
                                    required
                                 />
                              </div>
                              <div className="w-24">
                                 <label className="block text-[10px] font-bold text-content-tertiary mb-1 uppercase">Qty</label>
                                 <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                    required
                                 />
                              </div>
                              {formData.items.length > 1 && (
                                 <Button 
                                    type="button" 
                                    variant="danger" 
                                    className="!p-2.5" 
                                    onClick={() => handleRemoveItem(idx)}
                                 >
                                    <RiDeleteBinLine className="w-4 h-4" />
                                 </Button>
                              )}
                           </div>
                        ))}
                        <Button 
                           type="button" 
                           variant="secondary" 
                           icon={RiAddLine} 
                           className="w-full border-dashed"
                           onClick={handleAddItem}
                        >
                           Add Another Item
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="space-y-6">
                  <Card className="p-6 space-y-4">
                     <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2">Route Details</h3>
                     
                     <div>
                        <label className="block text-[10px] font-bold text-content-tertiary mb-1 uppercase">Recipient (Node)</label>
                        <Select
                           value={formData.recipientId}
                           onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                           options={[
                              { label: 'Select Recipient', value: '' },
                              ...distributors.map(d => ({ label: `${d.businessName || d.name} (${d.location || 'N/A'})`, value: d._id }))
                           ]}
                           required
                        />
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-content-tertiary mb-1 uppercase">Carrier Partner</label>
                        <Input
                           placeholder="e.g. BlueDart, FedEx"
                           value={formData.carrier}
                           onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-content-tertiary mb-1 uppercase">Tracking Number</label>
                        <Input
                           placeholder="Airway Bill / Tracking ID"
                           value={formData.trackingNumber}
                           onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                        />
                     </div>
                  </Card>

                  <Card className="p-6">
                     <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-4">Finalize Dispatch</h3>
                     <p className="text-[10px] text-content-tertiary leading-normal italic mb-6">
                        Dispatched stock will be immediately deducted from the sender's inventory and moved into "In Transit" status.
                     </p>
                     <Button 
                        type="submit" 
                        className="w-full py-4" 
                        icon={RiTruckLine}
                        loading={loading}
                     >
                        Confirm & Dispatch
                     </Button>
                  </Card>
               </div>
            </div>

            <Card className="p-6">
               <label className="block text-[10px] font-bold text-content-tertiary mb-2 uppercase">Logistics Notes / Special Instructions</label>
               <textarea
                  className="w-full bg-surface-secondary border border-border p-3 text-sm focus:outline-none focus:border-brand-teal transition-colors min-h-[100px]"
                  placeholder="Fragile items, specific delivery window, regional gate codes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
               ></textarea>
            </Card>
         </form>
      </div>
   );
}
