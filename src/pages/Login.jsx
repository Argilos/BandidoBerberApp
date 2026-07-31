import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ChevronRight, AlertCircle, Scissors } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, loginWithGoogle, user, isAdmin, userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Handle redirection based on role
    useEffect(() => {
        if (!authLoading && user) {
            if (isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else if (userProfile) {
                navigate('/', { replace: true });
            }
        }
    }, [user, isAdmin, userProfile, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            // Logic handled by useEffect
        } catch (err) {
            setError(err.message === 'Firebase: Error (auth/invalid-credential).'
                ? 'Pogrešan email ili lozinka.'
                : 'Došlo je do greške. Molimo pokušajte ponovo.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Logic handled by useEffect
        } catch (err) {
            console.error('Google login error:', err);
            if (err.code === 'auth/unauthorized-domain') {
                setError('Ova domena nije autorizovana u Firebase konzoli.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Pretraživač je blokirao iskačući prozor. Molimo omogućite iskačuće prozore.');
            } else {
                setError('Google prijava nije uspjela. ' + (err.message || ''));
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Branding */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20 mb-4 scale-in">
                        <Scissors size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                        {isRegistering ? 'Nova Era' : 'Dobrodošli nazad'}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                        {isRegistering ? 'Pridružite se Bandido porodici' : 'Prijavite se za pristup svojim terminima'}
                    </p>
                </div>

                <div className="bg-dark-grey/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {isRegistering && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Vaše Ime</label>
                                <div className="relative group/field">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/field:text-gold transition-colors">
                                        <LogIn size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-matte-black/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all"
                                        placeholder="Puno ime"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email Adresa</label>
                            <div className="relative group/field">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/field:text-gold transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-matte-black/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all"
                                    placeholder="ime@primjer.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Lozinka</label>
                            <div className="relative group/field">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within/field:text-gold transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-matte-black/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gold hover:bg-gold-light text-matte-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 group/btn uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {loading ? 'Procesiranje...' : (isRegistering ? 'Kreiraj račun' : 'Prijavi se')}
                            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-gray-600">
                            <span className="bg-dark-grey px-4">Ili nastavi sa</span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                        >
                            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
                            <span>Google</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all active:scale-95 opacity-50 cursor-not-allowed">
                            <img src="https://www.svgrepo.com/show/330030/apple.svg" className="w-4 h-4 invert" alt="Apple" />
                            <span>Apple</span>
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 font-medium">
                    {isRegistering ? 'Već imate račun?' : 'Nemate račun?'}
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="ml-2 text-gold hover:text-white transition-colors font-bold border-b border-gold/30"
                    >
                        {isRegistering ? 'Prijavite se' : 'Registrujte se'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
