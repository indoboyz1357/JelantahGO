import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, User } from '../types';
import { DEMO_USERS } from '../constants';
import Modal from '../components/Modal';
import { SearchIcon } from '../components/icons';

interface OrdersPageProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
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

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, setOrders }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isVerifyModalOpen, setVerifyModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState<string>('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [courierFilter, setCourierFilter] = useState<string>('all');

    const couriers = DEMO_USERS.filter(u => u.role === 'Kurir');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchMatch = searchTerm === '' ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerPhone.includes(searchTerm);
            const statusMatch = statusFilter === 'all' || order.status === statusFilter;
            const courierMatch = courierFilter === 'all' || order.courierId === courierFilter;

            return searchMatch && statusMatch && courierMatch;
        });
    }, [orders, searchTerm, statusFilter, courierFilter]);

    const handleOpenAssignModal = (order: Order) => {
        setSelectedOrder(order);
        setSelectedCourier(order.courierId || '');
        setAssignModalOpen(true);
    };

    const handleAssignCourier = () => {
        if (!selectedOrder || !selectedCourier) return;
        setOrders(prevOrders => prevOrders.map(o => 
            o.id === selectedOrder.id ? { ...o, courierId: selectedCourier, status: OrderStatus.Assigned } : o
        ));
        setAssignModalOpen(false);
        setSelectedOrder(null);
    };

    const handleOpenVerifyModal = (order: Order) => {
        setSelectedOrder(order);
        setVerifyModalOpen(true);
    }
    
    const handleVerifyOrder = () => {
        if (!selectedOrder) return;
         setOrders(prevOrders => prevOrders.map(o => 
            o.id === selectedOrder.id ? { ...o, status: OrderStatus.Verified } : o
        ));
        setVerifyModalOpen(false);
        setSelectedOrder(null);
    }

    const handleOpenDetailModal = (order: Order) => {
        setSelectedOrder(order);
        setDetailModalOpen(true);
    }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Daftar Order</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
            <input 
                type="text"
                placeholder="Cari ID, Nama, atau No. HP..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
        {/* FIX: Replaced `as any` with a more specific type assertion to improve type safety. */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')} className="w-full p-2 border border-border rounded-md bg-input text-foreground">
            <option value="all">Semua Status</option>
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={courierFilter} onChange={e => setCourierFilter(e.target.value)} className="w-full p-2 border border-border rounded-md bg-input text-foreground">
            <option value="all">Semua Kurir</option>
            {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3">ID Order</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Lokasi</th>
              <th scope="col" className="px-6 py-3">Liter (Est/Aktual)</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Kurir</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4">{order.customerKecamatan}, {order.customerKota}</td>
                <td className="px-6 py-4">{order.estimatedLiters} L / {order.actualLiters ? `${order.actualLiters} L` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">{couriers.find(c => c.id === order.courierId)?.name || 'N/A'}</td>
                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    <button onClick={() => handleOpenDetailModal(order)} className="font-medium text-muted-foreground hover:underline">Detail</button>
                    {order.status === OrderStatus.Pending && (
                         <button onClick={() => handleOpenAssignModal(order)} className="font-medium text-blue-600 hover:underline">Assign</button>
                    )}
                    {order.status === OrderStatus.Completed && (
                         <button onClick={() => handleOpenVerifyModal(order)} className="font-medium text-green-600 hover:underline">Verifikasi</button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Assign Courier Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Kurir">
          <div className="space-y-4">
              <p>Pilih kurir untuk order <span className="font-bold">{selectedOrder?.id}</span>.</p>
              <select 
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-input text-foreground"
              >
                  <option value="" disabled>Pilih Kurir</option>
                  {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary">Batal</button>
                <button onClick={handleAssignCourier} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Assign</button>
              </div>
          </div>
      </Modal>

      {/* Verify Order Modal */}
      <Modal isOpen={isVerifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verifikasi Order">
          <div className="space-y-4">
              <p>Verifikasi order <span className="font-bold">{selectedOrder?.id}</span> dari <span className="font-bold">{selectedOrder?.customerName}</span>?</p>
              <p>Liter aktual: <span className="font-bold">{selectedOrder?.actualLiters} L</span></p>
              {selectedOrder?.pickupPhotoUrl && <img src={selectedOrder.pickupPhotoUrl} alt="Bukti Pickup" className="rounded-md max-h-60 mx-auto"/>}
              <div className="flex justify-end space-x-2">
                <button onClick={() => setVerifyModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-secondary">Batal</button>
                <button onClick={handleVerifyOrder} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Verifikasi</button>
              </div>
          </div>
      </Modal>

        {/* Detail Order Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detail Order: ${selectedOrder?.id}`}>
          {selectedOrder && (
            <div className="space-y-4 text-sm text-foreground">
                <div><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                <div><strong>Lokasi:</strong> {selectedOrder.customerKecamatan}, {selectedOrder.customerKota}</div>
                <div><strong>Tanggal Order:</strong> {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</div>
                <hr className="border-border"/>
                <div><strong>Liter Estimasi:</strong> {selectedOrder.estimatedLiters} L</div>
                <div><strong>Liter Aktual:</strong> {selectedOrder.actualLiters || '-'} L</div>
                <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
                <div><strong>Kurir:</strong> {couriers.find(c => c.id === selectedOrder.courierId)?.name || 'Belum ditugaskan'}</div>
                 <hr className="border-border"/>
                <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.pickupPhotoUrl && (
                        <div>
                            <p className="font-semibold mb-2">Bukti Pickup</p>
                            <img src={selectedOrder.pickupPhotoUrl} alt="Bukti Pickup" className="rounded-md w-full"/>
                        </div>
                    )}
                     {selectedOrder.paymentProofUrl && (
                        <div>
                            <p className="font-semibold mb-2">Bukti Pembayaran</p>
                            <img src={selectedOrder.paymentProofUrl} alt="Bukti Pembayaran" className="rounded-md w-full"/>
                        </div>
                    )}
                </div>
            </div>
          )}
      </Modal>

    </div>
  );
};

export default OrdersPage;