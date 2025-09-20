// FIX: Replaced placeholder content with a functional root component to resolve compilation errors.
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
// FIX: Import OrderStatus to use its enum members for type safety.
import { Page, User, Role, Order, Customer, PriceTier, OrderStatus } from './types';
import { DEMO_USERS, DEMO_CUSTOMERS, DEMO_ORDERS, DEMO_PRICETIERS } from './constants';

import LoginPage from './pages/LoginPage';
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

const App: React.FC = () => {
    // State management
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('quick-pickup');
    
    // Data states
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [priceTiers, setPriceTiers] = useState<PriceTier[]>(DEMO_PRICETIERS);
    const [whitelist, setWhitelist] = useState<string[]>(['127.0.0.1']); // Default whitelist

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        if (!currentUser) return;

        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) console.error('Error fetching users:', usersError);
        else setUsers(usersData as User[]);

        const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
        if (customersError) console.error('Error fetching customers:', customersError);
        else setCustomers(customersData as Customer[]);

        const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*');
        if (ordersError) console.error('Error fetching orders:', ordersError);
        else setOrders(ordersData as Order[]);
    };

    // Login/Logout handlers
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        // Set default page based on role
        if (user.role === Role.Admin) {
            setCurrentPage('quick-pickup');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const addOrder = async (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        const newOrder = {
            ...newOrderData,
            id: `ORD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            status: OrderStatus.Pending,
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select();

        if (error) {
            console.error('Error adding order:', error);
        } else if (data) {
            setOrders(prev => [...data as Order[], ...prev]);
        }
    };

    // Render logic based on user role
    const renderContent = () => {
        if (!currentUser) {
            return <LoginPage onLogin={handleLogin} users={users} />;
        }
        
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

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
};

export default App;