import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { axios, user, navigate } = useContext(AppContext);
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) setMyOrders(data.orders);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 md:mt-16 pb-16 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Package size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No orders yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">You haven't placed any orders yet. Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {myOrders.map((order, index) => (
            <motion.div key={order._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID:</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{order._id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{order.paymentType}</span>
                  <span className="text-slate-900 dark:text-white text-base">${order.amount}</span>
                </div>
              </div>
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 gap-4 ${order.items.length !== itemIndex + 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      <img src={`${import.meta.env.VITE_BACKEND_URL}/images/${item.product.image[0]}`} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.product.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">{item.product.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                    <div className="flex items-center gap-1"><span className="text-slate-500 dark:text-slate-400 font-medium">Qty:</span><span className="font-bold text-slate-900 dark:text-white">{item.quantity || "1"}</span></div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : order.status === "Cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>{order.status}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">${(item.product.offerPrice * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
export default MyOrders;
