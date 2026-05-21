import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Gamepad2, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface Phase {
  id: 'briefing' | 'quiz';
  title: string;
  icon: React.ReactNode;
}

const PhaseIcons = {
  briefing: <BookOpen className="w-4 h-4" />,
  quiz: <GraduationCap className="w-4 h-4" />
};

interface Props {
  goalId: number;
  title: string;
  description: string;
  practiceComponent?: React.ReactNode;
  quizComponent: React.ReactNode;
  briefingContent: React.ReactNode;
  onComplete: (score: number) => void;
  color: string;
}

export function MissionContainer({ 
  title, 
  quizComponent, 
  briefingContent, 
  onComplete,
  color
}: Props) {
  const [phase, setPhase] = useState<'briefing' | 'quiz'>('briefing');

  const phases: Phase[] = [
    { id: 'briefing', title: 'Preleção', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', title: 'Jogo Real', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Phases Indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {phases.map((p, idx) => (
          <React.Fragment key={p.id}>
            <div className="flex flex-col items-center gap-2 relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-white",
                phase === p.id ? `border-transparent ${color} text-white shadow-lg scale-110` : 
                (phases.findIndex(x => x.id === phase) > idx ? "border-emerald-500 text-emerald-500" : "border-slate-200 text-slate-300")
              )}>
                {phases.findIndex(x => x.id === phase) > idx ? <GraduationCap className="w-5 h-5" /> : p.icon}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                phase === p.id ? "text-slate-900" : "text-slate-400"
              )}>{p.title}</span>
            </div>
            {idx < phases.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-100 mx-4 -mt-6 relative overflow-hidden">
                <motion.div 
                   className={cn("absolute inset-0", color.replace('bg-', 'bg-'))}
                   initial={{ x: '-100%' }}
                   animate={{ x: phases.findIndex(x => x.id === phase) > idx ? '0%' : '-100%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {phase === 'briefing' && (
            <motion.div 
              key="briefing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="prose prose-slate max-w-none">
                {briefingContent}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Prepare-se: O <span className="text-rose-600">Jogo Real</span> possui tempo limite de <span className="text-rose-600">20 segundos</span> para responder cada pergunta!
                </p>
              </div>

              <button 
                onClick={() => setPhase('quiz')}
                className={cn("w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]", color)}
              >
                Iniciar Jogo Real <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {quizComponent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
