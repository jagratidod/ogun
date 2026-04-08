export const ROLES = {
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer',
  CUSTOMER: 'customer',
};

export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const SERVICE_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

export const RESTOCK_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISPATCHED: 'dispatched',
  RECEIVED: 'received',
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const DEPARTMENTS = [
  'Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Service', 'IT', 'Logistics',
];

export const PRODUCT_CATEGORIES = [
  'Mixer Grinder', 'Toaster', 'Microwave Oven', 'Induction Cooktop',
  'Chimney', 'Dishwasher', 'Water Purifier', 'Air Fryer',
  'Electric Kettle', 'Hand Blender', 'Juicer', 'Rice Cooker',
  'Sandwich Maker', 'Coffee Maker', 'Food Processor',
];

export const LEAVE_TYPES = [
  'Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Off',
];

export const STATUS_COLORS = {
  active: 'badge-success',
  inactive: 'badge-danger',
  pending: 'badge-warning',
  completed: 'badge-success',
  placed: 'badge-info',
  confirmed: 'badge-teal',
  dispatched: 'badge-warning',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
  open: 'badge-warning',
  assigned: 'badge-info',
  in_progress: 'badge-teal',
  closed: 'badge-success',
  approved: 'badge-success',
  rejected: 'badge-danger',
  requested: 'badge-warning',
  received: 'badge-success',
  overdue: 'badge-danger',
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-danger',
  critical: 'badge-danger',
};

export const APP_NAME = 'OGUN CRM';
