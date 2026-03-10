import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import SubPageTransition from "../../components/SubPageTransition";
import {
  LayoutDashboard,
  ShoppingBag,
  List,
  PlusSquare,
  Layers,
  Users,
  Ticket,
  Truck,
  Mail,
  Moon,
  Sun,
  LogOut
} from "lucide-react";

const SellerLayout = () => {
  const { isSeller, setIsSeller, axios, navigate, isDarkMode, setIsDarkMode } = useAppContext();
  const location = useLocation();

  // Meaningful workflow order:
  // 0. Dashboard    — overview & analytics
  // 1. Orders       — urgent, first thing to check
  // 2. Product List — quick overview of inventory
  // 3. Add Product  — add to inventory
  // 4. Categories   — manage taxonomy
  // 5. Users        — customer management
  // 6. Captains     — delivery staff
  // 7. SMTP Settings — configuration, rarely touched
  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: LayoutDashboard },
    { name: "Orders", path: "/seller/orders", icon: ShoppingBag },
    { name: "Product List", path: "/seller/product-list", icon: List },
    { name: "Add Product", path: "/seller/add-product", icon: PlusSquare },
    { name: "Categories", path: "/seller/category-manager", icon: Layers },
    { name: "Users", path: "/seller/users", icon: Users },
    { name: "Coupons", path: "/seller/coupons", icon: Ticket },
    { name: "Captains", path: "/seller/captains", icon: Truck },
    { name: "SMTP Settings", path: "/seller/smtp", icon: Mail },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) { setIsSeller(false); toast.success("Logged out successfully"); navigate("/"); }
    } catch (error) { toast.error("Failed to logout"); console.error(error); }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-slate-300 dark:border-slate-700 py-3 bg-white dark:bg-slate-900 transition-all duration-300">
        <Link to={"/"}><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Gramodaya</h1></Link>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <p className="hidden sm:block">Hi! Admin</p>

          {/* Dark / Light mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            style={{ background: isDarkMode ? "#4f46e5" : "#e2e8f0" }}
          >
            {/* Track icons */}
            <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none select-none text-xs">
              <span className="text-yellow-400" style={{ opacity: isDarkMode ? 0 : 1, transition: "opacity 0.3s" }}>☀️</span>
              <span style={{ opacity: isDarkMode ? 1 : 0, transition: "opacity 0.3s" }}>🌙</span>
            </span>
            {/* Thumb */}
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center"
              style={{ transform: isDarkMode ? "translateX(28px)" : "translateX(2px)" }}
            />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 rounded-full text-sm px-4 py-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-70px)]">
        <div className="md:w-64 w-16 border-r text-base border-slate-300 dark:border-slate-700 pt-4 flex flex-col bg-white dark:bg-slate-900">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 transition-colors ${isActive
                  ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-500"
                  : "hover:bg-slate-100/90 dark:hover:bg-slate-800 border-white dark:border-slate-900 text-slate-700 dark:text-slate-300"
                }`
              }
            >
              <item.icon size={24} strokeWidth={2} />
              <p className="md:block hidden font-medium">{item.name}</p>
            </NavLink>
          ))}
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <AnimatePresence mode="wait">
            <SubPageTransition key={location.pathname}>
              <Outlet />
            </SubPageTransition>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default SellerLayout;
