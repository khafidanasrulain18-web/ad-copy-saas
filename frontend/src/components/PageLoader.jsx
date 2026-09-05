import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <motion.div
        className="flex gap-1.5"
        initial="start"
        animate="end"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-gold"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </div>
  );
}