import { useState, useEffect, useContext, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from "recharts";

// ─── Colour palette ────────────────────────────────────────────────
const PIE_COLORS = [
    "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
    "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

const STATUS_META = {
    "Order Placed": { color: "#6366f1", bg: "rgba(99,102,241,.12)" },
    Confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
    "In Progress": { color: "#a855f7", bg: "rgba(168,85,247,.12)" },
    "Out for Delivery": { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
    Delivered: { color: "#10b981", bg: "rgba(16,185,129,.12)" },
    Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
    Rejected: { color: "#f97316", bg: "rgba(249,115,22,.12)" },
};

// ─── Subcomponents ─────────────────────────────────────────────────

/** Reusable KPI Card */
const StatCard = ({ title, value, subtitle, icon, accent, dark }) => (
    <div
        className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${dark
            ? "bg-slate-800/60 border-slate-700/60"
            : "bg-white border-slate-200/80"
            }`}
        style={{ boxShadow: `0 0 0 1px ${accent}22` }}
    >
        {/* glow blob */}
        <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ background: accent }}
        />
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {title}
                </p>
                <p className={`text-3xl font-black ${dark ? "text-white" : "text-slate-800"}`}>
                    {value}
                </p>
                {subtitle && (
                    <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-400"}`}>
                        {subtitle}
                    </p>
                )}
            </div>
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: `${accent}22`, color: accent }}
            >
                {icon}
            </div>
        </div>
    </div>
);

/** Section wrapper */
const Section = ({ title, children, dark, action }) => (
    <div
        className={`rounded-2xl border p-5 ${dark ? "bg-slate-800/60 border-slate-700/60" : "bg-white border-slate-200/80"
            }`}
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base font-bold ${dark ? "text-white" : "text-slate-800"}`}>
                {title}
            </h3>
            {action}
        </div>
        {children}
    </div>
);

/** Custom tooltip for revenue chart */
const RevenueTooltip = ({ active, payload, label, dark }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className={`rounded-xl px-4 py-3 shadow-2xl text-sm border ${dark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}
        >
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {p.name === "Revenue" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
                </p>
            ))}
        </div>
    );
};

/** Status badge */
const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] || { color: "#94a3b8", bg: "rgba(148,163,184,.12)" };
    return (
        <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: m.bg, color: m.color }}
        >
            {status}
        </span>
    );
};

// ─── Star Rating display ────────────────────────────────────────────
const Stars = ({ rating }) => (
    <span className="text-amber-400 text-xs">
        {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
        <span className="ml-1 text-slate-400">{rating?.toFixed(1)}</span>
    </span>
);

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
    const { axios, isDarkMode } = useContext(AppContext);
    const dark = isDarkMode;

    const [overview, setOverview] = useState(null);
    const [salesChart, setSalesChart] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertLoading, setAlertLoading] = useState(false);
    const [chartDays, setChartDays] = useState(30);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [ov, sc, cat, prod, act] = await Promise.all([
                axios.get("/api/seller/dashboard/overview"),
                axios.get(`/api/seller/dashboard/sales-chart?days=${chartDays}`),
                axios.get("/api/seller/dashboard/category-distribution"),
                axios.get("/api/seller/dashboard/product-trends"),
                axios.get("/api/seller/dashboard/recent-activity"),
            ]);
            if (ov.data.success) setOverview(ov.data.overview);
            if (sc.data.success) setSalesChart(sc.data.chartData);
            if (cat.data.success) setCategories(cat.data.categories);
            if (prod.data.success) setProducts(prod.data.products);
            if (act.data.success) setActivities(act.data.activities);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [axios, chartDays]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSendLowStockAlert = async () => {
        setAlertLoading(true);
        try {
            const { data } = await axios.post("/api/seller/dashboard/low-stock-alert", { threshold: 5 });
            if (data.success) toast.success(data.message);
            else toast.error(data.message);
        } catch {
            toast.error("Failed to send alert. Check SMTP settings.");
        } finally {
            setAlertLoading(false);
        }
    };

    // ─── Skeleton ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={`min-h-screen p-6 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-28 rounded-2xl animate-pulse ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-64 rounded-2xl animate-pulse ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
                    ))}
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(...products.map(p => p.revenue), 1);

    return (
        <div
            className={`min-h-screen p-4 md:p-6 overflow-y-auto ${dark ? "bg-slate-950" : "bg-slate-50/50"}`}
            style={{ maxHeight: "95vh" }}
        >
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className={`text-2xl font-black ${dark ? "text-white" : "text-slate-800"}`}>
                        Business Overview
                    </h1>
                    <p className={`text-sm mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <button
                    onClick={fetchAll}
                    className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors ${dark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* ── Low‑Stock Alert Banner ── */}
            {overview?.lowStockCount > 0 && (
                <div
                    className={`flex flex-wrap items-center justify-between gap-3 mb-5 p-4 rounded-2xl border ${dark
                        ? "bg-amber-950/40 border-amber-700/60"
                        : "bg-amber-50 border-amber-200"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className={`font-bold text-sm ${dark ? "text-amber-300" : "text-amber-800"}`}>
                                {overview.lowStockCount} product{overview.lowStockCount > 1 ? "s" : ""} running low on stock!
                            </p>
                            <p className={`text-xs mt-0.5 ${dark ? "text-amber-400/70" : "text-amber-600"}`}>
                                {overview.lowStockProducts.map(p => p.name).join(", ")}
                            </p>
                            <p className={`text-[11px] mt-1 flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Auto-alert active — emails admins daily at <strong>08:00 AM</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            onClick={handleSendLowStockAlert}
                            disabled={alertLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                        >
                            {alertLoading ? "Sending…" : "📧 Send Alert Now"}
                        </button>
                        <p className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"}`}>
                            Sends to all SMTP admin recipients
                        </p>
                    </div>
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    dark={dark}
                    title="Total Revenue"
                    value={`₹${(overview?.totalRevenue || 0).toLocaleString("en-IN")}`}
                    subtitle="All time (non-cancelled)"
                    icon="💰"
                    accent="#10b981"
                />
                <StatCard
                    dark={dark}
                    title="Total Orders"
                    value={(overview?.totalOrders || 0).toLocaleString()}
                    subtitle={`${overview?.statusBreakdown?.Delivered || 0} delivered`}
                    icon="📦"
                    accent="#6366f1"
                />
                <StatCard
                    dark={dark}
                    title="Total Users"
                    value={(overview?.totalUsers || 0).toLocaleString()}
                    subtitle="Registered customers"
                    icon="👤"
                    accent="#3b82f6"
                />
                <StatCard
                    dark={dark}
                    title="Products"
                    value={(overview?.totalProducts || 0).toLocaleString()}
                    subtitle={`${overview?.lowStockCount || 0} low stock`}
                    icon="🛒"
                    accent={overview?.lowStockCount > 0 ? "#f59e0b" : "#a855f7"}
                />
            </div>

            {/* ── Order Status Breakdown ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {Object.entries(overview?.statusBreakdown || {}).map(([status, count]) => {
                    const m = STATUS_META[status] || { color: "#94a3b8", bg: "rgba(148,163,184,.12)" };
                    return (
                        <div
                            key={status}
                            className={`rounded-xl p-3 text-center border ${dark ? "bg-slate-800/60 border-slate-700/50" : "bg-white border-slate-200"
                                }`}
                        >
                            <p className="text-xl font-black" style={{ color: m.color }}>{count}</p>
                            <p className={`text-[10px] mt-0.5 font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                {status}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* ── Charts row 1 ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                {/* Revenue Area Chart — 2/3 width */}
                <div className="xl:col-span-2">
                    <Section
                        dark={dark}
                        title="Revenue Trend"
                        action={
                            <div className="flex gap-1">
                                {[7, 14, 30].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setChartDays(d)}
                                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${chartDays === d
                                            ? "bg-indigo-500 text-white"
                                            : dark
                                                ? "text-slate-400 hover:bg-slate-700"
                                                : "text-slate-500 hover:bg-slate-100"
                                            }`}
                                    >
                                        {d}d
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={salesChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }}
                                    interval={Math.floor(salesChart.length / 6)}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }}
                                    tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                                />
                                <Tooltip content={<RevenueTooltip dark={dark} />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    fill="url(#revGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Section>
                </div>

                {/* Category Pie — 1/3 width */}
                <Section dark={dark} title="Sales by Category">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={categories}
                                dataKey="totalOrders"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                            >
                                {categories.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value} orders`, name]}
                                contentStyle={{
                                    background: dark ? "#1e293b" : "#fff",
                                    border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                }}
                            />
                            <Legend
                                iconSize={8}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Charts row 2 ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                {/* Order Volume Bar Chart */}
                <Section dark={dark} title="Daily Order Volume">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={salesChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }}
                                interval={Math.floor(salesChart.length / 6)}
                            />
                            <YAxis tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }} />
                            <Tooltip
                                contentStyle={{
                                    background: dark ? "#1e293b" : "#fff",
                                    border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                }}
                            />
                            <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Category Product Count bar chart */}
                <Section dark={dark} title="Products per Category">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={categories}
                            layout="vertical"
                            margin={{ top: 4, right: 16, bottom: 0, left: 64 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#f1f5f9"} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#94a3b8" }}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: dark ? "#1e293b" : "#fff",
                                    border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                }}
                            />
                            <Bar dataKey="productCount" name="Products" radius={[0, 4, 4, 0]}>
                                {categories.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Top Products Trends ── */}
            <div className="mb-4">
                <Section dark={dark} title="🔥 Top Products by Orders">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={dark ? "text-slate-400" : "text-slate-500"}>
                                    <th className="text-left pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">#</th>
                                    <th className="text-left pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">Product</th>
                                    <th className="text-left pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">Category</th>
                                    <th className="text-right pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">Orders</th>
                                    <th className="text-right pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">Revenue</th>
                                    <th className="text-right pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">Stock</th>
                                    <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wide">Rating</th>
                                    <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wide w-36">Popularity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={`text-center py-8 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>
                                            No product data yet
                                        </td>
                                    </tr>
                                ) : products.map((p, idx) => (
                                    <tr
                                        key={p._id}
                                        className={`border-t transition-colors ${dark ? "border-slate-700/50 hover:bg-slate-700/30" : "border-slate-100 hover:bg-slate-50"
                                            }`}
                                    >
                                        <td className={`py-3 pr-4 font-bold text-xs ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-700" : dark ? "text-slate-500" : "text-slate-400"}`}>
                                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                {p.image && (
                                                    <img
                                                        src={`/uploads/${p.image}`}
                                                        alt={p.name}
                                                        className="w-8 h-8 object-cover rounded-lg shrink-0"
                                                        onError={e => e.currentTarget.style.display = "none"}
                                                    />
                                                )}
                                                <span className={`font-semibold truncate max-w-[140px] ${dark ? "text-white" : "text-slate-800"}`}>
                                                    {p.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`py-3 pr-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                            {p.category}
                                        </td>
                                        <td className={`py-3 pr-4 text-right font-semibold ${dark ? "text-indigo-300" : "text-indigo-600"}`}>
                                            {p.orderCount}
                                        </td>
                                        <td className={`py-3 pr-4 text-right font-semibold ${dark ? "text-emerald-300" : "text-emerald-600"}`}>
                                            ₹{p.revenue.toLocaleString("en-IN")}
                                        </td>
                                        <td className="py-3 pr-4 text-right">
                                            <span
                                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: p.stockQuantity <= 5
                                                        ? (dark ? "rgba(239,68,68,.2)" : "#fee2e2")
                                                        : (dark ? "rgba(16,185,129,.15)" : "#d1fae5"),
                                                    color: p.stockQuantity <= 5 ? "#ef4444" : "#10b981",
                                                }}
                                            >
                                                {p.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Stars rating={p.averageRating} />
                                        </td>
                                        <td className="py-3">
                                            <div className={`h-2 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min((p.revenue / maxRevenue) * 100, 100)}%`,
                                                        background: PIE_COLORS[idx % PIE_COLORS.length],
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            </div>

            {/* ── Audit / Recent Activity ── */}
            <div className="mb-4">
                <Section dark={dark} title="📋 Recent Activity (Audit Log)">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={dark ? "text-slate-400" : "text-slate-500"}>
                                    {["Order ID", "Customer", "Items", "Amount", "Payment", "Status", "Date"].map(h => (
                                        <th key={h} className="text-left pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={`text-center py-8 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>
                                            No recent orders
                                        </td>
                                    </tr>
                                ) : activities.map(a => (
                                    <tr
                                        key={a._id}
                                        className={`border-t transition-colors ${dark ? "border-slate-700/50 hover:bg-slate-700/30" : "border-slate-100 hover:bg-slate-50"
                                            }`}
                                    >
                                        <td className={`py-3 pr-4 font-mono text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                            #{String(a._id).slice(-6).toUpperCase()}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className={`font-semibold text-xs ${dark ? "text-white" : "text-slate-800"}`}>{a.userName}</p>
                                            <p className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"}`}>{a.userEmail}</p>
                                        </td>
                                        <td className={`py-3 pr-4 text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>
                                            {a.itemCount} item{a.itemCount !== 1 ? "s" : ""}
                                        </td>
                                        <td className={`py-3 pr-4 font-semibold text-xs ${dark ? "text-emerald-300" : "text-emerald-600"}`}>
                                            ₹{a.amount?.toLocaleString("en-IN")}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                                                }`}>
                                                {a.paymentType}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge status={a.status} />
                                        </td>
                                        <td className={`py-3 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                                            {new Date(a.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "2-digit",
                                            })}
                                            <br />
                                            <span className={dark ? "text-slate-500" : "text-slate-400"}>
                                                {new Date(a.createdAt).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            </div>

            {/* ── Low Stock Detail Table ── */}
            {overview?.lowStockProducts?.length > 0 && (
                <div className="mb-4">
                    <Section dark={dark} title="🚨 Low Stock Products">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={dark ? "text-slate-400" : "text-slate-500"}>
                                        {["Product", "Category", "Stock Left", "Action Needed"].map(h => (
                                            <th key={h} className="text-left pb-3 pr-4 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {overview.lowStockProducts.map(p => (
                                        <tr
                                            key={p._id}
                                            className={`border-t ${dark ? "border-slate-700/50" : "border-slate-100"}`}
                                        >
                                            <td className={`py-3 pr-4 font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{p.name}</td>
                                            <td className={`py-3 pr-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{p.category}</td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                    style={{
                                                        background: p.stockQuantity === 0 ? "#fee2e2" : "#fef3c7",
                                                        color: p.stockQuantity === 0 ? "#dc2626" : "#d97706",
                                                    }}
                                                >
                                                    {p.stockQuantity === 0 ? "OUT OF STOCK" : `${p.stockQuantity} left`}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className="text-xs font-semibold"
                                                    style={{ color: p.stockQuantity === 0 ? "#dc2626" : "#d97706" }}
                                                >
                                                    {p.stockQuantity === 0 ? "⛔ Restock immediately" : "⚠️ Restock soon"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </div>
            )}
        </div>
    );
}
