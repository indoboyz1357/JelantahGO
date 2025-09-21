import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Jika email Anda terdaftar, Anda akan menerima tautan untuk mengatur ulang kata sandi.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Lupa Kata Sandi</h2>
                <p className="text-sm text-center text-gray-600">
                    Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi Anda.
                </p>
                <form className="space-y-6" onSubmit={handlePasswordResetRequest}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Email Anda"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Ingat kata sandi Anda?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Kembali ke Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;