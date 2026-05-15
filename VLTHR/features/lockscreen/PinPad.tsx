'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, initAudio } from '@/lib/audio';
import { useEffect } from 'react';

interface PinPadProps {
  onCancel: () => void;
}

export function PinPad({ onCancel }: PinPadProps) {
  const { 
    enteredPasscode, appendPasscode, clearPasscode, pinError, 
    validatePasscode, isVerifying, requestCode, lastRequestTime 
  } = useAppStore();

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

  useEffect(() => {
    if (enteredPasscode.length === 6) {
      validatePasscode();
    }
  }, [enteredPasscode, validatePasscode]);

  const handlePress = (val: string) => {
    initAudio();
    if (val !== '') {
      playSound('tap');
      appendPasscode(val);
    }
  };

  const isThrottled = Date.now() - lastRequestTime < 30000;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-[400px] mx-auto">
      <div className="flex flex-col items-center justify-between h-[650px] w-full py-12 md:py-16">
        {/* Top Section - Status */}
        <div className="flex flex-col items-center gap-12">
          <span className="text-white text-[17px] font-medium tracking-tight opacity-90">
            Enter Passcode
          </span>
          
          <motion.div 
            animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-6 h-6 items-center"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  enteredPasscode.length > i 
                    ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                    : 'bg-transparent border-white/30'
                }`}
              />
            ))}
          </motion.div>
        </div>

        {/* Middle Section - Crystal Grid */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 md:gap-x-12 md:gap-y-8">
          {numbers.map((num, i) => (
            <div key={i} className="flex items-center justify-center">
              {num !== '' ? (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePress(num)}
                  disabled={isVerifying}
                  className="w-[78px] h-[78px] md:w-[86px] md:h-[86px] rounded-full waterglass-sphere flex flex-col items-center justify-center transition-all group"
                >
                  <span className="text-white text-[32px] md:text-[36px] font-normal leading-none mb-0.5">
                    {num}
                  </span>
                  {/* Visual Letters for authentic iOS look */}
                  <span className="text-[9px] md:text-[10px] text-white/50 font-bold tracking-widest uppercase">
                    {num === '2' && 'ABC'}
                    {num === '3' && 'DEF'}
                    {num === '4' && 'GHI'}
                    {num === '5' && 'JKL'}
                    {num === '6' && 'MNO'}
                    {num === '7' && 'PQRS'}
                    {num === '8' && 'TUV'}
                    {num === '9' && 'WXYZ'}
                  </span>
                </motion.button>
              ) : (
                <div className="w-[78px] h-[78px] md:w-[86px] md:h-[86px]" />
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom Section - Footer Actions */}
        <div className="flex justify-between w-full px-6">
          <button 
            onClick={() => { playSound('tap'); requestCode(); }}
            disabled={isThrottled}
            className={`text-white/60 hover:text-white text-[15px] font-normal transition-all ${isThrottled ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          >
            {isThrottled ? 'Wait 30s...' : 'Request Code'}
          </button>
          
          <button 
            onClick={() => { playSound('tap'); clearPasscode(); onCancel(); }}
            className="text-white/60 hover:text-white text-[15px] font-normal transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
