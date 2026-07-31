import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scissors, Calendar, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-matte-black text-white font-sans flex text-sm">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 bg-dark-grey border-r border-white/5 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/5 flex items-center gap-2 text-gold">
                    <Scissors size={24} />
                    <span className="font-bold text-lg tracking-wider uppercase">ADMIN PANELA</span>
                </div>

                <nav className="p-4 space-y-2">
                    <Link to="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-gold text-matte-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <LayoutDashboard size={20} />
                        <span>Kontrolna tabla</span>
                    </Link>
                    <Link to="/admin/schedule" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin/schedule') ? 'bg-gold text-matte-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Calendar size={20} />
                        <span>Raspored</span>
                    </Link>
                    <Link to="/admin/barbers" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin/barbers') ? 'bg-gold text-matte-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Users size={20} />
                        <span>Frizeri</span>
                    </Link>
                    <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin/users') ? 'bg-gold text-matte-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Users size={20} />
                        <span>Korisnici</span>
                    </Link>
                    <Link to="/admin/services" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/admin/services') ? 'bg-gold text-matte-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Scissors size={20} />
                        <span>Usluge</span>
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 w-full rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Odjava</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="md:hidden flex items-center justify-between p-4 bg-dark-grey border-b border-white/5 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-gold">
                        <Scissors size={20} />
                        <span className="font-bold">ADMIN PANEL</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="text-white">
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
