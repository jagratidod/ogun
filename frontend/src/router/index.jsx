import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../core/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../core/components/layout/AdminLayout';
import DistributorLayout from '../core/components/layout/DistributorLayout';
import RetailerLayout from '../core/components/layout/RetailerLayout';
import CustomerLayout from '../core/components/layout/CustomerLayout';

// Auth
import LaunchpadPage from '../modules/auth/pages/LaunchpadPage';
import AdminLoginPage from '../modules/auth/pages/AdminLoginPage';
import AdminSignUpPage from '../modules/auth/pages/AdminSignUpPage';
import AdminForgotPasswordPage from '../modules/auth/pages/AdminForgotPasswordPage';
import DistributorLoginPage from '../modules/auth/pages/DistributorLoginPage';
import DistributorSignUpPage from '../modules/auth/pages/DistributorSignUpPage';
import RetailerLoginPage from '../modules/auth/pages/RetailerLoginPage';
import RetailerSignUpPage from '../modules/auth/pages/RetailerSignUpPage';
import CustomerLoginPage from '../modules/customer/pages/CustomerLoginPage';
import CustomerRegisterPage from '../modules/customer/pages/CustomerRegisterPage';
import CustomerForgotPasswordPage from '../modules/customer/pages/CustomerForgotPasswordPage';
import SalesLoginPage from '../modules/auth/pages/SalesLoginPage';
import UnauthorizedPage from '../modules/auth/pages/UnauthorizedPage';

// Stub for unbuilt modules
import StubPage from '../modules/shared/StubPage';

import {
  AdminDashboardPage, UsersPage,
  ProductsPage, StockOverview, StockAlerts, OrderListPage,
  RestockRequestsPage, OrderFlowPage, LedgerPage, InvoicesPage,
  PaymentsPage, FinancialReportPage, EmployeesPage, DepartmentsPage,
  PayrollDashboardPage, SalaryProcessPage, LeaveRequestsPage,
  LeaveCalendarPage, RewardsDashboardPage, TargetConfigPage,
  PointsHistoryPage, ServiceRequestsPage, ServiceDetailPage,
  ServiceAnalyticsPage, DistributorListPage, RetailerListPage,
  CustomerListPage, ReportsPage, AdminSettingsPage, PayslipsPage, DeductionsPage, OfferLettersPage, SocialGridManagerPage,
  AdminProductQueriesPage, SalesRepsPage
} from '../modules/admin';

import {
  DistributorDashboardPage, DistributorStockPage, IncomingRequestsPage,
  DispatchPage, DistOrderHistoryPage, MyRetailersPage,
  DistLedgerPage, DistPaymentsPage, DistRewardsPage,
  DistAnalyticsPage, DistSettingsPage, BrowseAdminProducts, MyOrdersPage,
  DistributorProductQueriesPage
} from '../modules/distributor';

import {
  RetailerDashboardPage, NewSalePage, SalesHistoryPage,
  RetailerStockPage, RestockRequestPage, RetailerLedgerPage,
  RetailerCustomersPage, RetailerRewardsPage, RetailerAnalyticsPage,
  RetailerSettingsPage, BrowseDistributorProducts,
  RetailerQueriesPage, RetailerOrdersPage
} from '../modules/retailer';

import {
  SalesDashboardPage, RetailerListPage as SalesRetailerListPage, AddRetailerPage,
  SalesTerminalPage, SalesProfilePage
} from '../modules/sales';

import SalesLayout from '../core/components/layout/SalesLayout';
import CustomerHomePage from '../modules/customer/pages/CustomerHomePage';
import RegisterProductPage from '../modules/customer/pages/RegisterProductPage';
import MyProductsPage from '../modules/customer/pages/MyProductsPage';
import ProductDetailPage from '../modules/customer/pages/ProductDetailPage';
import RaiseComplaintPage from '../modules/customer/pages/RaiseComplaintPage';
import MyServiceRequestsPage from '../modules/customer/pages/MyServiceRequestsPage';
import ServiceRequestDetailPage from '../modules/customer/pages/ServiceRequestDetailPage';
import CustomerSettingsPage from '../modules/customer/pages/CustomerSettingsPage';
import CustomerSocialPage from '../modules/customer/pages/CustomerSocialPage';

import SplashPage from '../modules/shared/SplashPage';

// ─── Placeholder component generator ──────────────────
function Stub(title) {
  return () => <StubPage title={title} />;
}

// ─── Admin stubs ───────────────────────────────────────
const AdminDashboard = () => <AdminDashboardPage />;
const Users = () => <UsersPage />;
const Products = () => <ProductsPage />;
const StockOverviewComp = () => <StockOverview />;
const StockAlertsComp = () => <StockAlerts />;
const OrderList = () => <OrderListPage />;
const RestockRequests = () => <RestockRequestsPage />;
const OrderFlow = () => <OrderFlowPage />;
const OrderDetailPage = Stub('Order Detail'); 
const Ledger = () => <LedgerPage />;
const Invoices = () => <InvoicesPage />;
const Payments = () => <PaymentsPage />;
const FinancialReport = () => <FinancialReportPage />;
const Employees = () => <EmployeesPage />;
const EmployeeDetailPage = Stub('Employee Detail'); 
const OfferLetters = () => <OfferLettersPage />;
const Departments = () => <DepartmentsPage />;
const PayrollDashboard = () => <PayrollDashboardPage />;
const SalaryProcess = () => <SalaryProcessPage />;
const Payslips = () => <PayslipsPage />;
const Deductions = () => <DeductionsPage />;
const LeaveRequests = () => <LeaveRequestsPage />;
const LeaveCalendar = () => <LeaveCalendarPage />;
const RewardsDashboard = () => <RewardsDashboardPage />;
const TargetConfig = () => <TargetConfigPage />;
const PointsHistory = () => <PointsHistoryPage />;
const ServiceRequests = () => <ServiceRequestsPage />;
const ServiceDetail = () => <ServiceDetailPage />;
const ServiceAnalytics = () => <ServiceAnalyticsPage />;
const DistributorList = () => <DistributorListPage />;
const DistributorDetailPage = Stub('Distributor Detail'); 
const RetailerList = () => <RetailerListPage />;
const RetailerDetailPage = Stub('Retailer Detail'); 
const CustomerList = () => <CustomerListPage />;
const CustomerDetailPage = Stub('Customer Detail'); 
const Reports = () => <ReportsPage />;
const AdminSettings = () => <AdminSettingsPage />;
const SocialGridManager = () => <SocialGridManagerPage />;
const AdminProductQueries = () => <AdminProductQueriesPage />;
const SalesReps = () => <SalesRepsPage />;

// ─── Distributor real pages ───────────────────────────
const DistDashboard = () => <DistributorDashboardPage />;
const DistStock = () => <DistributorStockPage />;
const IncomingReqs = () => <IncomingRequestsPage />;
const Dispatch = () => <DispatchPage />;
const DistOrders = () => <DistOrderHistoryPage />;
const MyRetailers = () => <MyRetailersPage />;
const MyRetailerDetailPage = Stub('Retailer Detail'); 
const DistLedger = () => <DistLedgerPage />;
const DistPayments = () => <DistPaymentsPage />;
const DistRewards = () => <DistRewardsPage />;
const DistAnalytics = () => <DistAnalyticsPage />;
const DistSettings = () => <DistSettingsPage />;
const BrowseMarketplace = () => <BrowseAdminProducts />;
const MyOrders = () => <MyOrdersPage />;
const DistProductQueries = () => <DistributorProductQueriesPage />;

// ─── Retailer real pages ───────────────────────────
const RetailDashboard = () => <RetailerDashboardPage />;
const NewSale = () => <NewSalePage />;
const SalesHistory = () => <SalesHistoryPage />;
const RetailStock = () => <RetailerStockPage />;
const RestockReq = () => <RestockRequestPage />;
const RetailLedger = () => <RetailerLedgerPage />;
const RetailCustomers = () => <RetailerCustomersPage />;
const RetailRewards = () => <RetailerRewardsPage />;
const RetailerQueries = () => <RetailerQueriesPage />;
const RetailAnalytics = () => <RetailerAnalyticsPage />;
const RetailSettings = () => <RetailerSettingsPage />;

// ─── Customer real pages ───────────────────────────
const CustomerHome = () => <CustomerHomePage />;
const RegisterProduct = () => <RegisterProductPage />;
const MyProducts = () => <MyProductsPage />;
const ProductDetail = () => <ProductDetailPage />;
const RaiseComplaint = () => <RaiseComplaintPage />;
const MyServiceReqs = () => <MyServiceRequestsPage />;
const ServiceReqDetail = () => <ServiceRequestDetailPage />;
const CustomerSettings = () => <CustomerSettingsPage />;
const CustomerSocial = () => <CustomerSocialPage />;


function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuthContext();
  
  if (loading) return null; // Wait for auth initialization
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  switch (user?.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'distributor': return <Navigate to="/distributor" replace />;
    case 'retailer': return <Navigate to="/retailer" replace />;
    case 'sales_executive': return <Navigate to="/sales" replace />;
    case 'customer': return <Navigate to="/customer" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect Root to Business Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LaunchpadPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
        
        {/* Distributor Auth */}
        <Route path="/distributor/login" element={<DistributorLoginPage />} />
        <Route path="/distributor/signup" element={<DistributorSignUpPage />} />

        {/* Retailer Auth */}
        <Route path="/retailer/login" element={<RetailerLoginPage />} />
        <Route path="/retailer/signup" element={<RetailerSignUpPage />} />

        <Route path="/sales/login" element={<SalesLoginPage />} />

        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route path="/customer/register" element={<CustomerRegisterPage />} />
        <Route path="/customer/forgot-password" element={<CustomerForgotPasswordPage />} />
        <Route path="/splash" element={<SplashPage />} />
        
        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/admin/unauthorized" element={<UnauthorizedPage isAdmin />} />

        {/* User Auth Redirect */}
        <Route path="/home" element={<RootRedirect />} />

        {/* ═══ ADMIN ROUTES ═══ */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="rbac/users" element={<Users />} />
          <Route path="inventory/products" element={<Products />} />
          <Route path="inventory/stock" element={<StockOverviewComp />} />
          <Route path="inventory/alerts" element={<StockAlertsComp />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="orders/restock" element={<RestockRequests />} />
          <Route path="orders/flow" element={<OrderFlow />} />
          <Route path="inventory/queries" element={<AdminProductQueries />} />
          <Route path="accounts/ledger" element={<Ledger />} />
          <Route path="accounts/invoices" element={<Invoices />} />
          <Route path="accounts/payments" element={<Payments />} />
          <Route path="accounts/reports" element={<FinancialReport />} />
          <Route path="hr/employees" element={<Employees />} />
          <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="hr/offer-letters" element={<OfferLetters />} />
          <Route path="hr/departments" element={<Departments />} />
          <Route path="payroll" element={<PayrollDashboard />} />
          <Route path="payroll/process" element={<SalaryProcess />} />
          <Route path="payroll/payslips" element={<Payslips />} />
          <Route path="payroll/deductions" element={<Deductions />} />
          <Route path="leaves" element={<LeaveRequests />} />
          <Route path="leaves/calendar" element={<LeaveCalendar />} />
          <Route path="rewards" element={<RewardsDashboard />} />
          <Route path="rewards/targets" element={<TargetConfig />} />
          <Route path="rewards/history" element={<PointsHistory />} />
          <Route path="distributors" element={<DistributorList />} />
          <Route path="distributors/:id" element={<DistributorDetailPage />} />
          <Route path="retailers" element={<RetailerList />} />
          <Route path="retailers/:id" element={<RetailerDetailPage />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="sales-reps" element={<SalesReps />} />
          <Route path="service" element={<ServiceRequests />} />
          <Route path="service/:id" element={<ServiceDetail />} />
          <Route path="service/analytics" element={<ServiceAnalytics />} />
          <Route path="content/social-grid" element={<SocialGridManager />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ═══ DISTRIBUTOR ROUTES ═══ */}
        <Route path="/distributor" element={
          <ProtectedRoute allowedRoles={['distributor']}>
            <DistributorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DistDashboard />} />
          <Route path="stock" element={<DistStock />} />
          <Route path="orders" element={<IncomingReqs />} />
          <Route path="orders/dispatch" element={<Dispatch />} />
          <Route path="orders/history" element={<DistOrders />} />
          <Route path="marketplace" element={<BrowseMarketplace />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="queries" element={<DistProductQueries />} />
          <Route path="retailers" element={<MyRetailers />} />
          <Route path="retailers/:id" element={<MyRetailerDetailPage />} />
          <Route path="accounts" element={<DistLedger />} />
          <Route path="accounts/payments" element={<DistPayments />} />
          <Route path="rewards" element={<DistRewards />} />
          <Route path="analytics" element={<DistAnalytics />} />
          <Route path="settings" element={<DistSettings />} />
        </Route>

        {/* ═══ RETAILER ROUTES ═══ */}
        <Route path="/retailer" element={
          <ProtectedRoute allowedRoles={['retailer']}>
            <RetailerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RetailDashboard />} />
          <Route path="sales/new" element={<NewSale />} />
          <Route path="sales/history" element={<SalesHistory />} />
          <Route path="sales" element={<NewSale />} />
          <Route path="stock" element={<RetailStock />} />
          <Route path="stock/restock" element={<RestockReq />} />
          {/* Back-compat alias (dashboard deep-link) */}
          <Route path="restock" element={<RestockReq />} />
          <Route path="marketplace" element={<BrowseDistributorProducts />} />
          <Route path="queries" element={<RetailerQueries />} />
          <Route path="orders" element={<RetailerOrdersPage />} />
          <Route path="accounts" element={<RetailLedger />} />
          <Route path="customers" element={<RetailerCustomersPage />} />
          <Route path="rewards" element={<RetailRewards />} />
          <Route path="analytics" element={<RetailerAnalyticsPage />} />
          <Route path="settings" element={<RetailSettings />} />
        </Route>

        {/* ═══ SALES EXECUTIVE ROUTES ═══ */}
        <Route path="/sales" element={
          <ProtectedRoute allowedRoles={['sales_executive']}>
            <SalesLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SalesDashboardPage />} />
          <Route path="retailers" element={<SalesRetailerListPage />} />
          <Route path="retailers/add" element={<AddRetailerPage />} />
          <Route path="terminal" element={<SalesTerminalPage />} />
          <Route path="performance" element={<SalesDashboardPage />} /> {/* Reuse dashboard for now */}
          <Route path="rewards" element={<SalesDashboardPage />} /> {/* Reuse dashboard for now */}
          <Route path="profile" element={<SalesProfilePage />} />
        </Route>

        {/* ═══ CUSTOMER ROUTES ═══ */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerHome />} />
          <Route path="products/register" element={<RegisterProduct />} />
          <Route path="products" element={<MyProducts />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="service/raise" element={<RaiseComplaint />} />
          <Route path="service" element={<MyServiceReqs />} />
          <Route path="service/:id" element={<ServiceReqDetail />} />
          <Route path="social" element={<CustomerSocial />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
