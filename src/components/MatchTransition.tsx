import { motion } from 'motion/react';

export function MatchTransition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Animated Background Strips */}
      <motion.div 
        initial={{ x: '-100%', skewX: -20 }}
        animate={{ x: '200%', skewX: -20 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-vibrant-cyan/20 to-transparent"
      />
      <motion.div 
        initial={{ x: '200%', skewX: -20 }}
        animate={{ x: '-100%', skewX: -20 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-vibrant-pink/20 to-transparent"
      />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#00ffff1a_1px,transparent_1px),linear-gradient(to_bottom,#00ffff1a_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.2
          }}
          className="flex flex-col items-center"
        >
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] text-center">
            SOCCER<span className="text-vibrant-yellow drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]"> RIVALS 3D</span>
          </h1>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-vibrant-cyan via-vibrant-pink to-vibrant-yellow rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)]"
            />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-3xl font-black italic uppercase tracking-[0.4em] text-vibrant-cyan animate-pulse"
            >
              Joining Game
            </motion.p>
          </div>
        </motion.div>

        {/* Floating particles or accents */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-vibrant-cyan/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-vibrant-pink/10 blur-3xl rounded-full" />
      </div>

      {/* Corner Accents */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-vibrant-cyan/30 rounded-tl-3xl" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-vibrant-pink/30 rounded-br-3xl" />
    </motion.div>
  );
}
