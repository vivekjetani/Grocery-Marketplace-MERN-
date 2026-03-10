import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Lock, Eye, Database, Bell, CheckCircle } from "lucide-react";

const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const pillars = [
    { icon: Shield, color: "#10b981", label: "Food Safety", desc: "All products are sourced from verified, certified suppliers. We inspect quality at every step of the supply chain." },
    { icon: Lock, color: "#6366f1", label: "Data Security", desc: "Your data is encrypted end-to-end and stored on secure servers. We never sell or share your personal information." },
    { icon: Eye, color: "#f59e0b", label: "Transparency", desc: "We are open about our sourcing, pricing, and data practices. No hidden agendas, no fine print surprises." },
    { icon: Database, color: "#ec4899", label: "Data Retention", desc: "You control your data. Request deletion anytime and we'll remove your information within 7 business days." },
    { icon: Bell, color: "#3b82f6", label: "Allergen Alerts", desc: "Product listings include allergen information. Always check labels and contact us if you have specific dietary concerns." },
    { icon: CheckCircle, color: "#14b8a6", label: "Regular Audits", desc: "Our systems and food suppliers undergo periodic audits to ensure we maintain the highest safety standards." },
];

const SafetyInfo = () => {
    const [storeInfo, setStoreInfo] = useState(null);

    useEffect(() => {
        fetch("/api/seller/store-info")
            .then((r) => r.json())
            .then(({ storeInfo }) => setStoreInfo(storeInfo))
            .catch(() => { });
    }, []);

    const policy = storeInfo?.safetyPolicy || "We follow strict food safety standards — all products are sourced from verified suppliers, stored at optimal temperatures, and delivered with hygiene-first protocols. Your data is protected under our privacy policy and never shared with third parties.";

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Hero */}
            <div className="relative overflow-hidden py-24 px-6" style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)" }}>
                <motion.div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 70% 50%, #34d399, transparent 60%)" }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/20">
                        <Shield size={40} className="text-emerald-300" />
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight">
                        Safety First. <br /><span className="text-emerald-300">Always.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-emerald-100 text-lg max-w-xl mx-auto leading-relaxed">
                        Your safety — food, data, and privacy — is not an afterthought. It's the foundation of everything we do at Gramodaya.
                    </motion.p>
                </div>
            </div>

            {/* Policy text */}
            <section className="py-20 px-6 max-w-3xl mx-auto">
                <Reveal>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl p-8 mb-16">
                        <h2 className="font-black text-xl text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                            <Shield size={20} /> Our Safety &amp; Privacy Commitment
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{policy}</p>
                    </div>
                </Reveal>
            </section>

            {/* Pillars grid */}
            <section className="pb-24 px-6 bg-slate-50 dark:bg-slate-900 py-20">
                <div className="max-w-5xl mx-auto">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 dark:text-white mb-12">Our Safety Pillars</h2>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-6">
                        {pillars.map((p, i) => (
                            <Reveal key={p.label} delay={i * 0.08}>
                                <motion.div
                                    whileHover={{ y: -6 }}
                                    className="bg-white dark:bg-slate-800 rounded-3xl p-7 border border-slate-100 dark:border-slate-700 shadow-sm transition-all h-full"
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: p.color + "20" }}>
                                        <p.icon size={24} style={{ color: p.color }} />
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{p.label}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                                </motion.div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom note */}
            <section className="py-16 px-6 text-center bg-white dark:bg-slate-950">
                <Reveal>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                        Have a safety concern? Reach out immediately through our{" "}
                        <a href="/contact-us" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Contact Us</a>{" "}
                        page. Your concern will be escalated within 2 hours to our safety team.
                    </p>
                    <p className="text-slate-300 dark:text-slate-600 text-xs mt-4">Last updated: March 2026 · Gramodaya Safety Policy v2.1</p>
                </Reveal>
            </section>
        </div>
    );
};

export default SafetyInfo;
