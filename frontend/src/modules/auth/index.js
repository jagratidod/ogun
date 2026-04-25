import LaunchpadPage from './pages/LaunchpadPage';

export const authRoutes = [
  { path: '/login', element: <LaunchpadPage /> },
];

export { default as LaunchpadPage } from './pages/LaunchpadPage';
export { default as HRLoginPage } from './pages/HRLoginPage';
export { default as ServiceLoginPage } from './pages/ServiceLoginPage';
export { default as SalesLoginPage } from './pages/SalesLoginPage';
