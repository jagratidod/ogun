const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  registeredProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisteredProduct',
    required: [true, 'Registered product is required']
  },
  issueCategory: {
    type: String,
    required: [true, 'Issue category is required']
    // mot = Motor Issue, noi = Noise, spa = Spare Part, ins = Installation
  },
  issueDescription: {
    type: String,
    required: [true, 'Issue description is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  serviceAddress: {
    type: String
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  adminRemarks: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  history: [{
    status: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionImages: [{
    url: String,
    public_id: String
  }]
}, {
  timestamps: true
});

// Auto-generate ticket ID before saving
serviceRequestSchema.pre('save', async function () {
  if (this.isNew && !this.ticketId) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.ticketId = `SRV-${String(count + 1).padStart(3, '0')}`;
  }
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
