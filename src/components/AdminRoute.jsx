import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-matte-black flex items-center justify-center">
                <div className="text-gold animate-pulse font-black tracking-widest text-xs uppercase">Provjera ovlaštenja...</div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
