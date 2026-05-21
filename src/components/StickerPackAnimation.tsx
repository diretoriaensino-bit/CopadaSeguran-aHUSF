import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Trophy, Lock, ShieldCheck } from 'lucide-react';
import { GoalId, GOALS } from '../types';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sound';

interface Props {
  goalId: GoalId;
  config?: { img: string, title: string };
  onComplete: () => void;
  earnedStickers?: GoalId[];
  stickersConfig?: Record<string, { img: string, title: string }>;
}

export function StickerPackAnimation({ 
  goalId, 
  config, 
  onComplete, 
  earnedStickers = [], 
  stickersConfig = {} 
}: Props) {
  const [step, setStep] = useState<'idle' | 'tearing' | 'revealed' | 'gluing' | 'glued'>('idle');
  const sticker = config || { 
    img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=300", 
    title: `FIGURINHA META ${goalId}` 
  };
  const goal = GOALS.find(g => g.id === goalId);

  const stickersData = [1, 2, 3, 4, 5, 6].map(id => ({
    id,
    img: stickersConfig[id]?.img || "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=300",
    title: stickersConfig[id]?.title || `FIGURINHA META ${id}`
  }));

  const handleTear = () => {
    playSound('whistle');
    setStep('tearing');
    setTimeout(() => {
      setStep('revealed');
      playSound('glue');
    }, 800);
  };

  const handleGlue = () => {
    playSound('glue');
    setStep('gluing');
    setTimeout(() => {
      setStep('glued');
      playSound('victory');
    }, 1800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl min-h-[500px] flex items-center justify-center py-8">
        
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="pack"
              initial={{ scale: 0.5, y: 100, rotate: -10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              onClick={handleTear}
              className="relative w-64 h-80 bg-emerald-600 rounded-2xl shadow-2xl border-4 border-emerald-400 cursor-pointer group flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Panini Style Pack Design */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
              <div className="absolute top-0 w-full h-8 bg-black/10 flex justify-between px-2 items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                <div className="w-4 h-4 rounded-full border-2 border-white/20" />
              </div>
              
              <div className="relative z-10 text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white">
                   <Sparkles className="w-10 h-10 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl tracking-tighter italic">COPA DA</h3>
                  <h3 className="text-yellow-400 font-black text-3xl tracking-tighter -mt-2">SEGURANÇA</h3>
                </div>
                <div className="bg-white/20 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                  Toque para Abrir
                </div>
              </div>

              {/* Texture/Shine */}
              <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.div>
          )}

          {step === 'tearing' && (
            <motion.div key="tearing" className="relative w-64 h-80">
              <motion.div 
                initial={{ x: 0 }} 
                animate={{ x: -100, rotate: -15, opacity: 0 }} 
                className="absolute inset-y-0 left-0 w-1/2 bg-emerald-600 border-r-2 border-white/20 rounded-l-2xl z-20"
              />
              <motion.div 
                initial={{ x: 0 }} 
                animate={{ x: 100, rotate: 15, opacity: 0 }} 
                className="absolute inset-y-0 right-0 w-1/2 bg-emerald-600 border-l-2 border-white/20 rounded-r-2xl z-20"
              />
            </motion.div>
          )}

          {step === 'revealed' && (
            <motion.div
              key="sticker"
              initial={{ scale: 0, rotate: 720 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative group cursor-pointer"
              onClick={handleGlue}
            >
              <div className="relative w-64 h-80 bg-white p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white rotate-2 group-hover:rotate-0 transition-transform">
                <div className="h-full w-full bg-slate-100 rounded-lg overflow-hidden relative">
                  <img 
                    src={sticker?.img} 
                    alt={sticker?.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Meta+${goalId}&background=059669&color=fff&size=300`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">NOVA FIGURINHA!</p>
                    <h4 className="text-xl font-black leading-tight mb-2">{sticker?.title}</h4>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                       <span className="text-xs font-bold uppercase tracking-widest">{goal?.title}</span>
                    </div>
                  </div>
                </div>
                {/* Numbered Corner */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-emerald-800 border-4 border-white shadow-lg">
                  {goalId}
                </div>
              </div>
              
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm text-center">
                <p className="bg-slate-900 border-2 border-yellow-400 text-yellow-400 font-black uppercase tracking-widest text-xs md:text-sm py-2.5 px-6 rounded-full shadow-2xl animate-bounce">
                  Toque / Clique na figurinha para colar no álbum! 👆
                </p>
              </div>
            </motion.div>
          )}

          {(step === 'gluing' || step === 'glued') && (
            <motion.div
              key="album-gluing-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-4 border-emerald-500 rounded-[2.5rem] w-full max-w-lg p-5 md:p-6 shadow-2xl relative z-10 flex flex-col items-center gap-5 text-white"
            >
              <div className="text-center">
                <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                  Álbum Oficial Copa da Segurança
                </span>
                <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight mt-2 leading-none">
                  {step === 'gluing' ? 'Colando no seu Álbum...' : 'Figurinha Colada! ⚽'}
                </h2>
              </div>

              {/* Album Grid inside pack reveal screen */}
              <div className="grid grid-cols-3 gap-3 w-full my-2 font-sans">
                {stickersData.map((stickerItem) => {
                  const isPreviously = earnedStickers.includes(stickerItem.id as GoalId) && stickerItem.id !== goalId;
                  const isNew = stickerItem.id === goalId;

                  return (
                    <div key={stickerItem.id} className="relative aspect-[3/4] w-full text-slate-800">
                      {/* Slot Card */}
                      <div className={cn(
                        "absolute inset-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all overflow-hidden",
                        isPreviously 
                          ? "bg-white border-white shadow-md rotate-0" 
                          : "bg-emerald-950/40 border-emerald-500/30"
                      )}>
                        {isPreviously ? (
                          <>
                            <img 
                              src={stickerItem.img} 
                              alt={stickerItem.title} 
                              className="absolute inset-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Meta+${stickerItem.id}&background=059669&color=fff&size=300`;
                              }}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-1.5 pt-3 text-left">
                              <p className="text-[6.5px] font-black uppercase tracking-widest text-emerald-300 leading-none">Meta {stickerItem.id}</p>
                              <h4 className="text-[8px] font-bold text-white leading-tight truncate mt-0.5">{stickerItem.title}</h4>
                            </div>
                          </>
                        ) : isNew ? (
                          /* The animated sticker that flies into the slot */
                          <div className="absolute inset-0 bg-emerald-500/10 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 3.5, y: -240, rotate: 22, opacity: 0, filter: "drop-shadow(0 25px 15px rgba(0,0,0,0.5))" }}
                              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
                              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute inset-x-0 inset-y-0 w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 border-white bg-white flex flex-col"
                            >
                              <img 
                                src={stickerItem.img} 
                                alt={stickerItem.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Meta+${stickerItem.id}&background=059669&color=fff&size=300`;
                                }}
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-1.5 pt-3 leading-none text-left">
                                <p className="text-[6.5px] font-black uppercase tracking-widest text-yellow-300 leading-none">META {stickerItem.id}</p>
                                <h4 className="text-[8px] font-bold text-white leading-tight truncate mt-0.5">{stickerItem.title}</h4>
                              </div>
                              {/* Glare/Shine line that scans from left to right */}
                              <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.8 }}
                                className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              />
                            </motion.div>
                          </div>
                        ) : (
                          /* Locked meta slot */
                          <div className="flex flex-col items-center text-center opacity-25 select-none text-white">
                            <Lock className="w-4 h-4 text-emerald-400 mb-1" />
                            <p className="text-[7.5px] font-black uppercase tracking-widest text-emerald-400 leading-none">Meta {stickerItem.id}</p>
                          </div>
                        )}
                      </div>

                      {/* Corner Number */}
                      <div className={cn(
                        "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm z-25 border",
                        isPreviously 
                          ? "bg-emerald-600 text-white border-white" 
                          : isNew 
                            ? "bg-yellow-400 text-slate-900 border-white animate-bounce" 
                            : "bg-slate-800 text-slate-500 border-slate-700"
                      )}>
                        {stickerItem.id}
                      </div>

                      {/* Golden explosion particles on correct landing */}
                      {isNew && step === 'glued' && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(6)].map((_, spi) => (
                            <motion.div
                              key={spi}
                              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                              animate={{ 
                                scale: [0, 1.2, 0], 
                                x: (Math.random() - 0.5) * 120, 
                                y: (Math.random() - 0.5) * 120,
                                opacity: 0
                              }}
                              transition={{ duration: 1, delay: spi * 0.05 }}
                              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Alert Information and Call to Action */}
              <div className="w-full relative z-20 min-h-[90px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {step === 'glued' ? (
                    <motion.div
                      key="status-success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full flex flex-col items-center gap-4 text-center"
                    >
                      <div className="bg-emerald-950/80 border border-emerald-500/30 px-4 py-2.5 rounded-xl w-full text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <Trophy className="w-4 h-4 text-yellow-400 animate-bounce" />
                          <span className="text-yellow-400 font-extrabold text-xs uppercase tracking-wider">Figurinha Colada Com Sucesso!</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Seu Álbum da Copa da Segurança foi atualizado com a <strong>Meta {goalId}</strong>.
                        </p>
                      </div>

                      <motion.button
                        onClick={onComplete}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-sm py-3.5 px-6 rounded-xl shadow-lg transition-transform uppercase tracking-tight flex items-center justify-center gap-1.5"
                      >
                        Voltar às Missões ⚽
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="status-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center font-bold text-emerald-400 text-xs animate-pulse flex items-center gap-2 py-4"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      Fixando figurinha na página do álbum...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Sparks */}
        {step === 'revealed' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  x: (Math.random() - 0.5) * 600, 
                  y: (Math.random() - 0.5) * 600 
                }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                className="absolute left-1/2 top-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
