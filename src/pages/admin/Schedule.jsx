import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Check, X, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { getAllBookings, updateBooking, getBarbers, createBooking, deleteBooking } from '../../services/db';

const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const Schedule = () => {
    const [bookings, setBookings] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dateInputRef = useRef(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [bookingsData, barbersData] = await Promise.all([
            getAllBookings(),
            getBarbers()
        ]);
        setBookings(bookingsData);
        setBarbers(barbersData);
        setLoading(false);
    };

    const handleApprove = async (bookingId) => {
        if (confirm('Odobriti ovaj termin?')) {
            try {
                await updateBooking(bookingId, { status: 'confirmed' });
                alert('✅ Termin uspješno odobren!');
                await loadData();
            } catch (error) {
                console.error('Error approving:', error);
                alert('❌ Greška prilikom odobravanja: ' + error.message);
            }
        }
    };

    const handleReject = async (bookingId) => {
        if (confirm('Odbiti ovaj termin?')) {
            try {
                await updateBooking(bookingId, { status: 'rejected' });
                alert('✅ Termin uspješno odbijen!');
                await loadData();
            } catch (error) {
                console.error('Error rejecting:', error);
                alert('❌ Greška prilikom odbijanja: ' + error.message);
            }
        }
    };

    const handleBlockSlot = async (barberId, time) => {
        const barber = barbers.find(b => b.id === barberId);
        if (confirm(`Zauzeti termin ${time} za: ${barber?.name}?`)) {
            try {
                const selectedDateStr = selectedDate.toISOString().split('T')[0];
                await createBooking({
                    barberId,
                    barberName: barber?.name || 'Nepoznato',
                    date: selectedDateStr,
                    time,
                    status: 'blocked',
                    serviceName: 'ZAUZETO',
                    serviceId: 'blocked',
                    servicePrice: 0,
                    userId: 'admin',
                    userEmail: 'admin',
                    userName: 'Admin Blokada'
                });
                alert('✅ Termin uspješno zauzet!');
                await loadData();
            } catch (error) {
                console.error('Error blocking slot:', error);
                alert('❌ Greška prilikom zauzimanja: ' + error.message);
            }
        }
    };

    const handleUnblockSlot = async (bookingId) => {
        if (confirm('Osloboditi ovaj termin?')) {
            try {
                await deleteBooking(bookingId);
                alert('✅ Termin uspješno oslobođen!');
                await loadData();
            } catch (error) {
                console.error('Error unblocking:', error);
                alert('❌ Greška prilikom oslobađanja: ' + error.message);
            }
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const pendingBookings = bookings.filter(b => b.status === 'pending');

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const dayBookings = bookings.filter(b =>
        b.date && b.date.startsWith(selectedDateStr) &&
        (b.status === 'confirmed' || b.status === 'upcoming' || b.status === 'blocked')
    );

    const getBookingForSlot = (barberId, timeSlot) => {
        return dayBookings.find(b => b.barberId === barberId && b.time === timeSlot);
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

    if (loading) {
        return <div className="min-h-[400px] flex items-center justify-center text-gold font-black uppercase tracking-widest text-xs">Učitavanje rasporeda...</div>;
    }

    return (
        <div className="fade-in space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Raspored i Rezervacije</h1>
                <p className="text-gray-400 text-sm font-medium">Upravljajte terminima i odobravajte nove zahtjeve.</p>
            </div>

            {/* Pending Approvals Section */}
            {pendingBookings.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-3 mb-6 relative">
                        <h2 className="text-xl font-extrabold text-yellow-400 uppercase tracking-tight">Zahtjevi na čekanju</h2>
                        <span className="bg-yellow-500 text-matte-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-yellow-600/20 shadow-lg">
                            {pendingBookings.length}
                        </span>
                    </div>
                    <div className="space-y-3 relative">
                        {pendingBookings.map(booking => (
                            <div key={booking.id} className="bg-matte-black/40 p-5 rounded-2xl border border-yellow-500/10 hover:border-yellow-500/30 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{booking.serviceName}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500">
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                                <Calendar size={14} className="text-yellow-500/60" />
                                                {booking.date ? new Date(booking.date).toLocaleDateString('bs-BA') : 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                                <Clock size={14} className="text-yellow-500/60" />
                                                {booking.time}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gold/10 text-gold px-2 py-1 rounded">
                                                <User size={14} />
                                                {booking.barberName}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-3">
                                            Klijent: <span className="text-white">{booking.userName || booking.userEmail}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(booking.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                        >
                                            <Check size={16} /> Odobri
                                        </button>
                                        <button
                                            onClick={() => handleReject(booking.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                        >
                                            <X size={16} /> Odbij
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar View */}
            <div className="bg-dark-grey rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {/* Date Selector */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 border-b border-white/5 bg-matte-black/50">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Dnevni Raspored</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-3 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-gold"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="relative group">
                            <div className="flex items-center gap-3 font-black text-white px-6 py-3 bg-matte-black border border-white/5 rounded-2xl group-hover:border-gold/30 transition-all cursor-pointer shadow-lg min-w-[240px] justify-center text-xs uppercase tracking-widest">
                                <Calendar size={18} className="text-gold" />
                                <span>{selectedDate.toLocaleDateString('bs-BA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <input
                                type="date"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                        <button
                            onClick={() => changeDate(1)}
                            className="p-3 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-gold"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="ml-2 px-6 py-3 bg-gold/10 hover:bg-gold text-gold hover:text-matte-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            Danas
                        </button>
                    </div>
                </div>

                {/* Schedule Grid */}
                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                        {/* Header - Barber Columns */}
                        <div className={`grid gap-px bg-white/5`} style={{ gridTemplateColumns: `110px repeat(${barbers.length}, 1fr)` }}>
                            <div className="p-5 bg-dark-grey border-r border-white/5 flex items-center justify-center text-gray-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                VRIJEME
                            </div>
                            {barbers.map(barber => (
                                <div key={barber.id} className="p-5 bg-dark-grey border-r last:border-r-0 border-white/5 text-center relative group">
                                    <div className="font-black text-white mb-1 uppercase tracking-tight tracking-widest">{barber.name}</div>
                                    <div className="text-[9px] text-gold/60 font-black uppercase tracking-widest">{barber.specialty}</div>
                                </div>
                            ))}
                        </div>

                        {/* Time Slots */}
                        <div className="divide-y divide-white/5">
                            {timeSlots.map(time => (
                                <div key={time} className={`grid gap-px bg-white/5`} style={{ gridTemplateColumns: `110px repeat(${barbers.length}, 1fr)` }}>
                                    <div className="p-4 bg-dark-grey border-r border-white/5 flex items-center justify-center text-gray-500 font-black text-[10px] tracking-widest">
                                        {time}
                                    </div>
                                    {barbers.map(barber => {
                                        const booking = getBookingForSlot(barber.id, time);
                                        return (
                                            <div
                                                key={barber.id + time}
                                                className="p-2 bg-dark-grey border-r last:border-r-0 border-white/5 relative group min-h-[70px]"
                                            >
                                                {booking ? (
                                                    booking.status === 'blocked' ? (
                                                        <div
                                                            onClick={() => handleUnblockSlot(booking.id)}
                                                            className="bg-red-500/5 border-l-4 border-red-500 p-3 rounded-xl h-full flex flex-col justify-center cursor-pointer hover:bg-red-500/10 transition-all shadow-inner"
                                                        >
                                                            <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                                                <Lock size={12} />
                                                                <span>ZAUZETO</span>
                                                            </div>
                                                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">Slobodi termin</div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="bg-gold/5 border-l-4 border-gold p-3 rounded-xl h-full flex flex-col justify-center cursor-pointer hover:bg-gold/10 transition-all shadow-inner"
                                                        >
                                                            <div className="font-extrabold text-white truncate tracking-tight text-sm uppercase">{booking.userName || 'Korisnik'}</div>
                                                            <div className="text-[10px] text-gold/80 truncate font-bold uppercase tracking-widest mt-0.5">{booking.serviceName}</div>
                                                            <div className="text-[9px] text-gray-600 font-black mt-1 uppercase">{booking.servicePrice} KM</div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div
                                                        onClick={() => handleBlockSlot(barber.id, time)}
                                                        className="w-full h-full rounded-xl opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-[10px] text-gray-500 font-black uppercase tracking-widest cursor-pointer transition-all border border-dashed border-white/10"
                                                    >
                                                        <Lock size={16} className="mb-1 text-gray-700" />
                                                        <span>Zauzmi</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full"></div>
                    <div className="text-3xl font-black text-white mb-2 tracking-tighter relative">{dayBookings.length}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest relative">Današnjih Rezervacija</div>
                </div>
                <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full"></div>
                    <div className="text-3xl font-black text-yellow-500 mb-2 tracking-tighter relative">{pendingBookings.length}</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest relative">Zahtjeva na čekanju</div>
                </div>
                <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full"></div>
                    <div className="text-3xl font-black text-gold mb-2 tracking-tighter relative">
                        {dayBookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0)} KM
                    </div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest relative">Današnji Prihod</div>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div
                    onClick={() => setSelectedBooking(null)}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-dark-grey rounded-3xl border border-white/10 max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full -mr-24 -mt-24"></div>

                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight relative">Detalji Rezervacije</h2>

                        <div className="space-y-6 relative">
                            <div>
                                <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Usluga</div>
                                <div className="text-xl font-black text-gold uppercase tracking-tight">{selectedBooking.serviceName}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Ime Klijenta</div>
                                    <div className="text-white font-black text-sm uppercase">{selectedBooking.userName || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Email</div>
                                    <div className="text-gray-400 font-medium text-xs break-all">{selectedBooking.userEmail || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Datum</div>
                                    <div className="text-white font-black text-sm uppercase">
                                        {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString('bs-BA', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Vrijeme</div>
                                    <div className="text-white font-black text-sm uppercase">{selectedBooking.time}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Frizer</div>
                                    <div className="text-white font-black text-sm uppercase tracking-tight">{selectedBooking.barberName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Cijena</div>
                                    <div className="text-gold font-black text-xl tracking-tighter">{selectedBooking.servicePrice} KM</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Status</div>
                                <span className={`inline-block text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg ${selectedBooking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                    selectedBooking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        selectedBooking.status === 'blocked' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                    }`}>
                                    {getStatusLabel(selectedBooking.status)}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            {selectedBooking.status === 'pending' && (
                                <div className="flex gap-4 pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedBooking.id);
                                            setSelectedBooking(null);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                                    >
                                        <Check size={18} /> Odobri
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedBooking.id);
                                            setSelectedBooking(null);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                                    >
                                        <X size={18} /> Odbij
                                    </button>
                                </div>
                            )}

                            {selectedBooking.status === 'confirmed' && (
                                <div className="pt-8 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            handleReject(selectedBooking.id);
                                            setSelectedBooking(null);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                                    >
                                        <X size={18} /> Otkaži Rezervaciju
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
