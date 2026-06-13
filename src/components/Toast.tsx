import { AnimatePresence, motion } from "framer-motion";
import type { ToastItem } from "../types";

interface ToastProps {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}

const toneClassMap = {
  success: "from-[#ffb4c8]/25 to-white/10 border-[#ffb4c8]/25",
  info: "from-[#c4b5fd]/25 to-white/10 border-[#c4b5fd]/25",
  error: "from-red-300/25 to-white/10 border-red-200/25"
} as const;

export function Toast({ items, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[320px] flex-col gap-3">
      <AnimatePresence>
        {items.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto overflow-hidden rounded-2xl border bg-gradient-to-br px-4 py-3 text-left shadow-glass backdrop-blur-xl ${
              toneClassMap[toast.kind ?? "info"]
            }`}
            initial={{ opacity: 0, x: "120%", scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: "120%", scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
              mass: 0.9
            }}
          >
            <div className="text-sm text-white/90">{toast.message}</div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
