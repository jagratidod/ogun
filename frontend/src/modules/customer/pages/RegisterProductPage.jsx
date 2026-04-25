import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeFill, RiPriceTag3Fill, RiInformationFill, RiSmartphoneFill, RiShieldCheckFill, RiCalendarFill, RiStore2Fill, RiMapPinFill, RiHandHeartFill, RiCameraFill, RiShieldStarFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, Input, Select, Combobox, PageHeader } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function RegisterProductPage() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   const [errors, setErrors] = useState({});
   
   const [formData, setFormData] = useState({
      category: 'mix',
      productName: '',
      serialNumber: '',
      purchaseDate: '',
      invoiceNumber: '',
      storeName: '',
      customerName: '',
      mobileNumber: '',
      email: '',
      city: '',
      state: '',
      warrantyPeriod: '12',
      purchaseMode: 'Offline',
      warrantyStartDate: '',
      warrantyExpiryDate: '',
      amcOption: 'No',
      productUsage: 'Residential',
      installationDate: '',
      installedBy: 'Company',
      // Warranty Extension (optional at registration)
      extendWarranty: false,
      extensionMonths: '0',
      extensionType: 'standard'
   });

   const categories = [
      { label: 'Mixer Grinder', value: 'mix' },
      { label: 'Induction Cooktop', value: 'ind' },
      { label: 'Chimney', value: 'chi' },
      { label: 'Microwave Oven', value: 'micro' },
      { label: 'Dishwasher', value: 'dish' }
   ];

   const extensionPricing = {
      '6': { standard: 999, premium: 1499 },
      '12': { standard: 1799, premium: 2499 },
      '24': { standard: 2999, premium: 4499 }
   };

   const validate = () => {
      const newErrors = {};
      if (!formData.productName.trim()) newErrors.productName = 'Product Name is required';
      if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial Number is required';
      if (!formData.customerName.trim()) newErrors.customerName = 'Full Name is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase Date is required';

      if (!formData.mobileNumber) {
         newErrors.mobileNumber = 'Mobile Number is required';
      } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
         newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
         newErrors.email = 'Enter a valid email address';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleInputChange = (field, value) => {
      if (errors[field]) {
         setErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
         });
      }

      const updatedData = { ...formData, [field]: value };
      
      if (field === 'purchaseDate') {
         updatedData.warrantyStartDate = value;
         if (updatedData.warrantyPeriod) {
            updatedData.warrantyExpiryDate = calculateExpiry(value, updatedData.warrantyPeriod);
         }
      }

      if (field === 'warrantyPeriod' && updatedData.warrantyStartDate) {
         updatedData.warrantyExpiryDate = calculateExpiry(updatedData.warrantyStartDate, value);
      }

      setFormData(updatedData);
   };

   const calculateExpiry = (startDate, months) => {
      if (!startDate) return '';
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + parseInt(months));
      return date.toISOString().split('T')[0];
   };

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setSelectedFile(file);
         const url = URL.createObjectURL(file);
         setPreviewUrl(url);
      }
   };

   const handleRegister = async () => {
      if (!validate()) {
         return toast.error('Please correct the errors in the form');
      }
      setLoading(true);
      try {
         const formDataPayload = new FormData();
         
         // Append text fields
         formDataPayload.append('productName', formData.productName);
         formDataPayload.append('serialNumber', formData.serialNumber);
         const catVal = typeof formData.category === 'object' ? formData.category.value : formData.category;
         formDataPayload.append('category', catVal);
         formDataPayload.append('purchaseDate', formData.purchaseDate);
         formDataPayload.append('invoiceNumber', formData.invoiceNumber);
         formDataPayload.append('storeName', formData.storeName);
         formDataPayload.append('purchaseMode', formData.purchaseMode);
         formDataPayload.append('productUsage', formData.productUsage);
         formDataPayload.append('warrantyPeriod', formData.warrantyPeriod);
         if (formData.installationDate) formDataPayload.append('installationDate', formData.installationDate);
         formDataPayload.append('installedBy', formData.installedBy);
         formDataPayload.append('customerName', formData.customerName);
         formDataPayload.append('mobileNumber', formData.mobileNumber);
         formDataPayload.append('email', formData.email);
         formDataPayload.append('city', formData.city);
         formDataPayload.append('state', formData.state);
         formDataPayload.append('amcOption', formData.amcOption);

         // Append file if selected
         if (selectedFile) {
            formDataPayload.append('invoiceImage', selectedFile);
         }

         const res = await api.post('/customer/products/register', formDataPayload, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         const product = res.data?.data;

         // If user chose warranty extension at registration
         if (formData.extendWarranty && formData.extensionMonths !== '0' && product?._id) {
            const extAmount = extensionPricing[formData.extensionMonths]?.[formData.extensionType] || 0;
            await api.post(`/customer/products/${product._id}/extend-warranty`, {
               extensionMonths: formData.extensionMonths,
               extensionType: formData.extensionType,
               amount: extAmount
            });
         }

         toast.success('Product registered successfully!');
         navigate('/customer/products');
      } catch (err) {
         toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-6 pb-20">
         <div className="pt-2">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Warranty Registration</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Register your appliance for official service and support</p>
         </div>

         {/* Section: Product Details */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiVerifiedBadgeFill className="text-brand-teal w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Product Details</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm">
               <Combobox
                  label="Appliance Category"
                  options={categories}
                  value={formData.category}
                  onChange={(val) => handleInputChange('category', val)}
                  placeholder="Select Category"
               />
               <Input
                  label="Product / Model Name"
                  placeholder="e.g. Turbo Mixer 500"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  icon={RiInformationFill}
                  error={errors.productName}
                  required
               />
               <Input
                  label="Model Serial Number"
                  placeholder="Found on product sticker"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  icon={RiPriceTag3Fill}
                  error={errors.serialNumber}
                  required
               />
               <div className="grid grid-cols-2 gap-4">
                  <Select 
                     label="Usage Type" 
                     value={formData.productUsage}
                     onChange={(e) => handleInputChange('productUsage', e.target.value)}
                     options={[
                        { label: 'Residential', value: 'Residential' },
                        { label: 'Commercial', value: 'Commercial' }
                     ]}
                  />
                  <Select 
                     label="Purchase Mode" 
                     value={formData.purchaseMode}
                     onChange={(e) => handleInputChange('purchaseMode', e.target.value)}
                     options={[
                        { label: 'Offline Store', value: 'Offline' },
                        { label: 'Online Marketplace', value: 'Online' }
                     ]}
                  />
               </div>
            </Card>
         </section>

         {/* Section: Purchase Info */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiStore2Fill className="text-brand-teal w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Purchase Information</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm">
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                     label="Purchase Date" 
                     type="date" 
                     value={formData.purchaseDate}
                     onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                     icon={RiCalendarFill} 
                     error={errors.purchaseDate}
                     required
                  />
                  <Input 
                     label="Invoice Number" 
                     placeholder="SL-901" 
                     value={formData.invoiceNumber}
                     onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
               </div>
               <Input
                  label="Distributor / Store Name"
                  placeholder="Where did you buy it?"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  icon={RiStore2Fill}
               />
               <div className="pt-2">
                  <input type="file" id="invoice-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {previewUrl ? (
                     <div className="relative group overflow-hidden rounded-2xl border border-brand-teal h-32">
                        <img src={previewUrl} alt="Invoice" className="w-full h-full object-cover" />
                        <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-white text-[10px] font-black uppercase">Change Invoice</span>
                        </button>
                     </div>
                  ) : (
                     <label htmlFor="invoice-upload" className="w-full h-24 rounded-[24px] border border-dashed border-gray-200 bg-white flex items-center gap-6 px-6 cursor-pointer hover:bg-brand-teal/[0.02] transition-all">
                        <RiCameraFill className="w-7 h-7 text-gray-300" />
                        <div className="text-left">
                           <p className="text-[12px] text-gray-800 font-bold uppercase">Upload Invoice Image</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Optional but Recommended</p>
                        </div>
                     </label>
                  )}
               </div>
            </Card>
         </section>

         {/* Section: Warranty & AMC */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiShieldCheckFill className="text-brand-teal w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Warranty & Coverage</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm bg-gray-50/30">
               <div className="grid grid-cols-2 gap-4">
                  <Select 
                     label="Warranty Period" 
                     value={formData.warrantyPeriod}
                     onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                     options={[
                        { label: '6 Months', value: '6' },
                        { label: '1 Year (Standard)', value: '12' },
                        { label: '2 Years', value: '24' },
                        { label: '3 Years', value: '36' }
                     ]}
                  />
                  <Select 
                     label="AMC Eligible?" 
                     value={formData.amcOption}
                     onChange={(e) => handleInputChange('amcOption', e.target.value)}
                     options={[
                        { label: 'No', value: 'No' },
                        { label: 'Yes (Add AMC)', value: 'Yes' }
                     ]}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                     label="Start Date" 
                     type="date" 
                     value={formData.warrantyStartDate} 
                     readOnly 
                     className="bg-gray-50 opacity-70"
                  />
                  <Input 
                     label="Expiry Date" 
                     type="date" 
                     value={formData.warrantyExpiryDate} 
                     readOnly 
                     className="bg-gray-50 opacity-70"
                  />
               </div>
               <p className="text-[9px] text-gray-400 font-bold uppercase text-center px-4">Warranty dates are auto-calculated from your purchase date</p>
            </Card>
         </section>

         {/* Section: Extend Warranty (Optional at Registration) */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiShieldStarFill className="text-brand-pink w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Extend Warranty</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm bg-brand-pink/[0.02]">
               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input 
                        type="checkbox" 
                        checked={formData.extendWarranty}
                        onChange={(e) => handleInputChange('extendWarranty', e.target.checked)}
                        className="w-5 h-5 accent-brand-pink rounded"
                     />
                     <span className="text-[12px] font-black text-gray-800 uppercase tracking-wider group-hover:text-brand-pink transition-colors">
                        Add Extended Warranty
                     </span>
                  </label>
               </div>

               {formData.extendWarranty && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="grid grid-cols-3 gap-3">
                        {['6', '12', '24'].map(months => (
                           <button
                              key={months}
                              type="button"
                              onClick={() => handleInputChange('extensionMonths', months)}
                              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                                 formData.extensionMonths === months 
                                 ? 'border-brand-pink bg-brand-pink/5 shadow-lg' 
                                 : 'border-gray-100 bg-white hover:border-brand-pink/30'
                              }`}
                           >
                              <p className="text-lg font-black text-gray-800">{months === '6' ? '6' : months === '12' ? '1' : '2'}</p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{months === '6' ? 'Months' : months === '12' ? 'Year' : 'Years'}</p>
                              <p className="text-[11px] font-black text-brand-pink mt-2">₹{extensionPricing[months]?.standard}</p>
                           </button>
                        ))}
                     </div>
                     <Select
                        label="Extension Type"
                        value={formData.extensionType}
                        onChange={(e) => handleInputChange('extensionType', e.target.value)}
                        options={[
                           { label: 'Standard Coverage', value: 'standard' },
                           { label: 'Premium (Parts + Labor)', value: 'premium' }
                        ]}
                     />
                  </div>
               )}
            </Card>
         </section>

         {/* Section: Customer Details */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiSmartphoneFill className="text-brand-teal w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Customer Details</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm">
               <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={errors.customerName}
                  required
               />
               <div className="grid grid-cols-2 gap-4">
                  <Input
                     label="Mobile Number"
                     placeholder="10-digit number"
                     value={formData.mobileNumber}
                     onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                     error={errors.mobileNumber}
                     required
                  />
                  <Input
                     label="Email (Optional)"
                     placeholder="you@email.com"
                     value={formData.email}
                     onChange={(e) => handleInputChange('email', e.target.value)}
                     error={errors.email}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Input
                     label="City"
                     placeholder="e.g. Mumbai"
                     value={formData.city}
                     onChange={(e) => handleInputChange('city', e.target.value)}
                     error={errors.city}
                     required
                  />
                  <Input
                     label="State"
                     placeholder="e.g. Maharashtra"
                     value={formData.state}
                     onChange={(e) => handleInputChange('state', e.target.value)}
                     error={errors.state}
                     required
                  />
               </div>
            </Card>
         </section>

         {/* Section: Installation */}
         <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
               <RiMapPinFill className="text-brand-teal w-5 h-5" />
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Installation Status</h3>
            </div>
            <Card className="rounded-[28px] p-5 space-y-4 border-gray-100 shadow-sm">
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                     label="Installation Date" 
                     type="date"
                     value={formData.installationDate}
                     onChange={(e) => handleInputChange('installationDate', e.target.value)}
                  />
                  <Select 
                     label="Installed By" 
                     value={formData.installedBy}
                     onChange={(e) => handleInputChange('installedBy', e.target.value)}
                     options={[
                        { label: 'Company Service', value: 'Company' },
                        { label: 'Local Technician', value: 'Local' },
                        { label: 'Self Installed', value: 'Self' }
                     ]}
                  />
               </div>
            </Card>
         </section>

         <div className="flex flex-col gap-3 mt-4">
            <Button
               loading={loading}
               onClick={handleRegister}
               className="w-full h-14 rounded-full font-black text-[15px] shadow-xl shadow-brand-teal/20"
               icon={RiVerifiedBadgeFill}
            >
               Activate Warranty
            </Button>
            <div className="flex items-center justify-center gap-2 pt-1 opacity-50">
               <RiHandHeartFill className="text-brand-pink w-3 h-3" />
               <p className="text-[8px] text-center font-bold text-gray-400 uppercase tracking-widest">Ogun Certified Warranty Registration</p>
            </div>
         </div>
      </div>
   );
}
