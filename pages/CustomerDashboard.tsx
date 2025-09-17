import React, { useState, useMemo } from 'react';
import { User, Order, Customer, OrderStatus } from '../types';
import Modal from '../components/Modal';
import { LogoutIcon, OrderIcon, CustomerIcon, HomeIcon } from '../components/icons';
import BottomNavBar from '../components/BottomNavBar';
import { NavItemType } from '../components/Sidebar';

type CustomerPage = 'summary' | 'history' | 'profile';

interface CustomerDashboardProps {
    currentUser: User;
    customerData: Customer;
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
    onLogout: () => void;
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.Assigned: return 'bg-blue-100 text-blue-800';
    case OrderStatus.InProgress: return 'bg-indigo-100 text-indigo-800';
    case OrderStatus.Completed: return 'bg-purple-100 text-purple-800';
    case OrderStatus.Verified: return 'bg-green-100 text-green-800';
    case OrderStatus.Paid: return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Sub-component for Summary View
const SummaryView: React.FC<Pick<CustomerDashboardProps, 'orders' | 'addOrder' | 'customerData'>> = ({ orders, addOrder, customerData }) => {
    const [isOrderModalOpen, setOrderModalOpen] = useState(false);
    const [estimatedLiters, setEstimatedLiters] = useState('');
    const [message, setMessage] = useState('');

    const stats = useMemo(() => {
        const totalLiters = orders
            .filter(o => o.status === OrderStatus.Paid || o.status === OrderStatus.Verified)
            .reduce((sum, order) => sum + (order.actualLiters || 0), 0);
        const pendingOrders = orders.filter(o => o.status !== OrderStatus.Paid && o.status !== OrderStatus.Verified).length;
        return { totalLiters, pendingOrders };
    }, [orders]);

    const handleCreateOrder = () => {
        if (!estimatedLiters || parseInt(estimatedLiters, 10) <= 0) {
            setMessage('Harap masukkan estimasi liter yang valid.');
            return;
        }
        addOrder({
            customerId: customerData.id,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            customerKecamatan: customerData.kecamatan,
            customerKota: customerData.kota,
            estimatedLiters: parseInt(estimatedLiters, 10),
        });
        setMessage(`Order berhasil dibuat. Kurir akan segera menjemput.`);
        setEstimatedLiters('');
        setOrderModalOpen(false);
        
        setTimeout(() => setMessage(''), 5000);
    };

    return (
        <div className="space-y-6">
            {message && <div className="p-3 rounded-md bg-green-100 text-green-800">{message}</div>}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card p-6 rounded-lg shadow-md flex flex-col justify-center items-center text-center">
                    <h2 className="text-xl font-semibold mb-4 text-card-foreground">Jemput Jelantah Sekarang</h2>
                    <p className="text-muted-foreground mb-4">Buat permintaan penjemputan baru dengan mudah.</p>
                    <button onClick={() => setOrderModalOpen(true)} className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-transform transform hover:scale-105">
                        Buat Order Pickup
                    </button>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-card p-6 rounded-lg shadow-md">
                        <h4 className="text-muted-foreground">Order Pending</h4>
                        <p className="text-3xl font-bold text-blue-600">{stats.pendingOrders}</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-md">
                        <h4 className="text-muted-foreground">Total Liter Terkumpul</h4>
                        <p className="text-3xl font-bold text-green-600">{stats.totalLiters.toFixed(2)} L</p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} title="Buat Order Pickup Baru">
                <div className="space-y-4">
                    <p className="text-foreground">Masukkan estimasi jumlah jelantah (dalam liter) yang akan dijemput.</p>
                    <div>
                        <label htmlFor="liters-new" className="block text-sm font-medium text-foreground">Estimasi Liter</label>
                        <input
                            type="number"
                            id="liters-new"
                            value={estimatedLiters}
                            onChange={e => setEstimatedLiters(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
                            placeholder="Contoh: 20"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setOrderModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-md">Batal</button>
                        <button onClick={handleCreateOrder} className="px-4 py-2 bg-primary-600 text-white rounded-md">Buat Order</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
};

// Sub-component for History View
const HistoryView: React.FC<Pick<CustomerDashboardProps, 'orders'>> = ({ orders }) => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-semibold mb-4 text-card-foreground">Riwayat Order</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs text-foreground uppercase bg-muted/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Order</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Liter (Est/Aktual)</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                <td className="px-6 py-4">{order.estimatedLiters} L / {order.actualLiters ? `${order.actualLiters} L` : '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
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

// Sub-component for Profile View
const ProfileView: React.FC<Pick<CustomerDashboardProps, 'customerData' | 'setCustomers'>> = ({ customerData, setCustomers }) => {
    const [editedCustomer, setEditedCustomer] = useState<Customer>(customerData);
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedCustomer({...editedCustomer, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = () => {
        setCustomers(prev => prev.map(c => c.id === editedCustomer.id ? editedCustomer : c));
        setMessage('Profil berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
    };

    const renderInput = (id: keyof Customer, label: string) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
            <input
                type="text"
                id={id}
                name={id}
                value={(editedCustomer as any)[id] || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground"
            />
        </div>
    );

    return (
        <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Profil Saya</h2>
            {message && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800">{message}</div>}
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('name', 'Nama')}
                    {renderInput('phone', 'No. HP')}
                    {renderInput('address', 'Alamat Lengkap')}
                    {renderInput('kecamatan', 'Kecamatan')}
                    {renderInput('kota', 'Kota')}
                    {renderInput('bankAccount', 'Rekening Bank')}
                 </div>
                 <div className="flex justify-end">
                    <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Simpan Perubahan</button>
                 </div>
            </div>
        </div>
    );
};


const CustomerDashboard: React.FC<CustomerDashboardProps> = (props) => {
    const [activePage, setActivePage] = useState<CustomerPage>('summary');

    const navItems: NavItemType[] = [
        { page: 'summary', label: 'Ringkasan', icon: <HomeIcon /> },
        { page: 'history', label: 'Riwayat', icon: <OrderIcon /> },
        { page: 'profile', label: 'Profil', icon: <CustomerIcon /> },
    ];

    const pageTitles: Record<CustomerPage, string> = {
        summary: 'Ringkasan',
        history: 'Riwayat Order',
        profile: 'Profil Saya',
    };

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
                     <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">JelantahGO</span>
                </div>
                <nav className="flex-grow p-4">
                    <ul className="space-y-2">
                         {navItems.map(item => (
                            <NavItem
                                key={item.page}
                                icon={item.icon}
                                label={item.label}
                                isActive={activePage === item.page}
                                onClick={() => setActivePage(item.page as CustomerPage)}
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
                        {pageTitles[activePage]}
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
                    {activePage === 'summary' && <SummaryView orders={props.orders} addOrder={props.addOrder} customerData={props.customerData} />}
                    {activePage === 'history' && <HistoryView orders={props.orders} />}
                    {activePage === 'profile' && <ProfileView customerData={props.customerData} setCustomers={props.setCustomers} />}
                </main>
            </div>
            
            <BottomNavBar items={navItems} currentPage={activePage} setCurrentPage={setActivePage} />
        </div>
    );
};

export default CustomerDashboard;