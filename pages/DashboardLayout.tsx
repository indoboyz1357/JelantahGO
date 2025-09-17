import React from 'react';
import Sidebar, { NavItemType } from '../components/Sidebar';
import BottomNavBar from '../components/BottomNavBar';
import { Page, User } from '../types';
import { LogoutIcon, PickupIcon, OrderIcon, CustomerIcon, BillingIcon, SettingsIcon, UserManagementIcon } from '../components/icons';

interface DashboardLayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
}

const pageTitles: Record<Page, string> = {
    'quick-pickup': 'Quick Pick Up',
    'orders': 'Order Management',
    'customers': 'Customer Management',
    'billing': 'Billing & Payments',
    'settings': 'System Settings',
    'users': 'User Management',
};

const navItems: NavItemType[] = [
    { page: 'quick-pickup', label: 'Quick Pick Up', icon: <PickupIcon /> },
    { page: 'orders', label: 'Order List', icon: <OrderIcon /> },
    { page: 'customers', label: 'Customers', icon: <CustomerIcon /> },
    { page: 'billing', label: 'Billing', icon: <BillingIcon /> },
    { page: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    { page: 'users', label: 'Users', icon: <UserManagementIcon /> },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentPage, setCurrentPage, children, currentUser, onLogout }) => {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            navItems={navItems}
            title="JelantahGO"
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-md p-4 flex justify-between items-center z-10">
            <h1 className="text-2xl font-bold text-card-foreground">{pageTitles[currentPage]}</h1>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-foreground">{currentUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.role}</p>
                </div>
                <button onClick={onLogout} className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
                    <LogoutIcon className="w-6 h-6"/>
                </button>
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNavBar items={navItems.slice(0, 5)} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default DashboardLayout;