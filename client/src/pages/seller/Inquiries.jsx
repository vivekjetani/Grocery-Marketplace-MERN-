import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Mail, User, Clock, Trash2,
    ChevronRight, ExternalLink, Inbox, Search
} from "lucide-react";

const Inquiries = () => {
    const { axios } = useContext(AppContext);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const fetchInquiries = async () => {
        try {
            const { data } = await axios.get("/api/seller/inquiries");
            if (data.success) setInquiries(data.inquiries);
        } catch (err) {
            toast.error("Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInquiries(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            const { data } = await axios.delete(`/api/seller/inquiry/${id}`);
            if (data.success) {
                toast.success("Inquiry deleted");
                setInquiries(prev => prev.filter(inq => inq._id !== id));
                if (selectedId === id) setSelectedId(null);
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const filtered = inquiries.filter(inq =>
        inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selected = inquiries.find(inq => inq._id === selectedId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Contact Inquiries</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage messages sent by customers through the contact form</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search name, email, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl pl-12 pr-6 py-4 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* List Side */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">No inquiries found</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {filtered.map((inq) => (
                                <button
                                    key={inq._id}
                                    onClick={() => setSelectedId(inq._id)}
                                    className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedId === inq._id
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <p className={`font-black truncate ${selectedId === inq._id ? "text-white" : "text-slate-900 dark:text-white"}`}>
                                                {inq.name}
                                            </p>
                                            <p className={`text-xs mt-0.5 truncate ${selectedId === inq._id ? "text-indigo-100" : "text-slate-400"}`}>
                                                {inq.email}
                                            </p>
                                        </div>
                                        <div className={`text-[10px] font-bold shrink-0 opacity-70 ${selectedId === inq._id ? "text-white" : "text-slate-400"}`}>
                                            {new Date(inq.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className={`text-xs mt-3 line-clamp-2 ${selectedId === inq._id ? "text-indigo-50" : "text-slate-500 dark:text-slate-400"}`}>
                                        {inq.message}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Side */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {selected ? (
                            <motion.div
                                key={selected._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-10"
                            >
                                <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{selected.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                                <Mail size={14} />
                                                <a href={`mailto:${selected.email}`} className="hover:text-indigo-500 transition-colors">{selected.email}</a>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(selected._id)}
                                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                            <MessageSquare size={12} /> Message Content
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {selected.message}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock size={14} />
                                            Received on {new Date(selected.createdAt).toLocaleString()}
                                        </div>
                                        <a
                                            href={`mailto:${selected.email}?subject=Re: Inquiry from Gramodaya`}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm"
                                        >
                                            Reply via Email <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 px-10 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                                    <ChevronRight size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">Select an Inquiry</h3>
                                <p className="text-sm text-slate-400">Choose a message from the list on the left to view full details and reply.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Inquiries;
