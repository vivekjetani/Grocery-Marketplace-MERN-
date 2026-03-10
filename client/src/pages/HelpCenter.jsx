import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, MessageCircle, Phone, Mail, Package, CreditCard, MapPin, User } from "lucide-react";
import axios from "axios";

const categories = [
    {
        id: "orders",
        label: "Orders",
        icon: Package,
        color: "#6366f1",
        faqs: [
            { q: "How do I track my order?", a: "Once your order is placed, you'll receive a confirmation. You can track real-time status from your Profile → Orders page. Our delivery captain will keep you updated via WhatsApp." },
            { q: "Can I modify an order after placing it?", a: "You can modify your order within 10 minutes of placing it by contacting our support. After the order is picked up for delivery, modifications are not possible." },
            { q: "What if an item is missing from my delivery?", a: "If an item is missing, report it within 24 hours via the Contact Us page or WhatsApp. We'll immediately refund or re-deliver the missing item at no charge." },
            { q: "How long does delivery take?", a: "We typically deliver within 2–4 hours for in-stock items within our delivery zones. Same-day delivery is available for orders placed before 6 PM." },
        ],
    },
    {
        id: "payments",
        label: "Payments",
        icon: CreditCard,
        color: "#10b981",
        faqs: [
            { q: "What payment methods are accepted?", a: "We accept UPI, debit/credit cards, net banking, and Cash on Delivery (COD). All online payments are processed through secure, encrypted gateways." },
            { q: "Is my payment information safe?", a: "Absolutely. We use industry-standard SSL encryption and never store your card details on our servers. Payments are processed by certified payment gateways." },
            { q: "When will I get my refund?", a: "Refunds for eligible cancellations are processed within 5–7 business days to your original payment method. UPI refunds are typically faster (1–3 days)." },
            { q: "Are there any hidden charges?", a: "None. The price you see is the price you pay. Delivery charges (if any) are clearly displayed before checkout." },
        ],
    },
    {
        id: "delivery",
        label: "Delivery",
        icon: MapPin,
        color: "#f59e0b",
        faqs: [
            { q: "What areas do you deliver to?", a: "We currently deliver within our listed pin codes. You can check delivery availability by entering your pin code on the homepage or cart page." },
            { q: "Can I schedule a delivery time?", a: "Yes! During checkout you can select a preferred delivery window. Our captains will do their best to honour your chosen slot." },
            { q: "What happens if I'm not home?", a: "Our captain will attempt delivery twice. If unavailable, we'll leave a note and contact you to reschedule. COD orders may be cancelled if we can't reach you." },
            { q: "Is there a minimum order value?", a: "The minimum order value and any applicable delivery fees are shown at checkout. We offer free delivery above certain order thresholds — check the cart for current offers." },
        ],
    },
    {
        id: "account",
        label: "Account",
        icon: User,
        color: "#ec4899",
        faqs: [
            { q: "How do I verify my email?", a: "After registration, a verification link is sent to your email. Click it to activate your account. If you didn't receive it, check spam or use the 'Resend' option on login." },
            { q: "Can I have multiple addresses?", a: "Yes! You can save multiple delivery addresses in your Profile → Addresses section and select the right one at checkout." },
            { q: "How do I delete my account?", a: "To request account deletion, please contact us via the Contact Us page. We'll process your request within 7 business days in compliance with data regulations." },
            { q: "Is my personal data safe?", a: "Your privacy is our priority. We never sell your data. Read our full Safety & Privacy Info for details on how we handle and protect your information." },
        ],
    },
];

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${open ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"}`}
            onClick={() => setOpen((p) => !p)}
        >
            <div className="flex items-center justify-between p-5 gap-4">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{q}</p>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-slate-400">
                    <ChevronDown size={18} />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const HelpCenter = () => {
    const [active, setActive] = useState("orders");
    const [query, setQuery] = useState("");
    const [storeInfo, setStoreInfo] = useState(null);

    useEffect(() => {
        fetch("/api/seller/store-info")
            .then((r) => r.json())
            .then(({ storeInfo }) => setStoreInfo(storeInfo))
            .catch(() => { });
    }, []);

    const activeCat = categories.find((c) => c.id === active);
    const filtered = query
        ? categories.flatMap((c) => c.faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())))
        : activeCat?.faqs || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={{ fontFamily: "'DM Sans', 'Manrope', sans-serif" }}>
            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)" }}>
                <motion.div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 50%, #818cf8, transparent 60%)" }} animate={{ x: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
                <div className="relative z-10 text-center py-20 px-6 max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-200 text-xs tracking-widest uppercase font-bold mb-6">
                        💡 Help Center
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
                        How can we help?
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-indigo-200 mb-8">
                        Search our knowledge base or browse by category below.
                    </motion.p>
                    {/* Search */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative max-w-xl mx-auto">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 rounded-2xl pl-12 pr-6 py-4 text-slate-800 dark:text-white shadow-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                        />
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-16">
                {!query && (
                    /* Category tabs */
                    <div className="flex flex-wrap gap-3 mb-10 justify-center">
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActive(c.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${active === c.id ? "text-white border-transparent shadow-lg" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"}`}
                                style={active === c.id ? { background: c.color } : {}}
                            >
                                <c.icon size={16} /> {c.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* FAQs */}
                <div className="space-y-3 mb-20">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Search size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="font-semibold">No results found for "{query}"</p>
                            <p className="text-sm mt-1">Try different keywords or browse by category.</p>
                        </div>
                    ) : (
                        filtered.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)
                    )}
                </div>

                {/* Still need help? */}
                <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
                    <div className="p-10 text-center text-white">
                        <h3 className="text-2xl font-black mb-2">Still need help?</h3>
                        <p className="text-indigo-200 mb-8 text-sm">Our support team is here for you.</p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {storeInfo?.whatsapp && (
                                <a href={`https://wa.me/${storeInfo.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                                    className="flex flex-col items-center gap-2 p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                                    <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-sm">WhatsApp</span>
                                    <span className="text-indigo-200 text-xs">{storeInfo.whatsapp}</span>
                                </a>
                            )}
                            {storeInfo?.phone && (
                                <a href={`tel:${storeInfo.phone}`}
                                    className="flex flex-col items-center gap-2 p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                                    <Phone size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-sm">Call Us</span>
                                    <span className="text-indigo-200 text-xs">{storeInfo.phone}</span>
                                </a>
                            )}
                            {storeInfo?.email && (
                                <a href={`mailto:${storeInfo.email}`}
                                    className="flex flex-col items-center gap-2 p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                                    <Mail size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-sm">Email</span>
                                    <span className="text-indigo-200 text-xs">{storeInfo.email}</span>
                                </a>
                            )}
                            {!storeInfo?.whatsapp && !storeInfo?.phone && !storeInfo?.email && (
                                <a href="/contact-us" className="sm:col-span-3 flex items-center justify-center gap-2 p-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                    <MessageCircle size={20} /> Contact Us →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
