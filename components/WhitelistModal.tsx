import React, { useState } from 'react';
import Modal from './Modal';
import { TrashIcon } from './icons';

interface WhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  whitelist: string[];
  setWhitelist: React.Dispatch<React.SetStateAction<string[]>>;
}

const WhitelistModal: React.FC<WhitelistModalProps> = ({ isOpen, onClose, whitelist, setWhitelist }) => {
  const [newIp, setNewIp] = useState('');

  const handleAddIp = () => {
    if (newIp && !whitelist.includes(newIp)) {
      // Basic IP validation regex
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(newIp)) {
        setWhitelist([...whitelist, newIp]);
        setNewIp('');
      } else {
        alert('Format alamat IP tidak valid.');
      }
    }
  };

  const handleRemoveIp = (ipToRemove: string) => {
    setWhitelist(whitelist.filter(ip => ip !== ipToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kelola Whitelist Aplikasi">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Tambah Alamat IP Baru</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="w-full p-2 border rounded-md border-border bg-input text-foreground"
              placeholder="Contoh: 192.168.1.1"
            />
            <button onClick={handleAddIp} className="px-4 py-2 bg-primary-600 text-white rounded-md">Tambah</button>
          </div>
        </div>
        <div>
          <h3 className="text-md font-semibold text-foreground mb-2">Daftar IP Whitelist</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {whitelist.map(ip => (
              <li key={ip} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <span className="font-mono">{ip}</span>
                <button onClick={() => handleRemoveIp(ip)} className="text-destructive hover:text-destructive/80">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
            {whitelist.length === 0 && (
              <li className="text-center text-muted-foreground py-4">Belum ada IP yang di-whitelist.</li>
            )}
          </ul>
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-muted text-muted-foreground rounded-md">Tutup</button>
        </div>
      </div>
    </Modal>
  );
};

export default WhitelistModal;