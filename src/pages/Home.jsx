import { useNavigate } from 'react-router-dom';
import { Clock, Scissors, Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getServices } from '../services/db';

const Home = () => {
    const navigate = useNavigate();
    const [featuredServices, setFeaturedServices] = useState([]);

    useEffect(() => {
        getServices().then(data => {
            setFeaturedServices(data.slice(0, 3));
        });
    }, []);

    return (
        <div className="space-y-8 fade-in text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-dark-grey p-6 text-center border border-white/5 shadow-2xl slide-up">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-gold/5 rounded-full blur-3xl"></div>

                <h1 className="relative text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    BANDIDO BY HIMZO
                </h1>
                <p className="relative text-gray-400 text-sm mb-6">
                    Vrhunsko uređivanje za modernog muškarca.
                </p>
                <button
                    onClick={() => navigate('/book')}
                    className="relative w-full py-3 bg-gold hover:bg-gold-light text-matte-black font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    Rezerviši termin <ArrowRight size={18} />
                </button>
            </section>

            {/* Quick Info Grid */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-dark-grey p-4 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2 hover:border-gold/30 transition-colors cursor-pointer" onClick={() => navigate('/services')}>
                    <div className="p-2 bg-matte-black rounded-full text-gold">
                        <Scissors size={20} />
                    </div>
                    <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Usluge</span>
                        <span className="font-bold text-sm">Cijeli meni</span>
                    </div>
                </div>
                <div className="bg-dark-grey p-4 rounded-xl border border-white/5 flex flex-col items-center text-center gap-2">
                    <div className="p-2 bg-matte-black rounded-full text-gold">
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Danas</span>
                        <span className="font-bold text-sm text-green-400">Otvoreno</span>
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section>
                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Popularne usluge</h2>
                    <button onClick={() => navigate('/services')} className="text-[10px] text-gold hover:text-white transition-colors uppercase font-black tracking-widest">
                        Vidi sve
                    </button>
                </div>
                <div className="space-y-3">
                    {featuredServices.map((service, index) => (
                        <div
                            key={service.id}
                            className="group flex justify-between items-center bg-dark-grey p-4 rounded-xl border border-white/5 hover:border-gold/50 transition-all cursor-pointer"
                            onClick={() => navigate('/book')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-gold/50 font-mono text-sm">0{index + 1}</span>
                                <div>
                                    <h3 className="font-semibold text-white group-hover:text-gold transition-colors">{service.name}</h3>
                                    <p className="text-xs text-gray-500">{service.duration} min</p>
                                </div>
                            </div>
                            <span className="font-bold text-lg text-white">{service.price} KM</span>
                        </div>
                    ))}
                    {featuredServices.length === 0 && <div className="text-gray-500 text-sm text-center italic py-4">Učitavanje usluga...</div>}
                </div>
            </section>

            {/* Testimonial / Social Proof */}
            <section className="bg-gradient-to-br from-dark-grey to-matte-black p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1 text-gold mb-2">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                </div>
                <p className="text-sm text-gray-300 italic">"Najbolji fade u gradu. Atmosfera je vrhunska."</p>
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">— Alex M.</p>
            </section>
        </div>
    );
};

export default Home;
