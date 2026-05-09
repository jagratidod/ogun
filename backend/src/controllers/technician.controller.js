const ServiceRequest = require('../models/serviceRequest.model');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get all tickets assigned to the logged-in technician
 * @route   GET /api/v1/technician/my-tickets
 */
exports.getMyTickets = catchAsync(async (req, res) => {
  const tickets = await ServiceRequest.find({ assignedTechnician: req.user._id })
    .populate('customer', 'name phone email')
    .populate('registeredProduct', 'productName serialNumber modelNumber')
    .populate('spareParts.product', 'name sku')
    .sort('-updatedAt');

  return ApiResponse.success(res, tickets, 'Tickets fetched successfully');
});

/**
 * @desc    Update ticket status (Reached Site, Diagnosis, etc.)
 * @route   PATCH /api/v1/technician/tickets/:id/status
 */
exports.updateTicketStatus = catchAsync(async (req, res) => {
  const { status, note, technicianNotes } = req.body;
  const ticket = await ServiceRequest.findOne({ 
    _id: req.params.id, 
    assignedTechnician: req.user._id 
  });

  if (!ticket) return ApiResponse.error(res, 'Ticket not found or not assigned to you', 404);

  if (status) ticket.status = status;
  if (technicianNotes) ticket.technicianNotes = technicianNotes;

  ticket.history.push({
    status: status || ticket.status,
    note: note || `Updated by technician: ${status}`,
    updatedBy: req.user._id
  });

  await ticket.save();
  return ApiResponse.success(res, ticket, 'Ticket status updated');
});

/**
 * @desc    Request spare parts for a ticket
 * @route   POST /api/v1/technician/tickets/:id/spare-parts
 */
exports.requestSpareParts = catchAsync(async (req, res) => {
  const { parts } = req.body; // Array of { product, quantity }
  const ticket = await ServiceRequest.findOne({ 
    _id: req.params.id, 
    assignedTechnician: req.user._id 
  });

  if (!ticket) return ApiResponse.error(res, 'Ticket not found', 404);

  // Add new parts to the request list
  parts.forEach(p => {
    ticket.spareParts.push({
      product: p.product,
      quantity: p.quantity,
      status: 'Pending'
    });
  });

  ticket.status = 'Parts Pending';
  ticket.history.push({
    status: 'Parts Pending',
    note: `Spare parts requested: ${parts.length} items`,
    updatedBy: req.user._id
  });

  await ticket.save();
  return ApiResponse.success(res, ticket, 'Spare parts requested successfully');
});

/**
 * @desc    Submit final resolution with images
 * @route   PATCH /api/v1/technician/tickets/:id/resolve
 */
exports.resolveTicket = catchAsync(async (req, res) => {
  const { resolutionNotes, images } = req.body;
  const ticket = await ServiceRequest.findOne({ 
    _id: req.params.id, 
    assignedTechnician: req.user._id 
  });

  if (!ticket) return ApiResponse.error(res, 'Ticket not found', 404);

  ticket.status = 'Resolved';
  ticket.technicianNotes = resolutionNotes;
  ticket.resolvedAt = Date.now();
  
  if (images && images.length) {
    ticket.resolutionImages = images.map(img => ({ url: img }));
  }

  ticket.history.push({
    status: 'Resolved',
    note: 'Technician confirmed resolution on-site',
    updatedBy: req.user._id
  });

  await ticket.save();
  return ApiResponse.success(res, ticket, 'Ticket resolved successfully');
});
