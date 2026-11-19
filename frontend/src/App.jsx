import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import BottomTabBar from './components/layout/BottomTabBar';
import FloatingCartBar from './components/cart/FloatingCartBar';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/student/HomePage';
import BreakPlannerPage from './pages/student/BreakPlannerPage';
import OutletsListPage from './pages/student/OutletsListPage';
import OutletMenuPage from './pages/student/OutletMenuPage';
import CartPage from './pages/student/CartPage';
import CheckoutPage from './pages/student/CheckoutPage';
import LiveOrderTrackingPage from './pages/student/LiveOrderTrackingPage';
import OrdersHistoryPage from './pages/student/OrdersHistoryPage';
import ProfilePage from './pages/student/ProfilePage';
import VendorPortalPage from './pages/vendor/VendorPortalPage';
import ImageCheckPage from './pages/dev/ImageCheckPage';

// Loading spinner for auth transitions
const PageLoading = () => (
  <div className="min-h-screen bg-[#FBF6EC] flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
    <span className="font-mono text-xs uppercase tracking-wider text-text-muted">Loading UniBites...</span>
  </div>
);

// Protected Student Route Guard
const StudentRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'vendor') return <Navigate to="/vendor" replace />;
  return children;
};

// Protected Vendor Route Guard
const VendorRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'vendor') return <Navigate to="/home" replace />;
  return children;
};

// Main Landing & Home Route (Accessible directly by visitors and students)
const HomeOrVendorRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (isAuthenticated && role === 'vendor') return <Navigate to="/vendor" replace />;
  return <HomePage />;
};

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isVendorPage = location.pathname.startsWith('/vendor');
  const isDevPage = location.pathname.startsWith('/dev');
  const showStudentNav = !isAuthPage && !isVendorPage && !isDevPage;

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#2B1B1F] flex flex-col font-sans selection:bg-accent/30 selection:text-primary">
      {/* Top Navbar for desktop & mobile header */}
      {showStudentNav && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Main Landing & Home Routes */}
          <Route path="/" element={<HomeOrVendorRedirect />} />
          <Route path="/home" element={<HomeOrVendorRedirect />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Student Routes */}
          <Route
            path="/break-planner"
            element={
              <StudentRoute>
                <BreakPlannerPage />
              </StudentRoute>
            }
          />
          <Route path="/outlets" element={<OutletsListPage />} />
          <Route
            path="/outlet/:id"
            element={
              <StudentRoute>
                <OutletMenuPage />
              </StudentRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <StudentRoute>
                <CartPage />
              </StudentRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <StudentRoute>
                <CheckoutPage />
              </StudentRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <StudentRoute>
                <LiveOrderTrackingPage />
              </StudentRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <StudentRoute>
                <OrdersHistoryPage />
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentRoute>
                <ProfilePage />
              </StudentRoute>
            }
          />

          {/* Protected Vendor Route */}
          <Route
            path="/vendor"
            element={
              <VendorRoute>
                <VendorPortalPage />
              </VendorRoute>
            }
          />

          {/* Dev-only Visual Image Audit Gallery (Unprotected) */}
          <Route path="/dev/image-check" element={<ImageCheckPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Cart Bar (when cart has items) */}
      {showStudentNav && <FloatingCartBar />}

      {/* Bottom Tab Bar for Mobile (<768px) */}
      {showStudentNav && <BottomTabBar />}
    </div>
  );
}

export default App;
