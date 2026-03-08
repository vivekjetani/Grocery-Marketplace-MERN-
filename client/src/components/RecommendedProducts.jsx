import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "./ProductCard";
import axios from "axios";
import { motion } from "framer-motion";

const RecommendedProducts = ({ category, excludeId }) => {
    const [recommended, setRecommended] = useState([]);
    const { user } = useAppContext();

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const { data } = await axios.get(
                    `/api/product/recommended?category=${category || ""}&excludeId=${excludeId || ""}&userId=${user?._id || ""}`
                );
                if (data.success) {
                    setRecommended(data.products);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            }
        };
        fetchRecommended();
    }, [category, excludeId, user?._id]);

    if (recommended.length === 0) return null;

    return (
        <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Recommended <span className="text-primary">For You</span>
                    </h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Specially curated picks based on your interests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recommended.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedProducts;
