const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technician.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes are protected and restricted to technicians or admin
router.use(protect);
router.use(restrictTo('technician', 'admin'));

router.get('/my-tickets', technicianController.getMyTickets);
router.patch('/tickets/:id/status', technicianController.updateTicketStatus);
router.post('/tickets/:id/spare-parts', technicianController.requestSpareParts);
router.patch('/tickets/:id/resolve', technicianController.resolveTicket);

module.exports = router;
