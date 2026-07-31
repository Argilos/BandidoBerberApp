import { useState } from 'react';
import { Star, Send, Shield, ShieldOff } from 'lucide-react';
import { addReview } from '../services/db';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ barberId, barberName, onReviewSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            await addReview({
                userId: user.uid,
                userName: user.displayName || 'Korisnik',
                barberId,
                barberName,
                rating,
                comment,
                isAnonymous
            });
            setComment('');
            setRating(5);
            if (onReviewSubmitted) onReviewSubmitted();
            alert('Recenzija poslana! Hvala vam na povratnim informacijama.');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Greška prilikom slanja recenzije.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-dark-grey p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Ocijeni svoje iskustvo</h3>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className="transition-transform hover:scale-125 active:scale-95"
                        >
                            <Star
                                size={18}
                                className={num <= rating ? "fill-gold text-gold" : "text-gray-700"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napišite par riječi o frizuri..."
                className="w-full bg-matte-black/50 border border-white/5 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 h-32 resize-none transition-all"
                required
            />

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isAnonymous ? 'text-gold' : 'text-gray-500 hover:text-white'}`}
                >
                    {isAnonymous ? <Shield size={14} className="fill-gold/20" /> : <ShieldOff size={14} />}
                    {isAnonymous ? 'Objavi anonimno' : `Kao: ${user?.displayName || 'Korisnik'}`}
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gold text-matte-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gold-light transition-all shadow-lg shadow-gold/20 disabled:opacity-50 active:scale-95"
                >
                    {submitting ? 'Slanje...' : 'Objavi'} <Send size={14} />
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
