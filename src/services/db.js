import { db } from "../lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    getDoc,
    setDoc
} from 'firebase/firestore';

// User Profiles
export const createUserProfile = async (uid, userData) => {
    try {
        await setDoc(doc(db, "users", uid), {
            ...userData,
            role: userData.role || 'user',
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating user profile:", error);
    }
};

export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

// Services
export const getServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "services"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("getServices error:", error);
        return [];
    }
};

export const updateService = async (id, data) => {
    await updateDoc(doc(db, "services", id), data);
};

export const deleteService = async (id) => {
    await deleteDoc(doc(db, "services", id));
};

// Barbers
export const getBarbers = async () => {
    const querySnapshot = await getDocs(collection(db, "barbers"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBarber = async (id, data) => {
    await updateDoc(doc(db, "barbers", id), data);
};

export const deleteBarber = async (id) => {
    await deleteDoc(doc(db, "barbers", id));
};

// Bookings
export const createBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: serverTimestamp(),
            status: bookingData.status || 'pending'
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating booking: ", error);
        throw error;
    }
};

export const getUserBookings = async (userId) => {
    try {
        const q = query(
            collection(db, "bookings"),
            where("userId", "==", userId),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user bookings: ", error);
        return [];
    }
};

export const getAllBookings = async () => {
    try {
        const q = query(collection(db, "bookings"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all bookings: ", error);
        return [];
    }
};

export const updateBooking = async (id, data) => {
    try {
        await updateDoc(doc(db, "bookings", id), data);
        return true;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

export const deleteBooking = async (id) => {
    await deleteDoc(doc(db, "bookings", id));
};

// Admin Stats
export const getStats = async () => {
    try {
        const [bookingsSnapshot, barbersSnapshot] = await Promise.all([
            getDocs(collection(db, "bookings")),
            getDocs(collection(db, "barbers"))
        ]);

        const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const today = new Date().toISOString().split('T')[0];

        const todayBookings = bookings.filter(b => b.date && b.date.startsWith(today));
        const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed');

        return {
            totalBookings: bookings.length,
            todayBookings: todayBookings.length,
            upcomingBookings: upcomingBookings.length,
            activeBarbers: barbersSnapshot.size,
            todayRevenue: todayBookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0)
        };
    } catch (error) {
        console.error("Error fetching stats: ", error);
        return { totalBookings: 0, todayBookings: 0, upcomingBookings: 0, activeBarbers: 0, todayRevenue: 0 };
    }
};

// Reviews & Ratings
export const addReview = async (reviewData) => {
    try {
        await addDoc(collection(db, "reviews"), {
            ...reviewData,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding review: ", error);
        throw error;
    }
};

export const getReviews = async (barberId = null) => {
    try {
        let q;
        if (barberId) {
            q = query(collection(db, "reviews"), where("barberId", "==", barberId), orderBy("createdAt", "desc"));
        } else {
            q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        return [];
    }
};

export const getUsers = async () => {
    try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const updateUserRole = async (uid, role) => {
    try {
        await updateDoc(doc(db, "users", uid), { role });
        return true;
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};
// Shop Settings
export const getSettings = async () => {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", "shop"));
        if (settingsDoc.exists()) {
            return settingsDoc.data();
        }
        // Default settings if none exist
        const defaultSettings = { isOpen: true, acceptOnline: true };
        await setDoc(doc(db, "settings", "shop"), defaultSettings);
        return defaultSettings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return { isOpen: true, acceptOnline: true };
    }
};

export const updateSettings = async (data) => {
    try {
        await setDoc(doc(db, "settings", "shop"), data, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating settings:", error);
        throw error;
    }
};
