/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Play, Trophy, Snowflake, Info, Gamepad2, User, ChevronRight, X, Edit2, Globe } from 'lucide-react';
import { useGameStore } from '../store';
import { SettingsModal } from './SettingsModal';
import { WORLD_CUP_COUNTRIES } from '../constants/countries';

const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

function PlayerPreview() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions['Idle']) {
      actions['Idle'].play();
    }
  }, [actions]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={group} 
        object={scene} 
        scale={window.innerWidth < 768 ? 0.45 : 0.6} 
        position={[0, window.innerWidth < 768 ? -1.2 : -1.5, 0]} 
        rotation={[0, -Math.PI / 4, 0]} 
      />
    </Float>
  );
}

export function Lobby() {
  const setInLobby = useGameStore((state) => state.setInLobby);
  const setJoinMode = useGameStore((state) => state.setJoinMode);
  const playerName = useGameStore((state) => state.playerName);
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const selectedWorldCupCountry = useGameStore((state) => state.selectedWorldCupCountry);
  const setSelectedWorldCupCountry = useGameStore((state) => state.setSelectedWorldCupCountry);
  const setIsWorldCup = useGameStore((state) => state.setIsWorldCup);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showModesModal, setShowModesModal] = useState(false);
  const [showWorldCupModal, setShowWorldCupModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handlePlay = () => {
    setIsWorldCup(false);
    setJoinMode('queue');
    setInLobby(false);
  };

  const handleWorldCupPlay = () => {
    setIsWorldCup(true);
    setJoinMode('queue');
    setInLobby(false);
  };

  const handleCreate = () => {
    setJoinMode('create');
    setInLobby(false);
  };

  const handleTraining = (difficulty: 'easy' | 'medium' | 'hard' | 'pro') => {
    setJoinMode('training', undefined, difficulty);
    setInLobby(false);
    setShowModesModal(false);
  };

  const handleJoinPrivate = () => {
    if (roomCode.trim()) {
      setJoinMode('join', roomCode.trim().toUpperCase());
      setInLobby(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-vibrant-purple via-vibrant-pink to-vibrant-orange overflow-hidden font-sans select-none">
      {/* Floating Blobs for playfulness */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vibrant-cyan/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-vibrant-yellow/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Bottom Left: Copyright */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-50 pointer-events-none">
        <p className="text-[8px] md:text-[10px] text-white/30 font-black italic uppercase tracking-widest">
          © 2026 hentertrabelsi - All Rights Reserved
        </p>
      </div>
      
      {/* Top Left: Settings & Region */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 flex gap-2">
        {!showJoinModal && !showSettings && (
          <>
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ rotate: 90, scale: 1.1 }}
              onClick={() => setShowSettings(true)}
              className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-vibrant-cyan hover:border-vibrant-cyan/50 transition-all cursor-pointer shadow-xl group"
            >
              <Settings size={18} className="md:w-[22px] md:h-[22px] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
            </motion.button>
            
            {/* Region Selector */}
            <div className="relative group/region">
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-vibrant-yellow hover:border-vibrant-yellow/50 transition-all cursor-pointer shadow-xl flex items-center gap-2"
              >
                <Globe size={18} className="md:w-[22px] md:h-[22px]" />
                <span className="text-[10px] md:text-sm font-black italic uppercase text-white/80">
                  {useGameStore.getState().settings.server === 'usa' ? 'USA' : 'EU'}
                </span>
              </motion.button>
              
              <div className="absolute top-full left-0 mt-2 opacity-0 group-hover/region:opacity-100 pointer-events-none group-hover/region:pointer-events-auto transition-all flex flex-col gap-1 w-32">
                <button 
                  onClick={() => useGameStore.getState().setSettings({ server: 'usa' })}
                  className={`bg-black/60 backdrop-blur-md p-2 rounded-lg border text-left font-black italic uppercase text-[10px] transition-all ${useGameStore.getState().settings.server === 'usa' ? 'text-vibrant-yellow border-vibrant-yellow/50' : 'text-white/60 border-white/10 hover:text-white'}`}
                >
                  🇺🇸 USA East
                </button>
                <button 
                  onClick={() => useGameStore.getState().setSettings({ server: 'europe' })}
                  className={`bg-black/60 backdrop-blur-md p-2 rounded-lg border text-left font-black italic uppercase text-[10px] transition-all ${useGameStore.getState().settings.server === 'europe' ? 'text-vibrant-yellow border-vibrant-yellow/50' : 'text-white/60 border-white/10 hover:text-white'}`}
                >
                  🇪🇺 EU Frankfurt
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Right: Profile */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 md:gap-3 z-50">
        <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-xl p-1 md:p-2 pr-2.5 md:pr-4 rounded-lg md:rounded-2xl border border-white/10 shadow-xl group">
          <div className="relative">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-vibrant-cyan to-vibrant-purple rounded-lg md:rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,255,255,0.2)] transform group-hover:rotate-3 transition-transform overflow-hidden">
              {selectedWorldCupCountry ? (
                <img 
                  src={WORLD_CUP_COUNTRIES.find(c => c.name === selectedWorldCupCountry)?.flag} 
                  alt={selectedWorldCupCountry}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={14} className="md:w-5 md:h-5" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-vibrant-yellow text-[6px] md:text-[8px] font-black text-black px-1 md:px-1.5 py-0.5 rounded-full border border-black shadow-md">
              L1
            </div>
          </div>
          
          <div className="flex flex-col min-w-[60px] md:min-w-[120px]">
            <div className="flex items-center gap-1 group/input relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-white font-black text-[10px] md:text-sm leading-tight bg-transparent border-b border-transparent focus:border-vibrant-cyan focus:outline-none transition-all w-full placeholder:text-white/20 italic uppercase tracking-tight cursor-pointer pr-3 md:pr-4"
                placeholder="Name"
                maxLength={16}
              />
              <Edit2 size={8} className="md:w-2.5 md:h-2.5 absolute right-0 text-white/20 group-hover/input:text-vibrant-cyan transition-colors pointer-events-none" />
            </div>
            
            <div className="w-full h-0.5 md:h-1 bg-white/5 rounded-full overflow-hidden mt-0.5 md:mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '15%' }}
                className="h-full bg-gradient-to-r from-vibrant-cyan to-vibrant-purple"
              />
            </div>
          </div>
        </div>
      </div>

  <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Center: Title */}
      <div className="absolute top-16 md:top-16 left-1/2 -translate-x-1/2 text-center w-full px-4 z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="text-4xl sm:text-6xl md:text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] whitespace-nowrap flex flex-col md:block"
        >
          SOCCER <span className="text-vibrant-yellow drop-shadow-[0_0_15px_rgba(255,255,0,0.5)]">RIVALS 3D</span>
        </motion.h1>
      </div>

      {/* Center: 3D Preview */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-full h-full max-w-2xl max-h-[400px] md:max-h-[600px] -translate-y-10 md:translate-y-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={2} color="#9d00ff" />
            <pointLight position={[0, 5, 0]} intensity={1} color="#ffff00" />
            <Environment preset="city" />
            <PlayerPreview />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          </Canvas>
        </div>
      </div>

      {/* Left Side: Buttons & News */}
      <div className="absolute left-4 md:left-10 top-[50%] md:top-1/2 -translate-y-1/2 flex flex-col gap-3 md:gap-4 w-[calc(100%-2rem)] md:w-64 z-20">
        <div className="flex flex-row md:flex-col gap-2 md:gap-4">
          <motion.button 
            whileHover={{ x: 10, scale: 1.05 }}
            className="flex-1 bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-black text-[10px] sm:text-sm md:text-xl py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-1.5 md:gap-3 shadow-[0_4px_0_#c2410c] md:shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic"
          >
            <Settings size={16} className="md:w-6 md:h-6" />
            <span className="hidden sm:inline">Customize</span>
            <span className="sm:hidden">Skins</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ x: 10, scale: 1.05 }}
            onClick={() => setShowModesModal(true)}
            className="flex-1 bg-vibrant-cyan hover:bg-vibrant-cyan/90 text-black font-black text-[10px] sm:text-sm md:text-xl py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-1.5 md:gap-3 shadow-[0_4px_0_#0891b2] md:shadow-[0_8px_0_#0891b2] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic"
          >
            <Gamepad2 size={16} className="md:w-6 md:h-6" />
            Modes
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="md:hidden bg-black/40 backdrop-blur-md text-vibrant-cyan p-3 rounded-xl border border-white/10 flex items-center justify-center shadow-xl"
          >
            <Info size={18} />
          </motion.button>
        </div>

        <div className="hidden md:block bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-vibrant-cyan font-black italic text-lg uppercase">News</h3>
            <div className="bg-vibrant-cyan p-0.5 rounded text-black">
              <Info size={14} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div 
              onClick={() => setShowWorldCupModal(true)}
              className="bg-gradient-to-r from-vibrant-yellow/10 to-vibrant-orange/10 hover:from-vibrant-yellow/20 hover:to-vibrant-orange/20 p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group border border-vibrant-yellow/20"
            >
              <Globe size={18} className="text-vibrant-yellow" />
              <div className="flex flex-col flex-1">
                <span className="text-white/80 text-sm font-black uppercase italic">World Cup 2026</span>
                <span className="text-[10px] text-vibrant-cyan font-bold uppercase">Tournament Live!</span>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/60" />
            </div>
            <div className="bg-white/5 hover:bg-white/10 p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group">
              <Trophy size={18} className="text-vibrant-yellow" />
              <span className="text-white/80 text-sm font-medium flex-1">Season 1: Kickoff!</span>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Live Arenas */}
    

      {/* Bottom: Play Buttons */}
      <div className="absolute bottom-6 md:bottom-12 left-0 w-full flex flex-col items-center gap-3 md:gap-6 z-30">
        <div className="flex items-center justify-center w-full relative px-4">
          <motion.button 
            onClick={handlePlay}
            whileHover={{ scale: 1.1, rotate: [-1, 1, -1] }}
            whileTap={{ scale: 0.9 }}
            className="bg-vibrant-yellow hover:bg-vibrant-yellow/90 text-black font-black text-3xl sm:text-3xl md:text-6xl py-4 md:py-6 px-6 md:px-16 rounded-2xl md:rounded-[3rem] flex items-center justify-center gap-2 md:gap-4 shadow-[0_6px_0_#a16207] md:shadow-[0_12px_0_#a16207] active:shadow-none active:translate-y-2 transition-all cursor-pointer uppercase italic z-10"
          >
            <Play size={28} className="md:w-14 md:h-14" fill="black" />
            Play
          </motion.button>

          <div className="absolute left-[calc(50%+80px)] sm:left-[calc(50%+100px)] md:left-[calc(50%+180px)]">
            <motion.button 
              onClick={() => setShowWorldCupModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-vibrant-yellow to-vibrant-orange text-black font-black text-[8px] md:text-sm py-1.5 md:py-3 px-2 md:px-6 rounded-lg md:rounded-2xl flex items-center justify-center gap-1 md:gap-2 shadow-[0_3px_0_#a16207] md:shadow-[0_4px_0_#a16207] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic whitespace-nowrap"
            >
              <Globe size={12} className="md:w-5 md:h-5" />
              World Cup 2026
            </motion.button>
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 w-full md:w-auto">
        
          <motion.button 
            onClick={handleCreate}
            whileHover={{ scale: 1.05 }}
            className="flex-1 md:flex-none bg-vibrant-cyan hover:bg-vibrant-cyan/90 text-black font-black py-3 md:py-3 px-4 md:px-8 rounded-xl md:rounded-xl shadow-[0_4px_0_#0891b2] md:shadow-[0_6px_0_#0891b2] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic text-xs md:text-base"
          >
            Create
          </motion.button>
          <motion.button 
            onClick={() => setShowJoinModal(true)}
            whileHover={{ scale: 1.05 }}
            className="flex-1 md:flex-none bg-vibrant-purple hover:bg-vibrant-purple/90 text-white font-black py-3 md:py-3 px-4 md:px-8 rounded-xl md:rounded-xl shadow-[0_4px_0_#6b21a8] md:shadow-[0_6px_0_#6b21a8] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic text-xs md:text-base"
          >
            Join Private
          </motion.button>
        </div>
      </div>

     

      {/* Modes Selection Modal */}
      <AnimatePresence>
        {showModesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModesModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              className="relative bg-slate-900 border-t md:border border-white/10 p-6 md:p-8 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl max-w-sm w-full text-center mt-auto md:mt-0"
            >
              <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase mb-2">Game Modes</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 italic">Select your challenge</p>
              
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col gap-2 md:gap-3">
                  <div className="text-vibrant-cyan text-[8px] md:text-[10px] font-black uppercase tracking-widest text-left ml-2">Training (AI)</div>
                  <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                    <button 
                      onClick={() => handleTraining('easy')}
                      className="bg-white/5 hover:bg-vibrant-cyan/20 text-white/80 hover:text-vibrant-cyan font-black italic uppercase py-2.5 md:py-3 rounded-xl border border-white/10 hover:border-vibrant-cyan/30 transition-all cursor-pointer text-xs md:text-sm"
                    >
                      Easy Practice
                    </button>
                    <button 
                      onClick={() => handleTraining('medium')}
                      className="bg-white/5 hover:bg-vibrant-yellow/20 text-white/80 hover:text-vibrant-yellow font-black italic uppercase py-2.5 md:py-3 rounded-xl border border-white/10 hover:border-vibrant-yellow/30 transition-all cursor-pointer text-xs md:text-sm"
                    >
                      Medium Match
                    </button>
                    <button 
                      onClick={() => handleTraining('hard')}
                      className="bg-white/5 hover:bg-vibrant-orange/20 text-white/80 hover:text-vibrant-orange font-black italic uppercase py-2.5 md:py-3 rounded-xl border border-white/10 hover:border-vibrant-orange/30 transition-all cursor-pointer text-xs md:text-sm"
                    >
                      Hard Veteran
                    </button>
                    <button 
                      onClick={() => handleTraining('pro')}
                      className="bg-white/5 hover:bg-vibrant-pink/20 text-white/80 hover:text-vibrant-pink font-black italic uppercase py-2.5 md:py-3 rounded-xl border border-white/10 hover:border-vibrant-pink/30 transition-all cursor-pointer text-xs md:text-sm"
                    >
                      Professional Elite
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setShowModesModal(false);
                      setShowWorldCupModal(true);
                    }}
                    className="bg-gradient-to-r from-vibrant-yellow to-vibrant-orange hover:from-vibrant-yellow/90 hover:to-vibrant-orange/90 text-black font-black italic uppercase py-3 md:py-4 rounded-2xl shadow-[0_4px_0_#a16207] md:shadow-[0_6px_0_#a16207] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Globe size={16} className="md:w-[18px] md:h-[18px]" />
                    World Cup 2026
                  </button>

                  <button 
                    onClick={handlePlay}
                    className="bg-vibrant-yellow hover:bg-vibrant-yellow/90 text-black font-black italic uppercase py-3 md:py-4 rounded-2xl shadow-[0_4px_0_#a16207] md:shadow-[0_6px_0_#a16207] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Play size={16} className="md:w-[18px] md:h-[18px]" fill="black" />
                    Online Match
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowModesModal(false)}
                  className="text-white/20 hover:text-white/40 font-bold uppercase text-[10px] tracking-widest transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* World Cup Selection Modal */}
      <AnimatePresence>
        {showWorldCupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorldCupModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-slate-900 border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl md:text-4xl font-black italic text-white uppercase leading-none">World Cup 2026</h3>
                  <p className="text-vibrant-cyan text-[10px] font-bold uppercase tracking-widest mt-1">Select your nation</p>
                </div>
                <button 
                  onClick={() => setShowWorldCupModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WORLD_CUP_COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedWorldCupCountry(country.name);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden ${
                        selectedWorldCupCountry === country.name
                          ? 'border-vibrant-cyan bg-vibrant-cyan/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-12 h-8 md:w-16 md:h-10 shadow-lg rounded overflow-hidden group-hover:scale-110 transition-transform">
                        <img 
                          src={country.flag} 
                          alt={country.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className={`text-[10px] md:text-xs font-black uppercase italic text-center ${
                        selectedWorldCupCountry === country.name ? 'text-white' : 'text-white/40'
                      }`}>
                        {country.name}
                      </span>
                      {selectedWorldCupCountry === country.name && (
                        <motion.div 
                          layoutId="selected-glow"
                          className="absolute inset-0 bg-vibrant-cyan/5 pointer-events-none"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setShowWorldCupModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase py-4 rounded-2xl border border-white/10 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    handleWorldCupPlay();
                    setShowWorldCupModal(false);
                  }}
                  className="flex-[2] bg-vibrant-yellow hover:bg-vibrant-yellow/90 text-black font-black italic uppercase py-4 rounded-2xl shadow-[0_6px_0_#a16207] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="black" />
                  Enter Tournament
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Private Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              className="relative bg-slate-900 border-t md:border border-white/10 p-8 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl max-w-sm w-full text-center mt-auto md:mt-0"
            >
              <h3 className="text-3xl font-black italic text-white uppercase mb-6">Join Room</h3>
              <input 
                type="text" 
                placeholder="Enter Room Code" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 md:py-3 text-white text-center text-3xl md:text-2xl font-black tracking-widest uppercase mb-6 focus:outline-none focus:border-vibrant-cyan"
                maxLength={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowJoinModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black italic uppercase py-4 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button 
                  onClick={handleJoinPrivate}
                  disabled={roomCode.length < 3}
                  className="bg-vibrant-purple hover:bg-vibrant-purple/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black italic uppercase py-4 rounded-2xl shadow-[0_6px_0_#6b21a8] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
