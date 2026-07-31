import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../services/db';

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            const data = await getServices();
            setServices(data);
            setLoading(false);
        };
        fetchServices();
    }, []);

    if (loading) {
        return <div className="text-center pt-20 text-gold font-bold uppercase tracking-widest text-xs">Učitavanje usluga...</div>;
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gold mb-2 uppercase tracking-tight">Naš Meni</h1>
                <p className="text-gray-400 text-sm font-medium">Odaberite uslugu kako biste nastavili sa rezervacijom.</p>
            </div>

            <div className="grid gap-4">
                {services.map(service => (
                    <div
                        key={service.id}
                        className="group relative bg-dark-grey p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all active:scale-[0.98] cursor-pointer shadow-xl overflow-hidden"
                        onClick={() => navigate('/book')}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-2 relative">
                            <div>
                                <h4 className="text-lg font-extrabold text-white group-hover:text-gold transition-colors tracking-tight">{service.name}</h4>
                                <span className="text-[10px] text-gold/60 font-black tracking-widest uppercase">{service.duration} MIN</span>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">{service.price} KM</span>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium relative">{service.description}</p>

                        <div className="flex justify-end relative">
                            <button
                                className="text-[10px] font-black uppercase tracking-widest text-matte-black bg-gold px-6 py-2.5 rounded-full shadow-lg shadow-gold/20 transform translate-y-2 group-hover:translate-y-0 transition-all active:scale-90"
                            >
                                Rezerviši
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Services;
