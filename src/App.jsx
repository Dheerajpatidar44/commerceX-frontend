import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, BarChart3, Boxes, Store, Users, UserCheck, DollarSign, Globe } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User pages
import HomePage from './pages/user/HomePage';
import ProductListingPage from './pages/user/ProductListingPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import WishlistPage from './pages/user/WishlistPage';
import CheckoutPage from './pages/user/CheckoutPage';
import { PaymentSuccessPage, PaymentFailurePage } from './pages/user/PaymentPages';
import OrdersPage from './pages/user/OrdersPage';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorProductForm from './pages/vendor/VendorProductForm';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorInventory from './pages/vendor/VendorInventory';
import VendorRevenue from './pages/vendor/VendorRevenue';
import VendorPending from './pages/vendor/VendorPending';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminAPISettings from './pages/admin/AdminAPISettings';

function ProtectedRoute({ children, allowedRoles, requireApproval }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  if (requireApproval && user.role === 'vendor' && user.approvalStatus !== 'approved') {
    return <Navigate to="/vendor/pending" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && (user.role === 'admin' || user.role === 'vendor')) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.approvalStatus === 'approved') return <Navigate to="/vendor/dashboard" replace />;
    return <Navigate to="/vendor/pending" replace />;
  }
  return children;
}

// Vendor sidebar links
const vendorLinks = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/products/add', label: 'Add Product', icon: PlusCircle },
  { to: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/vendor/inventory', label: 'Inventory', icon: Boxes },
  { to: '/vendor/revenue', label: 'Revenue', icon: BarChart3 },
];

// Admin sidebar links
const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { to: '/admin/api-settings', label: 'API Settings', icon: Globe },
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Routes>
                {/* Auth routes (no layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Public routes (accessible to everyone) */}
                <Route element={<PublicLayout />}>
                  <Route path="/products" element={<ProductListingPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                </Route>

                {/* Restricted Public routes (Admins/Vendors redirected to Dashboard) */}
                <Route element={
                  <PublicOnlyRoute>
                    <PublicLayout />
                  </PublicOnlyRoute>
                }>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment-success" element={<PaymentSuccessPage />} />
                  <Route path="/payment-failure" element={<PaymentFailurePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Route>

                {/* Vendor routes */}
                <Route path="/vendor/pending" element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorPending />
                  </ProtectedRoute>
                } />
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['vendor']} requireApproval={true}>
                      <DashboardLayout links={vendorLinks} title="Vendor Panel" />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route path="/vendor/products" element={<VendorProducts />} />
                  <Route path="/vendor/products/add" element={<VendorProductForm />} />
                  <Route path="/vendor/products/edit/:id" element={<VendorProductForm />} />
                  <Route path="/vendor/orders" element={<VendorOrders />} />
                  <Route path="/vendor/inventory" element={<VendorInventory />} />
                  <Route path="/vendor/revenue" element={<VendorRevenue />} />
                </Route>

                {/* Admin routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DashboardLayout links={adminLinks} title="Admin Panel" />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/vendors" element={<AdminVendors />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/revenue" element={<AdminRevenue />} />
                  <Route path="/admin/api-settings" element={<AdminAPISettings />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
