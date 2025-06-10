import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export const AnimatedButton = ({
  animationPhase,
}: {
  animationPhase: string;
}) => {
  return (
    <motion.button
      aria-label="Анимация кнопки"
      disabled
      className="relative z-50 bg-orange-500 text-white shadow-xl flex items-center justify-center cursor-default overflow-hidden rounded-full w-16 h-16"
    >
      {/* Сам блик — абсолютный div */}
      <motion.div
        className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        style={{
          filter: "blur(10px)",
          transformOrigin: "left",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      />

      {/* Иконка */}
      {animationPhase === "expand" ? (
        <img src="/logo.svg" alt="logo" className="relative z-10" />
      ) : (
        <Plus size={30} className="relative z-10" />
      )}
    </motion.button>
  );
};
