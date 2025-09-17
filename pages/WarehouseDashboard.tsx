import React, { useState, useMemo } from 'react';
import { User, Order, OrderStatus } from '../types';
import { LogoutIcon, PickupIcon, OrderIcon } from '../components/icons';
import Modal from '../components/Modal';
import BottomNavBar from '../components/BottomNavBar';
import { NavItemType } from '../components/Sidebar';

type WarehousePage = 'verification' | 'history';

interface WarehouseDashboardProps {
    currentUser: User;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    onLogout: () => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Completed: return 'bg-purple-100 text-purple-800';
    case OrderStatus.Verified: return 'bg-green-100 text-green-800';
    case OrderStatus.Paid: return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Sub-component for Verification View
const VerificationView: React.FC<Pick<WarehouseDashboardProps, 'orders' | 'setOrders'>> = ({ orders, setOrders }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    const pendingVerificationOrders = useMemo(() => {
        return orders.filter(o => o.status === OrderStatus.Completed);
    }, [orders]);

    const handleOpenModal = (order: Order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const handleVerifyOrder = () => {
        if (!selectedOrder) return;
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: OrderStatus.Verified } : o));
        setModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Order Menunggu Verifikasi</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs text-foreground uppercase bg-muted/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Order</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Liter Aktual</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingVerificationOrders.map(order => (
                            <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4 font-semibold">{order.actualLiters} L</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleOpenModal(order)} className="font-medium text-blue-600 hover:underline">Verifikasi</button>
                                </td>
                            </tr>
                        ))}
                        {pendingVerificationOrders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada order yang perlu diverifikasi.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={`Verifikasi Order: ${selectedOrder?.id}`}>
              <div className="space-y-4 text-foreground">
                  <p>Verifikasi order dari <span className="font-bold">{selectedOrder?.customerName}</span>?</p>
                  <p>Liter aktual: <span className="font-bold">{selectedOrder?.actualLiters} L</span></p>
                  {selectedOrder?.pickupPhotoUrl && (
                    <div>
                        <p className="font-semibold mb-2">Bukti Pickup</p>
                        <img src={selectedOrder.pickupPhotoUrl} alt="Bukti Pickup" className="rounded-md max-h-60 mx-auto"/>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary">Batal</button>
                    <button onClick={handleVerifyOrder} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Verifikasi</button>
                  </div>
              </div>
            </Modal>
        </div>
    );
};

// Sub-component for History View
const HistoryView: React.FC<Pick<WarehouseDashboardProps, 'orders'>> = ({ orders }) => {
    const historyOrders = useMemo(() => {
        return orders.filter(o => o.status === OrderStatus.Verified || o.status === OrderStatus.Paid)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders]);

    return (
        <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Riwayat Order Terverifikasi</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs text-foreground uppercase bg-muted/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Order</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Liter Aktual</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyOrders.map(order => (
                            <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4">{order.actualLiters} L</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {historyOrders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada riwayat order.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const WarehouseDashboard: React.FC<WarehouseDashboardProps> = (props) => {
    const [activePage, setActivePage] = useState<WarehousePage>('verification');

    const navItems: NavItemType[] = [
        { page: 'verification', label: 'Verifikasi', icon: <PickupIcon /> },
        { page: 'history', label: 'Riwayat', icon: <OrderIcon /> },
    ];

    const NavItem: React.FC<{
      // FIX: Update icon prop type to allow cloning with a className prop, resolving TypeScript error.
      icon: React.ReactElement<{ className?: string }>;
      label: string;
      isActive: boolean;
      onClick: () => void;
    }> = ({ icon, label, isActive, onClick }) => (
      <li>
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
          className={`flex items-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors duration-200 ${ isActive ? 'bg-primary-700 text-white' : '' }`}>
          {/* FIX: Removed unnecessary type assertion as the icon prop type is now more specific. */}
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
          <span className="ml-3">{label}</span>
        </a>
      </li>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex-col hidden md:flex">
                <div className="flex items-center justify-center h-20 border-b border-border/20">
                    <span className="text-2xl font-bold text-primary-400">Dasbor Gudang</span>
                </div>
                <nav className="flex-grow p-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                             <NavItem
                                key={item.page}
                                icon={item.icon}
                                label={item.label}
                                isActive={activePage === item.page}
                                onClick={() => setActivePage(item.page as WarehousePage)}
                            />
                        ))}
                    </ul>
                </nav>
                 <div className="p-4 border-t border-border/20">
                    <div className="text-center mb-4">
                        <p className="font-semibold">{props.currentUser?.name}</p>
                        <p className="text-sm text-muted-foreground/80">{props.currentUser?.role}</p>
                    </div>
                    <button onClick={props.onLogout} className="w-full flex items-center justify-center p-2 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors">
                        <LogoutIcon className="w-5 h-5 mr-2" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-card shadow-md p-4 flex justify-between items-center z-10">
                     <h1 className="text-2xl font-bold text-card-foreground">
                        {activePage === 'verification' ? 'Verifikasi Order' : 'Riwayat Order'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-foreground">{props.currentUser?.name}</p>
                            <p className="text-sm text-muted-foreground">{props.currentUser?.role}</p>
                        </div>
                        <button onClick={props.onLogout} className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
                            <LogoutIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 pb-24 md:pb-6">
                    {activePage === 'verification' && <VerificationView orders={props.orders} setOrders={props.setOrders} />}
                    {activePage === 'history' && <HistoryView orders={props.orders} />}
                </main>
            </div>
            
            <BottomNavBar items={navItems} currentPage={activePage} setCurrentPage={setActivePage} />
        </div>
    );
};

export default WarehouseDashboard;