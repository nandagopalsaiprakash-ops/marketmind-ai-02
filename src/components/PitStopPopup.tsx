import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface PitStopPopupProps {
  show: boolean;
  mode: "technical" | "beginner";
  onClose: () => void;
}

export default function PitStopPopup({ show, mode, onClose }: PitStopPopupProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 1500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  const isTech = mode === "technical";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Flash overlay */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 ${isTech ? "bg-technical" : "bg-primary"}`}
          />

          {/* Speed lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? -800 : 800, opacity: 0 }}
              animate={{ x: i % 2 === 0 ? 800 : -800, opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
              className={`absolute h-1 w-40 rounded-full ${isTech ? "bg-technical" : "bg-primary"}`}
              style={{ top: `${15 + i * 9}%` }}
            />
          ))}

          {/* Main pit-stop card */}
          <motion.div
            initial={{ scale: 0.3, rotate: -15, y: 100, opacity: 0 }}
            animate={{
              scale: [0.3, 1.15, 1],
              rotate: [-15, 5, 0],
              y: [100, -10, 0],
              opacity: 1,
            }}
            exit={{ scale: 0.5, y: -80, opacity: 0, rotate: 10 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative"
          >
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`absolute inset-0 rounded-3xl ${isTech ? "bg-technical/40" : "bg-primary/40"} blur-2xl`}
            />

            <div
              className={`relative px-10 py-7 rounded-3xl border-4 backdrop-blur-xl shadow-2xl flex items-center gap-5 ${
                isTech
                  ? "bg-technical/20 border-technical text-technical-foreground"
                  : "bg-primary/20 border-primary text-primary-foreground"
              }`}
              style={{
                boxShadow: isTech
                  ? "0 0 60px hsl(var(--technical) / 0.6), inset 0 0 40px hsl(var(--technical) / 0.2)"
                  : "0 0 60px hsl(var(--primary) / 0.6), inset 0 0 40px hsl(var(--primary) / 0.2)",
              }}
            >
              {/* Spinning icon */}
              <motion.div
                animate={{ rotate: isTech ? 360 : -360 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isTech ? "bg-technical" : "bg-primary"
                }`}
              >
                {isTech ? (
                  <Zap className="w-8 h-8 text-background fill-background" />
                ) : (
                  <Sparkles className="w-8 h-8 text-background" />
                )}
              </motion.div>

              <div className="text-left">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="font-display font-black text-2xl md:text-4xl tracking-tight uppercase text-foreground leading-none"
                >
                  {isTech ? "TECHNICAL MODE" : "BEGINNER MODE"}
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className={`font-display font-bold text-base md:text-lg mt-1 ${
                    isTech ? "text-technical" : "text-primary"
                  }`}
                >
                  {isTech ? "🏎️ FULL THROTTLE ENGAGED" : "✨ EASY MODE ACTIVATED"}
                </motion.div>
              </div>
            </div>

            {/* Checker flag accent */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="absolute -top-3 -right-3 text-3xl"
            >
              {isTech ? "🏁" : "🎉"}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
