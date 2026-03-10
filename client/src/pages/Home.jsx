import Banner from "../components/Banner";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import NewsLetter from "../components/NewsLetter";
import RecommendedProducts from "../components/RecommendedProducts";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Home = () => {
  const { user, axios } = useAppContext();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      // If user is logged in and we haven't checked for the banner for THIS specific user in this session
      if (user && sessionStorage.getItem('welcomeBannerShown') !== user._id) {
        try {
          const { data } = await axios.get("/api/order/user");
          if (data.success) {
            if (data.orders.length === 0) {
              setShowWelcomePopup(true);
            }
            // Mark as checked for this specific user ID
            sessionStorage.setItem('welcomeBannerShown', user._id);
          }
        } catch (error) {
          console.error("Error checking orders for banner:", error);
        }
      }
    };

    // Add a small delay to ensure auth state and everything is fully settled
    const timer = setTimeout(() => {
      checkFirstTimeUser();
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="mt-10">
      <Banner />
      <Category />
      <BestSeller />
      <RecommendedProducts />
      <NewsLetter />

      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary to-accent opacity-20" />

              <button
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="flex flex-col items-center text-center relative z-10 mt-8 mb-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Welcome!</h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-6 text-lg">
                  Enjoy <span className="text-primary font-bold">50% off</span> your first order, just for you!
                </p>
                <div
                  className="bg-slate-100 dark:bg-slate-900/50 py-3 px-6 rounded-2xl w-full border border-slate-200 dark:border-slate-700 mb-6 flex justify-between items-center group cursor-copy"
                  onClick={() => {
                    navigator.clipboard.writeText("WELCOME50");
                    toast.success("Coupon code copied!");
                  }}
                  title="Click to copy"
                >
                  <span className="font-mono font-bold text-2xl tracking-wider text-slate-800 dark:text-slate-100">WELCOME50</span>
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <Link to="/products" onClick={() => setShowWelcomePopup(false)} className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all text-lg flex items-center justify-center gap-2">
                  Shop Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Home;
