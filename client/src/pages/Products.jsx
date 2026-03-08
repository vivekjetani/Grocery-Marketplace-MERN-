import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const Products = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return (
    <div className="mt-16 md:mt-24 min-h-[60vh]">
      <div className="mb-10 text-center md:text-left">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-lg text-slate-500 dark:text-slate-400 font-medium"
        >
          {filteredProducts.length} items found
        </motion.p>
      </div>

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
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 text-slate-300 dark:text-slate-600"
          >
            <svg className="w-24 h-24 mx-auto drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No products found</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Try searching for something else!</p>
        </div>
      )}
    </div>
  );
};
export default Products;
