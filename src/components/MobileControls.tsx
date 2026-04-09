import { Joystick } from 'react-joystick-component';
import { motion } from 'motion/react';
import { Zap, ArrowUp } from 'lucide-react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
  onKick: (active: boolean) => void;
  onJump: (active: boolean) => void;
}

export function MobileControls({ onMove, onStop, onKick, onJump }: MobileControlsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none">
      {/* Joystick Area */}
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 pointer-events-auto touch-none">
        <div className="bg-black/20 backdrop-blur-sm p-3 sm:p-4 rounded-full border border-white/10">
          <Joystick 
            size={window.innerWidth < 640 ? 80 : 100} 
            sticky={false} 
            baseColor="rgba(255, 255, 255, 0.1)" 
            stickColor="rgba(0, 255, 255, 0.5)" 
            move={(e) => onMove(e.x || 0, e.y || 0)} 
            stop={onStop} 
          />
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 flex gap-4 sm:gap-6 pointer-events-auto items-end">
        {/* Jump Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onPointerDown={() => onJump(true)}
          onPointerUp={() => onJump(false)}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-vibrant-purple/40 backdrop-blur-md rounded-full border-2 border-vibrant-purple/50 flex items-center justify-center text-white shadow-2xl active:bg-vibrant-purple/60 transition-colors touch-none"
        >
          <ArrowUp size={24} className="sm:w-8 sm:h-8" />
        </motion.button>

        {/* Kick Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onPointerDown={() => onKick(true)}
          onPointerUp={() => onKick(false)}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-vibrant-cyan/40 backdrop-blur-md rounded-full border-2 border-vibrant-cyan/50 flex items-center justify-center text-white shadow-2xl active:bg-vibrant-cyan/60 transition-colors touch-none"
        >
          <Zap size={32} className="sm:w-10 sm:h-10 fill-current" />
        </motion.button>
      </div>
    </div>
  );
}
