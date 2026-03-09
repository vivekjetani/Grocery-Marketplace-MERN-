import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import SubPageTransition from "../../components/SubPageTransition";

const SellerLayout = () => {
  const { isSeller, setIsSeller, axios, navigate } = useAppContext();
  const location = useLocation();
  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "Categories", path: "/seller/category-manager", icon: assets.add_icon }, // Using add_icon for now
    { name: "Users", path: "/seller/users", icon: assets.profile_icon },
    { name: "SMTP Settings", path: "/seller/smtp", icon: assets.order_icon }, // Reusing order_icon for now
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
        <Link to={"/"}><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Grocery Store App</h1></Link>
        <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400">
          <p>Hi! Admin</p>
          <button onClick={logout} className="border border-slate-300 dark:border-slate-600 rounded-full text-sm px-4 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">Logout</button>
        </div>
      </div>
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-slate-300 dark:border-slate-700 pt-4 flex flex-col bg-white dark:bg-slate-900">
          {sidebarLinks.map((item) => (
            <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
              className={({ isActive }) => `flex items-center py-3 px-4 gap-3 ${isActive ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-500" : "hover:bg-slate-100/90 dark:hover:bg-slate-800 border-white dark:border-slate-900 text-slate-700 dark:text-slate-300"}`}>
              <img src={item.icon} alt={item.name} className="w-7 h-7 dark:invert dark:opacity-80" />
              <p className="md:block hidden text-center">{item.name}</p>
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
