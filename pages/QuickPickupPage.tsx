import React, { useState } from 'react';
import { Customer, Order, OrderStatus } from '../types';

interface QuickPickupPageProps {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
}

const QuickPickupPage: React.FC<QuickPickupPageProps> = ({ customers, setCustomers, addOrder }) => {
    const [phone, setPhone] = useState('');
    const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ phone: '' });
    const [estimatedLiters, setEstimatedLiters] = useState('');
    const [message, setMessage] = useState('');


    const handleCheckCustomer = () => {
        setMessage('');
        const customer = customers.find(c => c.phone === phone);
        if (customer) {
            setFoundCustomer(customer);
            setShowRegistration(false);
        } else {
            setFoundCustomer(null);
            setShowRegistration(true);
            setNewCustomer({ phone });
        }
    };

    const handleRegisterAndOrder = () => {
        if (!newCustomer.name || !newCustomer.phone || !newCustomer.address || !newCustomer.kecamatan || !newCustomer.kota || !newCustomer.bankAccount || !estimatedLiters) {
            setMessage('Harap isi semua field yang wajib diisi.');
            return;
        }

        const newCust: Customer = {
            id: `cust-${Date.now()}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            address: newCustomer.address,
            kecamatan: newCustomer.kecamatan,
            kota: newCustomer.kota,
            shareLocation: newCustomer.shareLocation || '',
            bankAccount: newCustomer.bankAccount,
            downline: [],
            totalLiters: 0,
        };
        setCustomers(prev => [...prev, newCust]);
        
        addOrder({
            customerId: newCust.id,
            customerName: newCust.name,
            customerPhone: newCust.phone,
            customerKecamatan: newCust.kecamatan,
            customerKota: newCust.kota,
            estimatedLiters: parseInt(estimatedLiters, 10),
        });

        setMessage(`Customer baru ${newCust.name} berhasil didaftarkan dan order dibuat.`);
        resetState();
    };

    const handleCreateOrder = () => {
        if (!foundCustomer || !estimatedLiters) {
            setMessage('Harap isi jumlah liter.');
            return;
        }
        addOrder({
            customerId: foundCustomer.id,
            customerName: foundCustomer.name,
            customerPhone: foundCustomer.phone,
            customerKecamatan: foundCustomer.kecamatan,
            customerKota: foundCustomer.kota,
            estimatedLiters: parseInt(estimatedLiters, 10),
        });
        setMessage(`Order untuk ${foundCustomer.name} berhasil dibuat.`);
        resetState();
    };
    
    const resetState = () => {
        setPhone('');
        setFoundCustomer(null);
        setShowRegistration(false);
        setNewCustomer({phone: ''});
        setEstimatedLiters('');
    }

    // FIX: Restrict `id` to only keys of Customer that have string values to prevent type errors.
    const renderInput = (id: 'name' | 'phone' | 'address' | 'kecamatan' | 'kota' | 'bankAccount' | 'shareLocation', label: string, required = false) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
            <input 
                type="text" 
                id={id}
                required={required}
                value={(newCustomer as any)[id] || ''}
                onChange={e => setNewCustomer({...newCustomer, [id]: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-input text-foreground placeholder:text-muted-foreground"
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">1. Cek Customer</h2>
                <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground">Nomor HP</label>
                        <input 
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-input text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <button onClick={handleCheckCustomer} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 h-10">Cek</button>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md lg:row-span-2">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">2. Detail & Buat Order</h2>
                {message && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800">{message}</div>}

                {foundCustomer && (
                    <div className="space-y-4 text-foreground">
                        <h3 className="font-bold text-lg text-primary-700">{foundCustomer.name}</h3>
                        <p><strong>HP:</strong> {foundCustomer.phone}</p>
                        <p><strong>Alamat:</strong> {foundCustomer.address}, {foundCustomer.kecamatan}, {foundCustomer.kota}</p>
                        <p><strong>Total Setor:</strong> {foundCustomer.totalLiters} L</p>
                        <div>
                            <label htmlFor="liters-found" className="block text-sm font-medium text-foreground">Estimasi Liter</label>
                            <input
                                type="number"
                                id="liters-found"
                                value={estimatedLiters}
                                onChange={e => setEstimatedLiters(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
                                placeholder="Jumlah liter"
                            />
                        </div>
                        <button onClick={handleCreateOrder} className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Buat Order</button>
                    </div>
                )}

                {showRegistration && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-yellow-700">Customer Belum Terdaftar</h3>
                        <p className="text-muted-foreground">Silakan isi form registrasi di bawah ini.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('name', 'Nama', true)}
                            {renderInput('phone', 'No. HP', true)}
                            {renderInput('address', 'Alamat', true)}
                            {renderInput('kecamatan', 'Kecamatan', true)}
                            {renderInput('kota', 'Kota', true)}
                            {renderInput('bankAccount', 'Rekening Bank', true)}
                            {renderInput('shareLocation', 'Lokasi Share')}
                        </div>
                        <div>
                            {/* FIX: Corrected typo in closing tag from </for_label> to </label> */}
                            <label htmlFor="liters-new" className="block text-sm font-medium text-foreground">Estimasi Liter</label>
                             <input
                                type="number"
                                id="liters-new"
                                value={estimatedLiters}
                                onChange={e => setEstimatedLiters(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
                                placeholder="Jumlah liter"
                                required
                            />
                        </div>
                        <button onClick={handleRegisterAndOrder} className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Daftar &amp; Buat Order</button>
                    </div>
                )}

                {!foundCustomer && !showRegistration && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Masukkan nomor HP customer dan klik "Cek" untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickPickupPage;