import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, Link2, Shield, XCircle, Save } from "lucide-react";

const Field = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
            <Icon size={12} /> {label}
        </label>
        {props.textarea ? (
            <textarea
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed"
                {...props}
            />
        ) : (
            <input
                className="w-full bg-slate-50 dark:bg-slate-700/30 border-none rounded-2xl px-5 py-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                {...props}
            />
        )}
    </div>
);

const StoreInfo = () => {
    const { axios } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        address: "",
        phone: "",
        whatsapp: "",
        email: "",
        openHours: "",
        closedDays: "",
        mapLink: "",
        cancellationPolicy: "",
        safetyPolicy: "",
    });

    useEffect(() => {
        axios.get("/api/seller/store-info").then(({ data }) => {
            if (data.success) setForm(data.storeInfo);
        }).catch(console.error);
    }, []);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put("/api/seller/store-info", form);
            if (data.success) toast.success("Store info saved!");
            else toast.error(data.message);
        } catch {
            toast.error("Failed to save store info.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:p-10 p-4 max-w-4xl mx-auto space-y-8"
        >
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Store Info</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    These details appear on your public Contact Us, Help Center, Cancellation &amp; Safety pages.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Details */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-6">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MapPin size={18} className="text-indigo-500" /> Contact Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Field label="Address" icon={MapPin} name="address" value={form.address} onChange={handleChange} placeholder="123 Gram Street, Village Town, State 400001" />
                        <Field label="Phone" icon={Phone} name="phone" value={form.phone} onChange={handleChange} placeholder="+91 63510 51238" />
                        <Field label="WhatsApp Number" icon={MessageCircle} name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+91 63510 51238" />
                        <Field label="Business Email" icon={Mail} name="email" value={form.email} onChange={handleChange} placeholder="hello@gramodaya.in" />
                        <Field label="Open Hours" icon={Clock} name="openHours" value={form.openHours} onChange={handleChange} placeholder="Mon – Sat: 9 AM – 9 PM" />
                        <Field label="Closed Days" icon={Clock} name="closedDays" value={form.closedDays} onChange={handleChange} placeholder="Sunday" />
                        <div className="md:col-span-2">
                            <Field label="Google Maps Link" icon={Link2} name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                        </div>
                    </div>
                </div>

                {/* Policies */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-6">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield size={18} className="text-emerald-500" /> Policy Text
                    </h3>
                    <Field textarea label="Cancellation &amp; Refund Policy" icon={XCircle} name="cancellationPolicy" value={form.cancellationPolicy} onChange={handleChange} />
                    <Field textarea label="Safety &amp; Privacy Policy" icon={Shield} name="safetyPolicy" value={form.safetyPolicy} onChange={handleChange} />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                >
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                    {loading ? "Saving..." : "Save Store Info"}
                </button>
            </form>
        </motion.div>
    );
};

export default StoreInfo;
