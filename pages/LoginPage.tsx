import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Role } from '../types';

interface LoginPageProps {
  // onLogin is no longer needed as auth state is managed by Supabase
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    // onLogin is no longer needed, App will react to onAuthStateChange
  };
  
  const handleQuickLogin = async (email_val: string) => {
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email_val,
      password: 'password', // Assuming a default password for demo users
    });
    if (error) {
      setError(`Could not log in ${email_val}. Error: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">JelantahGO</h1>
        <p className="text-center text-muted-foreground mb-6">Sistem Manajemen Penjemputan Jelantah</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-foreground text-sm font-bold mb-2" htmlFor="username">
              Email
            </label>
            <input
              className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-foreground leading-tight focus:outline-none focus:shadow-outline bg-input placeholder:text-muted-foreground"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
                <button onClick={() => handleQuickLogin('admin@jelantah.com')} className="w-full bg-gray-700 hover:bg-gray-800 text-white text-sm py-2 px-3 rounded">Admin</button>
                <button onClick={() => handleQuickLogin('kurir@jelantah.com')} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded">Kurir</button>
                <button onClick={() => handleQuickLogin('warehouse@jelantah.com')} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-3 rounded">Warehouse</button>
                <button onClick={() => handleQuickLogin('siti@customer.com')} className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 px-3 rounded">Customer</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;