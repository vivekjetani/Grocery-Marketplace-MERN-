import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, ArrowRight, Star } from "lucide-react";

const Careers = () => {
    const { axios, backendUrl } = useContext(AppContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await axios.get("/api/career/active");
                if (data.success) {
                    setJobs(data.careers);
                }
            } catch (error) {
                console.error("Failed to fetch jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [axios]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-950 mix-blend-multiply" />
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-100/30 dark:from-indigo-900/10 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-6 border border-indigo-100 dark:border-indigo-800"
                    >
                        <Star size={16} fill="currentColor" /> We are hiring!
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6"
                    >
                        Join the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Gramodaya</span> Team
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
                    >
                        Help us build the future of fast, fresh, and sustainable grocery delivery. Bring your vibes, we'll bring the snacks.
                    </motion.p>
                </div>
            </div>

            {/* Roles Section */}
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                    <Briefcase className="text-indigo-500" size={28} />
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Open Roles</h2>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No open roles right now</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Check back later or follow us on our socials for updates!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Optional Banner if available visually behind or integrated beautifully */}
                                {job.bannerUrl && (
                                    <div className="h-24 w-full md:w-64 md:h-full md:absolute right-0 top-0 overflow-hidden">
                                        <img
                                            src={`${backendUrl}/images/${job.bannerUrl}`}
                                        alt="Banner"
                                        className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 opacity-20 dark:opacity-10 md:opacity-100 md:animate-pulse shadow-inner"
                                        style={{ "-webkit-mask-image": "linear-gradient(to right, transparent, black)" }}
                    />
                                    </div>
                                )}

                                <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:pr-64">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {job.location}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {job.type}</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/careers/${job._id}`}
                                    className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all mt-4 md:mt-0 shadow-lg"
                  >
                                    View Details <ArrowRight size={18} />
                                </Link>
                            </div>
              </motion.div>
                ))}
            </div>
        )}
        </div>
    </div >
  );
};

export default Careers;
