import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Truck, LogOut } from "lucide-react";

const CaptainLayout = ({ captain, onLogout, children }) => {
    const { axios } = useContext(AppContext);

    const logout = async () => {
        try {
            const { data } = await axios.get("/api/captain/logout");
            if (data.success) {
                toast.success("Logged out");
                onLogout();
            }
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 md:px-10 py-4 bg-slate-900 border-b border-slate-800 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow shadow-indigo-500/30">
                        <Truck size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white leading-none">Captain Portal</h1>
                        <p className="text-xs text-slate-400">Grocery Marketplace</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-slate-300 text-sm hidden sm:block">
                        Hi, <span className="font-bold text-white">{captain?.name}</span>
                    </p>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 text-sm px-4 py-2 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                {children}
            </div>
        </div>
    );
};

export default CaptainLayout;
