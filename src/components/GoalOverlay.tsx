import { motion, AnimatePresence } from 'motion/react';
import { WORLD_CUP_COUNTRIES } from '../constants/countries';

interface GoalOverlayProps {
  message: string;
  lastScorer?: {
    name: string;
    team: 'red' | 'blue';
    country?: string;
  };
  isWorldCup?: boolean;
  worldCupTeams?: { red: string; blue: string };
}

export function GoalOverlay({ message, lastScorer, isWorldCup, worldCupTeams }: GoalOverlayProps) {
  const teamName = lastScorer?.team === 'blue' 
    ? (isWorldCup && worldCupTeams?.blue ? worldCupTeams.blue : 'BLUE')
    : (isWorldCup && worldCupTeams?.red ? worldCupTeams.red : 'RED');
  
  const teamColor = lastScorer?.team === 'blue' ? 'text-vibrant-cyan' : 'text-vibrant-pink';
  const glowColor = lastScorer?.team === 'blue' ? 'shadow-vibrant-cyan/50' : 'shadow-vibrant-pink/50';
  const bgColor = lastScorer?.team === 'blue' ? 'bg-vibrant-cyan' : 'bg-vibrant-pink';

  const country = lastScorer?.country ? WORLD_CUP_COUNTRIES.find(c => c.name === lastScorer.country) : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Flash Effect (Removed) */}
      
      {/* Background Strips (Simplified) */}
      <motion.div
        initial={{ x: '-100%', skewX: -20 }}
        animate={{ x: '200%', skewX: -20 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className={`absolute top-0 bottom-0 w-full ${bgColor} opacity-10`}
      />

      <div className="relative z-[202] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="mb-4"
          >
            <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              GOAL!
            </h2>
          </motion.div>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-black/80 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-2xl md:rounded-[2rem] flex flex-col items-center shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-1">
              {isWorldCup && country && (
                <img 
                  src={country.flag} 
                  alt={country.name}
                  className="w-10 h-7 md:w-14 md:h-10 object-cover rounded shadow-lg"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className={`text-2xl md:text-4xl font-black italic uppercase tracking-tight ${teamColor}`}>
                {teamName}
              </span>
            </div>
            
            {lastScorer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center"
              >
                <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-1">Scored By</span>
                <span className="text-white text-xl md:text-3xl font-black italic uppercase tracking-tight">
                  {lastScorer.name}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Particles/Accents */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className={`absolute -z-10 w-64 h-64 rounded-full blur-3xl ${bgColor} opacity-10`}
        />
      </div>
    </div>
  );
}
