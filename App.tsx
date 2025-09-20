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
        const session = supabase.auth.getSession();
        // Removed the direct call to setCurrentUser, will be handled by onAuthStateChange
    
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching user profile:', error);
              } else {
                setCurrentUser(userProfile as User);
              }
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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error);
        else setCurrentUser(null);
    };
    
    const addOrder = async (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
        if (!currentUser) {
            console.error("Cannot add order, no user is logged in.");
            return;
        }

        const newOrder = {
            ...newOrderData,
            id: `ORD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            status: OrderStatus.Pending,
            customer_id: currentUser.customer_id, // Ensure customer_id is included
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
            return <LoginPage />;
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