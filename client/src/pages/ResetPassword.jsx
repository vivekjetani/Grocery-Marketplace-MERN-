import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { axios, setShowUserLogin } = useAppContext();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token.");
            navigate("/");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [token, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }
        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters.");
        }

        setIsSubmitting(true);
        try {
            const { data } = await axios.post("/api/user/reset-password", {
                token,
                newPassword,
            });

            if (data.success) {
                toast.success(data.message);
                navigate("/");
                setShowUserLogin(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl px-5 py-4 outline-none transition-all dark:text-white dark:placeholder-slate-500 font-medium shadow-sm";
    const labelClass = "text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-2 block";

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-lg shadow-primary/20 flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-300">
                            <span className="text-4xl">🔐</span>
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                            Reset Password
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                            Create a secure new password for your account.
                        </p>

                        {countdown > 0 ? (
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-primary font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Link Expires In</p>
                                    <p className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">
                                        {formatTime(countdown)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 font-bold text-center">
                                Link has expired. Please request a new one.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className={labelClass}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    className={inputClass}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={countdown === 0}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className={inputClass}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={countdown === 0}
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting || countdown === 0}
                                className="w-full py-5 bg-gradient-to-r from-primary via-accent to-secondary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Update Password
                                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
