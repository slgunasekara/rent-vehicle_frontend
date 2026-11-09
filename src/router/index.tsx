import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { RequireRole } from './Guards';
import Home from '../pages/public/Home';

// every page except the home page loads on demand, so the first visit downloads far less
const Login = lazy(() => import('../pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/auth/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const Find = lazy(() => import('../pages/public/Find'));
const VehicleDetails = lazy(() => import('../pages/public/VehicleDetails'));
const Contact = lazy(() => import('../pages/public/Contact'));
const About = lazy(() => import('../pages/public/About'));
const Policies = lazy(() => import('../pages/public/Policies'));
const PostAd = lazy(() => import('../pages/account/PostAd'));
const MyAds = lazy(() => import('../pages/account/MyAds'));
const Saved = lazy(() => import('../pages/account/Saved'));
const Account = lazy(() => import('../pages/account/Account'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminAds = lazy(() => import('../pages/admin/AdminAds'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminMessages = lazy(() => import('../pages/admin/AdminMessages'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
const AdminTeam = lazy(() => import('../pages/admin/AdminTeam'));

function PageLoading() {
  return <div className="grid min-h-screen place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" aria-label="Loading" /></div>;
}

/** every URL of the app: public pages, the signed-in pages (post / my ads / account) and the Company console (admin only) */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/find" element={<Find />} />
        <Route path="/vehicle/:id" element={<VehicleDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/post" element={<RequireRole><PostAd /></RequireRole>} />
        <Route path="/post/:id" element={<RequireRole><PostAd /></RequireRole>} />
        <Route path="/my-ads" element={<RequireRole><MyAds /></RequireRole>} />
        <Route path="/saved" element={<RequireRole><Saved /></RequireRole>} />
        <Route path="/account" element={<RequireRole><Account /></RequireRole>} />
        <Route path="/admin" element={<RequireRole roles={['admin']}><DashboardLayout /></RequireRole>}>
          <Route index element={<AdminDashboard />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="team" element={<AdminTeam />} />
        </Route>
        <Route path="*" element={<div className="grid min-h-screen place-items-center text-center"><div><p className="text-6xl font-extrabold text-brand-500">404</p><p className="mt-2 text-slate-600">Page not found</p><a href="/" className="btn-primary mt-4">Go home</a></div></div>} />
      </Routes>
    </Suspense>
  );
}
