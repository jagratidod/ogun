const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const payrollController = require('../controllers/payroll.controller');
const { protect, restrictTo, checkPermission } = require('../middleware/auth.middleware');

// Protect all HR routes
router.use(protect);
router.use(restrictTo('admin'));

// Protect all HR routes
router.use(protect);
router.use(restrictTo('admin'));

// Employee Management
router.get('/employees', checkPermission('hr'), hrController.getEmployees);
router.get('/employees/list', hrController.getEmployees); // Simple list for dropdowns
router.get('/departments', checkPermission('hr'), hrController.getDepartments);

// Leave Management
router.get('/leaves', checkPermission('hr'), hrController.getAllLeaves);
router.patch('/leaves/:id/review', checkPermission('hr'), hrController.reviewLeave);

// Self Leave
router.get('/my-leaves', hrController.getMyLeaves);
router.post('/my-leaves', hrController.applyMyLeave);

// ── Payroll Routes ──────────────────────────────────────
router.get('/payroll/stats', payrollController.getPayrollStats);
router.get('/payroll/employees', payrollController.getEmployeeSalaries);
router.patch('/payroll/employees/:id', payrollController.updateEmployeeSalary);
router.get('/payroll/preview', payrollController.previewPayroll);
router.post('/payroll/runs', payrollController.runPayroll);
router.get('/payroll/runs', payrollController.getPayrollRuns);
router.get('/payroll/runs/:id', payrollController.getPayrollRun);
router.patch('/payroll/runs/:id/approve', payrollController.approvePayroll);
router.patch('/payroll/runs/:runId/records/:recordId/pay', payrollController.payIndividualEmployee);
router.delete('/payroll/runs/:id', payrollController.deletePayrollRun);




module.exports = router;

