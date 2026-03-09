import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Server, Shield, Send, Save, Bell, BellOff, Info, Plus, Trash2, Edit2, Check, X } from "lucide-react";

const SmtpSettings = () => {
    const { axios } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [editValue, setEditValue] = useState("");

    const [settings, setSettings] = useState({
        host: "",
        port: 587,
        user: "",
        password: "",
        admins: [],
        fromEmail: "",
        isEnabled: true
    });

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get("/api/seller/smtp");
            if (data.success && data.smtp) {
                setSettings(data.smtp);
            }
        } catch (error) {
            console.error("Error fetching SMTP settings:", error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addAdminEmail = () => {
        if (!newAdminEmail || !newAdminEmail.includes("@")) {
            return toast.error("Please enter a valid admin email");
        }
        if (settings.admins.some(a => a.email === newAdminEmail)) {
            return toast.error("Email already exists");
        }
        setSettings(prev => ({
            ...prev,
            admins: [...prev.admins, { email: newAdminEmail, isEnabled: true }]
        }));
        setNewAdminEmail("");
    };

    const removeAdminEmail = (index) => {
        setSettings(prev => ({
            ...prev,
            admins: prev.admins.filter((_, i) => i !== index)
        }));
    };

    const toggleAdminStatus = (index) => {
        setSettings(prev => ({
            ...prev,
            admins: prev.admins.map((admin, i) => i === index ? { ...admin, isEnabled: !admin.isEnabled } : admin)
        }));
    };

    const startEditing = (index, email) => {
        setEditingAdmin(index);
        setEditValue(email);
    };

    const saveEdit = (index) => {
        if (!editValue || !editValue.includes("@")) {
            return toast.error("Please enter a valid email");
        }
        setSettings(prev => ({
            ...prev,
            admins: prev.admins.map((admin, i) => i === index ? { ...admin, email: editValue } : admin)
        }));
        setEditingAdmin(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put("/api/seller/smtp", settings);
            if (data.success) {
                toast.success("SMTP Settings updated successfully!");
                fetchSettings();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            return toast.error("Please enter a recipient email for testing");
        }
        setTestLoading(true);
        try {
            const { data } = await axios.post("/api/seller/smtp/test", { toEmail: testEmail });
            if (data.success) {
                toast.success("Test email sent! Check your inbox.");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "SMTP test failed. Check your credentials.");
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:p-10 p-4 max-w-5xl mx-auto space-y-8"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Notifications</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure SMTP settings for system emails</p>
                </div>
                <div
                    onClick={() => handleChange({ target: { name: 'isEnabled', type: 'checkbox', checked: !settings.isEnabled } })}
                    className={`cursor-pointer px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all duration-300 ${settings.isEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                    {settings.isEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                    {settings.isEnabled ? "Notifications ON" : "Notifications OFF"}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Server Configuration */}
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
                                    <input
                                        type="text"
                                        name="host"
                                        value={settings.host}
                                        onChange={handleChange}
                                        placeholder="smtp.gmail.com"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">SMTP Port</label>
                                    <input
                                        type="number"
                                        name="port"
                                        value={settings.port}
                                        onChange={handleChange}
                                        placeholder="587"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Username / Email</label>
                                    <input
                                        type="email"
                                        name="user"
                                        value={settings.user}
                                        onChange={handleChange}
                                        placeholder="admin@example.com"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Password / App Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={settings.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">From Name</label>
                                <input
                                    type="text"
                                    name="fromEmail"
                                    value={settings.fromEmail}
                                    onChange={handleChange}
                                    placeholder="Grocery Marketplace"
                                    className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                            >
                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                                {loading ? "Updating..." : "Save Configuration"}
                            </button>
                        </div>
                    </form>

                    {/* Admin Email Management */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Mail size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Admin Recipients</h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="New admin email..."
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-700/30 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    onClick={addAdminEmail}
                                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {settings.admins.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <p className="text-sm">No admin recipients added yet.</p>
                                        </div>
                                    ) : (
                                        settings.admins.map((admin, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`flex items-center justify-between p-4 rounded-2xl border ${admin.isEnabled ? 'border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20' : 'border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}
                                            >
                                                <div className="flex items-center gap-4 flex-grow">
                                                    <div
                                                        onClick={() => toggleAdminStatus(idx)}
                                                        className={`cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center transition-all ${admin.isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                                                    >
                                                        {admin.isEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                                                    </div>

                                                    {editingAdmin === idx ? (
                                                        <input
                                                            autoFocus
                                                            className="flex-grow bg-white dark:bg-slate-700 border-none rounded-lg px-3 py-1 text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => saveEdit(idx)}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx)}
                                                        />
                                                    ) : (
                                                        <div>
                                                            <p className={`text-sm font-bold ${admin.isEnabled ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{admin.email}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{admin.isEnabled ? 'Active' : 'Disabled'}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {editingAdmin === idx ? (
                                                        <button
                                                            onClick={() => saveEdit(idx)}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing(idx, admin.email)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeAdminEmail(idx)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-indigo-200" size={24} />
                            <h3 className="text-xl font-black">Security Tips</h3>
                        </div>
                        <ul className="space-y-4 text-sm text-indigo-100">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full mt-1.5 shrink-0" />
                                Use App Passwords for Gmail accounts instead of your main password.
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full mt-1.5 shrink-0" />
                                Port 465 is for SSL, Port 587 is for TLS/STARTTLS.
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full mt-1.5 shrink-0" />
                                You can add multiple admin emails to stay notified on all your devices.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Send className="text-indigo-500" size={20} />
                            <h3 className="font-black text-slate-800 dark:text-white">Quick Test</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Send a test email to verify your configuration is working correctly.
                        </p>
                        <input
                            type="email"
                            placeholder="Recipient email..."
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={testLoading || !settings.isEnabled}
                            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testLoading ? "Sending..." : "Send Test Email"}
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-4">
                        <Info className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            Order notification emails will be sent to ALL enabled admin recipients listed here.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmtpSettings;
