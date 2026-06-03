import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';

export default function App() {
	return (
		<Routes>
			{/* Public User Routes with Layout */}
			<Route element={<UserLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/products" element={<ProductListingPage />} />
				<Route path="/product/:id" element={<ProductDetailsPage />} />
				<Route path="/cart" element={<CartPage />} />
				<Route path="/orders" element={<OrdersPage />} />
				<Route path="/profile" element={<ProfilePage />} />
			</Route>

			{/* Auth Routes (No Layout) */}
			<Route path="/login" element={<AuthPage mode="login" />} />
			<Route path="/register" element={<AuthPage mode="register" />} />

			{/* Admin Routes */}
			<Route
				path="/admin"
				element={
					<AdminRoute>
						<AdminLayout />
					</AdminRoute>
				}
			>
				<Route index element={<AdminDashboardPage />} />
				<Route path="products" element={<AdminProductsPage />} />
				<Route path="products/add" element={<AddProductPage />} />
				<Route path="products/edit/:id" element={<EditProductPage />} />
				<Route path="orders" element={<AdminOrdersPage />} />
				<Route path="users" element={<AdminUsersPage />} />
			</Route>

			{/* Catch All */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
