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
import { PlayerState, useGameStore } from '../store';
import { Trophy, Target, Zap, MousePointer2 } from 'lucide-react';
import { WORLD_CUP_COUNTRIES } from '../constants/countries';

interface ScoreboardProps {
  players: Record<string, PlayerState>;
}

export function Scoreboard({ players }: ScoreboardProps) {
  const gameState = useGameStore(state => state.gameState);
  const isWorldCup = gameState.isWorldCup;
  const worldCupTeams = gameState.worldCupTeams;

  const playerList = Object.values(players).sort((a, b) => {
    if (a.team !== b.team) return a.team === 'blue' ? -1 : 1;
    return (b.goals * 3 + b.assists * 2 + b.kicks * 0.1) - (a.goals * 3 + a.assists * 2 + a.kicks * 0.1);
  });

  const bluePlayers = playerList.filter(p => p.team === 'blue');
  const redPlayers = playerList.filter(p => p.team === 'red');

  const TeamSection = ({ title, players, colorClass, accentClass }: { title: string, players: PlayerState[], colorClass: string, accentClass: string }) => (
    <div className="flex-1 flex flex-col gap-2">
      <div className={`flex items-center justify-between px-4 py-2 rounded-t-xl bg-black/40 border-b-2 ${accentClass}`}>
        <h3 className={`font-black italic uppercase tracking-widest ${colorClass}`}>{title}</h3>
        <span className="text-[10px] text-white/40 font-bold uppercase">Team Stats</span>
      </div>
      <div className="flex flex-col gap-1">
        {players.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_40px_40px_40px] md:grid-cols-[1fr_50px_50px_50px] items-center gap-1 md:gap-2 bg-white/5 hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors group">
            <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
              <div className={`w-1 h-4 md:w-1.5 md:h-6 rounded-full ${p.team === 'blue' ? 'bg-vibrant-cyan' : 'bg-vibrant-pink'}`} />
              {p.worldCupCountry && (
                <div className="w-5 h-3.5 md:w-7 md:h-5 rounded-sm overflow-hidden shadow-sm flex-shrink-0">
                  <img 
                    src={WORLD_CUP_COUNTRIES.find(c => c.name === p.worldCupCountry)?.flag} 
                    alt={p.worldCupCountry}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <span className="text-white font-bold truncate italic uppercase tracking-tight text-xs md:text-sm">{p.name}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[6px] md:text-[8px] text-white/30 font-black uppercase">G</span>
              <span className="text-white font-black italic text-xs md:text-base">{p.goals}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[6px] md:text-[8px] text-white/30 font-black uppercase">A</span>
              <span className="text-white font-black italic text-xs md:text-base">{p.assists}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[6px] md:text-[8px] text-white/30 font-black uppercase">K</span>
              <span className="text-white font-black italic text-xs md:text-base">{p.kicks}</span>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div className="py-8 text-center text-white/10 italic text-sm">No players</div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-[150] p-4 md:p-6"
    >
      <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-vibrant-yellow p-1.5 md:p-2 rounded-lg md:rounded-xl text-black">
              <Trophy size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-xl font-black italic text-white uppercase tracking-tighter">Match Statistics</h2>
              <p className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">Live Performance Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/40 font-black uppercase italic">Match Time</span>
              <span className="text-vibrant-yellow font-black italic">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8">
          <TeamSection 
            title={isWorldCup && worldCupTeams?.blue ? worldCupTeams.blue : "Blue Team"} 
            players={bluePlayers} 
            colorClass="text-vibrant-cyan" 
            accentClass="border-vibrant-cyan" 
          />
          <div className="hidden md:block w-px bg-white/5 self-stretch" />
          <TeamSection 
            title={isWorldCup && worldCupTeams?.red ? worldCupTeams.red : "Red Team"} 
            players={redPlayers} 
            colorClass="text-vibrant-pink" 
            accentClass="border-vibrant-pink" 
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-vibrant-cyan" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">3pts / Goal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-vibrant-pink" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">2pts / Assist</span>
            </div>
          </div>
          <div className="text-[10px] text-white/20 font-black italic uppercase tracking-[0.2em]">
            Press TAB to toggle
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
