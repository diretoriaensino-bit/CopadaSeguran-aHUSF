import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Lock, Star, ShieldCheck, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { GOALS, GoalId } from '../types';

interface Props {
  earnedStickers: GoalId[];
  stickersConfig: Record<string, { img: string, title: string }>;
  onClose: () => void;
}

export function StickerAlbum({ earnedStickers, stickersConfig, onClose }: Props) {
  const stickersData = [1, 2, 3, 4, 5, 6].map(id => ({
    id,
    img: stickersConfig[id]?.img || "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=300",
    title: stickersConfig[id]?.title || `FIGURINHA META ${id}`
  }));

  const totalEarned = earnedStickers.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-emerald-50 w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-4 border-white"
      >
        {/* Album Header */}
        <div className="bg-emerald-600 p-8 text-white relative overflow-hidden shrink-0">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 p-3 rounded-2xl shadow-lg">
                <Star className="w-8 h-8 text-emerald-700 fill-current" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Álbum de Figurinhas</h2>
                <p className="text-emerald-100 font-bold">Coleção Copa da Segurança 2026</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8 relative z-10 max-w-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Coleção Completa</span>
              <span className="text-2xl font-black">{totalEarned}/6</span>
            </div>
            <div className="h-3 bg-emerald-900/40 rounded-full overflow-hidden border border-emerald-400/30">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(totalEarned / 6) * 100}%` }}
                className="h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
              />
            </div>
          </div>

          <Sparkles className="absolute -right-8 -top-8 w-48 h-48 opacity-10 rotate-12" />
        </div>

        {/* Album Grid */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stickersData.map((sticker) => {
              const isEarned = earnedStickers.includes(sticker.id as GoalId);
              const goalInfo = GOALS.find(g => g.id === sticker.id);

              return (
                <div key={sticker.id} className="relative group">
                  {/* Sticker Slot */}
                  <div className={cn(
                    "aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative",
                    isEarned 
                      ? "bg-white border-white shadow-xl rotate-0 hover:-rotate-2 hover:scale-105" 
                      : "bg-emerald-100/50 border-emerald-200"
                  )}>
                    {isEarned ? (
                      <>
                        <img 
                          src={sticker.img} 
                          alt={sticker.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Meta+${sticker.id}&background=059669&color=fff&size=300`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Meta {sticker.id}</p>
                          <h4 className="text-xs font-black leading-tight border-b border-white/20 pb-1 mb-1">{sticker.title}</h4>
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-yellow-400" />
                            <span className="text-[8px] font-bold">CERTIFICADO</span>
                          </div>
                        </div>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center opacity-30">
                        <div className="p-4 bg-emerald-200 rounded-full mb-3">
                          <Lock className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Meta {sticker.id}</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1">Pontue +70% para ganhar</p>
                      </div>
                    )}
                  </div>

                  {/* Corner Number */}
                  <div className={cn(
                    "absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md z-10 border-2",
                    isEarned ? "bg-yellow-400 text-emerald-700 border-white" : "bg-slate-200 text-slate-400 border-slate-300"
                  )}>
                    {sticker.id}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-white/50 border-2 border-emerald-100 p-6 rounded-3xl text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-emerald-900 font-bold uppercase tracking-tight mb-2">Seja um Colecionador de Elite</h3>
            <p className="text-emerald-700/70 text-sm max-w-sm mx-auto">
              Ao completar o seu álbum, você demonstra domínio total sobre as 6 Metas Internacionais de Segurança do Paciente.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
