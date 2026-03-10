import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, ArrowRight, Star, FileSearch, PhoneCall, Code2, Users2, Heart, PartyPopper } from "lucide-react";

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

            {/* Hiring Process Section */}
            <div className="relative mt-40 pb-32">
                {/* Immersive Background Element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest text-xs uppercase mb-4 block"
                            >
                                Our Journey Together
                            </motion.span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                                How we find the next <br />
                                <span className="text-indigo-600 dark:text-indigo-400">Gramodaya</span> family member.
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-2 font-medium">
                            We've designed a transparent, human-first hiring process that values your time and your talent.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { step: "01", title: "Digital Greeting", desc: "Our talent team reviews every single application. We look for skills, but we also look for passion and a unique perspective.", icon: <FileSearch className="text-indigo-500" />, bg: "bg-indigo-50 dark:bg-indigo-950/20" },
                            { step: "02", title: "Culture Sync", desc: "A brief conversation with our people team to align on our mission, values, and how you see yourself growing with us.", icon: <PhoneCall className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/20" },
                            { step: "03", title: "Craft Deep Dive", desc: "Show us what you're made of. This is a technical or role-specific session where we solve a real-world problem together.", icon: <Code2 className="text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-950/20" },
                            { step: "04", title: "Meet the Squad", desc: "Our team is our greatest asset. You'll meet the people you'll be working with every day to ensure chemistry is just right.", icon: <Users2 className="text-pink-500" />, bg: "bg-pink-50 dark:bg-pink-950/20" },
                            { step: "05", title: "Foundational Hub", desc: "A final talk with leadership about the bigger picture—where we're going and how you'll lead us there.", icon: <Heart className="text-rose-500" />, bg: "bg-rose-50 dark:bg-rose-950/20" },
                            { step: "06", title: "The Welcome", desc: "Congratulations! You're now a part of something big. We'll send over the offer and start the onboarding magic.", icon: <PartyPopper className="text-emerald-500" />, bg: "bg-emerald-50 dark:bg-emerald-950/20" }
                        ].map((item, idx) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-indigo-500/5"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {item.icon}
                                </div>
                                <span className="text-4xl font-black text-slate-200 dark:text-slate-800 absolute top-10 right-10 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/30 transition-colors">
                                    {item.step}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-20 p-10 md:p-16 rounded-[3rem] bg-slate-900 dark:bg-indigo-600 text-center text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-6">Don't see the perfect role?</h3>
                            <p className="text-slate-400 dark:text-indigo-100 mb-10 max-w-xl mx-auto">We're always looking for exceptional talent. Drop your resume at careers@gramodaya.com and let's talk about how you can shape the future.</p>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="bg-white text-slate-900 dark:text-indigo-600 px-10 py-4 rounded-full font-black hover:scale-105 transition-transform"
                            >
                                Keep Exploring
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Careers;
