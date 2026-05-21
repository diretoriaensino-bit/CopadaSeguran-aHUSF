import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface SoccerCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  isGoal: boolean;
}

export function SoccerCelebration({ isVisible, onComplete, isGoal }: SoccerCelebrationProps) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowText(true);
      
      // Play Sound
      const goalAudio = 'https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3';
      const missAudio = 'https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3'; // Using same but could be different
      const audio = new Audio(isGoal ? goalAudio : missAudio);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio playback prevented:', e));

      if (isGoal) {
        // Explosion of confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#10b981', '#ffffff', '#064e3b'] 
          });
          confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#10b981', '#ffffff', '#064e3b']
          });
        }, 250);

        const timer = setTimeout(() => {
          setShowText(false);
          onComplete();
        }, 4000);

        return () => {
          clearInterval(interval);
          clearTimeout(timer);
        };
      } else {
        // Just show text then complete
        const timer = setTimeout(() => {
          setShowText(false);
          onComplete();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, onComplete, isGoal]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Soccer Ball flying across */}
          <motion.div
            initial={{ x: '-100vw', y: 0, rotate: 0 }}
            animate={isGoal ? {
              x: '100vw',
              y: 0,
              rotate: 720
            } : {
              x: ['-100vw', '10vw', '110vw'],
              y: [0, -100, -300],
              rotate: [0, 360, 720]
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute text-6xl"
          >
            ⚽
          </motion.div>

          {/* Crowds jumping */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-20 h-40">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 40 + Math.random() * 40 }}
                animate={{ 
                  height: [40 + Math.random() * 40, 80 + Math.random() * 80, 40 + Math.random() * 40],
                }}
                transition={{ 
                  duration: 0.3 + Math.random() * 0.5, 
                  repeat: Infinity,
                  delay: Math.random() * 0.5
                }}
                className="w-4 bg-slate-900 rounded-t-full"
              />
            ))}
          </div>

          {/* Goal Net Effect (Only if Goal) */}
          {isGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.3] }}
              transition={{ duration: 1, times: [0, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-[120vw] h-[120vh] border-[40px] border-white/10 rounded-full border-dashed animate-ping" />
            </motion.div>
          )}

          {/* Celebration / Miss Text */}
          <motion.div
            initial={{ scale: 0, rotate: -20, y: 0 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              rotate: [20, -10, 0],
              y: isGoal ? [0, -20, 0, -20, 0] : [0, 0, 0] 
            }}
            transition={{ 
              scale: { duration: 0.5 },
              rotate: { duration: 0.5 },
              y: { duration: 1, repeat: 3, ease: "easeInOut", delay: 0.5 }
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative z-10"
          >
            <h1 className="text-8xl md:text-9xl font-black text-white italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center">
              <span className={`text-transparent bg-clip-text bg-gradient-to-b ${isGoal ? 'from-yellow-400 via-yellow-200 to-yellow-600' : 'from-slate-300 via-white to-slate-500'} drop-shadow-sm`}>
                {isGoal ? 'GOOOOL!' : 'QUASE!'}
              </span>
              <motion.span 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`text-4xl md:text-5xl mt-2 ${isGoal ? 'bg-emerald-600' : 'bg-slate-600'} px-8 py-3 rounded-full shadow-2xl border-4 border-white tracking-tighter uppercase`}
              >
                {isGoal ? 'Meta Atingida!' : 'UUHHH! QUASE LÁ!'}
              </motion.span>
            </h1>
          </motion.div>
          
          {/* Flash effect */}
          {isGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white"
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
