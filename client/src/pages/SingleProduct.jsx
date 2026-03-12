import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "../components/ReviewForm";
import axios from "axios";

const SingleProduct = () => {
  const { products, navigate, addToCart } = useAppContext();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const product = products.find((product) => product._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter(
        (p) => p.category === product.category && p._id !== product._id
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image[0] ? product.image[0] : null);
    if (product) fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data } = await axios.get(`/api/review/list?productId=${id}`);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!product) return null;

  return (
    <div className="mt-10 md:mt-16 min-h-screen">
      {/* Breadcrumbs */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex mb-8 text-sm font-medium text-slate-500 dark:text-slate-400"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
              </svg>
              <Link to="/products" className="hover:text-primary transition-colors ml-1 md:ml-2">Products</Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
              </svg>
              <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors ml-1 md:ml-2">{product.category}</Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
              </svg>
              <span className="text-slate-800 dark:text-slate-200 ml-1 md:ml-2 font-semibold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
            </div>
          </li>
        </ol>
      </motion.nav>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        {/* Left Side: Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 md:gap-6"
        >
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 md:max-h-[600px]">
            {product.image.map((image, index) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={index}
                onClick={() => setThumbnail(image)}
                className={`flex-shrink-0 border-2 rounded-2xl overflow-hidden cursor-pointer w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 transition-all ${thumbnail === image ? "border-primary shadow-md" : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"}`}
              >
                <img
                  className="w-full h-full object-contain p-2"
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/${image}`}
                  alt={`Thumbnail ${index + 1}`}
                />
              </motion.button>
            ))}
          </div>

          <div className="flex-1 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-8 relative min-h-[300px] md:min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={thumbnail}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-contain drop-shadow-2xl"
                src={`${import.meta.env.VITE_BACKEND_URL}/images/${thumbnail}`}
                alt={product.name}
              />
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Side: Details (Sticky) */}
        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sticky top-28"
          >
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark text-xs font-bold tracking-widest uppercase">
              {product.category}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6 bg-slate-50 dark:bg-slate-800/50 w-max px-4 py-2 rounded-xl">
              <div className="flex items-center">
                {Array(5).fill("").map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {product.averageRating?.toFixed(1) || "0.0"}{" "}
                <span className="text-slate-400 font-normal">({product.numReviews || 0} reviews)</span>
              </span>
            </div>

            <div className="flex items-end gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <p className="text-4xl font-black text-slate-900 dark:text-white">
                ₹{product.offerPrice}
                <span className="text-lg font-bold text-slate-400 ml-1">/ {product.unit}</span>
              </p>
              {product.price > product.offerPrice && (
                <div className="flex flex-col pb-1">
                  <p className="text-lg text-slate-400 font-medium line-through">₹{product.price}</p>
                  <p className="text-xs font-bold text-green-500">Save ₹{(product.price - product.offerPrice).toFixed(2)}!</p>
                </div>
              )}
            </div>

            {/* Stock Badge */}
            {(() => {
              const qty = product.stockQuantity ?? 0;
              const outOfStock = !product.inStock || qty === 0;
              if (outOfStock) {
                return (
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-red-500">Out of Stock</span>
                  </div>
                );
              }
              if (qty <= 10) {
                return (
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-sm font-semibold text-amber-500">Only {qty} left — order soon!</span>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">In Stock</span>
                </div>
              );
            })()}

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About this item</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-inside text-base">
                {product.description.map((desc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1.5 text-primary text-xs">✨</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              {(!product.inStock || (product.stockQuantity ?? 0) === 0) ? (
                <div className="w-full py-4 rounded-xl font-bold text-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed select-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Currently Out of Stock
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product._id)}
                    className="w-full sm:w-1/2 py-4 rounded-xl font-bold text-lg bg-indigo-50 dark:bg-slate-800 text-primary dark:text-primary-dark hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Add to Cart
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addToCart(product._id);
                      navigate("/cart");
                      window.scrollTo(0, 0);
                    }}
                    className="w-full sm:w-1/2 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Buy it Now
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {loadingReviews ? (
              <p className="text-slate-500">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{review.userName}</h4>
                      <div className="flex text-amber-400 mt-1">
                        {Array(5).fill("").map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
        <ReviewForm productId={id} onReviewAdded={fetchReviews} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              You might also <span className="text-secondary">vibe with</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedProducts
              .filter((p) => p.inStock)
              .map((p, index) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>

          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate("/products");
                window.scrollTo(0, 0);
              }}
              className="px-10 py-4 rounded-full font-bold text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
              View More Products
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default SingleProduct;
