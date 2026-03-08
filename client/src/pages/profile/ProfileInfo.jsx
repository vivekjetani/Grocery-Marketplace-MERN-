import { useAppContext } from "../../context/AppContext";
import { User, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const ProfileInfo = () => {
    const { user } = useAppContext();

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 mt-12">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0"
                >
                    <img src={assets.profile_icon} alt="Profile" className="w-full h-full object-cover" />
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{user.name}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto">
                            <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                <Mail size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
