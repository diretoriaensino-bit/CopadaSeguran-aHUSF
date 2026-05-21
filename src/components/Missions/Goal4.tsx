import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Square, PlayCircle, ClipboardCheck, Zap, BookOpen, Trophy } from 'lucide-react';
import { cn, shuffleArray, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal4Mission({ onComplete }: Props) {
  const [checklist, setChecklist] = useState(() => shuffleArray([
    { id: 1, text: 'Confirmação da identidade do paciente', checked: false },
    { id: 2, text: 'Confirmação do sítio cirúrgico/lateralidade', checked: false },
    { id: 3, text: 'Confirmação do procedimento', checked: false },
    { id: 4, text: 'Materiais e equipamentos testados', checked: false },
  ]));

  const [isFinished, setIsFinished] = useState(false);

  const toggle = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const allChecked = checklist.every(i => i.checked);

  const Quiz = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    React.useEffect(() => {
      if (feedback || showResults) return;
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(-1);
            return 0;
          }
          if (prev <= 6) {
            playSound('warn');
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [qIndex, feedback, showResults]);

    const rawQuestions = [
      {
        q: "O que é o 'Time-out' na cirurgia?",
        options: ["Uma pausa para o café", "Uma pausa obrigatória para conferir os dados antes de começar a cirurgia", "Um tempo para o cirurgião descansar", "O final da operação"],
        correct: 1,
        feedback: "O Time-out é o VAR da equipe. Conferimos se tudo está certo antes do apito inicial!"
      },
      {
        q: "Quem deve participar da conferência (Checklist) na sala de cirurgia?",
        options: ["Apenas o médico", "Toda a equipe presente na sala", "Apenas a enfermagem", "Ninguém, é perda de tempo"],
        correct: 1,
        feedback: "A segurança é um esporte de equipe. Todos devem confirmar os dados juntos!"
      },
      {
        q: "O local que será operado deve ser marcado no corpo do paciente?",
        options: ["Sim, para evitar operar o lado errado", "Não, a equipe sempre sabe", "Só se o paciente pedir", "Apenas se for uma cirurgia plástica"],
        correct: 0,
        feedback: "Marcar o local (sítio cirúrgico) é essencial. O 'mapa' evita que operemos o lado errado."
      },
      {
        q: "Quando a equipe deve conferir se os materiais estão prontos?",
        options: ["Depois que a cirurgia acabar", "Antes de começar o procedimento", "Somente se faltar algo", "No dia seguinte"],
        correct: 1,
        feedback: "Confira o material antes de entrar em campo. Equipamento pronto é essencial para o gol!"
      },
      {
        q: "O que fazer se houver dúvida sobre qual lado operar?",
        options: ["Operar o que parece mais provável", "Parar tudo e confirmar no prontuário e com o cirurgião", "Perguntar para o paciente anestesiado", "Jogar uma moeda"],
        correct: 1,
        feedback: "Na dúvida, não jogue. Pare a partida e confirme as informações oficiais."
      },
      {
        q: "O checklist da OMS serve para quê?",
        options: ["Aumentar a papelada", "Garantir a segurança e evitar erros graves", "Deixar a cirurgia mais lenta", "Controlar o estoque"],
        correct: 1,
        feedback: "O checklist é o nosso guia de segurança. Segui-lo salva vidas!"
      },
      {
        q: "O que conferimos no 'Sign-in' (antes da anestesia)?",
        options: ["O nome do paciente e o local da cirurgia", "O que o paciente comeu ontem", "Qual novela ele gosta", "O preço do estacionamento"],
        correct: 0,
        feedback: "O primeiro tempo começa com a identidade do jogador e o plano de jogo."
      },
      {
        q: "Se um instrumento cair no chão, o que a equipe faz?",
        options: ["Limpa com a mão e usa", "Troca por um esterilizado", "Usa assim mesmo", "Cancela a cirurgia"],
        correct: 1,
        feedback: "Higiene total! Material sujo é cartão vermelho imediato."
      },
      {
        q: "No final da cirurgia (Sign-out), o que é importante conferir?",
        options: ["Se todos os instrumentos e compressas foram retirados e contados", "Se o médico está cansado", "Se já é hora do almoço", "Se o paciente quer ir embora"],
        correct: 0,
        feedback: "Nada pode ficar em campo após o apito final. A contagem garante que tudo saiu do paciente."
      },
      {
        q: "A segurança na cirurgia depende de quem?",
        options: ["Apenas do cirurgião chefe", "Do administrador do hospital", "De toda a equipe da sala", "Do fabricante dos bisturis"],
        correct: 2,
        feedback: "Um por todos e todos pelo paciente. A segurança é uma missão coletiva!"
      }
    ];

    const questions = React.useMemo(() => prepareQuizQuestions(rawQuestions, 5), []);

    const handleAnswer = (idx: number) => {
      setSelected(idx);
      const isCorrect = idx === questions[qIndex].correct;
      
      if (isCorrect) {
        playSound('correct');
        setFeedback('correct');
        setScore(prev => prev + 20);
      } else {
        playSound('wrong');
        setFeedback('wrong');
      }

      setTimeout(() => {
        if (qIndex < questions.length - 1) {
          setQIndex(prev => prev + 1);
          setSelected(null);
          setFeedback(null);
          setTimeLeft(20);
        } else {
          setShowResults(true);
        }
      }, 2000);
    };

    if (showResults) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-8"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-500">
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Desempenho no VAR</p>
            <div className="text-5xl font-black text-emerald-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "VAR impecável! Cirurgia totalmente segura." : 
               score >= 50 ? "Bom jogo, mas não pule etapas no checklist cirúrgico!" : 
               "Muitos riscos detectados. Revise o checklist da OMS imediatamente!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-emerald-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-blue-500" : i === qIndex ? "bg-emerald-500 animate-pulse" : "bg-slate-200")} />
              ))}
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / 20) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className={cn(
                "h-full transition-colors",
                timeLeft > 10 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-rose-500"
              )}
            />
          </div>
          <div className="flex justify-between px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo de Jogo</span>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-slate-400"
            )}>{timeLeft}s</span>
          </div>
        </div>
        <h4 className="text-xl font-bold text-slate-800 leading-tight">{questions[qIndex].q}</h4>
        <div className="grid gap-3">
          {questions[qIndex].options.map((opt, idx) => (
            <button
              key={`${qIndex}-${idx}`}
              onClick={() => !feedback && handleAnswer(idx)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left font-bold transition-all text-sm shadow-sm",
                selected === idx && feedback === 'correct' ? "border-emerald-500 bg-emerald-50 text-emerald-900" :
                selected === idx && feedback === 'wrong' ? "border-red-500 bg-red-50 text-red-900 animate-shake" :
                "border-slate-100 hover:border-emerald-200 hover:bg-slate-50",
                feedback && selected !== idx && "opacity-50"
              )}
              disabled={!!feedback}
            >
              {opt}
            </button>
          ))}
        </div>
        {feedback === 'wrong' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl"
          >
            <p className="text-red-700 text-sm font-medium leading-relaxed italic">
              🖥️ <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "CHAMOU O VAR!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={4}
      title="Cirurgia Segura"
      description="Paciente certo, local certo, procedimento certo."
      color="bg-emerald-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ficha Técnica: Meta 4
            </h3>
            <div className="space-y-4">
              <p className="text-emerald-900 font-bold text-lg">O que é a Cirurgia Segura?</p>
              <p className="text-emerald-800/80 text-sm leading-relaxed">
                É um conjunto de medidas para garantir que os procedimentos cirúrgicos sejam realizados no paciente correto, no local (lateralidade) correto e com o procedimento correto. O uso do Checklist de Cirurgia Segura da OMS é a principal estratégia para prevenir erros catastróficos.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Ação Principal</span>
                  <p className="text-emerald-900 font-black">Time-out</p>
                  <p className="text-[9px] text-emerald-700">Pausa antes da incisão.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Marcação</span>
                  <p className="text-emerald-900 font-black">Sítio Cirúrgico</p>
                  <p className="text-[9px] text-emerald-700">Identificação do local.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <img 
               src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800" 
               alt="Centro Cirúrgico" 
               className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-4 right-4 z-20 bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                Revisão do VAR
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-emerald-900">Checklist: O Nosso VAR</h3>
          <p className="text-slate-600">
            Antes da incisão, fazemos a revisão. O VAR da cirurgia garante que estamos no estádio certo, com o jogador certo e na perna certa.
          </p>
          <div className="bg-emerald-50 p-6 rounded-2xl border-l-4 border-emerald-500">
            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Fases da Partida
            </h4>
            <p className="text-xs text-emerald-700"><strong>Sign In</strong> (Vestiário), <strong>Time-out</strong> (Apito Inicial) e <strong>Sign Out</strong> (Fim do Jogo).</p>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-6">
          <p className="text-sm text-slate-500 italic">Execute o checklist da Pausa Cirúrgica:</p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center gap-3 transition-all",
                  item.checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100"
                )}
              >
                {item.checked ? <CheckSquare className="text-emerald-600" /> : <Square className="text-slate-300" />}
                <span className={cn("text-sm font-medium", item.checked ? "text-emerald-900" : "text-slate-600")}>{item.text}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsFinished(true)}
            disabled={!allChecked}
            className={cn(
              "w-full py-4 rounded-xl font-bold transition-all",
              isFinished ? "bg-blue-600 text-white" : (allChecked ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")
            )}
          >
            {isFinished ? "Time-Out Concluído! Vá para o Quiz." : "Finalizar Time-Out"}
          </button>
        </div>
      }
      quizComponent={<Quiz />}
    />
  );
}
