import React, { useState } from 'react';
import { PriceTier, User, Customer, Order, OrderStatus } from '../types';
import WhitelistModal from '../components/WhitelistModal';

interface SettingsPageProps {
  priceTiers: PriceTier[];
  setPriceTiers: React.Dispatch<React.SetStateAction<PriceTier[]>>;
  users: User[];
  customers: Customer[];
  orders: Order[];
  whitelist: string[];
  setWhitelist: React.Dispatch<React.SetStateAction<string[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ priceTiers, setPriceTiers, users, customers, orders, whitelist, setWhitelist }) => {
  const [tiers, setTiers] = useState<PriceTier[]>(priceTiers);
  const [featureMessage, setFeatureMessage] = useState('');
  const [isWhitelistModalOpen, setWhitelistModalOpen] = useState(false);

  const handleTierChange = (index: number, field: keyof PriceTier, value: any) => {
    const newTiers = [...tiers];
    if (field === 'maxLiter' && value === '') {
        newTiers[index][field] = Infinity;
    } else {
        newTiers[index][field] = value;
    }
    setTiers(newTiers);
  };
  
  const handleSaveChanges = () => {
    setPriceTiers(tiers);
    alert('Pengaturan harga berhasil disimpan!');
  }
  
  const handleBackupDatabase = () => {
    try {
      const dataToBackup = {
        users,
        customers,
        orders,
        priceTiers,
        backupTimestamp: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(dataToBackup, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `jelantahgo-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Proses backup gagal:", error);
      alert("Proses backup gagal. Silakan periksa konsol untuk detail.");
    }
  };



  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="bg-card p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">{title}</h2>
      {children}
    </div>
  );

  return (
    <div>
      {renderSection('Pengaturan Harga Beli (per Liter)', (
        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center">
              <div className="flex items-center space-x-2">
                <input 
                    type="number" 
                    value={tier.minLiter}
                    onChange={(e) => handleTierChange(index, 'minLiter', parseInt(e.target.value))}
                    className="w-full p-2 border border-border rounded-md bg-input text-foreground" 
                />
                <span>-</span>
                <input 
                    type="number" 
                    value={tier.maxLiter === Infinity ? '' : tier.maxLiter}
                    onChange={(e) => handleTierChange(index, 'maxLiter', e.target.value ? parseInt(e.target.value) : '')}
                    placeholder='∞'
                    className="w-full p-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground" 
                />
                 <span className="text-muted-foreground">Liter</span>
              </div>
              <div className="col-span-1">
                <input 
                    type="number" 
                    value={tier.pricePerLiter}
                    onChange={(e) => handleTierChange(index, 'pricePerLiter', parseInt(e.target.value))}
                    className="w-full p-2 border border-border rounded-md bg-input text-foreground" 
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Simpan Perubahan</button>
          </div>
        </div>
      ))}
      
      {renderSection('Fitur Lainnya', (
        <>
          {featureMessage && (
              <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm transition-opacity duration-300">
                {featureMessage}
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleBackupDatabase} className="w-full p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-primary/20 transition-colors">Backup Database</button>
              <button onClick={() => setWhitelistModalOpen(true)} className="w-full p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-primary/20 transition-colors">Whitelist Aplikasi</button>
              <button onClick={() => alert('Fungsi ini belum diimplementasikan.')} className="w-full p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-primary/20 transition-colors">Forward Data ke Google Sheet</button>
              <button onClick={() => alert('Fungsi ini belum diimplementasikan.')} className="w-full p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-primary/20 transition-colors">Notifikasi</button>
          </div>
        </>
      ))}

      <WhitelistModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setWhitelistModalOpen(false)}
        whitelist={whitelist}
        setWhitelist={setWhitelist}
      />
    </div>
  );
};

export default SettingsPage;