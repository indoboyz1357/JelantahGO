import { User, Role, Customer, Order, OrderStatus, PriceTier } from './types';

export const DEMO_USERS: User[] = [
    { id: 'user-1', name: 'Admin Jelantah', username: 'admin', password: 'password', role: Role.Admin },
    { id: 'user-2', name: 'Budi Kurir', username: 'budi', password: 'password', role: Role.Kurir },
    { id: 'user-3', name: 'Citra Kurir', username: 'citra', password: 'password', role: Role.Kurir },
    { id: 'user-4', name: 'Doni Gudang', username: 'doni', password: 'password', role: Role.Warehouse },
    { id: 'user-5', name: 'Warung Bu Siti', username: 'siti', password: 'password', role: Role.Customer, customerId: 'cust-1' },
];

export const DEMO_CUSTOMERS: Customer[] = [
    {
        id: 'cust-1', name: 'Warung Bu Siti', phone: '081234567890', address: 'Jl. Merdeka No. 1', kecamatan: 'Coblong', kota: 'Bandung',
        shareLocation: 'https://maps.google.com/123', bankAccount: 'BCA 1234567890', downline: [], totalLiters: 120,
    },
    {
        id: 'cust-2', name: 'Restoran Padang Jaya', phone: '089876543210', address: 'Jl. Sudirman No. 10', kecamatan: 'Andir', kota: 'Bandung',
        shareLocation: 'https://maps.google.com/456', bankAccount: 'Mandiri 0987654321', downline: ['cust-3'], totalLiters: 450,
    },
     {
        id: 'cust-3', name: 'Katering Sehat', phone: '081122334455', address: 'Jl. Asia Afrika No. 5', kecamatan: 'Sumur Bandung', kota: 'Bandung',
        shareLocation: 'https://maps.google.com/789', bankAccount: 'BNI 1122334455', downline: [], totalLiters: 80, referredBy: 'cust-2',
    },
];

export const DEMO_ORDERS: Order[] = [
    {
        id: 'ORD-001', customerId: 'cust-1', customerName: 'Warung Bu Siti', customerPhone: '081234567890', customerKecamatan: 'Coblong', customerKota: 'Bandung',
        estimatedLiters: 20, actualLiters: 22, status: OrderStatus.Paid, courierId: 'user-2', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        pickupPhotoUrl: 'https://picsum.photos/seed/pickup1/200/300', paymentProofUrl: 'https://picsum.photos/seed/payment1/200/300'
    },
    {
        id: 'ORD-002', customerId: 'cust-2', customerName: 'Restoran Padang Jaya', customerPhone: '089876543210', customerKecamatan: 'Andir', customerKota: 'Bandung',
        estimatedLiters: 50, actualLiters: 48, status: OrderStatus.Verified, courierId: 'user-3', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pickupPhotoUrl: 'https://picsum.photos/seed/pickup2/200/300'
    },
    {
        id: 'ORD-003', customerId: 'cust-3', customerName: 'Katering Sehat', customerPhone: '081122334455', customerKecamatan: 'Sumur Bandung', customerKota: 'Bandung',
        estimatedLiters: 15, actualLiters: 15, status: OrderStatus.Completed, courierId: 'user-2', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        pickupPhotoUrl: 'https://picsum.photos/seed/pickup3/200/300'
    },
    {
        id: 'ORD-004', customerId: 'cust-1', customerName: 'Warung Bu Siti', customerPhone: '081234567890', customerKecamatan: 'Coblong', customerKota: 'Bandung',
        estimatedLiters: 25, status: OrderStatus.Assigned, courierId: 'user-3', createdAt: new Date().toISOString()
    },
    {
        id: 'ORD-005', customerId: 'cust-2', customerName: 'Restoran Padang Jaya', customerPhone: '089876543210', customerKecamatan: 'Andir', customerKota: 'Bandung',
        estimatedLiters: 60, status: OrderStatus.Pending, createdAt: new Date().toISOString()
    },
];

export const DEMO_PRICETIERS: PriceTier[] = [
    { minLiter: 0, maxLiter: 50, pricePerLiter: 7000 },
    { minLiter: 51, maxLiter: 100, pricePerLiter: 7500 },
    { minLiter: 101, maxLiter: Infinity, pricePerLiter: 8000 },
];

export const COURIER_FEE_PER_LITER = 500;
export const AFFILIATE_FEE_PER_LITER = 200;