import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setShowUserLogin, setUser, axios, navigate, setAppliedCoupon } = useAppContext();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });
      if (data.success) {
        toast.success(data.message);
        if (state === "login") {
          setUser(data.user);
          setAppliedCoupon(null); // Fresh start on login
          setShowUserLogin(false);
          navigate("/");
        } else {
          setState("login");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 outline-none transition-all dark:text-white dark:placeholder-slate-500 font-medium";
  const labelClass = "text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowUserLogin(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
        >
          {/* Decorative Header */}
          <div className="h-32 bg-gradient-to-br from-primary via-accent to-secondary relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px]"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

            <button
              type="button"
              onClick={() => setShowUserLogin(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="px-8 pt-8 pb-10">
            <div className="-mt-16 w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 relative z-10">
              <span className="text-4xl">{state === "login" ? "👋" : "✨"}</span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              {state === "login" ? "Welcome back!" : "Join the squad"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              {state === "login" ? "Enter your details to access your account." : "Create an account to get started."}
            </p>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {state === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className={labelClass}>Name</label>
                    <input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      placeholder="e.g. Alex Doe"
                      className={inputClass}
                      type="text"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="alex@example.com"
                  className={inputClass}
                  type="email"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className={inputClass}
                  type="password"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
            >
              {state === "register" ? "Create Account" : "Let's Go"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </motion.button>

            <div className="mt-6 text-center">
              {state === "register" ? (
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setState("login")}
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setState("register")}
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default Auth;
