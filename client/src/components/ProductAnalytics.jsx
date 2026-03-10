import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { X, TrendingUp, Package, IndianRupee, Clock, Star, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ProductAnalytics = ({ productId, onClose }) => {
    const { axios, getImageUrl } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axios.get(`/api/product/analytics/${productId}`);
                if (data.success) {
                    setData(data.analytics);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [productId, axios]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                    <div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                        <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { product, totalSold, totalRevenue, peakHour, chartData } = data;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800">
                            <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                {product.name}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Product Insights & Analytics</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <MetricCard
                            icon={<Package className="text-blue-500" />}
                            label="Total Units Sold"
                            value={totalSold}
                            subValue="Lifetime"
                        />
                        <MetricCard
                            icon={<IndianRupee className="text-emerald-500" />}
                            label="Total Revenue"
                            value={`₹${totalRevenue.toLocaleString()}`}
                            subValue="Expected"
                        />
                        <MetricCard
                            icon={<Clock className="text-amber-500" />}
                            label="Peak Order Time"
                            value={peakHour}
                            subValue="Best performance"
                        />
                        <MetricCard
                            icon={<Star className="text-yellow-500" />}
                            label="Average Rating"
                            value={product.averageRating.toFixed(1)}
                            subValue={`${product.numReviews} Reviews`}
                        />
                    </div>

                    {/* Chart Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Order Volume (Last 30 Days)</h3>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorOrders)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* More details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Star size={18} className="text-yellow-500" /> General Info
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">M.R.P.</span>
                                    <span className="text-slate-900 dark:text-white font-medium">₹{product.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Selling Price</span>
                                    <span className="text-slate-900 dark:text-white font-medium">₹{product.offerPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Reviews Count</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{product.numReviews}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-500" /> Performance Analysis
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Based on recent trends, this product performs best around <span className="text-slate-900 dark:text-white font-bold">{peakHour}</span>.
                                Consider running promotions shortly before this time to maximize conversions.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 w-fit px-3 py-1 rounded-full">
                                <TrendingUp size={14} /> Higher engagement than average
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, subValue }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
            {icon}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            <span className="text-[10px] text-slate-400 font-normal">{subValue}</span>
        </div>
    </div>
);

export default ProductAnalytics;
