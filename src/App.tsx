/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Scene } from './components/Scene';
import { Lobby } from './components/Lobby';
import { Chat } from './components/Chat';
import { MatchTransition } from './components/MatchTransition';
import { GameOverTransition } from './components/GameOverTransition';
import { GoalOverlay } from './components/GoalOverlay';
import { Scoreboard } from './components/Scoreboard';
import { SettingsModal } from './components/SettingsModal';
import { MobileControls } from './components/MobileControls';
import { useGameStore } from './store';
import { useWindowSize } from './utils/hooks';
import { soundManager } from './utils/audio';
import { adManager } from './utils/ads';
import { LogOut, X, Check, Trophy, Settings, Copy } from 'lucide-react';
import { WORLD_CUP_COUNTRIES } from './constants/countries';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const setGameState = useGameStore((state) => state.setGameState);
  const setMyId = useGameStore((state) => state.setMyId);
  const gameState = useGameStore((state) => state.gameState);
  const inLobby = useGameStore((state) => state.inLobby);
  const setInLobby = useGameStore((state) => state.setInLobby);
  const playerName = useGameStore((state) => state.playerName);
  const settings = useGameStore((state) => state.settings);

  const roomId = useGameStore((state) => state.roomId);
  const isPrivate = useGameStore((state) => state.isPrivate);

  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, jump: false, kick: false });
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMatchTransition, setShowMatchTransition] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showInMatchSettings, setShowInMatchSettings] = useState(false);
  const [isTouchDevice] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const { width } = useWindowSize();
  const isMobileSize = width < 1024;
  const [joystickInput, setJoystickInput] = useState({ x: 0, z: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prevMatchStateRef = useRef(gameState.matchState);
  const prevRoomIdRef = useRef(roomId);

  // Handle room transition animation
  useEffect(() => {
    if (prevRoomIdRef.current === 'FREEPLAY' && roomId && roomId !== 'FREEPLAY') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowMatchTransition(true);
      const timer = setTimeout(() => setShowMatchTransition(false), 2500);
      return () => clearTimeout(timer);
    }
    prevRoomIdRef.current = roomId;
  }, [roomId]);

  const handleCopyRoom = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      soundManager.init();
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
    window.addEventListener('keydown', initAudio);
    window.addEventListener('mousedown', initAudio);
    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    return () => {
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Global click sound for buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.tagName === 'BUTTON') {
        soundManager.playClick();
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handle music state based on lobby
  useEffect(() => {
    soundManager.setMusicState(inLobby);
  }, [inLobby]);

  // Handle match state sounds and ads
  useEffect(() => {
    if (prevMatchStateRef.current !== gameState.matchState) {
      if (gameState.matchState === 'playing') {
        soundManager.playWhistle();
      } else if (gameState.matchState === 'goal') {
        soundManager.playGoal();
        adManager.triggerHappyMoment();
      } else if (gameState.matchState === 'gameover') {
        soundManager.playWhistle();
        setTimeout(() => soundManager.playWhistle(), 400); // Double whistle for game over
        adManager.triggerMidRoll();
      }
      prevMatchStateRef.current = gameState.matchState;
    }
  }, [gameState.matchState]);

  useEffect(() => {
    soundManager.setVolume(useGameStore.getState().settings.volume);
    
    // Determine backend URL based on regional setting
    const getBackendUrl = () => {
      // In development, always use local server
      if (import.meta.env.DEV) return undefined;
      
      const server = useGameStore.getState().settings.server;
      if (server === 'usa') return import.meta.env.VITE_USA_BACKEND_URL;
      if (server === 'europe') return import.meta.env.VITE_EU_BACKEND_URL;
      return undefined;
    };

    const backendUrl = getBackendUrl();
    console.log(`Connecting to ${useGameStore.getState().settings.server} server: ${backendUrl || 'Default (Same Origin)'}`);
    
    const newSocket = io(backendUrl, {
      reconnection: true,
    });
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    newSocket.on('init', ({ id, state, roomId, isPrivate }) => {
      setMyId(id);
      setGameState(state);
      useGameStore.getState().setRoomId(roomId, isPrivate);
    });

    newSocket.on('update', (state) => {
      setGameState(state);
    });

    newSocket.on('playerLeft', (id) => {
      if (id === newSocket.id) {
        setInLobby(true);
        useGameStore.getState().setRoomId(null);
      }
    });

    newSocket.on('roomCreated', (roomId) => {
      console.log('Created private room:', roomId);
    });

    newSocket.on('error', (msg) => {
      setErrorMessage(msg);
      setInLobby(true);
    });

    newSocket.on('matchEnded', () => {
      setInLobby(true);
      useGameStore.getState().setRoomId(null);
    });

    newSocket.on('goal', ({ team, score }) => {
      console.log(`Goal for ${team}! Score:`, score);
      const gameState = useGameStore.getState().gameState;
      useGameStore.getState().setGameState({
        ...gameState,
        score
      });
    });

    newSocket.on('reward', ({ coins, exp }) => {
      console.log(`Reward received: ${coins} coins, ${exp} exp`);
      useGameStore.getState().addCoins(coins);
      useGameStore.getState().addExp(exp);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [setGameState, setMyId, settings.server, setInLobby]); // Re-connect when server setting changes

  useEffect(() => {
    if (inLobby) {
      if (socket) {
        socket.emit('leave');
      }
      return;
    }

    if (socket) {
      const { joinMode, roomCodeToJoin, trainingDifficulty, selectedWorldCupCountry, isWorldCup, selectedCharacter } = useGameStore.getState();
      const payload = { name: playerName || 'Player', worldCupCountry: selectedWorldCupCountry, isWorldCup, character: selectedCharacter };
      
      if (joinMode === 'create') {
        socket.emit('createPrivateRoom', payload);
      } else if (joinMode === 'join' && roomCodeToJoin) {
        socket.emit('joinPrivateRoom', { ...payload, roomCode: roomCodeToJoin });
      } else if (joinMode === 'training' && trainingDifficulty) {
        socket.emit('startTraining', { ...payload, difficulty: trainingDifficulty });
      } else {
        socket.emit('joinQueue', payload);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const { keyBindings } = useGameStore.getState().settings;

      setKeys((k) => {
        const newKeys = { ...k };
        let changed = false;
        if (key === keyBindings.forward && !k.w) { newKeys.w = true; changed = true; }
        if (key === keyBindings.backward && !k.s) { newKeys.s = true; changed = true; }
        if (key === keyBindings.left && !k.a) { newKeys.a = true; changed = true; }
        if (key === keyBindings.right && !k.d) { newKeys.d = true; changed = true; }
        if (key === keyBindings.jump && !k.jump) { newKeys.jump = true; changed = true; }
        if (key === keyBindings.kick && !k.kick) { newKeys.kick = true; changed = true; }
        return changed ? newKeys : k;
      });

      if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const { keyBindings } = useGameStore.getState().settings;

      setKeys((k) => {
        const newKeys = { ...k };
        let changed = false;
        if (key === keyBindings.forward && k.w) { newKeys.w = false; changed = true; }
        if (key === keyBindings.backward && k.s) { newKeys.s = false; changed = true; }
        if (key === keyBindings.left && k.a) { newKeys.a = false; changed = true; }
        if (key === keyBindings.right && k.d) { newKeys.d = false; changed = true; }
        if (key === keyBindings.jump && k.jump) { newKeys.jump = false; changed = true; }
        if (key === keyBindings.kick && k.kick) { newKeys.kick = false; changed = true; }
        return changed ? newKeys : k;
      });

      if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) setKeys((k) => k.kick ? k : { ...k, kick: true });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setKeys((k) => !k.kick ? k : { ...k, kick: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [inLobby, socket, playerName]);

  useEffect(() => {
    if (inLobby) return; // Don't send input in lobby

    const interval = setInterval(() => {
      if (!socket) return;

      let dx = 0;
      let dz = 0;
      if (keys.w) dz -= 1;
      if (keys.s) dz += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;

      // Normalize local input
      if (dx !== 0 || dz !== 0) {
        const length = Math.sqrt(dx * dx + dz * dz);
        dx /= length;
        dz /= length;
      }

      // Rotate input vector by camera angle
      const angle = useGameStore.getState().cameraAngle;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Combine keyboard and joystick input
      const isKeyboardMoving = keys.w || keys.s || keys.a || keys.d;
      
      let inputX = dx;
      let inputZ = dz;

      if (!isKeyboardMoving) {
        // Handle joystick input with normalization and deadzone
        const joystickX = joystickInput.x;
        const joystickZ = joystickInput.z;
        const magnitude = Math.sqrt(joystickX * joystickX + joystickZ * joystickZ);
        
        // The library returns values up to the radius (size/2)
        const radius = window.innerWidth < 640 ? 40 : 50;
        const deadzone = 5;

        if (magnitude > deadzone) {
          // Normalize and scale to 0-1 range
          const normalizedMag = Math.min(1, (magnitude - deadzone) / (radius - deadzone));
          inputX = (joystickX / magnitude) * normalizedMag;
          inputZ = (joystickZ / magnitude) * normalizedMag;
        } else {
          inputX = 0;
          inputZ = 0;
        }
      }

      // Correct rotation to align with camera-relative movement
      const x = inputX * cos + inputZ * sin;
      const z = -inputX * sin + inputZ * cos;

      socket.emit('input', { x, z, kick: keys.kick, jump: keys.jump, cameraAngle: angle });
    }, 1000 / 30); // Send input at 30fps

    return () => clearInterval(interval);
  }, [keys, joystickInput, inLobby, socket]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLeaveMatch = () => {
    if (socket) {
      socket.emit('leave');
    }
    setInLobby(true);
    setShowLeaveConfirm(false);
  };

  if (inLobby) {
    return <Lobby />;
  }

  return (
    <div className="w-full h-screen relative bg-gray-900 overflow-hidden">
      <Scene />
      
      {/* UI Overlay */}
      <div className="absolute inset-x-0 top-0 p-2 sm:p-4 flex flex-col items-center pointer-events-none safe-area-inset z-40">
        <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto">
          {/* Blue team block */}
          <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-6 pr-4 sm:pr-8 py-2 md:py-3 bg-vibrant-cyan/5">
            <div className="flex flex-col items-end leading-none">
              <span className="text-[7px] sm:text-[10px] text-vibrant-cyan font-black uppercase italic tracking-widest opacity-80">BLUE</span>
              <span className="text-[10px] sm:text-lg font-black italic text-white truncate max-w-[60px] sm:max-w-[120px] uppercase">
                {gameState.isWorldCup && gameState.worldCupTeams?.blue ? gameState.worldCupTeams.blue : 'TEAM BLUE'}
              </span>
            </div>
            {gameState.isWorldCup && gameState.worldCupTeams?.blue && (
              <div className="w-5 h-3 sm:w-8 sm:h-5 rounded-sm overflow-hidden shadow-md hidden sm:block">
                <img 
                  src={WORLD_CUP_COUNTRIES.find(c => c.name === gameState.worldCupTeams?.blue)?.flag} 
                  alt={gameState.worldCupTeams.blue}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="text-xl sm:text-4xl font-black italic text-vibrant-cyan drop-shadow-[0_0_12px_rgba(0,255,255,0.6)] tabular-nums">
              {gameState.score.blue}
            </div>
          </div>

          {/* Time block */}
          <div className="flex flex-col items-center px-4 sm:px-8 border-x border-white/10 bg-black/20">
            <div className={`text-[8px] sm:text-[10px] font-black uppercase italic tracking-widest leading-none mb-0.5 sm:mb-1 ${gameState.isOvertime ? 'text-vibrant-pink animate-pulse' : 'text-white/40'}`}>
              {gameState.isOvertime ? 'OVERTIME' : 'TIME'}
            </div>
            <div className={`text-lg sm:text-3xl font-black italic font-mono tabular-nums leading-none flex items-center gap-1 sm:gap-2 ${gameState.timer < 10 && gameState.timer > 0 ? 'text-vibrant-pink animate-pulse' : 'text-white'}`}>
              {gameState.isOvertime && <span className="text-[10px] sm:text-xs">OT+</span>}
              {formatTime(gameState.timer)}
            </div>
          </div>

          {/* Red team block */}
          <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-8 pr-4 sm:pr-6 py-2 md:py-3 bg-vibrant-pink/5">
            <div className="text-xl sm:text-4xl font-black italic text-vibrant-pink drop-shadow-[0_0_12px_rgba(255,0,127,0.6)] tabular-nums">
              {gameState.score.red}
            </div>
            {gameState.isWorldCup && gameState.worldCupTeams?.red && (
              <div className="w-5 h-3 sm:w-8 sm:h-5 rounded-sm overflow-hidden shadow-md hidden sm:block">
                <img 
                  src={WORLD_CUP_COUNTRIES.find(c => c.name === gameState.worldCupTeams?.red)?.flag} 
                  alt={gameState.worldCupTeams.red}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[7px] sm:text-[10px] text-vibrant-pink font-black uppercase italic tracking-widest opacity-80">RED</span>
              <span className="text-[10px] sm:text-lg font-black italic text-white truncate max-w-[60px] sm:max-w-[120px] uppercase">
                {gameState.isWorldCup && gameState.worldCupTeams?.red ? gameState.worldCupTeams.red : 'TEAM RED'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Messages (Waiting/Freeplay/Countdown) */}
        {(gameState.matchState === 'waiting' || gameState.matchState === 'freeplay') && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-2 md:mt-4 text-[10px] sm:text-lg font-black uppercase italic text-white/80 animate-pulse bg-black/40 px-4 py-1 sm:px-6 sm:py-2 rounded-full backdrop-blur-md border border-white/10 text-center shadow-xl flex items-center gap-2"
          >
            {gameState.isOvertime && <span className="text-vibrant-pink">OVERTIME!</span>}
            {gameState.message}
          </motion.div>
        )}

        <AnimatePresence>
          {gameState.matchState === 'countdown' && (
            <motion.div
              key={gameState.timer}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3 }}
              className="mt-4 md:mt-8 text-6xl md:text-9xl font-black text-vibrant-yellow drop-shadow-[0_0_30px_rgba(255,255,0,0.8)] italic"
            >
              {gameState.timer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Controls Overlay (Icons & Room Info) */}
      <div className="absolute inset-0 pointer-events-none p-4 safe-area-inset z-30">
        {/* Top Left: Leave */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {!showScoreboard && !showInMatchSettings && (
            <button 
              onClick={() => setShowLeaveConfirm(true)}
              className="pointer-events-auto p-2 sm:px-4 sm:py-2 bg-black/40 hover:bg-vibrant-orange rounded-full border border-white/10 text-white/60 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg flex items-center gap-2 group"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline font-black uppercase italic text-xs tracking-wider">Leave</span>
            </button>
          )}
        </div>

        {/* Top Right: Settings & Room Info */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-3">
          {!showScoreboard && !showInMatchSettings && (
            <button 
              onClick={() => setShowInMatchSettings(true)}
              className="pointer-events-auto p-2 sm:p-3 bg-black/40 hover:bg-vibrant-cyan rounded-full border border-white/10 text-white/60 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
            >
              <Settings size={18} />
            </button>
          )}
          
          {roomId && isPrivate && (
            <div className="bg-black/40 text-white px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto flex flex-col items-end">
              <span className="text-[8px] sm:text-[10px] text-white/40 font-black uppercase italic tracking-widest">PRIVATE ROOM CODE</span>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-lg font-black tracking-widest text-vibrant-yellow select-all">{roomId}</span>
                <button 
                  onClick={handleCopyRoom}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-vibrant-cyan"
                >
                  {copied ? <Check size={14} className="text-vibrant-cyan" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Left: Controls Info (Desktop) */}
        {!isTouchDevice && (
          <div className="absolute bottom-24 left-4 hidden md:block bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl pointer-events-auto">
            <h2 className="text-[10px] font-black italic uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-1">Controls</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">{settings.keyBindings.forward}{settings.keyBindings.left}{settings.keyBindings.backward}{settings.keyBindings.right}</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">{settings.keyBindings.kick === ' ' ? 'SPC' : settings.keyBindings.kick}</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Kick</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">{settings.keyBindings.jump === ' ' ? 'SPC' : settings.keyBindings.jump}</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">T</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Click</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Kick</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Mouse</kbd>
                <span className="text-[10px] text-white/60 font-black uppercase italic">Camera</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Message */}
      <AnimatePresence>
        {gameState.matchState === 'goal' && (
          <GoalOverlay 
            message={gameState.message} 
            lastScorer={gameState.lastScorer}
            isWorldCup={gameState.isWorldCup}
            worldCupTeams={gameState.worldCupTeams}
          />
        )}
      </AnimatePresence>
      {/* Chat Section */}
      <Chat socket={socket} />

      {/* Mobile Controls */}
      {!inLobby && (isTouchDevice || isMobileSize || settings.forceMobileControls) && (
        <MobileControls 
          onMove={(x, y) => setJoystickInput({ x, z: -y })}
          onStop={() => setJoystickInput({ x: 0, z: 0 })}
          onKick={(active) => setKeys(k => ({ ...k, kick: active }))}
          onJump={(active) => setKeys(k => ({ ...k, jump: active }))}
        />
      )}

      {/* Mobile Scoreboard Button */}
      {!inLobby && (
        <div className="fixed bottom-48 right-6 z-50 md:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={() => setShowScoreboard(true)}
            onPointerUp={() => setShowScoreboard(false)}
            className="w-14 h-14 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-white shadow-2xl"
          >
            <Trophy size={24} />
          </motion.button>
        </div>
      )}

      {/* Transitions and Modals */}
      <AnimatePresence>
        {showMatchTransition && <MatchTransition />}
        {showScoreboard && <Scoreboard players={gameState.players} />}
        {showInMatchSettings && (
          <SettingsModal 
            isOpen={showInMatchSettings} 
            onClose={() => setShowInMatchSettings(false)} 
            minimal 
          />
        )}
        {gameState.matchState === 'gameover' && (
          <GameOverTransition 
            message={gameState.message} 
            score={gameState.score} 
            isWorldCup={gameState.isWorldCup}
            worldCupTeams={gameState.worldCupTeams}
          />
        )}
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-vibrant-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={40} className="text-vibrant-orange" />
              </div>
              <h3 className="text-3xl font-black italic text-white uppercase mb-2">Leave Match?</h3>
              <p className="text-white/60 mb-8 font-medium">Are you sure you want to quit the current match and return to the lobby?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLeaveConfirm(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black italic uppercase py-4 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button 
                  onClick={handleLeaveMatch}
                  className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-black italic uppercase py-4 rounded-2xl shadow-[0_6px_0_#c2410c] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {errorMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg z-[200] flex items-center gap-2">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-4 hover:text-white/80">
              <X size={16} />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */

