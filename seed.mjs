// Standalone script to seed Firestore database
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
    authDomain: "berber-booking-app-2026.firebaseapp.com",
    projectId: "berber-booking-app-2026",
    storageBucket: "berber-booking-app-2026.firebasestorage.app",
    messagingSenderId: "51072140614",
    appId: "1:51072140614:web:b69881c517936304ed9147"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const services = [
    { id: '1', name: 'Classic Haircut', duration: 45, price: 30, description: 'Precision cut with scissors and clippers, styled to perfection.' },
    { id: '2', name: 'Beard Trim', duration: 30, price: 20, description: 'Shape and style your beard with razor edging.' },
    { id: '3', name: 'Haircut + Beard', duration: 60, price: 45, description: 'The complete look. Any cut combined with a detailed beard trim.' },
    { id: '4', name: 'Full Service', duration: 90, price: 75, description: 'Haircut + Beard + Hair Wash + Hot Towel. The ultimate treatment.' },
];

const barbers = [
    { id: '1', name: 'James', specialty: 'Fades', available: true },
    { id: '2', name: 'Michael', specialty: 'Classic Cuts', available: true },
    { id: '3', name: 'Sarah', specialty: 'Beard Styling', available: true },
];

async function seedDatabase() {
    console.log('Starting database seed...');
    const batch = writeBatch(db);

    // Seed Services
    console.log('Seeding services...');
    services.forEach((service) => {
        const docRef = doc(collection(db, "services"), service.id);
        batch.set(docRef, service);
        console.log(`  - ${service.name}`);
    });

    // Seed Barbers
    console.log('Seeding barbers...');
    barbers.forEach((barber) => {
        const docRef = doc(collection(db, "barbers"), barber.id);
        batch.set(docRef, barber);
        console.log(`  - ${barber.name}`);
    });

    try {
        await batch.commit();
        console.log('\n✅ Database seeded successfully!');
        console.log(`   - ${services.length} services added`);
        console.log(`   - ${barbers.length} barbers added`);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
