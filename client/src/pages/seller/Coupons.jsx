import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, MoreVertical } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const Coupons = () => {
    const { axios } = useAppContext();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [usageData, setUsageData] = useState([]);
    const [usageLoading, setUsageLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [usageSearchTerm, setUsageSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        flatRate: "",
        expirationDate: "",
        usageLimit: "",
        isRepeatable: true,
        isActive: true
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/coupon/list");
            if (data.success) {
                setCoupons(data.coupons);
            }
        } catch (error) {
            toast.error("Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/coupon/create", formData);
            if (res.data.success) {
                toast.success("Coupon created successfully");
                setShowCreateModal(false);
                setFormData({
                    code: "",
                    discountPercentage: "",
                    flatRate: "",
                    expirationDate: "",
                    usageLimit: "",
                    isRepeatable: true,
                    isActive: true
                });
                fetchCoupons();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating coupon");
        }
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;
        try {
            setIsDeleting(true);
            const { data } = await axios.delete(`/api/coupon/${couponToDelete}`);
            if (data.success) {
                toast.success(data.message);
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to delete coupon");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setCouponToDelete(null);
        }
    };

    const confirmDelete = (id) => {
        setCouponToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleToggleStatus = async (id) => {
        try {
            const { data } = await axios.patch(`/api/coupon/toggle/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Failed to update coupon status");
        }
    };

    const viewUsage = async (coupon) => {
        setSelectedCoupon(coupon);
        setShowUsageModal(true);
        setUsageLoading(true);
        try {
            const { data } = await axios.get(`/api/coupon/usage/${coupon._id}`);
            if (data.success) {
                setUsageData(data.usage);
            }
        } catch (error) {
            toast.error("Failed to fetch usage details");
        } finally {
            setUsageLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Coupon Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create and monitor discount codes for your store.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Search coupons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-3 outline-none focus:border-primary transition-all dark:text-white"
                        />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Create Coupon
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).map((coupon) => (
                        <motion.div
                            key={coupon._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {coupon.isActive ? 'Active' : 'Inactive'}
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Ticket size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-xl font-black text-slate-800 dark:text-white tracking-wider">{coupon.code}</h3>
                                        <p className="text-sm text-slate-500">
                                            {coupon.discountPercentage ? `${coupon.discountPercentage}% OFF` : `₹${coupon.flatRate} OFF`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(coupon._id)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${coupon.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${coupon.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Usage</span>
                                    <span className="font-bold dark:text-slate-300">
                                        {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : Math.min(coupon.usedCount * 5, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Repeatable</span>
                                    <span className={`font-bold ${coupon.isRepeatable ? 'text-primary' : 'text-orange-500'}`}>
                                        {coupon.isRepeatable ? 'Yes' : 'No (Single Use)'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => viewUsage(coupon)}
                                    className="flex-grow py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                                >
                                    View Usage
                                </button>
                                <button
                                    onClick={() => confirmDelete(coupon._id)}
                                    className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                        >
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">Create New Coupon</h2>
                            <form onSubmit={handleCreate} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">Coupon Code</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                        placeholder="E.g. SUMMER20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">Discount %</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                            placeholder="10"
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value, flatRate: "" })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">Flat Rate (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                            placeholder="100"
                                            value={formData.flatRate}
                                            onChange={(e) => setFormData({ ...formData, flatRate: e.target.value, discountPercentage: "" })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                            placeholder="Unlimited"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                            value={formData.expirationDate}
                                            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-6 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-primary"
                                            checked={formData.isRepeatable}
                                            onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Repeatable</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-primary"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Active</span>
                                    </label>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-grow py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-grow py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
                                    >
                                        Create Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Usage Modal */}
            <AnimatePresence>
                {showUsageModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
                        >
                            <button onClick={() => setShowUsageModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h2 className="text-2xl font-bold mb-2 dark:text-white">Usage History: {selectedCoupon?.code}</h2>
                            <p className="text-slate-500 mb-6 text-sm">Detailed list of users who applied this code.</p>

                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={usageSearchTerm}
                                    onChange={(e) => setUsageSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-10 py-3 outline-none focus:border-primary transition-all dark:text-white"
                                />
                                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {usageLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : usageData.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                        <p className="text-slate-500 italic">No usage records found yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b dark:border-slate-700">
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase">User</th>
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase text-center">Discount</th>
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-slate-700">
                                            {usageData
                                                .filter(u =>
                                                    u.userName.toLowerCase().includes(usageSearchTerm.toLowerCase()) ||
                                                    u.userEmail.toLowerCase().includes(usageSearchTerm.toLowerCase())
                                                )
                                                .map((usage, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <td className="py-4">
                                                            <p className="font-bold text-slate-800 dark:text-slate-200">{usage.userName}</p>
                                                            <p className="text-xs text-slate-400">{usage.userEmail}</p>
                                                        </td>
                                                        <td className="py-4 text-center font-mono font-bold text-primary">₹{usage.discount}</td>
                                                        <td className="py-4 text-right text-sm text-slate-500">
                                                            {new Date(usage.date).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Coupon"
                message="Are you sure you want to delete this coupon? This action cannot be undone and customers will no longer be able to use this discount code."
                confirmText="Delete Coupon"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Coupons;
