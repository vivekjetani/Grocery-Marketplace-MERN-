import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Star, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false,
});

const LABELS = ["", "Poor 😕", "Fair 😐", "Good 😊", "Very Good 😄", "Excellent! 🤩"];

const ReviewFromEmail = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const initialRating = Math.max(1, Math.min(5, parseInt(searchParams.get("rating") || "5", 10)));

    const [rating, setRating] = useState(initialRating);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [productName, setProductName] = useState("");
    const [alreadyDone, setAlreadyDone] = useState(false);

    // Decode product name from token + pre-check if already reviewed
    useEffect(() => {
        if (!token) return;
        try {
            // JWT payload is base64 encoded, decode it without verifying (just for display)
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.productId) {
                // Optionally fetch product name
                api.get(`/api/product/${payload.productId}`)
                    .then(({ data }) => { if (data.success && data.product) setProductName(data.product.name); })
                    .catch(() => { });
            }
        } catch { }

        // Check review status on page load — show "already reviewed" immediately
        api.get(`/api/review/email-check?token=${token}`)
            .then(({ data }) => { if (data.success && data.reviewed) setAlreadyDone(true); })
            .catch(() => { });
    }, [token]);

    // No token in URL
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="text-center">
                    <AlertTriangle size={40} className="mx-auto text-amber-400 mb-4" />
                    <p className="font-bold text-slate-700 dark:text-white text-lg mb-2">Invalid review link</p>
                    <p className="text-slate-400 text-sm">This link is missing required information. Please use the link from your delivery email.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) { toast.error("Please write a comment"); return; }
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/api/review/email-review", { token, rating, comment });
            if (data.success) {
                setSubmitted(true);
                toast.success("Review submitted! 🙏");
            } else {
                if (data.message?.toLowerCase().includes("already")) setAlreadyDone(true);
                setError(data.message);
                toast.error(data.message);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to submit. Please try again.";
            if (msg?.toLowerCase().includes("already")) setAlreadyDone(true);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-2xl shadow-xl shadow-amber-200 dark:shadow-none mb-4">
                        <Star size={28} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Rate Your Purchase</h1>
                    {productName && <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{productName}</p>}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl p-8">

                    {/* Already reviewed */}
                    {alreadyDone && (
                        <div className="text-center space-y-3">
                            <CheckCircle size={44} className="mx-auto text-emerald-500" />
                            <p className="font-bold text-slate-900 dark:text-white text-lg">Already Reviewed!</p>
                            <p className="text-slate-400 text-sm">You've already shared your feedback on this product. Thank you!</p>
                        </div>
                    )}

                    {/* Error (non-duplicate) */}
                    {error && !alreadyDone && !submitted && (
                        <div className="text-center space-y-3">
                            <AlertTriangle size={44} className="mx-auto text-red-400" />
                            <p className="font-bold text-slate-900 dark:text-white">Something went wrong</p>
                            <p className="text-slate-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success */}
                    {submitted && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-4">
                            <div className="text-5xl">🎉</div>
                            <p className="text-xl font-black text-slate-900 dark:text-white">Thank you!</p>
                            <p className="text-slate-400 text-sm">Your review has been submitted. It helps other shoppers make better choices!</p>
                            <div className="flex justify-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} className={`text-2xl ${s <= rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Review Form — shown by default (no login required) */}
                    {!submitted && !alreadyDone && !error && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">
                                    Your Rating
                                </label>
                                <div className="flex gap-1 justify-center mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHovered(star)}
                                            onMouseLeave={() => setHovered(0)}
                                            className="text-4xl transition-all duration-100 hover:scale-125 focus:outline-none"
                                        >
                                            <span className={star <= (hovered || rating) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-sm font-bold text-amber-500 min-h-[20px]">
                                    {LABELS[hovered || rating]}
                                </p>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="What did you think? Taste, quality, packaging, anything..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition text-slate-800 dark:text-slate-200 resize-none text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-200 dark:shadow-none hover:from-amber-500 hover:to-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                            >
                                {loading
                                    ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                                    : <><Star size={18} className="fill-white" /> Submit Review</>
                                }
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    This link is valid for 7 days from your delivery date.
                </p>
            </motion.div>
        </div>
    );
};

export default ReviewFromEmail;
