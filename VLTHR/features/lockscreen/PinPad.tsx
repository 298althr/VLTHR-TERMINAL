'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, initAudio } from '@/lib/audio';

interface PinPadProps {
  onCancel: () => void;
}

export function PinPad({ onCancel }: PinPadProps) {
  const { enteredPin, appendPin, clearPin, pinError } = useAppStore();

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'Cancel'];

  const handlePress = (val: string) => {
    initAudio(); // Ensure context is started
    if (val === 'Cancel') {
      playSound('tap');
      onCancel();
      clearPin();
    } else if (val !== '') {
      playSound('tap');
      appendPin(val);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-[320px]">
      <div className="flex flex-col items-center gap-4">
        <span className="text-white text-lg font-medium">Enter Passcode</span>
        
        {/* PIN Dots */}
        <motion.div 
          animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 h-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-3.5 h-3.5 rounded-full border border-white/40 transition-all duration-200 ${
                enteredPin.length > i ? 'bg-white border-white scale-110' : 'bg-transparent'
              }`}
            />
          ))}
        </motion.div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-5">
        {numbers.map((num, i) => (
          <div key={i} className="flex items-center justify-center">
            {num !== '' ? (
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                onClick={() => handlePress(num)}
                className={`w-[66px] h-[66px] waterglass-sphere rounded-[20px] flex items-center justify-center ${
                  num === 'Cancel' 
                    ? 'text-white text-sm font-medium' 
                    : 'text-white text-[28px] font-semibold'
                }`}
              >
                {num}
              </motion.button>
            ) : (
              <div className="w-20 h-20" />
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => { clearPin(); onCancel(); }}
        className="text-white/60 text-sm font-medium mt-4"
      >
        Emergency
      </button>
    </div>
  );
}
