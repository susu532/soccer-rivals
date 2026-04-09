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
import { soundManager } from './utils/audio';
import { LogOut, X, Check, Trophy, Settings, Copy } from 'lucide-react';
import { WORLD_CUP_COUNTRIES } from './constants/countries';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const socketRef = useRef<Socket | null>(null);
  const setGameState = useGameStore((state) => state.setGameState);
  const setMyId = useGameStore((state) => state.setMyId);
  const gameState = useGameStore((state) => state.gameState);
  const inLobby = useGameStore((state) => state.inLobby);
  const setInLobby = useGameStore((state) => state.setInLobby);
  const playerName = useGameStore((state) => state.playerName);
  const selectedWorldCupCountry = useGameStore((state) => state.selectedWorldCupCountry);
  const settings = useGameStore((state) => state.settings);

  const roomId = useGameStore((state) => state.roomId);
  const isPrivate = useGameStore((state) => state.isPrivate);

  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, jump: false, kick: false });
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMatchTransition, setShowMatchTransition] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showInMatchSettings, setShowInMatchSettings] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickInput, setJoystickInput] = useState({ x: 0, z: 0 });
  const prevMatchStateRef = useRef(gameState.matchState);
  const prevRoomIdRef = useRef(roomId);

  // Handle room transition animation
  useEffect(() => {
    if (prevRoomIdRef.current === 'FREEPLAY' && roomId && roomId !== 'FREEPLAY') {
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
    };
    window.addEventListener('keydown', initAudio);
    window.addEventListener('mousedown', initAudio);
    return () => {
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
    };
  }, []);

  // Handle match state sounds
  useEffect(() => {
    if (prevMatchStateRef.current !== gameState.matchState) {
      if (gameState.matchState === 'playing') {
        soundManager.playWhistle();
      } else if (gameState.matchState === 'goal') {
        soundManager.playGoal();
      } else if (gameState.matchState === 'gameover') {
        soundManager.playWhistle();
        setTimeout(() => soundManager.playWhistle(), 400); // Double whistle for game over
      }
      prevMatchStateRef.current = gameState.matchState;
    }
  }, [gameState.matchState]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    soundManager.init();
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
      transports: ['websocket'], // Prefer websockets for game logic
      reconnection: true,
    });
    
    socketRef.current = newSocket;

    newSocket.on('init', ({ id, state, roomId, isPrivate }) => {
      setMyId(id);
      setGameState(state);
      useGameStore.getState().setRoomId(roomId, isPrivate);
    });

    newSocket.on('update', (state) => {
      setGameState(state);
    });

    newSocket.on('playerLeft', (id) => {
      if (id === socketRef.current?.id) {
        setInLobby(true);
        useGameStore.getState().setRoomId(null);
      }
    });

    newSocket.on('roomCreated', (roomId) => {
      console.log('Created private room:', roomId);
    });

    newSocket.on('error', (msg) => {
      alert(msg);
      setInLobby(true);
    });

    newSocket.on('matchEnded', () => {
      setInLobby(true);
      useGameStore.getState().setRoomId(null);
    });

    newSocket.on('goal', ({ team, score }) => {
      console.log(`Goal for ${team}! Score:`, score);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [setGameState, setMyId, settings.server]); // Re-connect when server setting changes

  useEffect(() => {
    if (inLobby) {
      if (socketRef.current) {
        socketRef.current.emit('leave');
      }
      return;
    }

    if (socketRef.current) {
      const { joinMode, roomCodeToJoin, trainingDifficulty, selectedWorldCupCountry, isWorldCup } = useGameStore.getState();
      const payload = { name: playerName || 'Player', worldCupCountry: selectedWorldCupCountry, isWorldCup };
      
      if (joinMode === 'create') {
        socketRef.current.emit('createPrivateRoom', payload);
      } else if (joinMode === 'join' && roomCodeToJoin) {
        socketRef.current.emit('joinPrivateRoom', { ...payload, roomCode: roomCodeToJoin });
      } else if (joinMode === 'training' && trainingDifficulty) {
        socketRef.current.emit('startTraining', { ...payload, difficulty: trainingDifficulty });
      } else {
        socketRef.current.emit('joinQueue', payload);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const { keyBindings } = useGameStore.getState().settings;

      setKeys((k) => {
        let newKeys = { ...k };
        let changed = false;
        if ((key === keyBindings.forward || key === 'z') && !k.w) { newKeys.w = true; changed = true; }
        if (key === keyBindings.backward && !k.s) { newKeys.s = true; changed = true; }
        if ((key === keyBindings.left || key === 'q') && !k.a) { newKeys.a = true; changed = true; }
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
        let newKeys = { ...k };
        let changed = false;
        if ((key === keyBindings.forward || key === 'z') && k.w) { newKeys.w = false; changed = true; }
        if (key === keyBindings.backward && k.s) { newKeys.s = false; changed = true; }
        if ((key === keyBindings.left || key === 'q') && k.a) { newKeys.a = false; changed = true; }
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
  }, [inLobby]);

  useEffect(() => {
    if (inLobby) return; // Don't send input in lobby

    const interval = setInterval(() => {
      if (!socketRef.current) return;

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

      socketRef.current.emit('input', { x, z, kick: keys.kick, jump: keys.jump, cameraAngle: angle });
    }, 1000 / 30); // Send input at 30fps

    return () => clearInterval(interval);
  }, [keys, joystickInput, inLobby]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLeaveMatch = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave');
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
      <div className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="bg-black/40 text-white p-2 md:p-6 rounded-lg md:rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <h1 className="text-xs sm:text-lg md:text-3xl font-black italic tracking-tighter mb-0.5 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-vibrant-cyan to-vibrant-pink">
              SOCCER RIVALS 3D
            </h1>
            {!(gameState.matchState === 'freeplay' && gameState.isWorldCup) && (
              <div className="flex gap-3 md:gap-8 text-sm sm:text-lg md:text-2xl font-black italic">
                <div className="text-vibrant-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] flex items-center gap-1 md:gap-2">
                  {gameState.isWorldCup && gameState.worldCupTeams?.blue && (
                    <img 
                      src={WORLD_CUP_COUNTRIES.find(c => c.name === gameState.worldCupTeams?.blue)?.flag} 
                      alt={gameState.worldCupTeams.blue}
                      className="w-4 h-3 md:w-6 md:h-4 object-cover rounded-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {gameState.isWorldCup && gameState.worldCupTeams?.blue ? gameState.worldCupTeams.blue : 'BLUE'}: {gameState.score.blue}
                </div>
                <div className="text-vibrant-pink drop-shadow-[0_0_10px_rgba(255,0,127,0.5)] flex items-center gap-1 md:gap-2">
                  {gameState.isWorldCup && gameState.worldCupTeams?.red ? gameState.worldCupTeams.red : 'RED'}: {gameState.score.red}
                  {gameState.isWorldCup && gameState.worldCupTeams?.red && (
                    <img 
                      src={WORLD_CUP_COUNTRIES.find(c => c.name === gameState.worldCupTeams?.red)?.flag} 
                      alt={gameState.worldCupTeams.red}
                      className="w-4 h-3 md:w-6 md:h-4 object-cover rounded-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLeaveConfirm(true)}
            className="pointer-events-auto bg-white/5 hover:bg-vibrant-orange/20 text-white/60 hover:text-vibrant-orange px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg border border-white/10 hover:border-vibrant-orange/30 backdrop-blur-md flex items-center gap-1.5 md:gap-2 font-black italic uppercase text-[8px] md:text-[10px] tracking-widest transition-all shadow-lg cursor-pointer w-fit"
          >
            <LogOut size={12} className="md:w-[14px] md:h-[14px]" />
            Leave
          </button>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-4 items-end pointer-events-auto">
          {!inLobby && !showScoreboard && !showInMatchSettings && !showMatchTransition && gameState.matchState !== 'gameover' && gameState.matchState !== 'goal' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ rotate: 90, scale: 1.1 }}
              onClick={() => setShowInMatchSettings(true)}
              className="p-2 md:p-3 rounded-lg md:rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-vibrant-cyan hover:border-vibrant-cyan/50 transition-all cursor-pointer shadow-xl group mb-1 md:mb-2"
            >
              <Settings size={18} className="md:w-[22px] md:h-[22px] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
            </motion.button>
          )}
          
          {roomId && isPrivate && (
            <div className="bg-black/50 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg pointer-events-auto flex flex-col items-end">
              <span className="text-[8px] md:text-[10px] text-white/60 font-bold uppercase tracking-widest">Room</span>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-sm md:text-xl font-black tracking-widest text-vibrant-yellow select-all">{roomId}</span>
                <button 
                  onClick={handleCopyRoom}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-vibrant-cyan"
                  title="Copy Room Code"
                >
                  {copied ? <Check size={12} className="text-vibrant-cyan md:w-[14px] md:h-[14px]" /> : <Copy size={12} className="md:w-[14px] md:h-[14px]" />}
                </button>
              </div>
            </div>
          )}
          <div className="hidden md:block bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm text-sm">
            <h2 className="font-bold mb-2">Controls</h2>
            <ul className="space-y-1">
              <li><kbd className="bg-gray-700 px-2 py-1 rounded">WASD / ZQSD</kbd> Move</li>
              <li><kbd className="bg-gray-700 px-2 py-1 rounded">F / Click</kbd> Kick</li>
              <li><kbd className="bg-gray-700 px-2 py-1 rounded">SPACE</kbd> Jump</li>
              <li><kbd className="bg-gray-700 px-2 py-1 rounded">T</kbd> Toggle Chat</li>
              <li><kbd className="bg-gray-700 px-2 py-1 rounded">Mouse</kbd> Rotate Camera</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top Center Timer */}
      <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="relative">
          <div className="bg-black/40 text-vibrant-yellow px-4 py-1.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/10 text-xl md:text-4xl font-black italic shadow-2xl flex items-center gap-2">
            {gameState.isOvertime && (
              <span className="text-[10px] md:text-xs bg-vibrant-pink text-white px-1.5 py-0.5 rounded uppercase not-italic tracking-tighter animate-pulse">OT</span>
            )}
            {gameState.matchState === 'countdown' ? '3:00' : formatTime(gameState.timer)}
          </div>
        </div>
        
        {(gameState.matchState === 'waiting' || gameState.matchState === 'freeplay') && (
          <div className="mt-1 md:mt-2 text-xs md:text-lg font-bold text-white/80 animate-pulse bg-black/40 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-md border border-white/10 whitespace-pre-line text-center">
            {gameState.message}
          </div>
        )}

        <AnimatePresence>
          {gameState.matchState === 'countdown' && (
            <motion.div
              key={gameState.timer}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3 }}
              className="mt-2 md:mt-4 text-5xl md:text-8xl font-black text-vibrant-yellow drop-shadow-[0_0_30px_rgba(255,255,0,0.8)] italic"
            >
              {gameState.timer}
            </motion.div>
          )}
        </AnimatePresence>
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
      <Chat socket={socketRef.current} />

      {/* Mobile Controls */}
      {!inLobby && (isTouchDevice || settings.forceMobileControls) && (
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
      </AnimatePresence>
    </div>
  );
}

/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */

