import React, { useState } from 'react';
import { User, Role } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau password salah.');
    }
  };
  
  const handleQuickLogin = (role: Role) => {
    // For roles other than customer, just find the first one.
    // For customer, find the specific demo customer.
    const user = role === Role.Customer 
        ? users.find(u => u.username === 'siti')
        : users.find(u => u.role === role);

    if(user) {
        onLogin(user);
    } else {
        setError(`Tidak ada user demo untuk role ${role}.`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">JelantahGO</h1>
        <p className="text-center text-muted-foreground mb-6">Sistem Manajemen Penjemputan Jelantah</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:shadow-outline bg-input placeholder:text-muted-foreground"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-foreground mb-3 leading-tight focus:outline-none focus:shadow-outline bg-input placeholder:text-muted-foreground"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-destructive text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">Coba login sebagai</span>
                <div className="flex-grow border-t border-border"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => handleQuickLogin(Role.Admin)} className="w-full bg-gray-700 hover:bg-gray-800 text-white text-sm py-2 px-3 rounded">Admin</button>
                <button onClick={() => handleQuickLogin(Role.Kurir)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded">Kurir</button>
                <button onClick={() => handleQuickLogin(Role.Warehouse)} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-3 rounded">Warehouse</button>
                <button onClick={() => handleQuickLogin(Role.Customer)} className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 px-3 rounded">Customer</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;