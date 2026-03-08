import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const BestSeller = () => {
  const { products } = useAppContext();

  return (
    <div className="mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Best <span className="text-secondary">Sellers</span>
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Trending items flying off the shelves.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-center justify-center">
        {products
          .filter((product) => product.inStock)
          .slice(0, 5)
          .map((product, index) => (
            <ProductCard key={product._id} product={product} />
          ))}
      </div>
    </div>
  );
};
export default BestSeller;
