import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";

/**
 * FloatingPaths Component - Optimized
 * Generates and animates SVG paths with memoization for performance
 */
const FloatingPaths = memo(({ position }) => {
    // Memoize path generation to prevent recalculation on every render
    const paths = useMemo(() => 
        Array.from({ length: 36 }, (_, i) => ({
            id: i,
            d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
                380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
                152 - i * 5 * position
            } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
                684 - i * 5 * position
            } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
            width: 0.5 + i * 0.03,
            opacity: 0.1 + i * 0.03,
        })),
        [position]
    );

    return (
        <svg
            className="absolute inset-0 w-full h-full text-slate-950 dark:text-white"
            viewBox="0 0 696 316"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <title>Background Decorative Paths</title>
            {paths.map((path) => (
                <motion.path
                    key={path.id}
                    d={path.d}
                    stroke="currentColor"
                    strokeWidth={path.width}
                    strokeOpacity={path.opacity}
                    strokeLinecap="round"
                    initial={{ pathLength: 0.3, opacity: 0.6 }}
                    animate={{
                        pathLength: 1,
                        opacity: [0.3, 0.6, 0.3],
                        pathOffset: [0, 1, 0],
                    }}
                    transition={{
                        duration: 20 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "linear",
                        // Reduce motion for users who prefer it
                        ...(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                            ? { duration: 60 } 
                            : {}),
                    }}
                />
            ))}
        </svg>
    );
});

FloatingPaths.displayName = "FloatingPaths";

/**
 * BackgroundPaths Component - Full Page Version with Title & Button
 * 
 * Features:
 * - Animated letter-by-letter text
 * - Optional CTA button
 * - Full viewport coverage
 * - Responsive design
 * 
 * @param {string} title - Title text to animate
 * @param {boolean} showButton - Whether to show CTA button
 * @param {string} buttonText - Button label text
 * @param {function} onButtonClick - Button click handler
 */
export const BackgroundPaths = memo(({
    title = "Background Paths",
    showButton = true,
    buttonText = "Discover Excellence",
    onButtonClick,
}) => {
    const words = useMemo(() => title.split(" "), [title]);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">
            {/* Animated Background Layer - Fixed positioning */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            {/* Content Layer - Above background */}
            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Animated Title - Letter by letter animation */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-3 md:mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                        dark:from-white dark:to-white/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    {/* CTA Button - Optional, responsive */}
                    {showButton && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                            dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                            overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <Button
                                variant="ghost"
                                onClick={onButtonClick}
                                className="rounded-[1.15rem] px-6 py-5 sm:px-8 sm:py-6 text-base sm:text-lg 
                                font-semibold backdrop-blur-md 
                                bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                                text-black dark:text-white transition-all duration-300 
                                group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                                hover:shadow-md dark:hover:shadow-neutral-800/50"
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    {buttonText}
                                </span>
                                <span
                                    className="ml-2 sm:ml-3 opacity-70 group-hover:opacity-100 
                                    group-hover:translate-x-1.5 transition-all duration-300 text-xl"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
});

BackgroundPaths.displayName = "BackgroundPaths";

/**
 * BackgroundPathsOnly Component - Optimized Full App Background
 * 
 * Best Practices Applied:
 * ✅ Fixed positioning (covers entire viewport, stays in place on scroll)
 * ✅ Full inset coverage (inset-0 = top-0 right-0 bottom-0 left-0)
 * ✅ Behind all content (-z-10 ensures it's below everything)
 * ✅ Non-interactive (pointer-events-none allows clicks through)
 * ✅ Performance optimized (will-change for GPU acceleration)
 * ✅ Accessibility (aria-hidden, reduced motion support)
 * ✅ Responsive (scales beautifully on all screen sizes)
 * ✅ Memory efficient (memoized, prevents unnecessary re-renders)
 * 
 * Usage:
 * ```jsx
 * <div className="relative min-h-screen">
 *   <BackgroundPathsOnly />
 *   <YourContent />
 * </div>
 * ```
 */
export const BackgroundPathsOnly = memo(() => {
    return (
        <div 
            className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden
                       bg-white dark:bg-black
                       will-change-transform"
            style={{ zIndex: -1 }}
            aria-hidden="true"
            role="presentation"
        >
            {/* Layer 1: Paths moving in positive direction */}
            <FloatingPaths position={1} />
            
            {/* Layer 2: Paths moving in negative direction (creates depth) */}
            <FloatingPaths position={-1} />
        </div>
    );
});

BackgroundPathsOnly.displayName = "BackgroundPathsOnly";
