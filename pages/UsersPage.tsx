import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient'; // Import supabase client
import { User, Role } from '../types';
import Modal from '../components/Modal';
import { SearchIcon } from '../components/icons';

interface UsersPageProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<Partial<User & { password?: string }>>({ name: '', username: '', role: Role.Kurir, password: '' });

    // Prevent the primary admin from being deleted
    const primaryAdminId = 'admin-jelantahgo';

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleOpenEditModal = (user: User) => {
        setEditingUser({ ...user });
        setEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setEditModalOpen(false);
        setAddModalOpen(false);
        setNewUser({ name: '', username: '', role: Role.Kurir });
    };

    const handleSaveChanges = () => {
        if (!editingUser) return;
        setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
        handleCloseModal();
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.username || !newUser.role || !newUser.password) {
            alert("Harap isi semua field, termasuk password.");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: newUser.username, // Using username as email for auth
            password: newUser.password,
            options: {
                data: {
                    name: newUser.name,
                    role: newUser.role,
                }
            }
        });

        if (error) {
            alert(`Error creating user: ${error.message}`);
            return;
        }

        if (data.user) {
            const userToAdd: User = {
                id: data.user.id,
                name: newUser.name,
                username: newUser.username,
                role: newUser.role,
            };
            setUsers(prev => [...prev, userToAdd]);
            handleCloseModal();
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (userId === primaryAdminId) {
            alert('Admin utama tidak dapat dihapus.');
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };
 
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, userState: 'edit' | 'add') => {
         const { name, value } = e.target;
        if (userState === 'edit' && editingUser) {
            setEditingUser({ ...editingUser, [name]: value });
        } else if (userState === 'add') {
            setNewUser({ ...newUser, [name]: value as Role });
        }
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-card-foreground">Manajemen User</h2>
                <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Tambah User</button>
            </div>
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari Nama atau Username..."
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
                            <th scope="col" className="px-6 py-3">Username</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="bg-card border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenEditModal(user)} className="font-medium text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModal} title={`Edit User: ${editingUser?.name}`}>
                {editingUser && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground">Nama</label>
                            <input type="text" name="name" value={editingUser.name} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Username</label>
                            <input type="text" name="username" value={editingUser.username} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Role</label>
                            <select name="role" value={editingUser.role} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground">
                                {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-md">Batal</button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-md">Simpan Perubahan</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add User Modal */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseModal} title="Tambah User Baru">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">Nama</label>
                        <input type="text" name="name" value={newUser.name} onChange={(e) => handleInputChange(e, 'add')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Username</label>
                        <input type="text" name="username" value={newUser.username} onChange={(e) => handleInputChange(e, 'add')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Password</label>
                        <input type="password" name="password" value={newUser.password} onChange={(e) => handleInputChange(e, 'add')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Role</label>
                        <select name="role" value={newUser.role} onChange={(e) => handleInputChange(e, 'add')} className="mt-1 w-full p-2 border rounded-md border-border bg-input text-foreground">
                            {Object.values(Role).filter(r => r !== Role.Customer).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={handleCloseModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-md">Batal</button>
                        <button onClick={handleAddUser} className="px-4 py-2 bg-primary-600 text-white rounded-md">Tambah User</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersPage;