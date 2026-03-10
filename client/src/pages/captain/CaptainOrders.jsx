import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    CheckCircle,
    XCircle,
    MapPin,
    Phone,
    User,
    ShoppingBag,
    KeyRound,
    Clock,
    Truck,
} from "lucide-react";

const statusConfig = {
    Pending: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Awaiting Response" },
    Accepted: { color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30", label: "In Progress" },
};

const CaptainOrders = () => {
    const { axios } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [otpInputs, setOtpInputs] = useState({});
    const [confirmingId, setConfirmingId] = useState(null);
    const [respondingId, setRespondingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get("/api/captain/orders");
            if (data.success) setOrders(data.orders);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 30 seconds for new orders
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRespond = async (orderId, action) => {
        setRespondingId(orderId + action);
        try {
            const { data } = await axios.post(`/api/captain/respond/${orderId}`, { action });
            if (data.success) {
                toast.success(action === "accept" ? "✅ Order accepted!" : "❌ Order rejected");
                fetchOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setRespondingId(null);
        }
    };

    const handleConfirmDelivery = async (orderId) => {
        const otp = otpInputs[orderId];
        if (!otp || otp.length !== 6) {
            toast.error("Please enter the 6-digit OTP from the customer");
            return;
        }
        setConfirmingId(orderId);
        try {
            const { data } = await axios.post(`/api/captain/confirm/${orderId}`, { otp });
            if (data.success) {
                toast.success("🎉 Delivery confirmed! Order marked as Delivered.");
                setOtpInputs((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
                fetchOrders();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setConfirmingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">My Deliveries</h2>
                    <p className="text-slate-400 text-sm mt-1">Pending and in-progress orders assigned to you</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-2xl">
                    <p className="text-indigo-400 font-bold text-sm flex items-center gap-2">
                        <Package size={16} />
                        {orders.length} Active
                    </p>
                </div>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white">No deliveries assigned</h3>
                    <p className="text-slate-400 mt-1">New deliveries will appear here when assigned to you.</p>
                </div>
            ) : (
                <AnimatePresence>
                    {orders.map((order, idx) => {
                        const status = order.captainStatus || "Pending";
                        const cfg = statusConfig[status] || statusConfig["Pending"];
                        const addr = order.address || {};

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all duration-300"
                            >
                                {/* Order Header */}
                                <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                                            <Package size={18} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</p>
                                            <p className="font-mono text-sm text-slate-300">#{order._id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
                                        {status === "Pending" ? <Clock size={12} /> : <Truck size={12} />}
                                        {cfg.label}
                                    </div>
                                </div>

                                <div className="p-6 grid md:grid-cols-2 gap-6">
                                    {/* Left: Customer Details & Items */}
                                    <div className="space-y-4">
                                        {/* Customer Info */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                                                <User size={10} /> Customer Details
                                            </p>
                                            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                                                <p className="font-bold text-white">
                                                    {addr.firstName} {addr.lastName}
                                                </p>
                                                {addr.phone && (
                                                    <p className="text-sm text-slate-300 flex items-center gap-2">
                                                        <Phone size={13} className="text-indigo-400" />
                                                        {addr.phone}
                                                    </p>
                                                )}
                                                <p className="text-sm text-slate-400 flex items-start gap-2 mt-1">
                                                    <MapPin size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <span>
                                                        {addr.street}, {addr.city}, {addr.state} - {addr.zipcode}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                                                <ShoppingBag size={10} /> Items to Deliver
                                            </p>
                                            <div className="space-y-2">
                                                {order.items?.filter((i) => i.product).map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3"
                                                    >
                                                        {item.product?.image?.[0] && (
                                                            <img
                                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/${item.product.image[0]}`}
                                                                alt={item.product.name}
                                                                className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                                                            />
                                                        )}
                                                        <div className="flex-grow">
                                                            <p className="text-sm font-bold text-white">{item.product?.name}</p>
                                                            <p className="text-xs text-indigo-400">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-black text-white">
                                                            ₹{(item.product?.offerPrice || 0) * item.quantity}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Action Panel */}
                                    <div className="space-y-4">
                                        {/* Total */}
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 shadow-lg shadow-indigo-900/40">
                                            <p className="text-indigo-200/70 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-white">₹{order.amount}</p>
                                            <p className="text-indigo-200/60 text-xs mt-2 font-semibold uppercase">{order.paymentType}</p>
                                        </div>

                                        {/* Pending: Accept / Reject */}
                                        {status === "Pending" && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Respond to Order</p>
                                                <button
                                                    onClick={() => handleRespond(order._id, "accept")}
                                                    disabled={respondingId === order._id + "accept"}
                                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                                                >
                                                    <CheckCircle size={18} />
                                                    {respondingId === order._id + "accept" ? "Accepting…" : "Accept Order"}
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(order._id, "reject")}
                                                    disabled={respondingId === order._id + "reject"}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 font-bold py-3 rounded-xl transition disabled:opacity-60"
                                                >
                                                    <XCircle size={18} />
                                                    {respondingId === order._id + "reject" ? "Rejecting…" : "Reject Order"}
                                                </button>
                                                <p className="text-xs text-slate-500 text-center">
                                                    ⚠️ Rejection will notify the customer
                                                </p>
                                            </div>
                                        )}

                                        {/* Accepted: OTP Confirm */}
                                        {status === "Accepted" && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                    <KeyRound size={12} /> Confirm Delivery via OTP
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Ask the customer for their 6-digit OTP to confirm delivery.
                                                </p>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    placeholder="Enter 6-digit OTP"
                                                    value={otpInputs[order._id] || ""}
                                                    onChange={(e) =>
                                                        setOtpInputs((prev) => ({ ...prev, [order._id]: e.target.value.replace(/\D/g, "") }))
                                                    }
                                                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white font-mono text-xl tracking-widest text-center placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                                />
                                                <button
                                                    onClick={() => handleConfirmDelivery(order._id)}
                                                    disabled={confirmingId === order._id}
                                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-900/40 disabled:opacity-60"
                                                >
                                                    <CheckCircle size={18} />
                                                    {confirmingId === order._id ? "Confirming…" : "Confirm Delivery"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            )}
        </div>
    );
};

export default CaptainOrders;
