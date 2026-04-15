/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { WORLD_CUP_COUNTRIES } from '../constants/countries';

interface GameOverTransitionProps {
  message: string;
  score: { red: number; blue: number };
  isWorldCup?: boolean;
  worldCupTeams?: { red: string; blue: string };
}

export function GameOverTransition({ message, score, isWorldCup, worldCupTeams }: GameOverTransitionProps) {
  const isBlueWin = message.includes('BLUE') || (isWorldCup && worldCupTeams?.blue && message.includes(worldCupTeams.blue.toUpperCase()));
  const isRedWin = message.includes('RED') || (isWorldCup && worldCupTeams?.red && message.includes(worldCupTeams.red.toUpperCase()));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl overflow-hidden"
    >
      {/* Background Glows */}
      <div className={`absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none`}>
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 blur-[120px] rounded-full ${isBlueWin ? 'bg-vibrant-cyan' : isRedWin ? 'bg-vibrant-pink' : 'bg-vibrant-yellow'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 blur-[120px] rounded-full ${isBlueWin ? 'bg-vibrant-cyan' : isRedWin ? 'bg-vibrant-pink' : 'bg-vibrant-yellow'}`} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="bg-white/10 p-6 rounded-full mb-6 border border-white/20 shadow-2xl">
            <Trophy size={64} className={isBlueWin ? 'text-vibrant-cyan' : isRedWin ? 'text-vibrant-pink' : 'text-vibrant-yellow'} />
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {message}
          </h2>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="flex items-center gap-12 md:gap-24 mb-16"
        >
          <div className="flex flex-col items-center">
            {isWorldCup && worldCupTeams?.blue && (
              <img 
                src={WORLD_CUP_COUNTRIES.find(c => c.name === worldCupTeams.blue)?.flag} 
                alt={worldCupTeams.blue}
                className="w-16 h-10 md:w-24 md:h-16 object-cover rounded-lg mb-4 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-vibrant-cyan text-xl font-black italic uppercase tracking-widest mb-2">
              {isWorldCup && worldCupTeams?.blue ? worldCupTeams.blue : 'BLUE'}
            </span>
            <span className="text-8xl md:text-9xl font-black italic text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">{score.blue}</span>
          </div>
          
          <div className="text-white/20 text-4xl font-black italic">VS</div>

          <div className="flex flex-col items-center">
            {isWorldCup && worldCupTeams?.red && (
              <img 
                src={WORLD_CUP_COUNTRIES.find(c => c.name === worldCupTeams.red)?.flag} 
                alt={worldCupTeams.red}
                className="w-16 h-10 md:w-24 md:h-16 object-cover rounded-lg mb-4 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-vibrant-pink text-xl font-black italic uppercase tracking-widest mb-2">
              {isWorldCup && worldCupTeams?.red ? worldCupTeams.red : 'RED'}
            </span>
            <span className="text-8xl md:text-9xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]">{score.red}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-3 h-3 bg-vibrant-yellow rounded-full animate-pulse" />
            <span className="text-white/80 font-black italic uppercase tracking-widest text-sm">Returning to Lobby</span>
          </div>

          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-vibrant-cyan via-vibrant-pink to-vibrant-yellow"
            />
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 border-white/10 rounded-tl-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />
      </div>
    </motion.div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
