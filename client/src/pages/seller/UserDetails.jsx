import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Users as UsersIcon, Star, ShoppingBag, DollarSign, Calendar, Package, ArrowLeft, Mail, Trash2, AlertTriangle } from "lucide-react";

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteUser = async () => {
        try {
            setIsDeleting(true);
            const response = await axios.delete(`/api/seller/users/${id}`);
            if (response.data.success) {
                toast.success("User deleted successfully");
                navigate("/seller/users");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete user");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/seller/users/${id}`);
            if (response.data.success) {
                setData(response.data);
            } else {
                toast.error(response.data.message);
                navigate("/seller/users");
            }
        } catch (error) {
            toast.error(error.message);
            navigate("/seller/users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const { user, orders, reviews, totalSpent, orderCount, reviewCount } = data;

    return (
        <div className="md:p-10 p-4 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/seller/users")}
                    className="shrink-0 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {user.name}
                    </h2>
                    <div className="flex gap-4 mt-1.5">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <Mail size={14} /> {user.email}
                        </span>
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 rounded-xl font-bold transition-all"
                    >
                        <Trash2 size={18} />
                        Delete User
                    </button>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Spent</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">₹{totalSpent.toLocaleString()}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{orderCount}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Star size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Reviews</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{reviewCount}</h3>
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Order History */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Package size={20} className="text-indigo-500" />
                        Order History
                    </h3>
                    <div className="grid gap-4">
                        {orders.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                <Package size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-slate-500 dark:text-slate-400">No orders placed yet.</p>
                            </div>
                        ) : (
                            orders.map((order, i) => (
                                <motion.div key={order._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order ID</p>
                                            <p className="font-mono text-sm text-slate-700 dark:text-slate-300">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Amount</p>
                                            <p className="font-black text-indigo-600 dark:text-indigo-400">₹{order.amount}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg w-fit">
                                            <Calendar size={14} className="text-slate-400" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg w-fit">
                                            <Package size={14} className="text-slate-400" />
                                            {order.items.length} Items
                                        </p>
                                        {order.discountAmount > 0 && (
                                            <p className="text-sm font-bold text-primary flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg w-fit border border-primary/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                Coupon: {order.couponCode} (-₹{order.discountAmount})
                                            </p>
                                        )}
                                    </div>

                                    {/* Items details */}
                                    <div className="mt-4 space-y-2">
                                        {order.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex justify-between items-center text-sm py-1 border-t border-slate-50 dark:border-slate-700/30">
                                                <span className="text-slate-600 dark:text-slate-400 line-clamp-1 flex-1 pr-4">{item.quantity} x Item</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Review History */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Star size={20} className="text-amber-500" />
                        Review History
                    </h3>
                    <div className="grid gap-4">
                        {reviews.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                <Star size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-slate-500 dark:text-slate-400">No reviews given yet.</p>
                            </div>
                        ) : (
                            reviews.map((review, i) => (
                                <motion.div key={review._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3 w-3/4">
                                            {review.productId?.image?.[0] ? (
                                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${review.productId.image[0]}`} alt="product" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600 shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{review.productId?.name || "Unknown Product"}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md shrink-0">
                                            <Star size={12} className="text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl italic">"{review.comment}"</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-4 mb-4 text-red-500">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Delete User Account</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete <span className="font-bold">{user.name}</span>? This will permanently remove their account, addresses, and reviews. Their order history will be preserved for store records. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Delete Forever
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;
