import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const BestSeller = () => {
  const { backendUrl } = useAppContext();
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const { data } = await axios.get("/api/product/best-sellers");
        if (data.success) {
          setBestSellers(data.products);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      }
    };
    fetchBestSellers();
  }, []);

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
        {bestSellers.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
export default BestSeller;
