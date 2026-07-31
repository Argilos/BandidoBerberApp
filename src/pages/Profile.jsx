import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, LogOut, User, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/db';
import ReviewForm from '../components/ReviewForm';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewBooking, setReviewBooking] = useState(null);

    const loadBookings = () => {
        if (user) {
            getUserBookings(user.uid).then(data => {
                setBookings(data);
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        loadBookings();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Potvrđeno';
            case 'pending': return 'Na čekanju';
            case 'rejected': return 'Odbijeno';
            case 'upcoming': return 'Predstojeće';
            case 'blocked': return 'Zauzeto';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Review Modal */}
            {reviewBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-matte-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-dark-grey rounded-3xl border border-white/10 shadow-2xl relative p-8 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setReviewBooking(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Ocijeni: {reviewBooking.barberName}</h2>
                        <p className="text-gray-500 text-[10px] mb-8 font-black uppercase tracking-[0.2em]">{reviewBooking.serviceName} • {reviewBooking.date}</p>

                        <ReviewForm
                            barberId={reviewBooking.barberId}
                            barberName={reviewBooking.barberName}
                            onReviewSubmitted={() => {
                                setReviewBooking(null);
                                loadBookings();
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Moj Profil</h1>
                    <p className="text-gray-400 text-sm font-medium">Upravljajte svojim računom</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition-colors" title="Odjava">
                    <LogOut size={24} />
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 flex items-center gap-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profil" className="w-16 h-16 rounded-full border-2 border-gold/20 object-cover shadow-lg" />
                ) : (
                    <div className="w-16 h-16 bg-matte-black rounded-full border-2 border-gold/20 flex items-center justify-center text-xl text-gold font-black shadow-lg">
                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="relative">
                    <h2 className="text-xl font-black text-white tracking-tight">{user?.displayName || 'Korisnik'}</h2>
                    <p className="text-gray-500 text-sm font-medium">{user?.email}</p>
                    <span className="text-[10px] text-gold font-black uppercase tracking-widest mt-1 inline-block bg-gold/10 px-2 py-0.5 rounded">Član</span>
                </div>
            </div>

            {/* Booking History */}
            <div>
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Moji Termini</h3>

                {loading ? (
                    <div className="text-center py-12 text-gold animate-pulse font-black uppercase tracking-widest text-xs">Učitavanje termina...</div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((apt) => (
                            <div key={apt.id} className="bg-dark-grey p-5 rounded-3xl border border-white/5 hover:border-gold/20 transition-all group shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-white text-lg tracking-tight uppercase">{apt.serviceName}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${apt.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                                                apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/10'
                                                }`}>
                                                {getStatusLabel(apt.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight"><Calendar size={14} className="text-gold" /> {apt.date}</div>
                                        <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-1 justify-end font-black uppercase tracking-widest"><Clock size={12} /> {apt.time}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5 relative">
                                    <div className="flex items-center gap-3 text-gold font-bold">
                                        <div className="w-8 h-8 rounded-full bg-matte-black flex items-center justify-center text-xs border border-gold/10">
                                            {(apt.barberName || 'B')[0]}
                                        </div>
                                        <span className="text-sm tracking-tight">{apt.barberName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {apt.status === 'confirmed' && (
                                            <button
                                                onClick={() => setReviewBooking(apt)}
                                                className="flex items-center gap-2 bg-white/5 hover:bg-gold hover:text-matte-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-90"
                                            >
                                                <Star size={14} /> Ocijeni
                                            </button>
                                        )}
                                        {apt.status === 'pending' && (
                                            <button className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 px-3 py-2 transition-colors">Otkaži zahtjev</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 bg-dark-grey/30 rounded-3xl border-2 border-dashed border-white/5">
                        <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="mb-6 font-medium italic text-sm">Niste imali prethodnih termina.</p>
                        <button
                            onClick={() => navigate('/book')}
                            className="bg-gold text-matte-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/10 active:scale-95"
                        >
                            Rezerviši svoj prvi termin
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
