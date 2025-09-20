import React, { useState, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../supabaseClient';
import { User, Order, OrderStatus } from '../types';
import Modal from '../components/Modal';
import { LogoutIcon, CameraIcon, PickupIcon, CashIcon } from '../components/icons';
import { COURIER_FEE_PER_LITER } from '../constants';
import BottomNavBar from '../components/BottomNavBar';
import { NavItemType } from '../components/Sidebar';

type CourierPage = 'pickup' | 'earnings';

interface CourierDashboardProps {
    currentUser: User;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    onLogout: () => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.Assigned: return 'bg-blue-100 text-blue-800';
    case OrderStatus.InProgress: return 'bg-indigo-100 text-indigo-800';
    case OrderStatus.Completed: return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Sub-component for Pickup Management
const PickupView: React.FC<CourierDashboardProps> = ({ currentUser, orders, setOrders }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
    const [actualLiters, setActualLiters] = useState('');
    const [pickupPhoto, setPickupPhoto] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const availableOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.Pending), [orders]);
    const myPickups = useMemo(() => {
        return orders
            .filter(o => o.courierId === currentUser.id && ![OrderStatus.Pending, OrderStatus.Verified, OrderStatus.Paid].includes(o.status))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, currentUser.id]);

    const handleTakeOrder = (orderId: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: OrderStatus.Assigned, courierId: currentUser.id} : o));
    };
    
    const handleStartPickup = (orderId: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: OrderStatus.InProgress} : o));
    };

    const handleOpenCompleteModal = (order: Order) => {
        setSelectedOrder(order);
        setActualLiters(order.estimatedLiters.toString());
        setCompleteModalOpen(true);
    };
    
    const handleCompletePickup = async () => {
        if (!selectedOrder || !actualLiters) {
            alert("Harap masukkan liter aktual yang dijemput.");
            return;
        }
        if (!pickupPhoto) {
            alert("Harap unggah foto bukti pickup.");
            return;
        }

        setIsUploading(true);

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp'
            };
            const compressedFile = await imageCompression(pickupPhoto, options);

            const filePath = `pickup-photos/${currentUser.id}/${selectedOrder.id}-${Date.now()}.webp`;
            const { data, error } = await supabase.storage
                .from('pickup-photos')
                .upload(filePath, compressedFile);

            if (error) {
                throw error;
            }

            const { publicURL } = supabase.storage.from('pickup-photos').getPublicUrl(filePath).data;

            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? {
                ...o,
                status: OrderStatus.Completed,
                actualLiters: parseInt(actualLiters, 10),
                pickupPhotoUrl: publicURL
            } : o));

            setCompleteModalOpen(false);
            setSelectedOrder(null);
            setActualLiters('');
            setPickupPhoto(null);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            // More detailed error logging
            if (error.statusCode) {
                console.error(`Supabase Storage Error: Status Code ${error.statusCode}, Message: ${error.message}`);
            } else if (error.name === 'ClientError') {
                console.error(`Supabase Client Error: ${error.message}`);
            } else if (error instanceof Error) {
                console.error(`General Error: ${error.message}, Stack: ${error.stack}`);
            }
            alert(`Gagal mengunggah gambar. Silakan coba lagi. Detail: ${error.message || error.toString()}`);
        } finally {
            setIsUploading(false);
        }
    };

    const renderMyPickupAction = (order: Order) => {
        switch(order.status) {
            case OrderStatus.Assigned:
                return <button onClick={() => handleStartPickup(order.id)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">Mulai Pickup</button>;
            case OrderStatus.InProgress:
                return <button onClick={() => handleOpenCompleteModal(order)} className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-xs">Selesaikan</button>;
            case OrderStatus.Completed:
                 return <span className="px-3 py-1 text-xs text-purple-800">Menunggu Verifikasi</span>;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-6">
            {/* My Pickups */}
            <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Pickup Saya</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                         <thead className="text-xs text-foreground uppercase bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Lokasi</th>
                                <th scope="col" className="px-6 py-3">Liter (Est)</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myPickups.map(order => (
                            <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 text-foreground">
                                    <div>{order.customerName}</div>
                                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                                </td>
                                <td className="px-6 py-4">{order.customerKecamatan}, {order.customerKota}</td>
                                <td className="px-6 py-4">{order.estimatedLiters} L</td>
                                <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                </td>
                                <td className="px-6 py-4">{renderMyPickupAction(order)}</td>
                            </tr>
                            ))}
                            {myPickups.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-muted-foreground">Tidak ada tugas penjemputan saat ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Available Orders */}
            <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Order Tersedia</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-foreground uppercase bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Lokasi</th>
                                <th scope="col" className="px-6 py-3">Liter (Est)</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableOrders.map(order => (
                                <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 text-foreground">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.customerKecamatan}, {order.customerKota}</td>
                                    <td className="px-6 py-4">{order.estimatedLiters} L</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleTakeOrder(order.id)} className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-xs">Ambil</button>
                                    </td>
                                </tr>
                            ))}
                            {availableOrders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada order baru yang tersedia.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isCompleteModalOpen} onClose={() => setCompleteModalOpen(false)} title="Selesaikan Pickup">
                <div className="space-y-4">
                    <p className="text-foreground">Selesaikan pickup untuk order <span className="font-bold">{selectedOrder?.id}</span>.</p>
                    <div>
                        <label htmlFor="actualLiters" className="block text-sm font-medium text-foreground">Liter Aktual yang Diambil</label>
                        <input type="number" id="actualLiters" value={actualLiters} onChange={e => setActualLiters(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder:text-muted-foreground" placeholder="Jumlah liter aktual" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-foreground mb-1">Upload Bukti Pickup</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <CameraIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <div className="flex text-sm text-muted-foreground">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setPickupPhoto(e.target.files ? e.target.files[0] : null)} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                {pickupPhoto && <p className="text-sm text-foreground">{pickupPhoto.name}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary">Batal</button>
                        <button onClick={handleCompletePickup} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700" disabled={isUploading}>
                            {isUploading ? 'Mengunggah...' : 'Selesaikan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Sub-component for Earnings View
const EarningsView: React.FC<CourierDashboardProps> = ({ currentUser, orders }) => {
    const myCompletedPickups = useMemo(() => {
        return orders.filter(o => o.courierId === currentUser.id && [OrderStatus.Completed, OrderStatus.Verified, OrderStatus.Paid].includes(o.status));
    }, [orders, currentUser.id]);

    const stats = useMemo(() => {
        return myCompletedPickups.reduce((acc, order) => {
            const liters = order.actualLiters || 0;
            acc.totalLiters += liters;
            acc.totalEarnings += liters * COURIER_FEE_PER_LITER;
            return acc;
        }, { totalLiters: 0, totalEarnings: 0 });
    }, [myCompletedPickups]);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-md">
                    <h4 className="text-muted-foreground">Total Pendapatan</h4>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow-md">
                    <h4 className="text-muted-foreground">Pickup Selesai</h4>
                    <p className="text-3xl font-bold text-blue-600">{myCompletedPickups.length}</p>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow-md">
                    <h4 className="text-muted-foreground">Total Liter Terkumpul</h4>
                    <p className="text-3xl font-bold text-orange-600">{stats.totalLiters} L</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Riwayat Pendapatan</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-foreground uppercase bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Order ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Liter Aktual</th>
                                <th scope="col" className="px-6 py-3">Fee Diterima</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myCompletedPickups.map(order => (
                                <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.actualLiters} L</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency((order.actualLiters || 0) * COURIER_FEE_PER_LITER)}</td>
                                    <td className="px-6 py-4">{order.status}</td>
                                </tr>
                            ))}
                             {myCompletedPickups.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada riwayat pendapatan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Main Courier Dashboard Component
const CourierDashboard: React.FC<CourierDashboardProps> = (props) => {
    const [activePage, setActivePage] = useState<CourierPage>('pickup');

    const navItems: NavItemType[] = [
        { page: 'pickup', label: 'Pickup', icon: <PickupIcon /> },
        { page: 'earnings', label: 'Pendapatan', icon: <CashIcon /> },
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
                    <span className="text-2xl font-bold text-primary-400">Dasbor Kurir</span>
                </div>
                <nav className="flex-grow p-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <NavItem
                                key={item.page}
                                icon={item.icon}
                                label={item.label}
                                isActive={activePage === item.page}
                                onClick={() => setActivePage(item.page as CourierPage)}
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
                        {activePage === 'pickup' ? 'Dasbor Pickup' : 'Pendapatan Saya'}
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
                    {activePage === 'pickup' && <PickupView {...props} />}
                    {activePage === 'earnings' && <EarningsView {...props} />}
                </main>
            </div>
            
            <BottomNavBar items={navItems} currentPage={activePage} setCurrentPage={setActivePage} />
        </div>
    );
};

export default CourierDashboard;