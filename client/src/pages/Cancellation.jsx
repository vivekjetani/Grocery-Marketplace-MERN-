import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { XCircle, Clock, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const timelineSteps = [
    { icon: XCircle, color: "#6366f1", label: "Place Cancellation Request", detail: "Within 30 minutes of ordering, cancel from your Profile → Orders page or WhatsApp us." },
    { icon: CheckCircle, color: "#10b981", label: "Request Verified", detail: "Our system checks if the order has been picked up yet. Usually instant." },
    { icon: RefreshCw, color: "#f59e0b", label: "Refund Initiated", detail: "If eligible, the refund is initiated immediately to your original payment method." },
    { icon: Clock, color: "#3b82f6", label: "Refund Credited", detail: "UPI: 1–3 days · Cards / Net Banking: 5–7 business days." },
];

const highlights = [
    { emoji: "⏱️", title: "30-Minute Window", desc: "Cancel within 30 mins of placing your order — no questions asked." },
    { emoji: "🚚", title: "Once Picked Up", desc: "After the captain collects your order, cancellation is not possible." },
    { emoji: "💸", title: "Full Refunds", desc: "Eligible cancellations receive a 100% refund — no deductions, no fees." },
    { emoji: "🥦", title: "Fresh Produce Exception", desc: "Perishables that have left our facility cannot be cancelled for hygiene reasons." },
];

const Cancellation = () => {
    const [storeInfo, setStoreInfo] = useState(null);

    useEffect(() => {
        fetch("/api/seller/store-info")
            .then((r) => r.json())
            .then(({ storeInfo }) => setStoreInfo(storeInfo))
            .catch(() => { });
    }, []);

    const policy = storeInfo?.cancellationPolicy ||
        "Orders can be cancelled within 30 minutes of placing them. Once the order is picked up by our delivery captain, cancellation is not possible. For eligible cancellations, refunds are processed within 5–7 business days.";

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Hero */}
            <div className="relative overflow-hidden py-24 px-6" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #7c3aed 100%)" }}>
                <motion.div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 60%, #a78bfa, transparent 60%)" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity }} />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
                        <XCircle size={40} className="text-violet-300" />
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight">
                        Cancellation &<br /><span className="text-violet-300">Refunds</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-violet-200 text-lg max-w-xl mx-auto">
                        Simple, fair, and transparent. We make cancellations as painless as possible.
                    </motion.p>
                </div>
            </div>

            {/* Policy text */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <Reveal>
                        <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 rounded-3xl p-8 mb-12">
                            <h2 className="font-black text-xl text-violet-800 dark:text-violet-300 mb-4 flex items-center gap-2">
                                <XCircle size={20} /> Cancellation & Refund Policy
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{policy}</p>
                        </div>
                    </Reveal>

                    {/* Highlight cards */}
                    <div className="grid sm:grid-cols-2 gap-5 mb-16">
                        {highlights.map((h, i) => (
                            <Reveal key={h.title} delay={i * 0.1}>
                                <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="text-3xl mb-3">{h.emoji}</div>
                                    <h3 className="font-black text-slate-900 dark:text-white mb-1">{h.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{h.desc}</p>
                                </motion.div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-2xl mx-auto">
                    <Reveal>
                        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-12">How Refunds Work</h2>
                    </Reveal>
                    <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-10">
                            {timelineSteps.map((step, i) => (
                                <Reveal key={step.label} delay={i * 0.12}>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md z-10 relative border-4 border-white dark:border-slate-900" style={{ background: step.color + "22" }}>
                                            <step.icon size={22} style={{ color: step.color }} />
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="font-black text-slate-900 dark:text-white mb-1">{step.label}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{step.detail}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Alert / note */}
            <section className="py-14 px-6 text-center bg-white dark:bg-slate-950">
                <Reveal>
                    <div className="inline-flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-2xl px-6 py-4 max-w-xl mx-auto text-left">
                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                            <strong>Need help with a cancellation?</strong> Reach out via{" "}
                            <a href="/contact-us" className="underline font-semibold">Contact Us</a>{" "}
                            or WhatsApp and our team will respond within 30 minutes during business hours.
                        </p>
                    </div>
                </Reveal>
            </section>
        </div>
    );
};

export default Cancellation;
