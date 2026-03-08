import { motion } from "framer-motion";

const pageVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.05, y: -10 }
};

const pageTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
