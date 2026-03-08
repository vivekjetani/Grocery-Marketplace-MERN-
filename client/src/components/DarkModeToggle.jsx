import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const DarkModeToggle = () => {
    const { isDarkMode, setIsDarkMode } = useAppContext();

    const toggleMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMode}
            className={`relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner overflow-hidden border ${isDarkMode
                ? "bg-slate-700 border-slate-600 shadow-slate-900/50"
                : "bg-blue-100 border-blue-200 shadow-blue-300/50"
                }`}
            aria-label="Toggle Dark Mode"
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 overflow-hidden rounded-full">
                {/* Stars for dark mode */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? "opacity-100" : "opacity-0"}`}>
                    <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
                    <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full opacity-50"></div>
                    <div className="absolute top-1 left-6 w-0.5 h-0.5 bg-white rounded-full opacity-80"></div>
                </div>
                {/* Clouds for light mode */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? "opacity-0" : "opacity-100"}`}>
                    <div className="absolute top-4 right-2 w-3 h-1.5 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-2 right-4 w-4 h-2 bg-white rounded-full opacity-60"></div>
                </div>
            </div>

            <motion.div
                layout
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
                className={`z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${isDarkMode ? "bg-slate-300 ml-8" : "bg-amber-400"
                    }`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isDarkMode ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon size={14} className="text-slate-700 fill-slate-700" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun size={14} className="text-amber-700" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.button>
    );
};

export default DarkModeToggle;
