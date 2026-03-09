import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ReviewForm = ({ productId, onReviewAdded }) => {
    const { user } = useAppContext();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [eligibility, setEligibility] = useState({ canReview: false, bought: false, reviewed: false, loading: true });

    useEffect(() => {
        const checkEligibility = async () => {
            if (!user) {
                setEligibility({ canReview: false, bought: false, reviewed: false, loading: false });
                return;
            }
            try {
                const { data } = await axios.get(`/api/review/can-review?productId=${productId}`);
                if (data.success) {
                    setEligibility({ ...data, loading: false });
                }
            } catch (error) {
                console.error("Error checking eligibility:", error);
                setEligibility(prev => ({ ...prev, loading: false }));
            }
        };
        checkEligibility();
    }, [user, productId, axios]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(
                "/api/review/add",
                { rating, comment, productId }
            );
            if (data.success) {
                toast.success(data.message);
                setComment("");
                setRating(5);
                setEligibility(prev => ({ ...prev, canReview: false, reviewed: true }));
                if (onReviewAdded) onReviewAdded();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding review");
        } finally {
            setLoading(false);
        }
    };

    if (eligibility.loading) return <div className="mt-10 p-6 text-slate-500">Checking eligibility...</div>;
    if (!user) return null; // Logic: if logout, don't see anything or handle based on requirement

    if (!eligibility.canReview) {
        return (
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mt-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Write a Review</h3>
                <p className="text-slate-500 dark:text-slate-400">
                    {eligibility.reviewed
                        ? "You have already reviewed this product. Thanks for your feedback!"
                        : "Only verified buyers can review this product. Please buy it first!"}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mt-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-all ${star <= rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                                    } hover:scale-110`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Comment</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-200"
                        placeholder="What did you think of this product?"
                    ></textarea>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Post Review"}
                </motion.button>
            </form>
        </div>
    );
};

export default ReviewForm;
