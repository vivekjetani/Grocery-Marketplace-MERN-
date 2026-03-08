import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const Banner = () => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden mt-6 shadow-2xl shadow-primary/20 bg-mesh-light dark:bg-mesh-dark border border-white/20 dark:border-slate-800 transition-colors duration-500 min-h-[400px] md:min-h-[500px] flex items-center">
      {/* Absolute positioning for full-width background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent dark:from-slate-950/80 dark:via-slate-900/30 dark:to-transparent z-10"></div>
        <img
          src={assets.main_banner_bg}
          alt="Banner Graphic"
          className="object-cover object-center h-full w-full opacity-70 dark:opacity-40 mix-blend-overlay"
        />
      </motion.div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/30 dark:bg-primary/15 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-40 animate-blob z-0"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-accent/30 dark:bg-accent/15 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-40 animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-secondary/30 dark:bg-secondary/15 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-40 animate-blob animation-delay-4000 z-0"></div>

      <div className="relative z-10 flex flex-col items-center md:items-start justify-center px-6 md:px-16 lg:px-24 w-full h-full text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white"
          >
            Fresh AF. <br />
            <span className="text-gradient dark:text-gradient-dark">Delivered Fast.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-lg font-medium"
          >
            Vibe check your groceries. High quality, sustainably sourced, and delivered straight to your door without the hassle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center mt-10 gap-4"
          >
            <Link
              to="/products"
              className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 w-full sm:w-auto overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Shop Now</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
export default Banner;
