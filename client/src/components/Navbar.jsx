import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    cartCount,
    axios,
    setAppliedCoupon,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        setUser(null);
        setAppliedCoupon(null);
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'py-3 bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl shadow-md border-slate-200 dark:border-slate-800' : 'py-5 bg-white/40 dark:bg-black/40 backdrop-blur-md border-transparent dark:border-transparent'}`}>
      <Link to="/">
        <motion.h2
          whileHover={{ scale: 1.05, rotate: -2, transition: { type: "spring", stiffness: 300 } }}
          whileTap={{ scale: 0.95 }}
          className="text-2xl font-bold text-gradient dark:text-gradient-dark origin-left"
        >
          Gramodaya
        </motion.h2>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8 font-medium">
        <Link to="/" className="hover:text-primary dark:hover:text-primary-dark transition-colors">
          Home
        </Link>
        <Link to="/products" className="hover:text-primary dark:hover:text-primary-dark transition-colors">
          All Products
        </Link>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-slate-300 dark:border-slate-600 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="w-full bg-transparent outline-none placeholder-slate-500 dark:placeholder-slate-400 dark:text-white"
            type="text"
            placeholder="Search products"
          />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.836 10.615 15 14.695" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <DarkModeToggle />

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="currentColor" className="text-primary dark:text-primary-dark" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          </svg>
          <span className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-secondary w-5 h-5 flex items-center justify-center rounded-full shadow-md shadow-secondary/50">
            {cartCount()}
          </span>
        </motion.div>

        {user ? (
          <div className="relative group">
            <Link to="/profile">
              <img src={assets.profile_icon} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary/20 cursor-pointer object-cover" />
            </Link>
            <ul className="hidden group-hover:block absolute top-[110%] right-0 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 w-32 rounded-xl z-40 text-sm overflow-hidden backdrop-blur-xl">
              <li onClick={() => navigate("/profile")} className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Profile
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500 transition-colors" onClick={logout}>
                Logout
              </li>
            </ul>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50"
          >
            Log In
          </motion.button>
        )}
      </div>

      {/* Mobile Right Controls */}
      <div className="flex items-center gap-5 md:hidden">
        <DarkModeToggle />

        <div className="relative cursor-pointer" onClick={() => navigate("/cart")}>
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0" stroke="currentColor" className="text-primary dark:text-primary-dark" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-secondary w-4 h-4 flex items-center justify-center rounded-full">
            {cartCount()}
          </span>
        </div>

        <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden focus:outline-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" className="text-slate-700 dark:text-slate-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl py-6 flex flex-col items-center gap-6 text-lg border-b border-slate-200 dark:border-slate-800 md:hidden z-40"
          >
            <Link onClick={() => setOpen(false)} to="/" className="hover:text-primary dark:hover:text-primary-dark transition-colors font-medium">
              Home
            </Link>
            <Link onClick={() => setOpen(false)} to="/products" className="hover:text-primary dark:hover:text-primary-dark transition-colors font-medium">
              All Products
            </Link>

            {user ? (
              <div className="flex flex-col items-center gap-4">
                <Link onClick={() => setOpen(false)} to="/profile" className="hover:text-primary dark:hover:text-primary-dark transition-colors font-medium">
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="px-8 py-2 border-2 border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium shadow-lg hover:shadow-xl w-3/4 max-w-xs"
              >
                Log In
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
