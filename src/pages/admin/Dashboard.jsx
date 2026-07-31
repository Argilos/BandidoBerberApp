import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Power, Globe, Star, Clock } from 'lucide-react';
import { getStats, getAllBookings, getSettings, updateSettings } from '../../services/db';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        todayBookings: 0,
        activeBarbers: 0,
        todayRevenue: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [shopSettings, setShopSettings] = useState({ isOpen: true, acceptOnline: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, bookingsData, settingsData] = await Promise.all([
                    getStats(),
                    getAllBookings(),
                    getSettings()
                ]);

                setStats(statsData);
                setShopSettings(settingsData);

                const now = new Date();
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

                const upcoming = bookingsData
                    .filter(b => {
                        if (!b.date || !b.time) return false;
                        if (b.status !== 'confirmed' && b.status !== 'upcoming') return false;

                        const [time, modifier] = b.time.split(' ');
                        let [hours, minutes] = time.split(':');
                        if (hours === '12') hours = '00';
                        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

                        const bookingDateTime = new Date(`${b.date}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
                        return bookingDateTime >= now && bookingDateTime <= oneHourLater;
                    })
                    .sort((a, b) => a.time.localeCompare(b.time));

                setUpcomingAppointments(upcoming);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSetting = async (key) => {
        const newValue = !shopSettings[key];
        const updated = { ...shopSettings, [key]: newValue };
        setShopSettings(updated);
        try {
            await updateSettings(updated);
        } catch (error) {
            alert('Neuspjelo ažuriranje statusa salona');
            setShopSettings(shopSettings);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-gold animate-pulse font-black uppercase tracking-widest text-xs">Učitavanje analitike...</div>
            </div>
        );
    }

    return (
        <div className="fade-in space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Kontrolna Tabla</h1>
                    <p className="text-gray-400 text-sm font-medium">Operativni pregled i upravljanje u realnom vremenu.</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${shopSettings.isOpen ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {shopSettings.isOpen ? '● Salon Radi' : '○ Salon Zatvoren'}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-grey p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-gold/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Ukupno Rezervacija</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Calendar size={18} /></div>
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter">{stats.totalBookings}</span>
                </div>

                <div className="bg-dark-grey p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-gold/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Broj Frizerâ</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Users size={18} /></div>
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter">{stats.activeBarbers}</span>
                </div>

                <div className="bg-dark-grey p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-gold/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Današnji Prihod</span>
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><DollarSign size={18} /></div>
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter">{stats.todayRevenue} KM</span>
                </div>

                <div className="bg-dark-grey p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-gold/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Potvrđeni Termini</span>
                        <div className="p-2 bg-gold/10 rounded-lg text-gold"><TrendingUp size={18} /></div>
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter">{stats.upcomingBookings || 0}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Real Upcoming Appointments */}
                <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -ml-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-8 relative">
                        <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
                            <Clock className="text-gold" size={20} /> Počinje za 1 sat
                        </h3>
                        <span className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded font-black uppercase tracking-widest border border-gold/10">Uživo</span>
                    </div>

                    <div className="space-y-4 relative">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-matte-black/40 border border-white/5 hover:border-gold/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center text-gold font-black border border-gold/10 text-lg group-hover:scale-110 transition-transform shadow-lg">
                                        {(booking.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-md tracking-tight">{booking.userName || 'Nepoznat klijent'}</h4>
                                        <p className="text-[10px] text-gold font-black uppercase tracking-widest">{booking.serviceName} • {booking.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-green-400 uppercase tracking-widest italic">Spreman</span>
                                    <span className="text-[9px] text-gray-600 font-bold uppercase">kod {booking.barberName}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center opacity-30">
                                <Calendar size={48} className="text-gray-600 mb-4" />
                                <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Nema termina u narednih sat vremena.</p>
                            </div>
                        )}
                        <button onClick={() => window.location.href = '/admin/schedule'} className="w-full mt-4 py-4 bg-white/5 hover:bg-gold hover:text-matte-black text-gray-500 hover:shadow-lg hover:shadow-gold/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                            Otvori puni raspored
                        </button>
                    </div>
                </div>

                {/* Operations Control */}
                <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2 uppercase tracking-tight relative">
                        <Power className="text-gold" size={20} /> Kontrola Rada
                    </h3>
                    <div className="space-y-6 relative">
                        <div className="flex justify-between items-center p-5 rounded-2xl bg-matte-black/30 border border-white/5 hover:border-white/10 transition-all">
                            <div>
                                <h4 className="font-black text-white text-xs uppercase tracking-wider">Status Salona</h4>
                                <p className="text-[10px] text-gray-500 font-medium italic mt-1">Glavni prekidač rada (Otvoreno/Zatvoreno)</p>
                            </div>
                            <button
                                onClick={() => toggleSetting('isOpen')}
                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${shopSettings.isOpen ? 'bg-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${shopSettings.isOpen ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-5 rounded-2xl bg-matte-black/30 border border-white/5 hover:border-white/10 transition-all">
                            <div>
                                <h4 className="font-black text-white text-xs uppercase tracking-wider">Online Rezervacije</h4>
                                <p className="text-[10px] text-gray-500 font-medium italic mt-1">Omogući/Onemogući rezervacije za klijente</p>
                            </div>
                            <button
                                onClick={() => toggleSetting('acceptOnline')}
                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${shopSettings.acceptOnline ? 'bg-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${shopSettings.acceptOnline ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-gold/5 border border-gold/10">
                            <h4 className="text-gold font-black text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Star size={12} fill="currentColor" /> Sigurnosna Napomena
                            </h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed italic font-medium">
                                Promjene statusa su trenutne i primjenjuju se na sve korisničke uređaje prilikom sljedeće sinhronizacije sesije.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
