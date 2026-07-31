import { useState, useEffect } from 'react';
import { getServices, updateService, deleteService } from '../../services/db';
import { Plus, Edit2, Trash2, Clock, Banknote, X, Save } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', duration: 30, price: 25 });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const data = await getServices();
        setServices(data);
        setLoading(false);
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const handleSave = async (id) => {
        try {
            await updateService(id, editForm);
            setEditingId(null);
            await loadServices();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('❌ Greška prilikom spremanja: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Obrisati ovu uslugu? Ova radnja se ne može poništiti.')) {
            try {
                await deleteService(id);
                await loadServices();
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('❌ Greška prilikom brisanja: ' + error.message);
            }
        }
    };

    const handleAdd = async () => {
        if (!newService.name || !newService.description) {
            alert('Molimo popunite sva polja');
            return;
        }
        try {
            await addDoc(collection(db, 'services'), {
                ...newService,
                duration: parseInt(newService.duration),
                price: parseInt(newService.price)
            });
            setShowAddForm(false);
            setNewService({ name: '', description: '', duration: 30, price: 25 });
            await loadServices();
        } catch (error) {
            console.error('Error adding service:', error);
            alert('❌ Greška prilikom dodavanja: ' + error.message);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gold font-black uppercase tracking-widest text-xs">Učitavanje usluga...</div>;
    }

    return (
        <div className="fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Upravljanje Uslugama</h1>
                    <p className="text-gray-400 text-sm font-medium">Postavite cijene, trajanje i opise usluga.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-gold hover:bg-gold-light text-matte-black font-black px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 uppercase text-[10px] tracking-widest"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddForm ? 'Otkaži' : 'Dodaj uslugu'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-dark-grey p-8 rounded-3xl border border-gold/30 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight relative">Nova Usluga</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Naziv usluge</label>
                            <input
                                type="text"
                                placeholder="npr. Šišanje i pranje"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Kratki opis</label>
                            <input
                                type="text"
                                placeholder="npr. Klasično šišanje sa pranjem i stilizovanjem"
                                value={newService.description}
                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Trajanje (minute)</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={newService.duration}
                                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Cijena (KM)</label>
                            <input
                                type="number"
                                placeholder="20"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end relative">
                        <button
                            onClick={handleAdd}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            Spremi uslugu
                        </button>
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="grid gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-dark-grey p-6 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-all group">
                        {editingId === service.id ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Naziv</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2 text-white outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Opis</label>
                                        <input
                                            type="text"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2 text-white outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Trajanje (min)</label>
                                        <input
                                            type="number"
                                            value={editForm.duration}
                                            onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                                            className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2 text-white outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest ml-1">Cijena (KM)</label>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                                            className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2 text-white outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSave(service.id)}
                                        className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        <Save size={16} /> Spremi
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        <X size={16} /> Otkaži
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-gold transition-colors">{service.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">{service.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-3 bg-white/5 hover:bg-gold hover:text-matte-black rounded-2xl text-gray-400 transition-all shadow-lg active:scale-95"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-2xl text-gray-400 transition-all shadow-lg active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3 bg-matte-black/40 px-4 py-2 rounded-xl border border-white/5">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Trajanje</div>
                                            <div className="text-white font-black text-sm uppercase">{service.duration} min</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-matte-black/40 px-4 py-2 rounded-xl border border-white/5">
                                        <div className="p-2 bg-gold/10 rounded-lg text-gold">
                                            <Banknote size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Cijena</div>
                                            <div className="text-gold font-black text-sm uppercase">{service.price} KM</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="text-center py-20 bg-dark-grey rounded-3xl border border-dashed border-white/10 group">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Plus size={40} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nema pronađenih usluga.</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">Kliknite na "Dodaj uslugu" da počnete.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
