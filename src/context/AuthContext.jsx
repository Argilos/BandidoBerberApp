import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    updateProfile,
    setPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, createUserProfile } from '../services/db';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe = () => { };

        const initAuth = async () => {
            try {
                await setPersistence(auth, browserSessionPersistence).catch(err => {
                    console.error("Persistence error:", err);
                });

                unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                    try {
                        setUser(currentUser);
                        if (currentUser) {
                            const profile = await getUserProfile(currentUser.uid);
                            if (!profile) {
                                const newProfile = {
                                    email: currentUser.email,
                                    name: currentUser.displayName || 'Korisnik',
                                    role: currentUser.email === 'super@admin.com' ? 'admin' : 'user'
                                };
                                await createUserProfile(currentUser.uid, newProfile);
                                setUserProfile({ ...newProfile, id: currentUser.uid });
                            } else {
                                setUserProfile(profile);
                            }
                        } else {
                            setUserProfile(null);
                        }
                    } catch (error) {
                        console.error("Profile fetch error:", error);
                    } finally {
                        setLoading(false);
                    }
                });
            } catch (err) {
                console.error("Auth init error:", err);
                setLoading(false);
            }
        };

        initAuth();
        return () => unsubscribe();
    }, []);

    const loginFn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signupFn = (email, password, name) => {
        return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            await updateProfile(userCredential.user, {
                displayName: name
            });
            return userCredential;
        });
    };

    const logoutFn = () => {
        return signOut(auth);
    };

    const appleLoginFn = () => {
        const provider = new OAuthProvider('apple.com');
        return signInWithPopup(auth, provider);
    };

    const googleLoginFn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const value = {
        user,
        userProfile,
        isAdmin: userProfile?.role === 'admin' || user?.email === 'super@admin.com',
        login: loginFn,
        register: signupFn,
        logout: logoutFn,
        loginWithGoogle: googleLoginFn,
        appleLogin: appleLoginFn,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
