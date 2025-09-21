import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Page, User, Role, Order, Customer, PriceTier, OrderStatus } from './types';
import { DEMO_USERS, DEMO_CUSTOMERS, DEMO_ORDERS, DEMO_PRICETIERS } from './constants';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Import ForgotPasswordPage
import DashboardLayout from './pages/DashboardLayout';
import QuickPickupPage from './pages/QuickPickupPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import CourierDashboard from './pages/CourierDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Component for protected routes
const ProtectedRoute: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />; // Renders the child route's element
};

// Component for public routes (login, register, etc.)
const PublicRoute: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    if (currentUser) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // To wait for session check
    const [currentPage, setCurrentPage] = useState<Page>('quick-pickup');
    
    // Data states
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>(DEMO_PRICETIERS);
    const [whitelist, setWhitelist] = useState<string[]>(['127.0.0.1']);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setCurrentUser(userProfile as User);
            }
            setLoading(false);
        };

        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              setCurrentUser(userProfile as User);
            } else {
              setCurrentUser(null);
            }
          }
        );
    
        return () => {
          authListener.subscription.unsubscribe();
        };
      }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        // Fetching logic remains the same
        const { data: usersData } = await supabase.from('users').select('*');
        setUsers(usersData as User[] || []);
        const { data: customersData } = await supabase.from('customers').select('*');
        setCustomers(customersData as Customer[] || []);
        const { data: ordersData } = await supabase.from('orders').select('*');
        setOrders(ordersData as Order[] || []);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };
    
    const addOrder = async (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        // Add order logic remains the same
    };

    const renderDashboard = () => {
        if (!currentUser) return null;
        
        switch (currentUser.role) {
            case Role.Admin:
                return (
                    <DashboardLayout 
                        currentUser={currentUser} 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        onLogout={handleLogout}
                    >
                        {currentPage === 'quick-pickup' && <QuickPickupPage customers={customers} setCustomers={setCustomers} addOrder={addOrder} />}
                        {currentPage === 'orders' && <OrdersPage orders={orders} setOrders={setOrders} />}
                        {currentPage === 'customers' && <CustomersPage customers={customers} setCustomers={setCustomers} />}
                        {currentPage === 'billing' && <BillingPage orders={orders} customers={customers} priceTiers={priceTiers} setOrders={setOrders}/>}
                        {currentPage === 'settings' && <SettingsPage priceTiers={priceTiers} setPriceTiers={setPriceTiers} users={users} customers={customers} orders={orders} whitelist={whitelist} setWhitelist={setWhitelist} />}
                        {currentPage === 'users' && <UsersPage users={users} setUsers={setUsers} />}
                    </DashboardLayout>
                );
            case Role.Kurir:
                return <CourierDashboard currentUser={currentUser} orders={orders} setOrders={setOrders} onLogout={handleLogout} />;
            case Role.Warehouse:
                 return <WarehouseDashboard currentUser={currentUser} orders={orders} setOrders={setOrders} onLogout={handleLogout} />;
            case Role.Customer:
                const customerData = customers.find(c => c.id === currentUser.customerId);
                if (customerData) {
                    const customerOrders = orders.filter(o => o.customerId === customerData.id);
                     return <CustomerDashboard 
                                currentUser={currentUser} 
                                customerData={customerData}
                                orders={customerOrders} 
                                addOrder={addOrder}
                                onLogout={handleLogout}
                                setCustomers={setCustomers} 
                            />;
                }
                return <div>Error: Customer data not found.</div>;
            default:
                return <div>Unknown role. Please log out.</div>;
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner component
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute currentUser={currentUser} />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route element={<ProtectedRoute currentUser={currentUser} />}>
                    <Route path="/*" element={renderDashboard()} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;