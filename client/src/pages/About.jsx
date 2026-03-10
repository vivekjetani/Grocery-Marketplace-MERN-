import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, X } from "lucide-react";

/* ── tiny floating grain overlay ── */
const GrainOverlay = () => (
    <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "150px" }}
    />
);

const fadeUp = { hidden: { opacity: 0, y: 48 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { ...fadeUp.show.transition, delay } } }}>
            {children}
        </motion.div>
    );
};

const values = [
    { emoji: "🌱", title: "Village-First Sourcing", desc: "Every product traces back to a real farmer or artisan community. No middlemen, no mystery — just honest supply chains." },
    { emoji: "🤝", title: "Ethical Commerce", desc: "Fair prices for producers, fair prices for you. Transparent fees, zero-surprise billing, and community reinvestment." },
    { emoji: "⚡", title: "Speed Meets Purpose", desc: "Our captain network delivers with the urgency of a startup and the care of a neighbour." },
    { emoji: "♻️", title: "Rooted Sustainability", desc: "Minimal packaging, local delivery loops, and a pledge to offset our carbon footprint season by season." },
];

const milestones = [
    { year: "2023", label: "Founded", detail: "Born from a conversation at a village mela, with a dream to connect Gram to the grid." },
    { year: "2024", label: "10k Orders", detail: "Crossed ten thousand orders, spreading across 20+ pin codes in our first year." },
    { year: "2025", label: "Captain Fleet", detail: "Launched our dedicated delivery captain network for hyper-local last-mile delivery." },
    { year: "2026", label: "Today", detail: "Building the most trusted, ethical grocery marketplace in the region — one village at a time." },
];

/* ── SEED SWARM GAME (Easter Egg) ── */
const SeedGame = ({ onClose }) => {
    const [score, setScore] = useState(0);
    const [seeds, setSeeds] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const requestRef = useRef();

    // Initialize 60 seeds with random starting positions
    useEffect(() => {
        const initialSeeds = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            color: ["#6366f1", "#10b981", "#f59e0b"][Math.floor(Math.random() * 3)],
        }));
        setSeeds(initialSeeds);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const updatePhysics = useCallback(() => {
        setSeeds((prev) =>
            prev.map((s) => {
                let { x, y, vx, vy } = s;
                // Attraction to mouse
                const dx = mousePos.x - x;
                const dy = mousePos.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 400) {
                    vx += (dx / dist) * 0.15;
                    vy += (dy / dist) * 0.15;
                }

                // Friction
                vx *= 0.98;
                vy *= 0.98;

                // Update pos
                x += vx;
                y += vy;

                // Bounce off edges
                if (x < 0 || x > window.innerWidth) vx *= -1;
                if (y < 0 || y > window.innerHeight) vy *= -1;

                // Collide with mouse (harvest)
                if (dist < 30) {
                    setScore((ps) => ps + 1);
                    x = Math.random() * window.innerWidth;
                    y = Math.random() * window.innerHeight;
                    vx = (Math.random() - 0.5) * 10;
                    vy = (Math.random() - 0.5) * 10;
                }

                return { ...s, x, y, vx, vy };
            })
        );
        requestRef.current = requestAnimationFrame(updatePhysics);
    }, [mousePos]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(requestRef.current);
    }, [updatePhysics]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md cursor-none overflow-hidden"
        >
            {/* Custom Game Cursor */}
            <motion.div
                animate={{ x: mousePos.x - 12, y: mousePos.y - 12 }}
                transition={{ type: "spring", damping: 25, stiffness: 400, mass: 0.5 }}
                className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-white mix-blend-difference pointer-events-none z-[110]"
            />

            {/* Seeds */}
            {seeds.map((s) => (
                <div
                    key={s.id}
                    className="absolute rounded-full blur-[1px] pointer-events-none"
                    style={{
                        left: s.x, top: s.y,
                        width: s.size, height: s.size,
                        backgroundColor: s.color,
                        boxShadow: `0 0 10px ${s.color}`,
                    }}
                />
            ))}

            {/* UI */}
            <div className="absolute top-10 left-10 text-white font-black z-[120]">
                <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Seeds Harvested</p>
                <h3 className="text-6xl tabular-nums">{score}</h3>
            </div>

            <button
                onClick={onClose}
                className="absolute top-10 right-10 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur transition-all active:scale-90 z-[120]"
            >
                <X size={28} />
            </button>

            {score >= 20 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-[120]">
                    <Sparkles className="mx-auto text-emerald-400 mb-4 animate-bounce" size={40} />
                    <h2 className="text-3xl font-black text-white">Gramodaya Ascended!</h2>
                    <p className="text-slate-400">The village spirit is strong with you.</p>
                </motion.div>
            )}

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 text-xs font-mono">
                MOVE MOUSE TO COLLECT SEEDS · HARVEST 20 TO ASCEND
            </div>
        </motion.div>
    );
};

const About = () => {
    const [gameActive, setGameActive] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const handleEasterEggClick = () => {
        setClickCount((p) => p + 1);
        if (clickCount >= 2) {
            setGameActive(true);
            setClickCount(0);
        }
    };

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
            <GrainOverlay />

            {/* ── HERO ── */}
            <section
                ref={heroRef}
                className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0f1623 100%)" }}
            >
                {/* animated mesh blobs */}
                <motion.div className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", top: "-10%", left: "-15%", y: heroY }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", bottom: "0%", right: "-10%" }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
                <motion.div className="absolute w-[300px] h-[300px] rounded-full blur-2xl opacity-10" style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", top: "30%", right: "20%" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }} />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl">
                    {/* badge */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs tracking-[0.25em] uppercase font-bold mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> The Rooted &amp; Purposeful Choice
                    </motion.div>

                    {/* title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-6xl md:text-8xl font-black text-white mb-4 leading-none tracking-tight select-none"
                    >
                        <span onClick={handleEasterEggClick} className="cursor-default">Gra</span>
                        <span style={{ WebkitTextStroke: "2px #6366f1", color: "transparent" }}>modaya</span>
                    </motion.h1>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-4 text-slate-500 text-sm font-mono mb-8">
                        <span className="text-indigo-400">Gram</span>
                        <span>/</span>
                        <span className="text-slate-400">Village · Community</span>
                        <span>+</span>
                        <span className="text-emerald-400">Udaya</span>
                        <span>/</span>
                        <span className="text-slate-400">Rise · Ascension</span>
                    </motion.div>

                    <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
                        We're not just a grocery store. We're a movement — bringing the best of India's villages to your doorstep with radical transparency, ethical sourcing, and community-first values.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30">
                            Shop Now →
                        </Link>
                        <a href="#values" className="px-8 py-4 rounded-2xl border border-white/10 hover:border-white/30 text-white font-bold transition-all hover:bg-white/5">
                            Our Story ↓
                        </a>
                    </motion.div>
                </motion.div>

                {/* scroll cue */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
            </section>

            {/* ── MISSION STATEMENT ── */}
            <section className="py-28 bg-white dark:bg-slate-950 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Reveal>
                        <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase mb-6">Our Mission</p>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                            Every purchase is a{" "}
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #6366f1, #10b981)" }}>
                                vote for the village.
                            </span>
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Gramodaya was born from a simple question: why does fresh, ethical produce feel like a luxury? We're here to change that — making the best community-sourced groceries accessible to everyone, while lifting the communities that grow them.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section id="values" className="py-24 bg-slate-50 dark:bg-slate-900 px-6">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase text-center mb-4">What We Stand For</p>
                        <h2 className="text-4xl md:text-5xl font-black text-center text-slate-900 dark:text-white mb-16">Our Core Values</h2>
                    </Reveal>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((v, i) => (
                            <Reveal key={v.title} delay={i * 0.1}>
                                <motion.div
                                    whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(99,102,241,0.12)" }}
                                    className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 transition-all cursor-default group"
                                >
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{v.emoji}</div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{v.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
                                </motion.div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ── */}
            <section className="py-28 bg-white dark:bg-slate-950 px-6">
                <div className="max-w-4xl mx-auto">
                    <Reveal>
                        <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase text-center mb-4">Our Journey</p>
                        <h2 className="text-4xl md:text-5xl font-black text-center text-slate-900 dark:text-white mb-16">From Idea to Movement</h2>
                    </Reveal>
                    <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:left-1/2" />
                        <div className="space-y-12">
                            {milestones.map((m, i) => (
                                <Reveal key={m.year} delay={i * 0.12}>
                                    <div className={`flex gap-8 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                                        <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} md:block hidden`}>
                                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                                <h4 className="font-black text-slate-900 dark:text-white mb-1">{m.label}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">{m.detail}</p>
                                            </div>
                                        </div>
                                        <div className="flex-none w-16 flex justify-center">
                                            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-indigo-900 z-10 relative">
                                                {m.year.slice(2)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 md:hidden">
                                                <span className="text-indigo-500 font-black text-sm">{m.year}</span>
                                                <h4 className="font-black text-slate-900 dark:text-white mb-1">{m.label}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">{m.detail}</p>
                                            </div>
                                            <div className="hidden md:block">
                                                {i % 2 !== 0 && (
                                                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                                        <h4 className="font-black text-slate-900 dark:text-white mb-1">{m.label}</h4>
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{m.detail}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)" }}>
                <motion.div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at center, #6366f1 0%, transparent 60%)" }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    <Reveal>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to Shop with Purpose?</h2>
                        <p className="text-slate-400 text-lg mb-10">Join thousands of conscious shoppers who choose community every time they add to cart.</p>
                        <Link to="/products" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/40">
                            Explore Products →
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* ── GAME OVERLAY ── */}
            <AnimatePresence>
                {gameActive && <SeedGame onClose={() => setGameActive(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default About;
