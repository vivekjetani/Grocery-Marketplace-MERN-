import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, MessageCircle, Mail, Clock, ExternalLink, Send } from "lucide-react";
import toast from "react-hot-toast";

const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const ContactUs = () => {
    const { axios } = useAppContext();
    const [storeInfo, setStoreInfo] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        axios.get("/api/seller/store-info")
            .then(({ data }) => setStoreInfo(data.storeInfo))
            .catch(() => { });
    }, [axios]);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return toast.error("Please fill all fields.");
        setSending(true);
        try {
            const { data } = await axios.post("/api/seller/inquiry", form);
            if (data.success) {
                toast.success("Message sent! We'll respond within 24 hours 🙌");
                setForm({ name: "", email: "", message: "" });
            } else {
                toast.error(data.message || "Failed to send message.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const channels = [
        storeInfo?.phone && {
            icon: Phone, color: "#6366f1", label: "Call Us",
            value: storeInfo.phone,
            href: `tel:${storeInfo.phone}`,
            sub: "Mon – Sat, " + (storeInfo.openHours || "9 AM – 9 PM"),
        },
        storeInfo?.whatsapp && {
            icon: MessageCircle, color: "#10b981", label: "WhatsApp",
            value: storeInfo.whatsapp,
            href: `https://wa.me/${storeInfo.whatsapp.replace(/\D/g, "")}`,
            sub: "Drop a message, we reply fast!",
        },
        storeInfo?.email && {
            icon: Mail, color: "#f59e0b", label: "Email Us",
            value: storeInfo.email,
            href: `mailto:${storeInfo.email}`,
            sub: "Response within 24 hours",
        },
    ].filter(Boolean);

    // Fallback channels if nothing from API yet
    const displayChannels = channels.length > 0 ? channels : [
        { icon: MessageCircle, color: "#10b981", label: "WhatsApp", value: "+91 63510 51238", href: "https://wa.me/916351051238", sub: "Drop a message, we reply fast!" },
        { icon: Phone, color: "#6366f1", label: "Call Us", value: "+91 63510 51238", href: "tel:+916351051238", sub: "Mon – Sat, 9 AM – 9 PM" },
        { icon: Mail, color: "#f59e0b", label: "Email", value: "hello@gramodaya.in", href: "mailto:hello@gramodaya.in", sub: "Response within 24 hours" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Hero */}
            <div className="relative overflow-hidden py-24 px-6" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #111827 60%, #1a1a2e 100%)" }}>
                <motion.div className="absolute inset-0 opacity-15" style={{ background: "radial-gradient(circle at 60% 40%, #6366f1, transparent 55%)" }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
                <motion.div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 20% 70%, #10b981, transparent 50%)" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }} />
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
                        <MessageCircle size={40} className="text-indigo-300" />
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight">
                        Let's <span className="text-indigo-400">Talk.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-slate-400 text-lg max-w-md mx-auto">
                        Questions, concerns, or just want to say hi? We're real people and we'd love to hear from you.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left – channels + store details */}
                    <div className="space-y-8">
                        <Reveal>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Get In Touch</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pick the channel that works best for you.</p>
                        </Reveal>

                        <div className="space-y-4">
                            {displayChannels.map((c, i) => (
                                <Reveal key={c.label} delay={i * 0.1}>
                                    <motion.a
                                        href={c.href}
                                        target={c.href.startsWith("http") ? "_blank" : undefined}
                                        rel="noreferrer"
                                        whileHover={{ x: 6 }}
                                        className="flex items-center gap-5 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: c.color + "18" }}>
                                            <c.icon size={24} style={{ color: c.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900 dark:text-white text-sm">{c.label}</p>
                                            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">{c.value}</p>
                                            <p className="text-slate-400 text-xs">{c.sub}</p>
                                        </div>
                                        <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                    </motion.a>
                                </Reveal>
                            ))}
                        </div>

                        {/* Store address + hours */}
                        {(storeInfo?.address || storeInfo?.openHours) && (
                            <Reveal delay={0.3}>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                                    {storeInfo.address && (
                                        <div className="flex gap-3 items-start">
                                            <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Our Address</p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">{storeInfo.address}</p>
                                                {storeInfo.mapLink && (
                                                    <a href={storeInfo.mapLink} target="_blank" rel="noreferrer" className="text-indigo-500 text-xs font-semibold hover:underline mt-1 inline-flex items-center gap-1">
                                                        View on Map <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(storeInfo.openHours || storeInfo.closedDays) && (
                                        <div className="flex gap-3 items-start">
                                            <Clock size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Business Hours</p>
                                                {storeInfo.openHours && <p className="text-slate-500 dark:text-slate-400 text-sm">{storeInfo.openHours}</p>}
                                                {storeInfo.closedDays && <p className="text-slate-400 text-xs mt-0.5">Closed: {storeInfo.closedDays}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        )}
                    </div>

                    {/* Right – message form */}
                    <Reveal delay={0.15}>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none p-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Send a Message</h3>
                            <p className="text-slate-400 text-sm mb-7">We'll respond within 24 hours.</p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Name</label>
                                    <input
                                        name="name" value={form.name} onChange={handleChange}
                                        placeholder="Vivek Jetani"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <input
                                        type="email" name="email" value={form.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message</label>
                                    <textarea
                                        name="message" value={form.message} onChange={handleChange}
                                        rows={5}
                                        placeholder="Tell us how we can help…"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={sending}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <Send size={18} className={sending ? "animate-pulse" : ""} />
                                    {sending ? "Sending…" : "Send Message"}
                                </motion.button>
                            </form>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
