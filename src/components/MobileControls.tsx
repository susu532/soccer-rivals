/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import { Joystick } from 'react-joystick-component';
import { motion } from 'motion/react';
import { Zap, ArrowUp } from 'lucide-react';
import { useWindowSize } from '../utils/hooks';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
  onKick: (active: boolean) => void;
  onJump: (active: boolean) => void;
}

export function MobileControls({ onMove, onStop, onKick, onJump }: MobileControlsProps) {
  const { width, height } = useWindowSize();
  const isLandscape = width > height;

  // Dynamically calculate sizes
  const joystickSize = width < 640 ? 80 : 110;
  const buttonSize = width < 640 ? "w-16 h-16" : "w-24 h-24";
  const jumpButtonSize = width < 640 ? "w-14 h-14" : "w-18 h-18";

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none safe-area-inset">
      {/* Joystick Area */}
      <div className={`absolute pointer-events-auto touch-none ${
        isLandscape 
          ? 'bottom-8 left-12' 
          : 'bottom-16 left-8'
      }`}>
        <div className="bg-black/20 backdrop-blur-md p-3 sm:p-5 rounded-full border border-white/20 shadow-2xl">
          <Joystick 
            size={joystickSize} 
            sticky={false} 
            baseColor="rgba(255, 255, 255, 0.05)" 
            stickColor="rgba(0, 255, 255, 0.6)" 
            move={(e) => onMove(e.x || 0, e.y || 0)} 
            stop={onStop} 
          />
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className={`absolute flex gap-4 sm:gap-8 pointer-events-auto items-end ${
        isLandscape 
          ? 'bottom-8 right-12' 
          : 'bottom-16 right-8'
      }`}>
        {/* Jump Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => onJump(true)}
          onPointerUp={() => onJump(false)}
          className={`${jumpButtonSize} bg-vibrant-purple/40 backdrop-blur-xl rounded-full border-2 border-vibrant-purple/50 flex items-center justify-center text-white shadow-[0_0_20px_rgba(157,0,255,0.3)] active:bg-vibrant-purple/60 transition-colors touch-none mb-4`}
        >
          <ArrowUp size={width < 640 ? 24 : 32} />
        </motion.button>

        {/* Kick Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onPointerDown={() => onKick(true)}
          onPointerUp={() => onKick(false)}
          className={`${buttonSize} bg-vibrant-cyan/40 backdrop-blur-xl rounded-full border-4 border-vibrant-cyan/50 flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,255,255,0.3)] active:bg-vibrant-cyan/60 transition-colors touch-none`}
        >
          <Zap size={width < 640 ? 32 : 48} className="fill-current" />
        </motion.button>
      </div>
    </div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
