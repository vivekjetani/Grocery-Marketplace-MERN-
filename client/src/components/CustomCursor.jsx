import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const foodEmojis = ["🍎", "🍔", "🍕", "🌮", "🍣", "🍩", "🍪", "🥑", "🍓", "🍉", "🍇", "🥕", "🧀", "🍟", "🥞", "🥐", "🥩", "🍗"];

const CustomCursor = ({ boundaryRef }) => {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [emojiIndex, setEmojiIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!boundaryRef?.current) return;

        const boundaryElement = boundaryRef.current;
        let movementCounter = 0;

        const updateMousePosition = (e) => {
            // Get boundaries of the relative parent container
            const rect = boundaryElement.getBoundingClientRect();

            // Calculate mouse position relative to the container
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setMousePosition({ x, y });
            setIsVisible(true);

            movementCounter++;
            if (movementCounter % 20 === 0) {
                setEmojiIndex((prev) => (prev + 1) % foodEmojis.length);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        boundaryElement.addEventListener("mousemove", updateMousePosition);
        boundaryElement.addEventListener("mouseleave", handleMouseLeave);
        boundaryElement.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            boundaryElement.removeEventListener("mousemove", updateMousePosition);
            boundaryElement.removeEventListener("mouseleave", handleMouseLeave);
            boundaryElement.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [boundaryRef]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="absolute top-0 left-0 pointer-events-none z-[9999] text-3xl md:text-4xl drop-shadow-xl select-none"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: mousePosition.x + 15,
                        y: mousePosition.y + 15,
                        rotate: mousePosition.x % 30 - 15
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                        mass: 0.5
                    }}
                >
                    {foodEmojis[emojiIndex]}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomCursor;
