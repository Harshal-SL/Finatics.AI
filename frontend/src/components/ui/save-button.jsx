"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

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
 * SaveButton Component
 * 
 * An animated save button with three states: idle, saving, and saved.
 * Features confetti animation on successful save and sparkle effects.
 * Only animates when button is clicked (active state), not on hover.
 * 
 * @param {Object} props
 * @param {Object} props.text - Custom text for each state {idle, saving, saved}
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onSave - Async function to call on save
 */
export function SaveButton({ 
  text = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved!"
  },
  className,
  onSave
}) {
  const [status, setStatus] = useState("idle")
  const [bounce, setBounce] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"

  const handleSave = async () => {
    if (status === "idle") {
      setStatus("saving")
      try {
        if (onSave) {
          await onSave()
        } else {
          // Simulate save if onSave is not provided
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        setStatus("saved")
        setBounce(true)
        
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
                  colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
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
          setStatus("idle")
          setBounce(false)
        }, 2000)
      } catch (error) {
        setStatus("idle")
        console.error("Save failed:", error)
      }
    }
  }

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
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleSave}
        animate={status}
        variants={buttonVariants}
        className={cn(
          "relative overflow-hidden rounded-full px-6 py-2 transition-all duration-200",
          className
        )}
        style={{ minWidth: "150px" }}
        whileTap={status === "idle" ? { scale: 0.95 } : {}}
        disabled={status !== "idle"}
      >
        <span className="z-10 flex items-center justify-center gap-2 text-sm font-medium">
          <AnimatePresence mode="wait">
            {status === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  rotate: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
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
            {status === "idle" ? text.idle : status === "saving" ? text.saving : text.saved}
          </motion.span>
        </span>
      </motion.button>
      <AnimatePresence>
        {bounce && (
          <motion.div
            className="absolute top-0 right-0 -mr-1 -mt-1"
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
  )
}
