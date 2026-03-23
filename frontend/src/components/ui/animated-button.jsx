import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Lazy load confetti to avoid WebGL initialization errors
let confetti = null;
const loadConfetti = async () => {
  if (!confetti && typeof window !== 'undefined') {
    try {
      const module = await import("canvas-confetti");
      confetti = module.default;
    } catch (err) {
      console.debug("Failed to load confetti:", err);
    }
  }
  return confetti;
};

/**
 * Animated Save Button Component
 * 
 * A beautiful animated button with multiple states and confetti effect.
 * Features:
 * - Three states: idle, saving, saved
 * - Smooth transitions with framer-motion
 * - Confetti celebration on save
 * - Sparkle animation
 * - Theme-aware (dark/light mode)
 * - Custom text for each state
 * - Shimmer/spark effect on hover
 * 
 * @param {Object} props
 * @param {Object} props.text - Custom text for each state {idle, saving, saved}
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onSave - Async function to call on save
 * @param {string} props.variant - Button style variant (default, primary, success)
 * @param {string} props.size - Button size (sm, md, lg)
 */
export function AnimatedButton({ 
  text = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved!"
  },
  className,
  onSave,
  onClick,
  variant = "default",
  size = "md",
  disabled = false,
  children,
  ...props
}) {
  const [status, setStatus] = useState("idle");
  const [bounce, setBounce] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "system";

  const handleClick = async (e) => {
    // If there's a custom onClick handler, call it
    if (onClick) {
      onClick(e);
      return;
    }
    
    // Otherwise, run the save animation
    if (status === "idle" && !disabled && onSave) {
      setStatus("saving");
      try {
        await onSave();
        setStatus("saved");
        setBounce(true);
        
        // Confetti celebration with error handling
        try {
          // Only trigger confetti if window is visible and has proper dimensions
          if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
            const confettiFn = await loadConfetti();
            if (confettiFn) {
              // Small delay to ensure DOM is ready
              setTimeout(() => {
                confettiFn({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
                  shapes: ["star", "circle"],
                });
              }, 100);
            }
          }
        } catch (confettiError) {
          // Silently catch confetti errors to prevent breaking the component
          console.debug("Confetti effect skipped:", confettiError.message);
        }
        
        setTimeout(() => {
          setStatus("idle");
          setBounce(false);
        }, 2000);
      } catch (error) {
        setStatus("idle");
        console.error("Operation failed:", error);
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs min-w-[100px]",
    md: "px-6 py-2 text-sm min-w-[120px]",
    lg: "px-8 py-3 text-base min-w-[160px]"
  };

  // Animation variants based on status (no background color change)
  const buttonVariants = {
    idle: {
      scale: 1,
    },
    saving: {
      scale: 1,
    },
    saved: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.5, 1],
      },
    },
  };

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  };

  // Display text: use children if provided, otherwise use text prop
  const displayText = children || (status === "idle" ? text.idle : status === "saving" ? text.saving : text.saved);

  return (
    <div className="relative inline-block" style={{ pointerEvents: 'auto' }}>
      <motion.button
        onClick={handleClick}
        animate={status}
        variants={buttonVariants}
        disabled={disabled || status !== "idle"}
        className={cn(
          "relative overflow-hidden rounded-full transition-all duration-200",
          sizeClasses[size],
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        whileTap={status === "idle" && !disabled ? { scale: 0.95 } : {}}
        style={{ pointerEvents: 'auto', cursor: disabled ? 'not-allowed' : 'pointer' }}
        {...props}
      >
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2 font-medium pointer-events-none">
          <AnimatePresence mode="wait">
            {status === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.span>
            )}
            {status === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
          
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {displayText}
          </motion.span>
        </span>
      </motion.button>
      
      {/* Sparkle effect on saved */}
      <AnimatePresence>
        {bounce && (
          <motion.div
            className="absolute top-0 right-0 -mr-1 -mt-1 pointer-events-none"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={sparkleVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedButton;
