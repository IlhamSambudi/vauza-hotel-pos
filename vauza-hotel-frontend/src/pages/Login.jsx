import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/'; // Hard reload to ensure state resets, or use navigate('/')
        } catch {
            setError('Username atau password salah');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-neu relative overflow-hidden font-sans">
            <div className="w-full max-w-md bg-neu rounded-2xl shadow-neu-flat p-8 relative z-10 mx-4">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-primary tracking-tighter drop-shadow-sm">
                        Vauza POS
                    </h1>
                    <p className="text-sm font-bold text-textSub mt-2 tracking-wide uppercase">
                        Reservation System
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-neu text-red-500 text-sm font-bold px-4 py-3 rounded-xl shadow-neu-pressed text-center">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-textSub mb-2 uppercase tracking-wider ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-neu text-textMain placeholder-textSub/40 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-textSub mb-2 uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neu text-textMain placeholder-textSub/40 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium"
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-textSub hover:text-primary transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neu text-primary py-4 rounded-xl hover:text-primaryHover transition-all disabled:opacity-50 font-black tracking-wide shadow-neu-flat active:shadow-neu-pressed hover:-translate-y-0.5"
                    >
                        {loading ? 'SIGNING IN...' : 'LOGIN'}
                    </button>
                </form>

                {/* FOOTER */}
                <div className="mt-8 text-center text-[10px] font-bold text-textSub uppercase tracking-widest opacity-60">
                    © {new Date().getFullYear()} Vauza Tamma Abadi
                </div>
            </div>
        </div>
    );
}
