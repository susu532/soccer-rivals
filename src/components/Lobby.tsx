/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Play, Trophy, Info, Gamepad2, User, ChevronRight, X, Edit2, Globe, Palette, Lock, Tv, Loader2, Coins } from 'lucide-react';
import { useGameStore } from '../store';
import { useWindowSize } from '../utils/hooks';
import { SettingsModal } from './SettingsModal';
import { WORLD_CUP_COUNTRIES } from '../constants/countries';
import { CHARACTERS } from '../constants/characters';
import { adManager } from '../utils/ads';

function PlayerPreview() {
  const { width } = useWindowSize();
  const selectedCharacter = useGameStore((state) => state.selectedCharacter);
  const characterConfig = CHARACTERS[selectedCharacter] || CHARACTERS['robot'];
  const group = useRef<THREE.Group>(null);
  const { scene, animations: defaultAnimations } = useGLTF(characterConfig.url);
  
  const animations = useMemo(() => {
    return defaultAnimations.map((anim, index) => {
      const clone = anim.clone();
      if (clone.name === 'mixamo.com') {
        clone.name = `mixamo.com${index}`;
      }
      clone.tracks = clone.tracks.filter(track => !track.name.includes('morphTargetInfluences'));
      clone.tracks.forEach(track => {
        track.name = track.name.replace(/:/g, '').replace(/_\d+(?=\.)/g, '');

        // Remove root motion (horizontal movement) to prevent rubber-banding
        if (track.name.match(/(Hips|Pelvis|Root)\.position/i)) {
          const initialX = track.values[0];
          const initialZ = track.values[2];
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = initialX;
            track.values[i + 2] = initialZ;
          }
        }
      });
      return clone;
    });
  }, [defaultAnimations]);
  
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        child.visible = false;
        (child as THREE.Light).intensity = 0;
      }
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;
        
        // Adjust material for custom models to remove all shiny reflections
        if (characterConfig.isCustom) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(mat => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                const m = mat.clone();
                m.envMapIntensity = 0;
                m.metalness = 0;
                m.roughness = 1;
                m.emissive = new THREE.Color(0x000000);
                return m;
              }
              return mat;
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
            mesh.material = mesh.material.clone();
            mesh.material.envMapIntensity = 0;
            mesh.material.metalness = 0;
            mesh.material.roughness = 1;
            mesh.material.emissive = new THREE.Color(0x000000);
          }
        }
      }
    });
    return clone;
  }, [scene, characterConfig.isCustom]);
  
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length === 0) return;
    const idleAnim = characterConfig.animations.idle;
    // Try to find the action, fallback to first available if not found
    const actionName = actions[idleAnim] ? idleAnim : (names[0] || '');
    
    if (actionName && actions[actionName]) {
      const action = actions[actionName];
      action.reset().fadeIn(0.3).play();
      return () => {
        action.fadeOut(0.3);
      };
    }
  }, [actions, characterConfig, names]);

  // Normalize scale and position based on character config
  const baseScale = width < 768 ? 0.45 : 0.6;
  const normalization = 1 / (CHARACTERS['robot']?.scale || 0.4);
  const normalizedScale = characterConfig.scale * normalization * baseScale;
  let normalizedY = characterConfig.yOffset * normalization * baseScale;
  
  // Elevate fox and lower others specifically in the lobby
  if (selectedCharacter === 'fox') {
    normalizedY += 0.6 * baseScale; 
  } else {
    normalizedY -= 0.8 * baseScale;
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={group} dispose={null}>
        <primitive 
          object={clonedScene} 
          scale={normalizedScale} 
          position={[0, normalizedY, 0]} 
          rotation={[
            characterConfig.rotationOffset[0],
            characterConfig.rotationOffset[1] - Math.PI / 4,
            characterConfig.rotationOffset[2]
          ]} 
        />
      </group>
    </Float>
  );
}

function CharacterModel({ charKey }: { charKey: string }) {
  const characterConfig = CHARACTERS[charKey];
  const { scene, animations: defaultAnimations } = useGLTF(characterConfig.url);
  const group = useRef<THREE.Group>(null);
  
  const animations = useMemo(() => {
    return defaultAnimations.map((anim, index) => {
      const clone = anim.clone();
      if (clone.name === 'mixamo.com') {
        clone.name = `mixamo.com${index}`;
      }
      clone.tracks = clone.tracks.filter(track => !track.name.includes('morphTargetInfluences'));
      clone.tracks.forEach(track => {
        track.name = track.name.replace(/:/g, '').replace(/_\d+(?=\.)/g, '');

        // Remove root motion (horizontal movement) to prevent rubber-banding
        if (track.name.match(/(Hips|Pelvis|Root)\.position/i)) {
          const initialX = track.values[0];
          const initialZ = track.values[2];
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] = initialX;
            track.values[i + 2] = initialZ;
          }
        }
      });
      return clone;
    });
  }, [defaultAnimations]);

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        child.visible = false;
        (child as THREE.Light).intensity = 0;
      }
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;

        // Adjust material for custom models to remove all shiny reflections
        if (characterConfig.isCustom) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(mat => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                const m = mat.clone();
                m.envMapIntensity = 0;
                m.metalness = 0;
                m.roughness = 1;
                m.emissive = new THREE.Color(0x000000);
                return m;
              }
              return mat;
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
            mesh.material = mesh.material.clone();
            mesh.material.envMapIntensity = 0;
            mesh.material.metalness = 0;
            mesh.material.roughness = 1;
            mesh.material.emissive = new THREE.Color(0x000000);
          }
        }
      }
    });
    return clone;
  }, [scene, characterConfig.isCustom]);

  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length === 0) return;
    const idleAnim = characterConfig.animations.idle;
    const actionName = actions[idleAnim] ? idleAnim : (names[0] || '');
    
    if (actionName && actions[actionName]) {
      const action = actions[actionName];
      action.reset().fadeIn(0.3).play();
      return () => {
        action.fadeOut(0.3);
      };
    }
  }, [actions, characterConfig, names]);

  // Normalize scale and position for icons
  const normalization = 1 / (CHARACTERS['robot']?.scale || 0.4);
  const iconScale = characterConfig.scale * normalization * 0.5;
  let iconY = characterConfig.yOffset * normalization * 0.5;
  
  // Elevate fox and lower others specifically in the customization preview
  if (charKey === 'fox') {
    iconY += 0.3;
  } else {
    iconY -= 0.4;
  }

  return (
    <group ref={group} dispose={null}>
      <primitive 
        object={clonedScene} 
        scale={iconScale} 
        position={[0, iconY, 0]} 
        rotation={[
          characterConfig.rotationOffset[0],
          characterConfig.rotationOffset[1] - Math.PI / 6,
          characterConfig.rotationOffset[2]
        ]} 
      />
    </group>
  );
}

function CharacterIconPreview({ charKey }: { charKey: string }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={2} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <CharacterModel charKey={charKey} />
        </Suspense>
      </Canvas>
    </div>
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
  const selectedCharacter = useGameStore((state) => state.selectedCharacter);
  const setSelectedCharacter = useGameStore((state) => state.setSelectedCharacter);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showModesModal, setShowModesModal] = useState(false);
  const [showWorldCupModal, setShowWorldCupModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const unlockedCharacters = useGameStore((state) => state.unlockedCharacters);
  const unlockCharacter = useGameStore((state) => state.unlockCharacter);
  const coins = useGameStore((state) => state.coins);
  const exp = useGameStore((state) => state.exp);
  const addCoins = useGameStore((state) => state.addCoins);
  const [isWatchingAd, setIsWatchingAd] = useState<string | null>(null);

  const level = Math.floor(exp / 100) + 1;
  const expInLevel = exp % 100;
  const expProgress = expInLevel; // percentage if 100 is max per level

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Splash Screen Transition */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gray-950 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vibrant-cyan/20 via-gray-900 to-gray-950"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="relative z-10 flex flex-col items-center gap-8"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.3 }}
              >
                <img 
                  src="/logo.png" 
                  alt="Soccer Rivals Logo" 
                  className="w-40 h-40 md:w-56 md:h-56 mix-blend-multiply brightness-125 contrast-125" 
                />
              </motion.div>
              
              <motion.div className="flex flex-col items-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-5xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] text-center"
                >
                  SOCCER<span className="text-vibrant-yellow drop-shadow-[0_0_20px_rgba(255,255,0,0.6)]"> RIVALS 3D</span>
                </motion.h1>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "150%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.7 }}
                  className="h-1 lg:h-2 mt-4 bg-gradient-to-r from-transparent via-vibrant-cyan to-transparent rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                />
              </motion.div>
            </motion.div>

            {/* Decorative particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
              <motion.div 
                animate={{ y: ["-10%", "110%"], x: ["-5%", "5%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-[20%] w-1 h-32 bg-vibrant-pink/50 blur-md rounded-full transform -skew-x-[30deg]"
              />
              <motion.div 
                animate={{ y: ["-10%", "110%"], x: ["5%", "-5%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                className="absolute top-0 right-[30%] w-2 h-40 bg-vibrant-cyan/50 blur-md rounded-full transform -skew-x-[30deg]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Blobs for playfulness */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vibrant-cyan/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-vibrant-yellow/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Bottom Left: Copyright */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-50 pointer-events-none">
        <p className="text-[8px] md:text-[10px] text-white/30 font-black italic uppercase tracking-widest">
          © 2026 hentertrabelsi - All Rights Reserved
        </p>
         <p className="text-[8px] md:text-[10px] text-white/30 font-black italic uppercase tracking-widest">
          Discord: #susuxo
        </p>
      </div>
      
      {/* Top Left: Settings & Region */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 flex gap-2">
        {!showJoinModal && !showSettings && !showCustomizeModal && (
          <>
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ rotate: 90, scale: 1.1 }}
              onClick={() => setShowSettings(true)}
              className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-vibrant-cyan hover:border-vibrant-cyan/50 transition-all cursor-pointer shadow-xl group"
            >
              <Settings size={18} className="md:w-[22px] md:h-[22px] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
            </motion.button>
            
            {/* Region Selector */}
            <div className="relative group/region">
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-vibrant-yellow hover:border-vibrant-yellow/50 transition-all cursor-pointer shadow-xl flex items-center gap-2"
              >
                <Globe size={18} className="md:w-[22px] md:h-[22px]" />
                <span className="text-[10px] md:text-sm font-black italic uppercase text-white/80">
                  {useGameStore.getState().settings.server === 'usa' ? 'USA' : 'EU'}
                </span>
              </motion.button>
              
              <div className="absolute top-full left-0 mt-2 opacity-0 group-hover/region:opacity-100 pointer-events-none group-hover/region:pointer-events-auto transition-all flex flex-col gap-1 w-32 z-[100]">
                <button 
                  onClick={() => useGameStore.getState().setSettings({ server: 'usa' })}
                  className={`bg-black/80 backdrop-blur-md p-2 rounded-lg border text-left font-black italic uppercase text-[10px] transition-all cursor-pointer ${useGameStore.getState().settings.server === 'usa' ? 'text-vibrant-yellow border-vibrant-yellow/50' : 'text-white/60 border-white/10 hover:text-white hover:bg-white/5'}`}
                >
                  🇺🇸 USA East
                </button>
                <button 
                  onClick={() => useGameStore.getState().setSettings({ server: 'europe' })}
                  className={`bg-black/80 backdrop-blur-md p-2 rounded-lg border text-left font-black italic uppercase text-[10px] transition-all cursor-pointer ${useGameStore.getState().settings.server === 'europe' ? 'text-vibrant-yellow border-vibrant-yellow/50' : 'text-white/60 border-white/10 hover:text-white hover:bg-white/5'}`}
                >
                  🇪🇺 EU Frankfurt
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Right: Profile Card */}
      {!showCustomizeModal && (
        <div className="absolute top-32 right-4 md:top-6 md:right-6 z-50 flex flex-col items-end gap-2 md:gap-3 scale-[0.8] md:scale-100 origin-right">
          {/* Profile Card */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-2xl p-2 md:p-2 pr-5 md:pr-5 rounded-2xl md:rounded-2xl border border-white/10 shadow-2xl group hover:border-vibrant-cyan/30 transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-vibrant-cyan via-vibrant-purple to-vibrant-pink rounded-xl md:rounded-xl flex items-center justify-center text-black shadow-lg transform group-hover:scale-105 transition-transform overflow-hidden">
                {selectedWorldCupCountry ? (
                  <img 
                    src={WORLD_CUP_COUNTRIES.find(c => c.name === selectedWorldCupCountry)?.flag} 
                    alt={selectedWorldCupCountry}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={20} className="md:w-6 md:h-6" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-vibrant-yellow text-[8px] md:text-[10px] font-black text-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-xl">
                LV.{level}
              </div>
            </div>
            
            <div className="flex flex-col min-w-[100px] md:min-w-[140px]">
              <div className="flex items-center justify-between group/input relative">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-white font-black text-xs md:text-base leading-tight bg-transparent border-b-2 border-transparent focus:border-vibrant-cyan focus:outline-none transition-all w-full placeholder:text-white/20 italic uppercase tracking-tight cursor-pointer pr-6"
                  placeholder="NAME"
                  maxLength={16}
                />
                <Edit2 size={10} className="absolute right-0 text-white/20 group-hover/input:text-vibrant-cyan transition-colors pointer-events-none" />
              </div>
              
              <div className="flex flex-col mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${expProgress}%` }}
                      className="h-full bg-gradient-to-r from-vibrant-cyan to-vibrant-purple shadow-[0_0_8px_rgba(0,255,255,0.5)]"
                    />
                  </div>
                  <span className="text-[8px] font-black text-white/40 italic uppercase">XP</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coins & Ad Bar */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1.5 md:p-1.5 pr-4 md:pr-4 rounded-xl md:rounded-xl border border-white/10 shadow-xl hover:border-vibrant-yellow/30 transition-all"
          >
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 bg-vibrant-yellow rounded-lg md:rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,0,0.4)] animate-pulse">
                <Coins size={14} className="md:w-[14px] md:h-[14px]" />
              </div>
              <span className="text-vibrant-yellow font-black italic text-sm md:text-base drop-shadow-md">{coins}</span>
            </div>
            
            <div className="w-px h-5 bg-white/10 mx-1"></div>
            
            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsWatchingAd('reward');
                adManager.triggerRewarded(() => {
                  addCoins(100);
                  setIsWatchingAd(null);
                });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink px-3 md:px-3 py-1.5 md:py-1.5 rounded-lg md:rounded-lg shadow-lg hover:shadow-vibrant-orange/20 transition-all group/ad"
            >
              <Tv size={14} className="text-white group-hover/ad:animate-bounce md:w-[14px] md:h-[14px]" />
              <span className="text-[10px] font-black uppercase italic text-white whitespace-nowrap">+100</span>
            </motion.button>
          </motion.div>
        </div>
      )}

  <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Center: Title */}
      {!showCustomizeModal && (
        <div className="absolute top-16 sm:top-20 md:top-24 left-1/2 -translate-x-1/2 text-center w-full max-w-[90vw] px-4 z-10 pointer-events-none">
          <motion.h1 
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="text-[clamp(1.5rem,8vw,5.5rem)] font-black italic tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex flex-row items-baseline justify-center gap-3 sm:gap-4 leading-none select-none whitespace-nowrap"
          >
            <span>SOCCER</span>
            <span className="text-vibrant-yellow drop-shadow-[0_0_15px_rgba(255,255,0,0.5)]">RIVALS 3D</span>
          </motion.h1>
        </div>
      )}

      {/* Center: 3D Preview */}
      <div 
        className={`absolute top-0 left-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${
          showCustomizeModal 
            ? 'w-full h-[45%] md:h-full md:w-1/2 z-40' 
            : 'w-full h-full z-0'
        }`}
      >
        <div className={`w-full h-full transition-all duration-500 ${
          showCustomizeModal ? 'max-w-none max-h-none' : 'max-w-2xl max-h-[400px] md:max-h-[600px] -translate-y-10 md:translate-y-0'
        }`}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={2} color="#9d00ff" />
            <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <PlayerPreview key={selectedCharacter} />
            </Suspense>
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          </Canvas>
        </div>
      </div>
       {/* Left Side: Buttons */}
      {!showCustomizeModal && (
        <div className="absolute left-1/2 md:left-10 top-[60%] md:top-1/2 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 flex flex-col gap-3 md:gap-4 w-auto md:w-64 z-20 pointer-events-none">
          <div className="flex flex-row md:flex-col gap-2 md:gap-4 pointer-events-auto items-center justify-center">
            <motion.button 
              whileHover={{ x: 10, scale: 1.05 }}
              onClick={() => setShowCustomizeModal(true)}
              className="w-32 md:w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-black text-[10px] sm:text-sm md:text-xl py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-1.5 md:gap-3 shadow-[0_4px_0_#c2410c] md:shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic"
            >
              <Settings size={16} className="md:w-6 md:h-6" />
              <span className="hidden sm:inline">Customize</span>
              <span className="sm:hidden">Skins</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ x: 10, scale: 1.05 }}
              onClick={() => setShowModesModal(true)}
              className="w-32 md:w-full bg-vibrant-cyan hover:bg-vibrant-cyan/90 text-black font-black text-[10px] sm:text-sm md:text-xl py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl flex items-center justify-center md:justify-start gap-1.5 md:gap-3 shadow-[0_4px_0_#0891b2] md:shadow-[0_8px_0_#0891b2] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic"
            >
              <Gamepad2 size={16} className="md:w-6 md:h-6" />
              Modes
            </motion.button>
          </div>

          <div className="hidden md:block bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl pointer-events-auto">
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
      )}

      {/* Mobile News Section */}
      {!showCustomizeModal && (
        <div className="md:hidden absolute left-2 top-[30%] z-20 pointer-events-auto scale-[clamp(0.1,2vw,0.15)] origin-left" hidden>
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl w-48">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-vibrant-cyan font-black italic text-base uppercase">News</h3>
              <Info size={12} className="text-white/40" />
            </div>
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => setShowWorldCupModal(true)}
                className="bg-vibrant-yellow/10 p-2.5 rounded-xl border border-vibrant-yellow/20 flex items-center gap-3 cursor-pointer"
              >
                <Globe size={16} className="text-vibrant-yellow" />
                <span className="text-white/80 text-xs font-black uppercase italic">World Cup</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl flex items-center gap-3">
                <Trophy size={16} className="text-vibrant-yellow" />
                <span className="text-white/80 text-xs font-black uppercase italic">Kickoff!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Side: Live Arenas */}
    

      {/* Bottom: Play Buttons */}
      {!showCustomizeModal && (
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

          <div className="flex gap-2 md:gap-4 w-auto md:w-auto">
          
            <motion.button 
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              className="bg-vibrant-cyan hover:bg-vibrant-cyan/90 text-black font-black py-2.5 md:py-3 px-6 md:px-8 rounded-xl md:rounded-xl shadow-[0_4px_0_#0891b2] md:shadow-[0_6px_0_#0891b2] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic text-[10px] md:text-base min-w-[100px] md:min-w-0"
            >
              Create
            </motion.button>
            <motion.button 
              onClick={() => setShowJoinModal(true)}
              whileHover={{ scale: 1.05 }}
              className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white font-black py-2.5 md:py-3 px-6 md:px-8 rounded-xl md:rounded-xl shadow-[0_4px_0_#6b21a8] md:shadow-[0_6px_0_#6b21a8] active:shadow-none active:translate-y-1 transition-all cursor-pointer uppercase italic text-[10px] md:text-base min-w-[100px] md:min-w-0"
            >
              Join Private
            </motion.button>
          </div>
        </div>
      )}

     

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

      {/* Customize Full Page Overlay */}
      <AnimatePresence>
        {showCustomizeModal && (
          <motion.div 
            initial={{ opacity: 0, x: '100vw' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100vw' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 md:left-1/2 md:w-1/2 h-full bg-black/95 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 z-[60] flex flex-col p-4 sm:p-6 md:p-12 md:rounded-none overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase leading-none">Customize</h3>
                <p className="text-vibrant-orange text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Select your character</p>
              </div>
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors border border-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {Object.keys(CHARACTERS).map((charKey) => {
                  const isUnlocked = unlockedCharacters.includes(charKey);
                  return (
                    <button
                      key={charKey}
                      onClick={() => {
                        const config = CHARACTERS[charKey];
                        if (isUnlocked) {
                          setSelectedCharacter(charKey as 'robot' | 'fox' | 'cristiano ronaldo' | 'kobe' | 'lamin yamal');
                        } else if (config.unlockType === 'coins') {
                          if (coins >= (config.price || 0)) {
                            addCoins(-(config.price || 0));
                            unlockCharacter(charKey);
                            setSelectedCharacter(charKey as 'robot' | 'fox' | 'cristiano ronaldo' | 'kobe' | 'lamin yamal');
                          }
                        } else if (config.unlockType === 'ads') {
                          setIsWatchingAd(charKey);
                          adManager.triggerRewarded(() => {
                            unlockCharacter(charKey);
                            setSelectedCharacter(charKey as 'robot' | 'fox' | 'cristiano ronaldo' | 'kobe' | 'lamin yamal');
                            setIsWatchingAd(null);
                          });
                        }
                      }}
                      className={`p-6 md:p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden ${
                        selectedCharacter === charKey
                          ? 'border-vibrant-orange bg-vibrant-orange/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      } ${!isUnlocked ? 'grayscale-[0.8] opacity-80' : ''}`}
                    >
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative">
                        <Suspense fallback={<User size={48} className="text-white/10 animate-pulse" />}>
                          <CharacterIconPreview charKey={charKey} />
                        </Suspense>
                        
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10">
                            {CHARACTERS[charKey].unlockType === 'coins' ? (
                              <>
                                <div className="bg-vibrant-yellow p-2 rounded-full text-black shadow-[0_0_15px_rgba(255,255,0,0.5)]">
                                  <Coins size={20} />
                                </div>
                                <span className={`text-[24px] font-black uppercase italic ${coins >= (CHARACTERS[charKey].price || 0) ? 'text-vibrant-yellow' : 'text-red-500'}`}>
                                  {CHARACTERS[charKey].price}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="bg-vibrant-yellow p-2 rounded-full text-black shadow-[0_0_15px_rgba(255,255,0,0.5)]">
                                  <Tv size={20} />
                                </div>
                                <span className="text-[12px] font-black uppercase italic text-vibrant-yellow">Watch Ad</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg md:text-xl font-black uppercase italic text-center ${
                          selectedCharacter === charKey ? 'text-white' : 'text-white/40'
                        }`}>
                          {charKey.replace(/_/g, ' ')}
                        </span>
                        {!isUnlocked && <Lock size={14} className="text-white/20" />}
                      </div>
                      {selectedCharacter === charKey && (
                        <motion.div 
                          layoutId="selected-character-glow"
                          className="absolute inset-0 bg-vibrant-orange/5 pointer-events-none"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-black italic uppercase py-5 md:py-6 text-lg md:text-xl rounded-2xl shadow-[0_8px_0_#c2410c] active:shadow-none active:translate-y-2 transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                <Palette size={24} />
                Confirm Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Simulation Overlay */}
      <AnimatePresence>
        {isWatchingAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-8 text-vibrant-cyan"
            >
              <Loader2 size={64} />
            </motion.div>
            <h2 className="text-4xl font-black italic text-white uppercase mb-2">Watching Ad...</h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">Unlocking {isWatchingAd} character</p>
            
            <div className="mt-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-full bg-vibrant-cyan"
              />
            </div>
            
            <p className="mt-4 text-[10px] text-white/20 uppercase font-black tracking-tighter italic">
              Placeholder for future ad implementation
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
