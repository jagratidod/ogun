import { useState, useMemo, useEffect } from 'react';
import {
   RiTruckLine, RiSearchLine, RiFilterLine,
   RiEyeLine, RiFileDownloadLine, RiFilter2Line,
   RiCheckDoubleLine, RiCloseLine, RiInboxArchiveLine,
   RiArrowDownSLine, RiMapPinLine, RiUserLine, RiHistoryLine
} from 'react-icons/ri';
import {
   PageHeader, Card, CardHeader, CardTitle, CardDescription,
   DataTable, Badge, Button, Input, Select, useSearch, useSort,
   usePagination, formatDateTime, Modal, useModal
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AllShipmentsPage() {
   const navigate = useNavigate();
   const [shipments, setShipments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState('all');
   const { isOpen, open, close, data: selectedShipment } = useModal();

   useEffect(() => {
      fetchShipments();
   }, []);

   const fetchShipments = async () => {
      try {
         setLoading(true);
         const res = await logisticsService.getAllShipments();
         setShipments(res.data || []);
      } catch (error) {
         toast.error('Failed to fetch shipments');
      } finally {
         setLoading(false);
      }
   };

   const filteredBySelects = useMemo(() => {
      return shipments.filter(s => {
         return statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
      });
   }, [shipments, statusFilter]);

   const { query, setQuery, filteredData } = useSearch(filteredBySelects, ['shipmentId', 'recipient.name', 'recipient.businessName', 'carrier', 'trackingNumber']);
   const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'createdAt', 'desc');
   const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);

   const columns = [
      {
         key: 'shipmentId', label: 'Shipment ID', sortable: true, render: (val) => (
            <span className="font-bold text-content-primary p-2 bg-surface-secondary/50 border border-border/50">{val}</span>
         )
      },
      {
         key: 'createdAt', label: 'Dispatched', sortable: true, render: (val) => {
            const dateObj = formatDateTime(val);
            return (
               <div className="flex flex-col">
                  <span className="text-sm font-medium text-content-primary">{dateObj.split(',')[0]}</span>
                  <span className="text-[10px] text-content-tertiary">{dateObj.split(',')[1]}</span>
               </div>
            );
         }
      },
      { 
         key: 'recipient', label: 'Route (Sender → Recipient)', render: (_, row) => (
            <div className="flex flex-col">
               <div className="flex items-center gap-1">
                  <Badge variant="info" className="text-[8px] py-0">Admin</Badge>
                  <span className="text-[10px] text-content-tertiary">→</span>
                  <span className="text-sm font-bold text-content-primary">{row.recipient?.businessName || row.recipient?.name}</span>
               </div>
               <span className="text-[10px] text-content-tertiary mt-1 flex items-center gap-1">
                  <RiMapPinLine className="w-3 h-3" /> {row.recipient?.location || 'General Route'}
               </span>
            </div>
         )
      },
      {
         key: 'carrier', label: 'Logistics Info', render: (_, row) => (
            <div className="flex flex-col">
               <span className="text-sm font-medium text-content-primary">{row.carrier || 'N/A'}</span>
               <span className="text-[10px] text-content-tertiary font-mono">TRK: {row.trackingNumber || 'PENDING'}</span>
            </div>
         )
      },
      {
         key: 'status', label: 'Status', render: (val) => {
            const statusMap = {
               'Pending': 'warning',
               'In Transit': 'info',
               'Out for Delivery': 'teal',
               'Delivered': 'success',
               'Cancelled': 'danger'
            };
            return <Badge variant={statusMap[val] || 'secondary'}>{val}</Badge>;
         }
      },
      {
         key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
            <div className="flex justify-end gap-2">
               <Button variant="secondary" size="xs" icon={RiEyeLine} onClick={() => navigate(`/logistics/shipments/${row._id}`)}>Details</Button>
            </div>
         )
      }
   ];

   return (
      <div className="page-container">
         <PageHeader
            title="Global Shipment Pipeline"
            subtitle="Track and manage every unit moving through the OGUN supply chain"
         >
            <div className="flex gap-2">
               <Button icon={RiFileDownloadLine} variant="secondary">Export Logs</Button>
               <Button icon={RiTruckLine} variant="primary">New Dispatch</Button>
            </div>
         </PageHeader>

         <Card>
            <CardHeader className="pb-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3">
                     <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                           { label: 'All Shipments', value: 'all' },
                           { label: 'Pending', value: 'Pending' },
                           { label: 'In Transit', value: 'In Transit' },
                           { label: 'Out for Delivery', value: 'Out for Delivery' },
                           { label: 'Delivered', value: 'Delivered' },
                           { label: 'Cancelled', value: 'Cancelled' }
                        ]}
                        className="w-48"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="relative group">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-brand-teal transition-colors" />
                        <Input
                           placeholder="Search ID, Tracking, Destination..."
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                           className="pl-10 w-72 h-10"
                        />
                     </div>
                  </div>
               </div>
            </CardHeader>
            
            <DataTable
               columns={columns}
               data={paginatedData}
               sortKey={sortKey}
               sortDirection={sortDirection}
               onSort={requestSort}
               loading={loading}
               onRowClick={(row) => navigate(`/logistics/shipments/${row._id}`)}
            />
            
            <div className="p-4 border-t border-border flex items-center justify-between bg-surface-secondary/20">
               <span className="text-[11px] font-medium text-content-tertiary">
                  Displaying {startIndex}-{endIndex} of {totalItems} shipments in network
               </span>
               <div className="flex gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || totalPages <= 1}>Back</Button>
                  <div className="flex items-center px-4 bg-surface-secondary text-[11px] font-bold border border-border">Page {currentPage} of {totalPages}</div>
                  <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages <= 1}>Next</Button>
               </div>
            </div>
         </Card>

         <Modal
            isOpen={isOpen}
            onClose={close}
            size="lg"
            title={`Shipment Profile: ${selectedShipment?.shipmentId}`}
         >
            <div className="space-y-6 py-2">
               {/* Transit Overview */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-secondary border border-border">
                     <p className="text-[9px] text-content-tertiary uppercase font-black tracking-widest mb-1">Origin (Sender)</p>
                     <h4 className="text-sm font-bold text-content-primary">Central Logistics Hub</h4>
                     <p className="text-[10px] text-content-tertiary">Admin Authority</p>
                  </div>
                  <div className="p-4 bg-brand-teal/5 border border-brand-teal/20">
                     <p className="text-[9px] text-brand-teal uppercase font-black tracking-widest mb-1">Destination (Recipient)</p>
                     <h4 className="text-sm font-bold text-content-primary">{selectedShipment?.recipient?.businessName}</h4>
                     <p className="text-[10px] text-content-tertiary">{selectedShipment?.recipient?.location}</p>
                  </div>
               </div>

               {/* Tracking Timeline Placeholder */}
               <div className="p-6 border border-border bg-surface-elevated">
                  <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                     <RiHistoryLine /> Transit Timeline
                  </h5>
                  <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                     <div className="flex items-start gap-4 relative">
                        <div className="w-[24px] h-[24px] rounded-full bg-success flex items-center justify-center border-4 border-white z-10">
                           <RiCheckDoubleLine className="text-white w-3 h-3" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-content-primary">Dispatched from Hub</p>
                           <p className="text-[10px] text-content-tertiary">{formatDateTime(selectedShipment?.dispatchedAt)}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 relative">
                        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center border-4 border-white z-10 ${selectedShipment?.status === 'Delivered' ? 'bg-success' : 'bg-warning'}`}>
                           {selectedShipment?.status === 'Delivered' ? <RiCheckDoubleLine className="text-white w-3 h-3" /> : <RiTruckLine className="text-white w-3 h-3" />}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-content-primary">{selectedShipment?.status}</p>
                           <p className="text-[10px] text-content-tertiary">Current update via {selectedShipment?.carrier || 'Carrier'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Product Manifest */}
               <div>
                  <h5 className="text-[10px] text-content-tertiary uppercase font-black tracking-widest mb-3">Shipment Manifest</h5>
                  <div className="border border-border divide-y divide-border max-h-[200px] overflow-y-auto">
                     {selectedShipment?.products?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-surface-secondary/30">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-surface-secondary flex items-center justify-center text-xs font-bold text-content-tertiary border border-border">
                                 {idx + 1}
                              </div>
                              <span className="text-xs font-medium text-content-primary">{item.product?.name}</span>
                           </div>
                           <span className="text-xs font-black text-brand-teal">{item.quantity} Units</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-between items-center pt-4 border-t border-border">
                   <div className="flex items-center gap-2">
                       <RiUserLine className="text-content-tertiary" />
                       <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-widest">No Agent Assigned</span>
                   </div>
                   <Button size="sm">Assign Delivery Agent</Button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
