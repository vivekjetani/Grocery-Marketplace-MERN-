import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
    Truck,
    Plus,
    Trash2,
    Mail,
    User,
    Lock,
    CheckCircle,
    XCircle,
    RefreshCw,
    Users,
    Search,
    X,
} from "lucide-react";

const Captains = () => {
    const { axios } = useContext(AppContext);
    const [captains, setCaptains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [captainSearch, setCaptainSearch] = useState("");

    const fetchCaptains = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/seller/captains");
            if (data.success) setCaptains(data.captains);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptains();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast.error("Name and email are required");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await axios.post("/api/seller/captain", form);
            if (data.success) {
                toast.success("Captain created! Welcome email sent.");
                setForm({ name: "", email: "", password: "" });
                fetchCaptains();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete captain "${name}"? This cannot be undone.`)) return;
        try {
            const { data } = await axios.delete(`/api/seller/captain/${id}`);
            if (data.success) {
                toast.success("Captain deleted");
                setCaptains((prev) => prev.filter((c) => c._id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="md:p-10 p-4 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Captains</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your delivery agents</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-2">
                            <Truck size={16} />
                            {captains.length} Registered
                        </p>
                    </div>
                    <button
                        onClick={fetchCaptains}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Create Captain Form */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <Plus size={18} className="text-indigo-500" />
                        Add New Captain
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="captain@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        {/* Password (optional) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Password <span className="text-slate-400 normal-case font-normal">(leave blank to auto-generate)</span>
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Auto-generated if left empty"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                                Captain will receive login credentials via email.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <RefreshCw size={16} className="animate-spin" /> Creating…
                                </span>
                            ) : (
                                <>
                                    <Plus size={18} /> Create Captain & Send Email
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Captains List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-indigo-500" />
                            Registered Captains
                        </h3>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={captainSearch}
                            onChange={(e) => setCaptainSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="pl-9 pr-8 py-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        {captainSearch && (
                            <button onClick={() => setCaptainSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : captains.filter(c =>
                        !captainSearch.trim() ||
                        c.name?.toLowerCase().includes(captainSearch.toLowerCase()) ||
                        c.email?.toLowerCase().includes(captainSearch.toLowerCase())
                    ).length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-10 text-center">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Truck size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-900 dark:text-white font-bold">{captainSearch ? 'No captains match your search' : 'No captains yet'}</p>
                            <p className="text-slate-400 text-sm mt-1">{captainSearch ? 'Try a different search term.' : 'Create your first captain to get started.'}</p>
                        </div>
                    ) : (
                        captains
                            .filter(c =>
                                !captainSearch.trim() ||
                                c.name?.toLowerCase().includes(captainSearch.toLowerCase()) ||
                                c.email?.toLowerCase().includes(captainSearch.toLowerCase())
                            ).map((captain, idx) => (
                                <motion.div
                                    key={captain._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow shadow-indigo-200 dark:shadow-none">
                                            {captain.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{captain.name}</p>
                                            <p className="text-xs text-slate-400">{captain.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Status badges */}
                                        <div className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${captain.isBusy ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600"}`}>
                                            {captain.isBusy ? (
                                                <><Truck size={11} /> Busy</>
                                            ) : (
                                                <><CheckCircle size={11} /> Free</>
                                            )}
                                        </div>
                                        <div className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${captain.isActive ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                                            {captain.isActive ? <><CheckCircle size={11} /> Active</> : <><XCircle size={11} /> Inactive</>}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(captain._id, captain.name)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Captains;
