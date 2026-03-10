import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Server, Shield, Send, Save, Bell, BellOff,
    Info, Plus, Trash2, Edit2, Check, X, Clock, Calendar, ChevronDown,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────
const FREQ_OPTIONS = [
    { value: "daily", label: "Every Day", icon: "🔁" },
    { value: "alternate", label: "Every Other Day", icon: "⏭️" },
    { value: "weekly", label: "Once a Week", icon: "📅" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const NOTIF_TYPES = [
    { key: "lowStock", label: "Low Stock Alert", desc: "Products running out of stock", color: "#f59e0b" },
    { key: "newOrder", label: "New Order", desc: "When a customer places an order", color: "#6366f1" },
    { key: "orderStatus", label: "Order Status Change", desc: "Confirmed, delivered, cancelled…", color: "#10b981" },
    { key: "dailySummary", label: "Daily Summary", desc: "Day-end revenue & order digest", color: "#3b82f6" },
];

// ─── Helpers ───────────────────────────────────────────────────────
const defaultAdmin = (email = "") => ({
    email,
    isEnabled: true,
    frequency: "daily",
    alertHour: 8,
    alertDay: 1,
    notifications: { lowStock: true, newOrder: true, orderStatus: false, dailySummary: false },
});

const fmt12h = (h) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:00 ${ampm}`;
};

// ─── Per-admin expandable card ──────────────────────────────────────
const AdminCard = ({ admin, idx, onChange, onRemove }) => {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editVal, setEditVal] = useState(admin.email);

    const set = (field, val) => onChange(idx, { ...admin, [field]: val });
    const setNotif = (key, val) =>
        onChange(idx, { ...admin, notifications: { ...admin.notifications, [key]: val } });

    const scheduleLabel = () => {
        const freq = FREQ_OPTIONS.find(f => f.value === admin.frequency);
        const dayStr = admin.frequency === "weekly" ? ` · ${DAY_NAMES[admin.alertDay ?? 1]}` : "";
        return `${freq?.label}${dayStr} · ${fmt12h(admin.alertHour ?? 8)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-2xl border overflow-hidden transition-all ${admin.isEnabled
                    ? "border-indigo-100 dark:border-indigo-900/40"
                    : "border-slate-200 dark:border-slate-700 opacity-60"
                }`}
        >
            {/* ── Card header row ── */}
            <div className="flex items-center p-4 gap-3">
                {/* Bell toggle */}
                <button
                    type="button"
                    onClick={() => set("isEnabled", !admin.isEnabled)}
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all ${admin.isEnabled
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                        }`}
                >
                    {admin.isEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>

                {/* Email (editable) */}
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <input
                            autoFocus
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => { if (editVal.includes("@")) { set("email", editVal); setEditing(false); } else toast.error("Invalid email"); }}
                            onKeyDown={e => e.key === "Enter" && e.target.blur()}
                            className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-3 py-1 text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    ) : (
                        <>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{admin.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{scheduleLabel()}</p>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => setEditing(!editing)} className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors">
                        {editing ? <Check size={16} /> : <Edit2 size={16} />}
                    </button>
                    <button type="button" onClick={() => onRemove(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setExpanded(p => !p)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"
                    >
                        <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ── Expandable settings ── */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
                    >
                        <div className="p-5 space-y-5 bg-slate-50/50 dark:bg-slate-800/30">

                            {/* ── Schedule section ── */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                    <Clock size={11} /> Alert Schedule
                                </p>

                                {/* Frequency pills */}
                                <div className="flex gap-2 flex-wrap mb-4">
                                    {FREQ_OPTIONS.map(f => (
                                        <button
                                            key={f.value}
                                            type="button"
                                            onClick={() => set("frequency", f.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${admin.frequency === f.value
                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                    : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400"
                                                }`}
                                        >
                                            <span>{f.icon}</span> {f.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Alert time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                                            Time of Day
                                        </label>
                                        <select
                                            value={admin.alertHour ?? 8}
                                            onChange={e => set("alertHour", Number(e.target.value))}
                                            className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {Array.from({ length: 24 }, (_, h) => (
                                                <option key={h} value={h}>{fmt12h(h)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Day of week (only for weekly) */}
                                    {admin.frequency === "weekly" && (
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block flex items-center gap-1">
                                                <Calendar size={10} /> Day of Week
                                            </label>
                                            <select
                                                value={admin.alertDay ?? 1}
                                                onChange={e => set("alertDay", Number(e.target.value))}
                                                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {DAY_NAMES.map((d, i) => (
                                                    <option key={i} value={i}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Notification types ── */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                    <Bell size={11} /> Email Types
                                </p>
                                <div className="space-y-2">
                                    {NOTIF_TYPES.map(({ key, label, desc, color }) => {
                                        const on = admin.notifications?.[key] ?? false;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNotif(key, !on)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${on
                                                        ? "border-transparent bg-white dark:bg-slate-700 shadow-sm"
                                                        : "border-slate-100 dark:border-slate-700 bg-transparent opacity-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ background: on ? color : "#94a3b8" }}
                                                    />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p>
                                                        <p className="text-[10px] text-slate-400">{desc}</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-8 h-4 rounded-full relative transition-colors"
                                                    style={{ background: on ? color : "#e2e8f0" }}
                                                >
                                                    <div
                                                        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                                                        style={{ transform: on ? "translateX(17px)" : "translateX(2px)" }}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────
const SmtpSettings = () => {
    const { axios } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");

    const [settings, setSettings] = useState({
        host: "", port: 587, user: "", password: "",
        admins: [], fromEmail: "", isEnabled: true,
    });

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get("/api/seller/smtp");
            if (data.success && data.smtp) setSettings(data.smtp);
        } catch (err) {
            console.error("Error fetching SMTP settings:", err);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const addAdmin = () => {
        if (!newAdminEmail || !newAdminEmail.includes("@")) return toast.error("Please enter a valid email");
        if (settings.admins.some(a => a.email === newAdminEmail)) return toast.error("Email already exists");
        setSettings(prev => ({ ...prev, admins: [...prev.admins, defaultAdmin(newAdminEmail)] }));
        setNewAdminEmail("");
    };

    const updateAdmin = (idx, updated) => {
        setSettings(prev => ({ ...prev, admins: prev.admins.map((a, i) => i === idx ? updated : a) }));
    };

    const removeAdmin = (idx) => {
        setSettings(prev => ({ ...prev, admins: prev.admins.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put("/api/seller/smtp", settings);
            if (data.success) { toast.success("SMTP Settings updated!"); fetchSettings(); }
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update settings");
        } finally { setLoading(false); }
    };

    const handleTestEmail = async () => {
        if (!testEmail) return toast.error("Please enter a recipient email");
        setTestLoading(true);
        try {
            const { data } = await axios.post("/api/seller/smtp/test", { toEmail: testEmail });
            if (data.success) toast.success("Test email sent! Check your inbox.");
            else toast.error(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "SMTP test failed.");
        } finally { setTestLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:p-10 p-4 max-w-5xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Notifications</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure SMTP and per-admin alert preferences</p>
                </div>
                <div
                    onClick={() => handleChange({ target: { name: "isEnabled", type: "checkbox", checked: !settings.isEnabled } })}
                    className={`cursor-pointer px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all duration-300 ${settings.isEnabled
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                >
                    {settings.isEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                    {settings.isEnabled ? "Notifications ON" : "Notifications OFF"}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* Server config form */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Server size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Server Configuration</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">SMTP Host</label>
                                    <input type="text" name="host" value={settings.host} onChange={handleChange}
                                        placeholder="smtp.gmail.com" required
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">SMTP Port</label>
                                    <input type="number" name="port" value={settings.port} onChange={handleChange}
                                        placeholder="587" required
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Username / Email</label>
                                    <input type="email" name="user" value={settings.user} onChange={handleChange}
                                        placeholder="admin@example.com" required
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Password / App Password</label>
                                    <input type="password" name="password" value={settings.password} onChange={handleChange}
                                        placeholder="••••••••••••" required
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">From Name</label>
                                <input type="text" name="fromEmail" value={settings.fromEmail} onChange={handleChange}
                                    placeholder="Grocery Marketplace" required
                                    className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group">
                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                                {loading ? "Updating..." : "Save Configuration"}
                            </button>
                        </div>
                    </form>

                    {/* Admin Recipients */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Admin Recipients</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Each admin has individual schedule &amp; notification preferences</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <input
                                    type="email" placeholder="New admin email…"
                                    value={newAdminEmail}
                                    onChange={e => setNewAdminEmail(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAdmin())}
                                    className="bg-slate-50 dark:bg-slate-700/30 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button type="button" onClick={addAdmin}
                                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <AnimatePresence mode="popLayout">
                                {settings.admins.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400">
                                        <Mail size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No admin recipients added yet.</p>
                                        <p className="text-xs mt-1">Add an email above to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {settings.admins.map((admin, idx) => (
                                            <AdminCard
                                                key={idx}
                                                admin={admin}
                                                idx={idx}
                                                onChange={updateAdmin}
                                                onRemove={removeAdmin}
                                            />
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>

                            {settings.admins.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Save size={16} />
                                    {loading ? "Saving…" : "Save All Admin Preferences"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-indigo-200" size={24} />
                            <h3 className="text-xl font-black">Schedule Guide</h3>
                        </div>
                        <ul className="space-y-4 text-sm text-indigo-100">
                            <li className="flex gap-3">
                                <span className="text-indigo-300 shrink-0 mt-0.5">🔁</span>
                                <span><strong>Every Day</strong> — alert at the chosen hour, daily</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-indigo-300 shrink-0 mt-0.5">⏭️</span>
                                <span><strong>Every Other Day</strong> — alternating days at chosen hour</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-indigo-300 shrink-0 mt-0.5">📅</span>
                                <span><strong>Once a Week</strong> — pick the day and hour</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-indigo-300 shrink-0 mt-0.5">🔔</span>
                                <span>Each admin can enable only the notification types they want</span>
                            </li>
                        </ul>
                    </div>

                    {/* Test email */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Send className="text-indigo-500" size={20} />
                            <h3 className="font-black text-slate-800 dark:text-white">Quick Test</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Send a test email to verify your SMTP configuration.
                        </p>
                        <input type="email" placeholder="Recipient email…" value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <button onClick={handleTestEmail} disabled={testLoading || !settings.isEnabled}
                            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            {testLoading ? "Sending..." : "Send Test Email"}
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-4">
                        <Info className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            Click the <strong>▾ arrow</strong> on any admin card to configure their schedule and which emails they receive. Changes take effect after saving.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmtpSettings;
