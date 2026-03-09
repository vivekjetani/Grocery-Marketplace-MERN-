import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    setCartItems,
    removeFromCart,
    updateCartItem,
    axios,
    user,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [address, setAddress] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        const product = products.find((product) => product._id === key);
        if (product) {
          tempArray.push({ ...product, quantity: cartItems[key] });
        }
      }
    }
    setCartArray(tempArray);
  };

  const getAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddress(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      getAddress();
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }
      setLoading(true);
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", {
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        });
        if (data.success) {
          toast.success("Order placed successfully! 🎉");
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Remove the early return so the empty state logic within the JSX runs.
  // We'll rely on the cartArray.length === 0 check below to render the empty state.
  // if (!products.length || !cartItems) return null;

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Your Cart</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">You have <span className="text-primary font-bold">{cartCount()}</span> items in your cart</p>
      </motion.div>

      {cartArray.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4 mt-8 glass dark:glass-dark rounded-3xl"
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-6 drop-shadow-xl"
          >
            <svg className="w-24 h-24 text-primary opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Your cart is feeling light</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center">Looks like you haven't added anything yet. Let's fix that!</p>
          <Link to="/products" className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:-translate-y-1">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
          <div className="flex-1">
            <div className="hidden md:grid grid-cols-[3fr_1fr_1fr] gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">
              <p>Product</p>
              <p className="text-center">Quantity & Price</p>
              <p className="text-right pr-4">Total</p>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {cartArray.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr] gap-4 items-center bg-white dark:bg-slate-800/60 p-4 md:p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative group"
                  >
                    <button
                      onClick={() => {
                        updateCartItem(product._id, 0); // Effectively removes it due to getCart logic
                      }}
                      className="absolute -top-3 -right-3 md:top-4 md:right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors shadow-sm md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-10"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="flex w-full md:w-auto items-center gap-4">
                      <Link to={`/product/${product.category.toLowerCase()}/${product._id}`} className="shrink-0 w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img
                          className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-300"
                          src={`${import.meta.env.VITE_BACKEND_URL}/images/${product.image[0]}`}
                          alt={product.name}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product.category.toLowerCase()}/${product._id}`}>
                          <p className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate hover:text-primary dark:hover:text-primary-dark transition-colors">{product.name}</p>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {product.category} {product.weight ? `• ${product.weight}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-between md:justify-center w-full md:w-auto bg-slate-50 md:bg-transparent dark:bg-slate-900/50 md:dark:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none">
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full h-10 shadow-sm md:mb-1">
                        <button
                          onClick={() => updateCartItem(product._id, Math.max(0, cartItems[product._id] - 1))}
                          className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">{cartItems[product._id]}</span>
                        <button
                          onClick={() => updateCartItem(product._id, cartItems[product._id] + 1)}
                          className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="md:hidden font-bold text-slate-900 dark:text-white">₹{product.offerPrice}</span>
                    </div>

                    <div className="hidden md:flex flex-col items-end w-full pr-4">
                      <p className="font-black text-xl text-slate-900 dark:text-white">
                        ₹{(product.offerPrice * product.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">₹{product.offerPrice} each</p>
                    </div>

                    <div className="md:hidden w-full flex justify-between items-center px-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="font-medium text-slate-500 dark:text-slate-400 text-sm">Total</span>
                      <span className="font-black text-lg text-slate-900 dark:text-white">₹{(product.offerPrice * product.quantity).toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Link to="/products" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-[400px]"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-28">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Summary</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delivery To</p>
                    {user && (
                      <button onClick={() => setShowAddress(!showAddress)} className="text-sm font-bold text-primary hover:text-accent transition-colors">
                        Change
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative">
                    {!user ? (
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Login to select address</p>
                    ) : selectedAddress ? (
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}
                        </p>
                      </div>
                    ) : (
                      <button onClick={() => navigate("/add-address")} className="text-sm font-medium text-primary hover:underline">
                        + Add a new address
                      </button>
                    )}

                    <AnimatePresence>
                      {showAddress && user && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 overflow-hidden"
                        >
                          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {address.map((addr, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedAddress(addr);
                                  setShowAddress(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-colors ${selectedAddress?._id === addr._id ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                              >
                                {addr.street}, {addr.city}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setShowAddress(false);
                                navigate("/add-address");
                              }}
                              className="w-full text-left p-3 rounded-xl text-sm font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                              Add New Address
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment Method</p>
                  <div className="relative">
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                    >
                      <option value="COD">Cash On Delivery (COD)</option>
                      <option value="Online" disabled>Credit/Debit Card (Coming Soon)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{totalCartAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Estimated Tax (2%)</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{((totalCartAmount() * 2) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Free</span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-black text-primary">₹{(totalCartAmount() + (totalCartAmount() * 2) / 100).toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={user ? placeOrder : () => toast.error("Please login to place an order")}
                disabled={loading}
                className={`w-full mt-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Processing..." : (paymentOption === "COD" ? "Place Order Now" : "Complete Purchase")}
                {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </motion.button>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Secure checkout guaranteed
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;
