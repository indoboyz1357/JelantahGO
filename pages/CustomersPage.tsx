import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import Modal from '../components/Modal';
import { SearchIcon, MapPinIcon } from '../components/icons';

interface CustomersPageProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomersPage: React.FC<CustomersPageProps> = ({ customers, setCustomers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.kota.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const handleOpenEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setEditModalOpen(true);
    };
    
    const handleCloseEditModal = () => {
        setEditingCustomer(null);
        setEditModalOpen(false);
    }

    const handleSaveChanges = () => {
        if (!editingCustomer) return;
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
        handleCloseEditModal();
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!editingCustomer) return;
        setEditingCustomer({
            ...editingCustomer,
            [e.target.name]: e.target.value
        })
    }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Kelola Customer</h2>
      <div className="mb-4">
        <div className="relative">
            <input 
                type="text"
                placeholder="Cari Nama, No. HP, Kecamatan, atau Kota..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-muted-foreground">
          <thead className="text-xs text-foreground uppercase bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3">Nama</th>
              <th scope="col" className="px-6 py-3">Kontak</th>
              <th scope="col" className="px-6 py-3">Alamat Singkat</th>
              <th scope="col" className="px-6 py-3">Total Liter</th>
              <th scope="col" className="px-6 py-3">Jumlah Downline</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="bg-card border-b border-border hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground">{customer.name}</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4">
                  {customer.shareLocation ? (
                    <a 
                      href={customer.shareLocation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      <span>{customer.kecamatan}, {customer.kota}</span>
                      <MapPinIcon className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <span>{customer.kecamatan}, {customer.kota}</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold">{customer.totalLiters} L</td>
                <td className="px-6 py-4 text-center">{customer.downline.length}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleOpenEditModal(customer)} className="font-medium text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title={`Edit Customer: ${editingCustomer?.name}`}>
         {editingCustomer && (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">Nama</label>
                        <input type="text" name="name" value={editingCustomer.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">No. HP</label>
                        <input type="text" name="phone" value={editingCustomer.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground">Alamat</label>
                        <input type="text" name="address" value={editingCustomer.address} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Kecamatan</label>
                        <input type="text" name="kecamatan" value={editingCustomer.kecamatan} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground">Kota</label>
                        <input type="text" name="kota" value={editingCustomer.kota} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Rekening</label>
                        <input type="text" name="bankAccount" value={editingCustomer.bankAccount} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground">Lokasi Share (URL Peta)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="shareLocation" 
                                value={editingCustomer.shareLocation} 
                                onChange={handleInputChange} 
                                className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground pr-10"
                                placeholder="https://maps.google.com/..."
                            />
                            {editingCustomer.shareLocation && (
                                <a 
                                    href={editingCustomer.shareLocation}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Buka Peta"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"
                                >
                                    <MapPinIcon className="w-5 h-5"/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={handleCloseEditModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-md">Batal</button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-md">Simpan Perubahan</button>
                </div>
            </div>
         )}
      </Modal>

    </div>
  );
};

export default CustomersPage;