import { useState, useEffect } from 'react';
import { getBarbers, updateBarber, deleteBarber } from '../../services/db';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Barbers = () => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBarber, setNewBarber] = useState({ name: '', specialty: '', available: true });

    useEffect(() => {
        loadBarbers();
    }, []);

    const loadBarbers = async () => {
        const data = await getBarbers();
        setBarbers(data);
        setLoading(false);
    };

    const handleEdit = (barber) => {
        setEditingId(barber.id);
        setEditForm({ ...barber });
    };

    const handleSave = async (id) => {
        try {
            await updateBarber(id, editForm);
            setEditingId(null);
            await loadBarbers();
        } catch (error) {
            console.error('Error saving barber:', error);
            alert('❌ Greška prilikom spremanja: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Obrisati ovog frizera? Ova radnja se ne može poništiti.')) {
            try {
                await deleteBarber(id);
                await loadBarbers();
            } catch (error) {
                console.error('Error deleting barber:', error);
                alert('❌ Greška prilikom brisanja: ' + error.message);
            }
        }
    };

    const handleAdd = async () => {
        if (!newBarber.name || !newBarber.specialty) {
            alert('Molimo popunite sva polja');
            return;
        }
        try {
            await addDoc(collection(db, 'barbers'), newBarber);
            setShowAddForm(false);
            setNewBarber({ name: '', specialty: '', available: true });
            await loadBarbers();
        } catch (error) {
            console.error('Error adding barber:', error);
            alert('❌ Greška prilikom dodavanja: ' + error.message);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gold font-black uppercase tracking-widest text-xs">Učitavanje frizera...</div>;
    }

    return (
        <div className="fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Upravljanje Frizerima</h1>
                    <p className="text-gray-400 text-sm font-medium">Dodajte, uredite ili obrišite profile frizera.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-gold hover:bg-gold-light text-matte-black font-black px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95 uppercase text-[10px] tracking-widest"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddForm ? 'Otkaži' : 'Dodaj frizera'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-dark-grey p-8 rounded-3xl border border-gold/30 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight relative">Novi Frizer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Ime i prezime</label>
                            <input
                                type="text"
                                placeholder="Unesite ime frizera"
                                value={newBarber.name}
                                onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Specijalnost</label>
                            <input
                                type="text"
                                placeholder="npr. Fades, Brada, Makaze"
                                value={newBarber.specialty}
                                onChange={(e) => setNewBarber({ ...newBarber, specialty: e.target.value })}
                                className="w-full bg-matte-black border border-white/5 focus:border-gold/50 rounded-2xl px-5 py-3 text-white transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between relative">
                        <label className="flex items-center gap-3 text-white cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full transition-all relative ${newBarber.available ? 'bg-gold' : 'bg-gray-800'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newBarber.available ? 'left-7' : 'left-1'}`}></div>
                            </div>
                            <input
                                type="checkbox"
                                checked={newBarber.available}
                                onChange={(e) => setNewBarber({ ...newBarber, available: e.target.checked })}
                                className="hidden"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Dostupan za rad</span>
                        </label>
                        <button
                            onClick={handleAdd}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            Spremi frizera
                        </button>
                    </div>
                </div>
            )}

            {/* Barbers List */}
            <div className="grid gap-6">
                {barbers.map(barber => (
                    <div key={barber.id} className="bg-dark-grey p-6 rounded-3xl border border-white/5 flex items-center justify-between shadow-xl hover:border-white/10 transition-all group">
                        {editingId === barber.id ? (
                            <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Ime</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2.5 text-white outline-none"
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Specijalnost</label>
                                    <input
                                        type="text"
                                        value={editForm.specialty}
                                        onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                        className="w-full bg-matte-black border border-white/10 focus:border-gold/50 rounded-xl px-4 py-2.5 text-white outline-none"
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 px-4">
                                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Dostupan</label>
                                    <input
                                        type="checkbox"
                                        checked={editForm.available}
                                        onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                                        className="w-5 h-5 accent-gold"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSave(barber.id)}
                                        className="p-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all shadow-lg"
                                    >
                                        <Save size={20} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-3xl bg-matte-black flex items-center justify-center text-2xl font-black text-gold border border-white/5 relative shadow-inner group-hover:border-gold/20 transition-all">
                                        {barber.name ? barber.name.charAt(0) : 'B'}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-grey ${barber.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{barber.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{barber.specialty}</p>
                                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-lg ${barber.available ? 'bg-green-500/5 text-green-500 border-green-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                                            {barber.available ? 'Dostupan' : 'Nedostupan'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEdit(barber)}
                                        className="p-3 bg-white/5 hover:bg-gold hover:text-matte-black rounded-2xl text-gray-400 transition-all shadow-lg active:scale-95"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(barber.id)}
                                        className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-2xl text-gray-400 transition-all shadow-lg active:scale-95"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {barbers.length === 0 && (
                    <div className="text-center py-20 bg-dark-grey rounded-3xl border border-dashed border-white/10 group">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <User size={40} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nema pronađenih frizera.</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">Kliknite na "Dodaj frizera" da počnete.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Barbers;
