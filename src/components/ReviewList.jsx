import { Star, User } from 'lucide-react';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-dark-grey/30 rounded-3xl border border-dashed border-white/5">
                <p className="text-gray-500 text-sm italic font-medium">Još uvijek nema recenzija. Budite prvi!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-dark-grey p-5 rounded-2xl border border-white/5 space-y-4 shadow-lg group hover:border-gold/20 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-matte-black flex items-center justify-center border border-white/10 group-hover:border-gold/20 transition-all">
                                <User size={20} className="text-gray-500 group-hover:text-gold transition-colors" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm tracking-tight">
                                    {review.isAnonymous ? 'Anonimno' : review.userName}
                                </p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('bs-BA') : 'Upravo sad'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-0.5 bg-matte-black px-2 py-1 rounded-full border border-white/5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={10}
                                    className={star <= review.rating ? "fill-gold text-gold" : "text-gray-700"}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute -top-2 -left-2 text-3xl text-gold/10 font-serif">"</span>
                        <p className="text-gray-400 text-sm italic leading-relaxed pl-2">
                            {review.comment}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
