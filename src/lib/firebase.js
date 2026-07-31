import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "berber-booking-app-2026.firebaseapp.com",
    projectId: "berber-booking-app-2026",
    storageBucket: "berber-booking-app-2026.firebasestorage.app",
    messagingSenderId: "51072140614",
    appId: "1:51072140614:web:b69881c517936304ed9147"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
