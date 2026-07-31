import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Booking = lazy(() => import('./pages/Booking'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminBarbers = lazy(() => import('./pages/admin/Barbers'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const Schedule = lazy(() => import('./pages/admin/Schedule'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

const PageLoader = () => (
  <div className="min-h-screen bg-matte-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      <p className="text-gold font-bold tracking-widest uppercase text-xs animate-pulse">Učitavanje... Dobrodošli</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* User Routes - All Protected */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Home /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/services" element={
              <ProtectedRoute>
                <MainLayout><Services /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/book" element={
              <ProtectedRoute>
                <MainLayout><Booking /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />

            {/* Admin Routes - Protected by role */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="barbers" element={<AdminBarbers />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="services" element={<AdminServices />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
