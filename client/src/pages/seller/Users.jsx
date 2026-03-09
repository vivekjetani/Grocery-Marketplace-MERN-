import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Users as UsersIcon, Trophy, Star, ShoppingBag, DollarSign, ChevronRight, Search, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { axios } = useContext(AppContext);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get("/api/seller/users");
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="md:p-10 p-4 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} />
                        Customer Leaderboard
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Top customers ranked by engagement and loyalty
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-2">
                            <UsersIcon size={18} />
                            {users.length} Total Users
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersIcon size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No users found</h3>
                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your search query.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <th className="p-4 pl-6 w-20 text-center">Rank</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Joined Date</th>
                                    <th className="p-4 text-center">Orders</th>
                                    <th className="p-4 text-center">Reviews</th>
                                    <th className="p-4 text-right">Total Spent</th>
                                    <th className="p-4 pr-6 w-20"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/seller/users/${user._id}`)}
                                        className="group border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                                    >
                                        <td className="p-4 pl-6 text-center">
                                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                                                        index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                            'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-100 dark:border-slate-700'}`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.isVerified ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                    <CheckCircle2 size={13} />
                                                    Verified
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-xs">
                                                    <XCircle size={13} />
                                                    Unverified
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                <CalendarDays size={14} />
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                <ShoppingBag size={14} />
                                                {user.orderCount}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                <Star size={14} />
                                                {user.reviewCount}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="font-black text-slate-900 dark:text-white">₹{user.totalSpent?.toLocaleString() || 0}</p>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all shadow-sm ml-auto">
                                                <ChevronRight size={16} />
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
