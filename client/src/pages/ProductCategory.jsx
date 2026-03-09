import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductCategory = () => {
  const { products, categories } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === category
  );

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category
  );

  return (
    <div className="mt-16 md:mt-24 min-h-[60vh]">
      {searchCategory && (
        <div className="mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: searchCategory.bgColor }}>
            <img src={searchCategory.image} alt={searchCategory.text} className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              {searchCategory.text}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-1 text-slate-500 dark:text-slate-400 font-medium"
            >
              We found {filteredProducts.filter(p => p.inStock).length} items in this category
            </motion.p>
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
        >
          {filteredProducts
            .filter((product) => product.inStock)
            .map((product, index) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-lg dark:shadow-black/20 rounded-3xl mt-8">
          <motion.div
            animate={{
              y: [0, -15, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-6 text-slate-300 dark:text-slate-600 drop-shadow-lg"
          >
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">It's quiet here. Too quiet.</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">We're all out of {searchCategory?.text || category}. Restocking soon!</p>
          <Link to="/products" className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-accent transition-colors shadow-lg shadow-primary/30">
            Browse other categories
          </Link>
        </div>
      )}
    </div>
  );
};
export default ProductCategory;
