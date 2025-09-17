export type Page = 'quick-pickup' | 'orders' | 'customers' | 'billing' | 'settings' | 'users';

export enum Role {
    Admin = 'Admin',
    Kurir = 'Kurir',
    Warehouse = 'Warehouse',
    Customer = 'Customer', // This role is for customers using a portal, not for system users
}

export interface User {
    id: string;
    name: string;
    username: string;
    password?: string; // Should not be passed to client, but useful for demo login
    role: Role;
    customerId?: string; // To link a user login to a customer entry
}

export enum OrderStatus {
    Pending = 'Pending',
    Assigned = 'Assigned',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Verified = 'Verified',
    Paid = 'Paid',
}

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerKecamatan: string;
    customerKota: string;
    estimatedLiters: number;
    actualLiters?: number;
    status: OrderStatus;
    courierId?: string;
    createdAt: string;
    pickupPhotoUrl?: string;
    paymentProofUrl?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    kecamatan: string;
    kota: string;
    shareLocation: string;
    bankAccount: string;
    downline: string[]; // array of customer IDs
    totalLiters: number;
    referredBy?: string; // customer ID of referrer
}

export interface PriceTier {
    minLiter: number;
    maxLiter: number;
    pricePerLiter: number;
}