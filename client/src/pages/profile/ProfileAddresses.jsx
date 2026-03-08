import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2 } from "lucide-react";

const ProfileAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const { axios, user, navigate } = useContext(AppContext);

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get("/api/address/get");
            if (data.success) {
                setAddresses(data.addresses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch addresses");
        }
    };

    const deleteAddress = async (id) => {
        try {
            const { data } = await axios.delete(`/api/address/delete/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchAddresses();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete address");
        }
    };

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-secondary/5 to-transparent"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 bg-secondary/10 dark:bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Saved Addresses</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your delivery locations</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/add-address")}
                    className="relative z-10 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all w-full sm:w-auto"
                >
                    <Plus size={18} />
                    <span>Add New</span>
                </motion.button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-5">
                        <MapPin size={32} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No addresses found</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">You haven't added any shipping addresses yet.</p>
                    <button
                        onClick={() => navigate("/add-address")}
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Add your first address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <AnimatePresence>
                        {addresses.map((addr, index) => (
                            <motion.div
                                key={addr._id || index}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative group hover:border-primary/30 dark:hover:border-primary/30 transition-all"
                            >
                                {/* Default Badge if index 0 currently */}
                                {index === 0 && (
                                    <span className="absolute top-4 left-4 md:left-auto md:right-4 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
                                        Default
                                    </span>
                                )}

                                <button
                                    onClick={() => deleteAddress(addr._id)}
                                    className="absolute top-4 right-4 md:top-auto md:bottom-4 md:right-4 w-8 h-8 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                                    title="Delete Address"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                    {addr.firstName} {addr.lastName}
                                </h3>
                                {addr.phone && (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">{addr.phone}</p>
                                )}

                                <div className="space-y-1 text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <p>{addr.street}</p>
                                    <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                    <p className="font-medium text-slate-500 dark:text-slate-400">{addr.country}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default ProfileAddresses;
