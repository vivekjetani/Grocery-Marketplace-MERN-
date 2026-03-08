import { motion } from "framer-motion";

const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

const transition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
};

const SubPageTransition = ({ children }) => {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

export default SubPageTransition;
