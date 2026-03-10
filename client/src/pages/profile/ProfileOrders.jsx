import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Package, RefreshCw, Star, X, KeyRound } from "lucide-react";
import ReviewForm from "../../components/ReviewForm";

const ProfileOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [reviewProductId, setReviewProductId] = useState(null);
  const { axios, user, navigate, cartItems, setCartItems, getImageUrl } = useContext(AppContext);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) setMyOrders(data.orders);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handleReorder = (orderItems) => {
    try {
      let newCart = structuredClone(cartItems || {});
      orderItems.forEach(item => {
        const productId = item.product._id;
        if (newCart[productId]) {
          newCart[productId] += item.quantity;
        } else {
          newCart[productId] = item.quantity;
        }
      });
      setCartItems(newCart);
      toast.success("Items added to cart! 🎉");
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to reorder items");
    }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
          <Package size={24} />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''} placed</p>
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

              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID:</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{order._id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReorder(order.items)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <RefreshCw size={14} />
                    <span>Reorder</span>
                  </motion.button>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{order.paymentType}</span>
                  <span className="text-slate-900 dark:text-white text-base">₹{order.amount}</span>
                </div>
              </div>

              {/* Delivery OTP — shown only when captain is assigned & order is In Progress */}
              {order.deliveryOtp && order.status === "In Progress" && (
                <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/40 flex items-center gap-3">
                  <KeyRound size={16} className="text-indigo-500 shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Delivery OTP — Share with your captain
                    </p>
                    <p className="font-mono text-2xl font-black text-indigo-700 dark:text-indigo-300 tracking-[6px] mt-0.5">
                      {order.deliveryOtp}
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    🚚 In Progress
                  </span>
                </div>
              )}

              {/* Coupon Info */}
              {order.discountAmount > 0 && (
                <div className="px-6 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Coupon Applied:</span>
                  <span className="text-xs font-mono font-bold text-primary-dark/80 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-primary/20">{order.couponCode}</span>
                  <span className="text-xs font-bold text-primary ml-auto">-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Order Items */}
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 gap-4 ${order.items.length !== itemIndex + 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      <img src={getImageUrl(item.product.image[0])} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.product.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">{item.product.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Qty:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.quantity || "1"}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === "Delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : order.status === "Cancelled" || order.status === "Rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : order.status === "In Progress" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}>{order.status}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">₹{(item.product.offerPrice * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => setReviewProductId(item.product._id)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                    >
                      <Star size={14} />
                      Give Review
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewProductId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={() => setReviewProductId(null)}
                className="absolute top-14 right-4 z-10 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              <ReviewForm
                productId={reviewProductId}
                onReviewAdded={() => setReviewProductId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileOrders;
