import {motion} from 'framer-motion';

export default function CryptoLoader() {
  return (
    <motion.div className="flex gap-2 justify-center">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: [10, 30, 10] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            delay: i * 0.15
          }}
          className="w-2 bg-green-400 rounded"
        />
      ))}
    </motion.div>
  );
}
