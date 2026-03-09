import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Package, Calendar, User, MapPin, CreditCard, CheckCircle, Clock } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { axios } = useContext(AppContext);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) setOrders(data.orders.filter(o => o && o.items && o.address));
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success("Order status updated and mail sent!");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="md:p-10 p-4 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Orders List</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your customer orders</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-2">
            <Package size={18} />
            {orders.length} Total Orders
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No orders yet</h3>
            <p className="text-slate-500 dark:text-slate-400">When customers buy your products, they will appear here.</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Order ID</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300">#{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar size={10} /> Date
                    </p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${order.isPaid ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'}`}>
                    {order.isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {order.isPaid ? "Paid" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6 grid md:grid-cols-[1.5fr_1fr_0.8fr] gap-8">
                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                    <Package size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Order Items</span>
                  </div>
                  {order.items.filter(item => item.product).map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-4 items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/20 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
                      <img
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                        src={item.product?.image?.[0] ? `${import.meta.env.VITE_BACKEND_URL}/images/${item.product.image[0]}` : ""}
                        alt={item.product?.name || "Product"}
                      />
                      <div className="flex-grow">
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{item.product?.name || "Deleted Product"}</p>
                        <p className="text-xs font-bold text-indigo-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">₹{(item.product?.offerPrice ?? 0) * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer & Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                    <User size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Customer Details</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-full">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">{order.address?.firstName} {order.address?.lastName}</p>
                    <div className="flex gap-2 items-start mt-3">
                      <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {order.address?.street},<br />
                        {order.address?.city}, {order.address?.state},<br />
                        {order.address?.zipcode}, {order.address?.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                    <CreditCard size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Payment & Status</span>
                  </div>
                  <div className="flex flex-col gap-4 h-full">
                    <div className="p-5 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none flex flex-col justify-between">
                      <div>
                        <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black">₹{order.amount}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-indigo-400/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Method:</span>
                          <span className="font-black text-sm">{order.paymentType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Update Status</p>
                      <select
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={order.status || 'Order Placed'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;

