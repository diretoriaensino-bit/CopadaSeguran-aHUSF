// src/components/MascotHelper.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../lib/sound';
import { Sparkles, RotateCw, Check, X, Clipboard, ShieldAlert, Award } from 'lucide-react';
import { TransparentImage } from './TransparentImage';
import mascotUrl from '../assets/images/husf_mascote_updated_1779362707243.png';

const MASCOT_TIPS = [
  "Olá, Campeão! Eu sou o **Apitinho**, o mascote oficial da Copa da Segurança do HUSF! Pronto para garantir o Hexa para o seu setor? ⚽🏆",
  "**Identificar o paciente** corretamente pelo nome completo e data de nascimento evita cartões vermelhos! Nunca use o número do quarto para identificação! 🛡️",
  "Na **comunicação efetiva**, de emergência quando receber uma prescrição verbal, anote em um papel e leia de volta para que o médico confirme! 🗣️",
  "**Medicamentos de alta vigilância** como Potássio Cloreto, Insulina e Heparina exigem dupla checagem na administração e armazenamento super seguro! 💊",
  "No checklist de **cirurgia segura**, o 'TIME OUT' antes de iniciar a cirurgia é como a checagem do VAR: evita qualquer erro de campo! 🏁",
  "A higienização nos **5 momentos recomendados pela OMS** dá goleada na infecção! Sabão e Álcool em gel protegem você e o paciente! 🧽",
  "Avalie o **risco de queda e lesão por pressão** na admissão do paciente. Manter grades elevadas é como ter uma zaga intransponível em campo! 🛏️",
  "Acertando **mais de 70%** em cada missão, você marca um GOLAÇO de placa e ganha pacotinhos de figurinhas para colar no seu álbum! 🌟📦",
  "O seu setor pode voar alto e alcançar a liderança do **Ranking Geral do HUSF**! Incentive seus colegas a jogarem limpo e entrarem em campo! 💪🏅",
  "Na **Meta 6 (Prevenção de Lesões)**, a mudança de decúbito programada a cada duas horas é nossa melhor jogada coletiva para aliviar a pressão! 🛋️"
];

export function MascotHelper() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenTactics = () => {
    playSound('correct');
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);
    
    const randomIndex = Math.floor(Math.random() * MASCOT_TIPS.length);
    setCurrentTipIndex(randomIndex);
    
    setIsModalOpen(true);
    setShowBubble(false);
  };

  const nextTip = () => {
    playSound('correct');
    setCurrentTipIndex((prev) => (prev + 1) % MASCOT_TIPS.length);
  };

  const randomTip = () => {
    playSound('whistle');
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * MASCOT_TIPS.length);
    } while (nextIndex === currentTipIndex && MASCOT_TIPS.length > 1);
    setCurrentTipIndex(nextIndex);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-45 flex flex-col items-end pointer-events-none select-none">
        {/* Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="mb-3 max-w-xs bg-white text-slate-800 p-3 rounded-2xl shadow-xl border-2 border-emerald-500 relative pointer-events-auto cursor-pointer"
              onClick={handleOpenTactics}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-full flex items-center justify-center text-[10px] font-black transition-colors"
                id="btn-close-bubble"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="text-xs font-semibold leading-relaxed pr-2">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" /> Apitinho Convida:
                </span>
                <p className="text-[11px] text-slate-600 font-medium">Ei jogador! Clique em mi para conferir a minha **Instrução Tática** do dia! 📋⚽</p>
              </div>

              <div className="absolute -bottom-2 right-10 w-3 h-3 bg-white border-r-2 border-b-2 border-emerald-500 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Character Button */}
        <motion.div
          animate={isBouncing ? { y: [0, -20, 0], scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
          transition={isBouncing ? { duration: 0.4, ease: "easeInOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative cursor-pointer pointer-events-auto flex flex-col items-center group"
          onClick={handleOpenTactics}
          id="mascot-button"
        >
          <div className="absolute inset-0 bg-emerald-400/25 blur-xl rounded-full scale-75 group-hover:scale-105 transition-transform duration-500 animate-pulse" />
          
          <TransparentImage
            src={mascotUrl}
            alt="Mascote Apitinho"
            className="w-24 h-24 md:w-28 md:h-28 object-contain relative drop-shadow-2xl select-none group-hover:rotate-6 transition-transform"
            referrerPolicy="no-referrer"
            id="mascot-avatar-image"
          />

          <div className="mt-1 bg-slate-950 text-white font-black text-[9.5px] uppercase px-3 py-1 rounded-full border border-slate-800 tracking-wider shadow-md group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all flex items-center gap-1">
            <span>Prancheta Tática</span> <span className="animate-bounce">📋</span>
          </div>
        </motion.div>
      </div>

      {/* Instructional Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border-2 border-emerald-500 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative"
              id="mascot-modal-card"
            >
              {/* Top Banner Accent */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white relative">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors text-white"
                  id="btn-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    <TransparentImage
                      src={mascotUrl}
                      alt="Apitinho"
                      className="w-full h-full object-contain scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest text-emerald-300">
                      Técnico Apitinho ⚽
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mt-1">Sessão de Instrução Tática</h2>
                  </div>
                </div>
              </div>

              {/* Tips content area */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="bg-slate-950/55 border border-slate-800 rounded-3xl p-6 min-h-[140px] flex flex-col justify-center relative">
                  <div className="absolute top-4 left-4 text-emerald-500/25 font-serif text-6xl select-none">“</div>
                  <p className="text-slate-300 font-medium leading-relaxed z-10 text-[14px] md:text-base pr-4">
                    {MASCOT_TIPS[currentTipIndex].split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-emerald-400 font-extrabold">{part}</strong> : part
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={randomTip}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-slate-750 hover:border-slate-600 shadow-md active:scale-95"
                    id="btn-random-tip"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-500" /> Sortear Instrução
                  </button>
                  <button
                    onClick={nextTip}
                    type="button"
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                    id="btn-next-tip"
                  >
                    Próxima Tática <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}