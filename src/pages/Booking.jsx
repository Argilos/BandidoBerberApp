import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Calendar, Clock, User, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getServices, getBarbers, createBooking, getAllBookings, getReviews } from '../services/db';
import ReviewList from '../components/ReviewList';
import { timeSlots } from '../data/mockData';

const Booking = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [bookingData, setBookingData] = useState({
        service: null,
        barber: null,
        date: new Date(),
        time: null
    });

    const getLocalDateString = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const loadWithDelay = async () => {
            try {
                const [servicesData, barbersData, bookingsData, reviewsData] = await Promise.all([
                    getServices(),
                    getBarbers(),
                    getAllBookings(),
                    getReviews()
                ]);
                setServices(servicesData);
                setBarbers(barbersData);
                setAllBookings(bookingsData);
                setReviews(reviewsData);
            } catch (err) {
                console.error("Failed to load booking data", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadWithDelay();
    }, []);

    useEffect(() => {
        if (bookingData.barber && bookingData.date) {
            const dateStr = getLocalDateString(bookingData.date);
            const booked = allBookings
                .filter(b =>
                    b.barberId === bookingData.barber.id &&
                    b.date && b.date.startsWith(dateStr) &&
                    (b.status === 'confirmed' || b.status === 'upcoming' || b.status === 'blocked' || b.status === 'pending')
                )
                .map(b => b.time);
            setBookedSlots(booked);
        } else {
            setBookedSlots([]);
        }
    }, [bookingData.barber, bookingData.date, allBookings]);

    const handleServiceSelect = (service) => {
        setBookingData({ ...bookingData, service });
        setStep(2);
    };

    const handleBarberSelect = (barber) => {
        setBookingData({ ...bookingData, barber });
        setStep(3);
    };

    const handleTimeSelect = (time) => {
        setBookingData({ ...bookingData, time });
    };

    const handleConfirm = async () => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            const payload = {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Korisnik',
                serviceId: bookingData.service.id,
                serviceName: bookingData.service.name,
                servicePrice: bookingData.service.price,
                serviceDuration: bookingData.service.duration,
                barberId: bookingData.barber.id,
                barberName: bookingData.barber.name,
                date: getLocalDateString(bookingData.date),
                time: bookingData.time,
                status: 'pending'
            };

            await createBooking(payload);
            alert('🎉 Rezervacija poslana! Vaš termin čeka na odobrenje admina. Bit ćete obaviješteni čim bude potvrđen.');
            navigate('/profile');
        } catch (error) {
            console.error("Booking failed", error);
            alert("Greška prilikom rezervacije. Molimo pokušajte ponovo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const formatDate = (date) => {
        const days = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`;
    };

    const getBarberStats = (barberId) => {
        const barberReviews = reviews.filter(r => r.barberId === barberId);
        if (barberReviews.length === 0) return { avg: 0, count: 0 };
        const sum = barberReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            avg: (sum / barberReviews.length).toFixed(1),
            count: barberReviews.length
        };
    };

    if (loadingData) {
        return <div className="min-h-[50vh] flex items-center justify-center text-gold fade-in font-bold uppercase tracking-widest text-xs">Učitavanje opcija...</div>;
    }

    return (
        <div className="pb-8 fade-in">
            {/* Progress Bar */}
            <div className="flex items-center justify-between px-4 mb-8 relative">
                <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-dark-grey -z-10"></div>
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s ? 'bg-gold text-matte-black shadow-[0_0_10px_rgba(198,163,85,0.4)]' : 'bg-dark-grey text-gray-500 border border-white/5'
                            }`}
                    >
                        {step > s ? <Check size={14} strokeWidth={3} /> : s}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 fade-in">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Odaberi uslugu</h2>
                        <p className="text-gray-400 text-sm">Izaberite svoj tretman</p>
                    </div>
                    <div className="space-y-3">
                        {services.map(service => (
                            <div
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${bookingData.service?.id === service.id
                                    ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5'
                                    : 'bg-dark-grey border-white/5 hover:border-gold/30'
                                    }`}
                            >
                                <div>
                                    <h3 className={`font-bold ${bookingData.service?.id === service.id ? 'text-gold' : 'text-white'}`}>{service.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{service.duration} min • {service.description}</p>
                                </div>
                                <span className="font-bold text-lg text-white">{service.price} KM</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 fade-in">
                    <button onClick={prevStep} className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Nazad
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Frizer</h2>
                        <p className="text-gray-400 text-sm">Izaberite svog majstora</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {barbers.map(barber => {
                            const stats = getBarberStats(barber.id);
                            return (
                                <div key={barber.id} className="space-y-4">
                                    <div
                                        onClick={() => handleBarberSelect(barber)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${bookingData.barber?.id === barber.id
                                            ? 'bg-gold/10 border-gold shadow-[0_4px_20px_rgba(198,163,85,0.15)]'
                                            : 'bg-dark-grey border-white/5 hover:border-gold/30'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-matte-black flex items-center justify-center text-xl font-bold text-gold border border-white/10 shrink-0">
                                            {barber.name ? barber.name[0] : 'B'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg tracking-tight">{barber.name}</h3>
                                            <p className="text-xs text-gold/60 font-black uppercase tracking-widest mb-1">{barber.specialty}</p>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={12} className="fill-gold text-gold" />
                                                <span className="text-sm font-bold text-white">{stats.avg}</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">({stats.count} recenzija)</span>
                                            </div>
                                        </div>
                                        {bookingData.barber?.id === barber.id && (
                                            <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                                                <Check size={14} className="text-matte-black" />
                                            </div>
                                        )}
                                    </div>

                                    {bookingData.barber?.id === barber.id && (
                                        <div className="px-2 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Nedavni komentari</h4>
                                            <ReviewList reviews={reviews.filter(r => r.barberId === barber.id).slice(0, 3)} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 fade-in">
                    <button onClick={prevStep} className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Nazad
                    </button>

                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Datum i vrijeme</h2>
                        <p className="text-gray-400 text-sm">Pronađite termin koji vam odgovara</p>
                    </div>

                    {/* Date Scroller */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                            const d = new Date();
                            d.setDate(d.getDate() + offset);
                            const isSelected = d.toDateString() === bookingData.date.toDateString();
                            const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
                            return (
                                <button
                                    key={offset}
                                    onClick={() => setBookingData({ ...bookingData, date: d })}
                                    className={`min-w-[70px] h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${isSelected
                                        ? 'bg-gold text-matte-black border-gold shadow-lg shadow-gold/20'
                                        : 'bg-dark-grey text-gray-400 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <span className="text-[10px] uppercase font-black tracking-widest">{dayNames[d.getDay()]}</span>
                                    <span className="text-xl font-bold mt-1 tracking-tighter">{d.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => {
                            const isBooked = bookedSlots.includes(time);
                            return (
                                <button
                                    key={time}
                                    disabled={isBooked}
                                    onClick={() => handleTimeSelect(time)}
                                    className={`py-3 px-1 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${bookingData.time === time
                                        ? 'bg-gold text-matte-black border-gold shadow-lg shadow-gold/20'
                                        : isBooked
                                            ? 'bg-red-500/5 border-red-500/20 text-gray-700 cursor-not-allowed opacity-50'
                                            : 'bg-dark-grey text-white border-white/5 hover:border-gold/30'
                                        }`}
                                >
                                    {time}
                                    {isBooked && <div className="text-[9px] text-red-500/80 mt-0.5 font-bold">Zauzeto</div>}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        disabled={!bookingData.time}
                        onClick={nextStep}
                        className="w-full py-4 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-matte-black font-black rounded-2xl transition-all mt-4 uppercase tracking-[0.2em] text-xs shadow-lg shadow-gold/20 active:scale-95"
                    >
                        Nastavi
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6 fade-in">
                    <button onClick={prevStep} className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Nazad
                    </button>

                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Potvrda</h2>
                        <p className="text-gray-400 text-sm">Provjerite detalje svog termina</p>
                    </div>

                    <div className="bg-dark-grey p-6 rounded-3xl border border-white/5 space-y-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-center relative">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Usluga</span>
                            <span className="font-bold text-white tracking-tight">{bookingData.service?.name}</span>
                        </div>
                        <div className="flex justify-between items-center relative">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Frizer</span>
                            <span className="font-bold text-white tracking-tight">{bookingData.barber?.name}</span>
                        </div>
                        <div className="flex justify-between items-center relative">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Datum</span>
                            <span className="font-bold text-white tracking-tight">{formatDate(bookingData.date)}</span>
                        </div>
                        <div className="flex justify-between items-center relative">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Vrijeme</span>
                            <span className="font-bold text-white tracking-tight">{bookingData.time}</span>
                        </div>

                        <div className="h-px bg-white/5 my-4 relative"></div>

                        <div className="flex justify-between items-center relative">
                            <span className="text-white font-black text-xs uppercase tracking-widest">Ukupno</span>
                            <span className="text-3xl font-black text-gold tracking-tighter">{bookingData.service?.price} KM</span>
                        </div>
                    </div>

                    <button
                        className="w-full py-4 bg-gold hover:bg-gold-light text-matte-black font-black rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs active:scale-95"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Potvrđivanje...' : 'Potvrdi rezervaciju'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Booking;
