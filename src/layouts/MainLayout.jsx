import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, Scissors, Menu } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className="relative flex flex-col items-center justify-center w-16 h-12 group">
        {/* Levitating Circle */}
        <div className={`absolute left-1/2 -translate-x-1/2 bg-gold text-matte-black p-2.5 rounded-full shadow-lg shadow-gold/40 floating-gold ${active ? '-top-6 opacity-100 scale-100' : 'top-0 opacity-0 scale-50 pointer-events-none'}`}>
            <Icon size={20} />
        </div>

        {/* Default State (Icon + Label) */}
        <div className={`flex flex-col items-center transition-all duration-500 ease-out ${active ? 'opacity-0 translate-y-4 scale-75' : 'opacity-100'}`}>
            <Icon size={24} className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-[10px] uppercase tracking-wider mt-1 text-gray-500 font-bold">{label}</span>
        </div>

        {/* Active Label */}
        <span className={`text-[10px] uppercase tracking-wider text-gold font-bold absolute bottom-0 transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {label}
        </span>
    </Link>
);

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const isAuthPage = location.pathname.toLowerCase().startsWith('/login');

    return (
        <div className="flex flex-col min-h-screen bg-matte-black text-white font-sans">
            {/* Top Bar */}
            {!isAuthPage && (
                <header className="sticky top-0 z-50 flex justify-between items-center p-4 bg-matte-black/95 border-b border-dark-grey backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-gold">
                        <Scissors size={24} />
                        <span className="font-bold text-lg tracking-wider uppercase">Bandido</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-white hover:text-gold transition-colors p-2">
                            <Menu size={24} />
                        </button>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className={`flex-1 w-full p-4 page-transition ${!isAuthPage ? 'pb-24' : ''}`}>
                <div className="max-w-md mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Nav */}
            {!isAuthPage && (
                <nav className="fixed bottom-0 left-0 right-0 bg-dark-grey/95 border-t border-dark-grey/50 backdrop-blur-xl flex justify-around items-center pt-2 pb-6 px-4 z-50 safe-area-bottom">
                    <NavItem to="/" icon={Home} label="Početna" active={isActive('/')} />
                    <NavItem to="/services" icon={Scissors} label="Usluge" active={isActive('/services')} />
                    <NavItem to="/book" icon={Calendar} label="Rezerviši" active={isActive('/book')} />
                    <NavItem to="/profile" icon={User} label="Profil" active={isActive('/profile')} />
                </nav>
            )}
        </div>
    );
};

export default MainLayout;
