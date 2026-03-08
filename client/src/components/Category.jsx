import { categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const Category = () => {
    const { navigate } = useAppContext();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
    };

    return (
        <div className="mt-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
                Shop by <span className="text-primary dark:text-primary-dark">Category</span>
            </h2>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6 items-center justify-center"
            >
                {categories.map((category, index) => (
                    <motion.div
                        variants={item}
                        key={index}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group cursor-pointer p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-primary/20 transition-all border border-transparent hover:border-white/50 backdrop-blur-sm relative overflow-hidden"
                        style={{ backgroundColor: category.bgColor }}
                        onClick={() => {
                            navigate(`/products/${category.path.toLowerCase()}`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        {/* Dark mode overlay to darken pastel backgrounds */}
                        <div className="absolute inset-0 bg-slate-900/80 dark:block hidden transition-all"></div>
                        {/* Decorative glow inside card */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/5 to-transparent dark:from-white/10 dark:to-transparent"></div>

                        <img
                            src={category.image}
                            alt={category.text}
                            className="max-w-24 md:max-w-28 drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10"
                        />
                        <p className="mt-4 text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 tracking-wide relative z-10">{category.text}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
export default Category;
