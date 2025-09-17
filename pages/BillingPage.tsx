import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Customer, PriceTier } from '../types';
import { COURIER_FEE_PER_LITER, AFFILIATE_FEE_PER_LITER } from '../constants';
import Modal from '../components/Modal';
import { SearchIcon } from '../components/icons';


interface BillingPageProps {
  orders: Order[];
  customers: Customer[];
  priceTiers: PriceTier[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const BillingPage: React.FC<BillingPageProps> = ({ orders, customers, priceTiers, setOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus.Verified | OrderStatus.Paid>('all');
  
  const billingData = useMemo(() => {
    const billableOrders = orders.filter(o => 
        (o.status === OrderStatus.Verified || o.status === OrderStatus.Paid) &&
        (statusFilter === 'all' || o.status === statusFilter) &&
        (
            searchTerm === '' ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return billableOrders.map(order => {
      const liters = order.actualLiters || 0;
      const tier = priceTiers.find(t => liters >= t.minLiter && liters <= t.maxLiter);
      const pricePerLiter = tier ? tier.pricePerLiter : 0;
      
      const customerPayout = liters * pricePerLiter;
      const courierFee = liters * COURIER_FEE_PER_LITER;
      
      const customer = customers.find(c => c.id === order.customerId);
      let affiliateFee = 0;
      let affiliateName: string | undefined = undefined;

      if (customer?.referredBy) {
        const affiliate = customers.find(c => c.id === customer.referredBy);
        if (affiliate) {
          affiliateFee = liters * AFFILIATE_FEE_PER_LITER;
          affiliateName = affiliate.name;
        }
      }
      
      return {
        orderId: order.id,
        customerName: order.customerName,
        actualLiters: liters,
        customerPayout,
        courierFee,
        affiliateFee,
        affiliateName,
        status: order.status,
      };
    });
  }, [orders, customers, priceTiers, searchTerm, statusFilter]);

  const handleOpenUploadModal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if(order) {
        setSelectedOrder(order);
        setModalOpen(true);
    }
  }

  const handleConfirmPayment = () => {
    if(!selectedOrder) return;
    
    // Update order status
    setOrders(prev => prev.map(o => o.id === selectedOrder.id 
        ? {...o, status: OrderStatus.Paid, paymentProofUrl: 'https://picsum.photos/200/300' }
        : o
    ));

    // Find customer to send notification
    const customer = customers.find(c => c.id === selectedOrder.customerId);

    // Simulate sending email notification
    if (customer) {
        // In a real application, this would be an API call to a backend service.
        // For this demo, we'll use a simple alert to simulate the action.
        alert(`Pembayaran untuk order ${selectedOrder.id} telah dikonfirmasi. Notifikasi email (simulasi) telah dikirimkan ke customer ${customer.name}.`);
    }
    
    // Close modal and reset state
    setModalOpen(false);
    setSelectedOrder(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Penagihan & Pembayaran</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
            <input 
                type="text"
                placeholder="Cari ID Order atau Nama Customer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
         <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full p-2 border border-border rounded-md bg-input text-foreground">
            <option value="all">Semua Status Tagihan</option>
            <option value={OrderStatus.Verified}>Terverifikasi (Belum Dibayar)</option>
            <option value={OrderStatus.Paid}>Dibayar</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Total (Rp)</th>
              <th scope="col" className="px-6 py-3">Fee Kurir (Rp)</th>
              <th scope="col" className="px-6 py-3">Fee Affiliate (Rp)</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {billingData.map(item => (
              <tr key={item.orderId} className="bg-card border-b border-border hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground">{item.orderId}</td>
                <td className="px-6 py-4">{item.customerName} ({item.actualLiters} L)</td>
                <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(item.customerPayout)}</td>
                <td className="px-6 py-4 text-destructive">{formatCurrency(item.courierFee)}</td>
                <td className="px-6 py-4 text-orange-600">
                  {formatCurrency(item.affiliateFee)}
                  {item.affiliateName && <div className="text-xs text-muted-foreground">({item.affiliateName})</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === OrderStatus.Paid ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.status === OrderStatus.Paid ? 'Dibayar' : 'Terverifikasi'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.status === OrderStatus.Verified && (
                    <button onClick={() => handleOpenUploadModal(item.orderId)} className="font-medium text-blue-600 hover:underline">Upload Bukti Bayar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Konfirmasi Pembayaran">
        <div className="space-y-4">
            <p className="text-foreground">Anda akan mengkonfirmasi pembayaran untuk order <span className="font-bold">{selectedOrder?.id}</span>.</p>
            <p className="text-sm text-muted-foreground">Fitur upload file dinonaktifkan di demo ini. Klik "Konfirmasi" akan menandai order sebagai lunas.</p>
            <div className="flex justify-end space-x-2 pt-4">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-muted rounded-md text-muted-foreground">Batal</button>
                <button onClick={handleConfirmPayment} className="px-4 py-2 bg-primary-600 text-white rounded-md">Konfirmasi</button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default BillingPage;