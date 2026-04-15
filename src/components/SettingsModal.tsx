/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Monitor, Keyboard, Globe, Check, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  minimal?: boolean;
}

export function SettingsModal({ isOpen, onClose, minimal = false }: SettingsModalProps) {
  const { settings, setSettings } = useGameStore();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSettings({ volume });
    soundManager.setVolume(volume);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const [bindingKey, setBindingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!bindingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const newKey = e.key.toLowerCase();
      
      // Don't allow Escape to be bound (it's for closing/canceling)
      if (e.key === 'Escape') {
        setBindingKey(null);
        return;
      }

      const updatedBindings = { ...settings.keyBindings, [bindingKey]: newKey };
      setSettings({ keyBindings: updatedBindings });
      setBindingKey(null);
      soundManager.playClick();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindingKey, settings.keyBindings, setSettings]);

  const resetBindings = () => {
    setSettings({
      keyBindings: {
        forward: 'w',
        backward: 's',
        left: 'a',
        right: 'd',
        jump: ' ',
        kick: 'f',
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-vibrant-cyan p-2 rounded-xl text-black">
                  <Monitor size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Game Settings</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Configure your experience</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Server Selection */}
              {!minimal && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Globe size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Region Selection</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(['europe', 'usa'] as const).map((region) => (
                      <button
                        key={region}
                        onClick={() => setSettings({ server: region })}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                          settings.server === region 
                            ? 'border-vibrant-cyan bg-vibrant-cyan/10 text-white' 
                            : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                        }`}
                      >
                        <span className="font-black italic uppercase tracking-tight">{region}</span>
                        {settings.server === region && <Check size={18} className="text-vibrant-cyan" />}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Audio */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Volume2 size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Audio Control</h3>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/80">Master Volume</span>
                    <span className="text-vibrant-cyan font-black italic">{Math.round(settings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vibrant-cyan"
                  />
                </div>
              </section>

              {/* Key Bindings */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60">
                    <Keyboard size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Key Bindings</h3>
                  </div>
                  <button 
                    onClick={resetBindings}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/20 hover:text-vibrant-yellow transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Reset to Default
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(settings.keyBindings).map(([action, key]) => (
                    <button 
                      key={action} 
                      onClick={() => setBindingKey(action)}
                      className={`flex items-center justify-between p-3 px-4 rounded-xl border transition-all group cursor-pointer ${
                        bindingKey === action 
                          ? 'bg-vibrant-yellow/20 border-vibrant-yellow shadow-[0_0_15px_rgba(255,255,0,0.2)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-wider ${bindingKey === action ? 'text-vibrant-yellow' : 'text-white/40'}`}>
                        {action}
                      </span>
                      <div className={`min-w-[50px] h-8 rounded-lg flex items-center justify-center border transition-all ${
                        bindingKey === action 
                          ? 'bg-vibrant-yellow text-black border-vibrant-yellow' 
                          : 'bg-white/10 text-vibrant-yellow border-white/10 group-hover:bg-white/20'
                      }`}>
                        <span className="font-black uppercase italic text-xs">
                          {bindingKey === action ? '...' : (key === ' ' ? 'SPC' : key)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {bindingKey && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-[10px] font-black uppercase italic text-vibrant-yellow animate-pulse"
                  >
                    Press any key to bind to {bindingKey}... (ESC to cancel)
                  </motion.p>
                )}
              </section>

              {/* Display */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Monitor size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Display Settings</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={toggleFullscreen}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white/80">Toggle Fullscreen</span>
                    <div className="w-10 h-6 bg-white/10 rounded-full relative transition-colors group-hover:bg-white/20">
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full" />
                    </div>
                  </button>

                  <button
                    onClick={() => setSettings({ forceMobileControls: !settings.forceMobileControls })}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      settings.forceMobileControls 
                        ? 'border-vibrant-cyan bg-vibrant-cyan/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm font-bold text-white/80">Force Mobile Controls (Joysticks)</span>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.forceMobileControls ? 'bg-vibrant-cyan' : 'bg-white/10'}`}>
                      <motion.div 
                        animate={{ x: settings.forceMobileControls ? 16 : 0 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                      />
                    </div>
                  </button>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-center">
              <button 
                onClick={onClose}
                className="px-12 py-3 bg-vibrant-cyan hover:bg-vibrant-cyan/80 text-black font-black italic uppercase tracking-tighter rounded-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              >
                Save & Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
