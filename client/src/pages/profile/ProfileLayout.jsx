import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ProfileLayout = () => {
    const location = useLocation();
    const { axios, setUser, navigate } = useAppContext();

    const logout = async () => {
        try {
            const { data } = await axios.get("/api/user/logout");
            if (data.success) {
                setUser(null);
                navigate("/");
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const navItems = [
        { name: "Profile Info", path: "/profile/info", icon: User },
        { name: "Orders", path: "/profile/orders", icon: Package },
        { name: "Addresses", path: "/profile/addresses", icon: MapPin },
    ];

    return (
        <div className="py-10 md:py-16 max-w-7xl mx-auto min-h-[60vh]">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 lg:w-72 shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-28 overflow-x-auto md:overflow-visible">
                        <h2 className="hidden md:block text-2xl font-extrabold text-slate-900 dark:text-white px-4 pt-2 pb-6">My Account</h2>

                        <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path === '/profile/info' && location.pathname === '/profile');
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={({ isActive: isLinkActive }) => {
                                            const active = isLinkActive || (item.path === '/profile/info' && location.pathname === '/profile');
                                            return `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all relative overflow-hidden group w-full md:w-auto ${active
                                                ? "text-primary bg-primary/10 dark:bg-primary/20"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                                }`
                                        }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabIndicator"
                                                className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-2xl md:rounded-xl z-0"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <item.icon size={20} className="relative z-10" />
                                        <span className="relative z-10 whitespace-nowrap">{item.name}</span>
                                    </NavLink>
                                );
                            })}

                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full md:w-auto mt-2 md:mt-4"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default ProfileLayout;
