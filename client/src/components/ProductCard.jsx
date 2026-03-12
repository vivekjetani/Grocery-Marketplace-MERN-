import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

// Marquee content repeated for seamless looping
const MARQUEE_TEXT = "OUT OF STOCK · SOLD OUT · OUT OF STOCK · SOLD OUT · OUT OF STOCK · SOLD OUT · ";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate, getImageUrl } = useAppContext();
  const isOutOfStock = !product.inStock || (product.stockQuantity ?? 1) === 0;

  return (
    product && (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: isOutOfStock ? 0 : -8 }}
        onClick={() => {
          navigate(`/product/${product.category.toLowerCase()}/${product?._id}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="group relative border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect (only when in stock) */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* ── OUT OF STOCK OVERLAY ── */}
        {isOutOfStock && (
          <>
            {/* Glass layer */}
            <div
              className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
              style={{
                background: "rgba(15, 15, 25, 0.28)",
                backdropFilter: "blur(0.5px)",
                WebkitBackdropFilter: "blur(0.5px)",
              }}
            />

            {/* Diagonal marquee ribbon – top-left to bottom-right */}
            <div
              className="absolute inset-0 z-20 overflow-hidden rounded-2xl pointer-events-none"
              aria-hidden="true"
            >
              {/* Top ribbon */}
              <div
                className="absolute left-0 right-0 flex items-center overflow-hidden"
                style={{ top: "28%", transform: "rotate(-22deg) scaleX(1.6)" }}
              >
                <div
                  className="flex whitespace-nowrap animate-marquee-oos"
                  style={{ animationDuration: "8s" }}
                >
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black tracking-[0.25em] uppercase px-4 py-[5px] bg-red-500/90 text-white"
                    >
                      {MARQUEE_TEXT}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom ribbon (offset timing for richness) */}
              <div
                className="absolute left-0 right-0 flex items-center overflow-hidden"
                style={{ top: "60%", transform: "rotate(-22deg) scaleX(1.6)" }}
              >
                <div
                  className="flex whitespace-nowrap animate-marquee-oos-reverse"
                  style={{ animationDuration: "10s" }}
                >
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black tracking-[0.25em] uppercase px-4 py-[5px] bg-slate-900/80 text-red-400 border-y border-red-500/40"
                    >
                      {MARQUEE_TEXT}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Out of stock center badge */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div
                className="px-4 py-2 rounded-full border border-red-500/60 text-red-400 text-xs font-black tracking-widest uppercase"
                style={{
                  background: "rgba(20, 10, 10, 0.7)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 0 20px rgba(239,68,68,0.25), inset 0 0 12px rgba(239,68,68,0.08)",
                }}
              >
                Out of Stock
              </div>
            </div>
          </>
        )}

        {/* Product Image */}
        <div className="flex items-center justify-center h-48 sm:h-52 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 overflow-hidden relative group-hover:bg-slate-100 dark:group-hover:bg-slate-900 transition-colors">
          <motion.img
            whileHover={{ scale: isOutOfStock ? 1 : 1.1 }}
            transition={{ duration: 0.4 }}
            className={`object-contain h-full w-full drop-shadow-md transition-all ${isOutOfStock ? "grayscale opacity-60" : ""}`}
            src={getImageUrl(product.image[0])}
            alt={product.name}
          />
        </div>

        <div className="flex flex-col flex-grow">
          <p className="text-xs font-bold tracking-wider text-primary dark:text-primary-dark uppercase mb-1">{product.category}</p>
          <p className="text-slate-900 dark:text-white font-semibold text-lg leading-tight line-clamp-2 mb-2">
            {product.name}
          </p>

          <div className="flex items-center gap-1 mb-4 mt-auto">
            <div className="flex items-center">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.averageRating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600"
                      }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
            </div>
            <span className="text-xs text-slate-500 font-medium ml-1">
              ({product.numReviews || 0})
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex flex-col">
              <span className={`text-xl font-bold ${isOutOfStock ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                ₹{product.offerPrice.toFixed(2)}
                <span className="text-xs font-medium ml-1 opacity-60">/ {product.unit}</span>
              </span>
              {product.price > product.offerPrice && (
                <span className="text-xs font-medium text-slate-400 line-through">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Cart button – hidden when out of stock */}
            {!isOutOfStock && (
              <div onClick={(e) => e.stopPropagation()} className="z-10">
                <AnimatePresence mode="wait">
                  {!cartItems?.[product?._id] ? (
                    <motion.button
                      key="addBtn"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product?._id)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                      aria-label="Add to cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="counter"
                      initial={{ opacity: 0, width: 40 }}
                      animate={{ opacity: 1, width: "auto" }}
                      className="flex items-center justify-between h-10 px-2 bg-primary rounded-full text-white shadow-lg shadow-primary/30"
                    >
                      <button
                        onClick={() => removeFromCart(product?._id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      </button>
                      <span className="w-6 text-center font-bold text-sm">
                        {cartItems[product?._id]}
                      </span>
                      <button
                        onClick={() => addToCart(product?._id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  );
};
export default ProductCard;
