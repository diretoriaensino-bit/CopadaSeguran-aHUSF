import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../lib/sound';
import { Sparkles, RotateCw, Check, X, Clipboard, ShieldAlert, Award } from 'lucide-react';
import { TransparentImage } from './TransparentImage';
import mascotUrl from './assets/images/husf_mascote_updated_1779362707243.png';

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
    
    // Pick a random tip to start on when opening, to keep it dynamic and fresh!
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
        {/* Speech Bubble floating text */}
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
              >
                <X className="w-3 h-3" />
              </button>

              <div className="text-xs font-semibold leading-relaxed pr-2">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" /> Apitinho Convida:
                </span>
                <p className="text-[11px] text-slate-600 font-medium">Ei jogador! Clique em mim para conferir a minha **Instrução Tática** do dia! 📋⚽</p>
              </div>

              {/* Bubble arrow */}
              <div className="absolute -bottom-2 right-10 w-3 h-3 bg-white border-r-2 border-b-2 border-emerald-500 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot character avatar */}
        <motion.div
          animate={isBouncing ? { y: [0, -20, 0], scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
          transition={isBouncing ? { duration: 0.4, ease: "easeInOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative cursor-pointer pointer-events-auto flex flex-col items-center group"
          onClick={handleOpenTactics}
        >
          {/* Active pulse aura behind mascot */}
          <div className="absolute inset-0 bg-emerald-400/25 blur-xl rounded-full scale-75 group-hover:scale-105 transition-transform duration-500 animate-pulse" />
          
          {/* Mascot artwork */}
          <TransparentImage
            src="/src/assets/images/husf_mascote_updated_1779362707243.png"
            alt="Mascote Apitinho"
            className="w-24 h-24 md:w-28 md:h-28 object-contain relative drop-shadow-2xl select-none group-hover:rotate-6 transition-transform"
            referrerPolicy="no-referrer"
          />

          {/* Prompt pill below */}
          <div className="mt-1 bg-slate-950 text-white font-black text-[9.5px] uppercase px-3 py-1 rounded-full border border-slate-800 tracking-wider shadow-md group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all flex items-center gap-1">
            <span>Prancheta Tática</span> <span className="animate-bounce">📋</span>
          </div>
        </motion.div>
      </div>

      {/* Immersive Tactics Chalkboard Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-900 border-4 border-emerald-500 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              {/* Green Chalkboard/Stadium header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => {
                      playSound('correct');
                      setIsModalOpen(false);
                    }}
                    className="w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors border border-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mascot head cutout */}
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    <TransparentImage
                      src="/src/assets/images/husf_mascote_updated_1779362707243.png"
                      alt="Apitinho"
                      className="w-full h-full object-contain scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Técnico Oficial</span>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight leading-tight mt-0.5">Prancheta do Apitinho</h2>
                    <p className="text-emerald-200 text-xs">Instruções para o Hexa da Segurança do Paciente HUSF!</p>
                  </div>
                </div>
              </div>

              {/* Tactics Chalkboard Area */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Chalkboard Card */}
                <div className="bg-emerald-950 border-2 border-dashed border-emerald-600/65 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-inner flex flex-col items-center justify-center text-center group">
                  {/* Subtle soccer field background texture */}
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-700/30 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-emerald-700/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Clipboard/Tactics icon indicator */}
                  <div className="mb-4 bg-emerald-900 border border-emerald-700 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 relative z-10 shadow-sm">
                    <Clipboard className="w-3.5 h-3.5" /> Jogada Ensaiada #{currentTipIndex + 1}
                  </div>

                  {/* Active Instruction Text */}
                  <div className="relative z-10 min-h-[100px] flex items-center justify-center px-2">
                    <motion.p
                      key={currentTipIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white text-base md:text-lg font-bold leading-relaxed tracking-wide text-emerald-50 max-w-md"
                      dangerouslySetInnerHTML={{
                        __html: MASCOT_TIPS[currentTipIndex].replace(/\*\*(.*?)\*\*/g, '<span class="text-yellow-300 font-extrabold outline-none">$1</span>')
                      }}
                    />
                  </div>

                  {/* Motivational footer on chalkboard */}
                  <div className="mt-4 text-[10px] text-emerald-400/70 font-mono tracking-wider relative z-10">
                    🏆 COPA DA SEGURANÇA 2026 • HUSF 🏆
                  </div>
                </div>

                {/* Tactical Actions Dashboard */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={nextTip}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 group shadow-sm"
                  >
                    <RotateCw className="w-5 h-5 text-emerald-400 transition-transform group-hover:rotate-180 duration-500" />
                    <span className="font-extrabold text-xs uppercase tracking-tight text-center">Próxima Instrução</span>
                    <span className="text-[9px] text-slate-400 font-medium">Ciclar Dicas Sequencialmente</span>
                  </button>

                  <button
                    onClick={randomTip}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 group shadow-sm"
                  >
                    <span className="text-xl transition-all group-hover:scale-125 select-none font-black text-amber-400">📣</span>
                    <span className="font-extrabold text-xs uppercase tracking-tight text-center">Jogada Surpresa!</span>
                    <span className="text-[9px] text-slate-400 font-medium">Instrução ao Acaso</span>
                  </button>
                </div>

                {/* Core action button */}
                <button
                  onClick={() => {
                    playSound('correct');
                    setIsModalOpen(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4.5 rounded-2xl transition-all uppercase tracking-tight text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3px]" /> Entendido Professor! Vamos pro Jogo 💪
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

