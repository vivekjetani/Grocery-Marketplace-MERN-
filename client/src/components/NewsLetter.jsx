import { motion } from "framer-motion";
import toast from "react-hot-toast";

const NewsLetter = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("You're subscribed! 🎉");
    e.target.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="my-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl shadow-purple-500/30"
    >
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <h1 className="md:text-5xl text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Never Miss a Deal!
        </h1>
        <p className="md:text-xl text-white/90 font-medium py-6 px-4 drop-shadow-sm">
          Join the squad. Subscribe to get the latest drops, sustainable finds, and exclusive discounts right to your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center w-full gap-3 sm:gap-0 mt-4 relative">
          <input
            className="w-full sm:w-[70%] h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none rounded-xl sm:rounded-r-none px-6 shadow-inner focus:ring-2 focus:ring-white/50 transition-all font-medium"
            type="email"
            placeholder="Drop your email here..."
            required
          />
          <button
            type="submit"
            className="w-full sm:w-[30%] h-14 text-slate-900 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer font-bold text-lg rounded-xl sm:rounded-l-none shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Subscribe ✨
          </button>
        </form>
      </div>
    </motion.div>
  );
};
export default NewsLetter;
