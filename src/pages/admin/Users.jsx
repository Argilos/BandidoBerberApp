import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, User, Mail, Calendar, Search } from 'lucide-react';
import { getUsers, updateUserRole } from '../../services/db';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleRoleChange = async (uid, newRole) => {
        const roleLabel = newRole === 'admin' ? 'Administrator' : 'Korisnik';
        if (confirm(`Da li ste sigurni da želite promijeniti ulogu ovog korisnika u ${roleLabel}?`)) {
            try {
                await updateUserRole(uid, newRole);
                alert('✅ Uloga uspješno ažurirana!');
                loadUsers();
            } catch (error) {
                console.error('Error updating role:', error);
                alert('❌ Neuspješno ažuriranje uloge');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight flex items-center gap-3">
                        <UsersIcon className="text-gold" size={32} /> Upravljanje Korisnicima
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">Pratite i upravljajte svim registrovanim klijentima i osobljem.</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Pretraži korisnike..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-grey border border-white/5 focus:border-gold/50 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none shadow-xl transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-dark-grey/50 rounded-3xl border border-white/5">
                    <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
                    <div className="text-gold font-black uppercase tracking-widest text-xs">Preuzimanje direktorija...</div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-dark-grey p-5 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all shadow-xl group">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${user.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-white/5 text-gray-500'}`}>
                                    {user.role === 'admin' ? <Shield size={28} /> : <User size={28} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-white text-lg tracking-tight uppercase">{user.name || 'Anonimni Korisnik'}</h3>
                                        <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-black border shadow-lg ${user.role === 'admin' ? 'bg-gold text-matte-black border-gold' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                            {user.role === 'admin' ? 'ADMIN' : 'KLIJENT'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                                        <span className="flex items-center gap-2 bg-matte-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-white/10"><Mail size={12} className="text-gold/50" /> {user.email}</span>
                                        {user.createdAt?.toDate ? (
                                            <span className="flex items-center gap-2 bg-matte-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-white/10"><Calendar size={12} className="text-gold/50" /> {user.createdAt.toDate().toLocaleDateString('bs-BA')}</span>
                                        ) : user.createdAt ? (
                                            <span className="flex items-center gap-2 bg-matte-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-white/10"><Calendar size={12} className="text-gold/50" /> {new Date(user.createdAt).toLocaleDateString('bs-BA')}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-matte-black/50 p-2 rounded-2xl border border-white/5">
                                <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest pl-2">Promijeni ulogu:</div>
                                <select
                                    className="bg-dark-grey border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white focus:outline-none focus:border-gold cursor-pointer transition-all uppercase tracking-widest"
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                                >
                                    <option value="user">Korisnik</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 bg-dark-grey rounded-3xl border border-dashed border-white/10 group">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <UsersIcon className="text-gray-600" size={40} />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nema pronađenih korisnika.</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">Pokušajte sa drugačijim uslovima pretrage.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
