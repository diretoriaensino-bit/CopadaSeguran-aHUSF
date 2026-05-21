import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertCircle, CheckCircle2, Bed, Info, BookOpen, Trophy } from 'lucide-react';
import { cn, shuffleArray, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal6Mission({ onComplete }: Props) {
  const [solved, setSolved] = useState<string[]>([]);
  const [practiceDone, setPracticeDone] = useState(false);

  const risks = React.useMemo(() => shuffleArray([
    { id: 'grades', title: 'Grade da Cama Abaixada', description: 'Eleve as grades de pacientes com risco de queda.' },
    { id: 'floor', title: 'Piso Molhado/Escorregadio', description: 'Mantenha o ambiente seco e sinalizado.' },
    { id: 'bell', title: 'Campainha Fora de Alcance', description: 'A campainha deve estar sempre ao alcance das mãos.' },
  ]), []);

  const fixRisk = (id: string) => {
    if (practiceDone) return;
    if (!solved.includes(id)) {
      const next = [...solved, id];
      setSolved(next);
      if (next.length === risks.length) {
        setPracticeDone(true);
      }
    }
  };

  const Quiz = () => {
    const [qIndex, setQIndex] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
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
        q: "Como podemos evitar que um paciente caia da cama?",
        options: ["Deixando-o sozinho", "Mantendo as grades da cama sempre levantadas e travadas", "Dando um calmante", "Pedindo para ele não se mexer"],
        correct: 1,
        feedback: "As grades são a nossa muralha de defesa contra quedas!"
      },
      {
        q: "O que é uma 'Lesão por Pressão' (escaras)?",
        options: ["Um corte com faca", "Uma ferida na pele causada por ficar muito tempo na mesma posição", "Uma alergia a remédio", "Um roxo de batida"],
        correct: 1,
        feedback: "A pressão constante 'sufoca' a pele. Mudar a posição é o melhor remédio!"
      },
      {
        q: "O que ajuda a evitar que o paciente escorregue no quarto?",
        options: ["Tapetes fofos", "Chão seco, bem iluminado e uso de sapatos fechados/antiderrapantes", "Correr no corredor", "Meias de seda"],
        correct: 1,
        feedback: "Um campo seguro evita escorregões. Luz e chão seco são fundamentais."
      },
      {
        q: "Qual a melhor forma de evitar feridas na pele de quem fica muito tempo deitado?",
        options: ["Deixar o paciente sempre na mesma posição", "Mudar o paciente de posição a cada 2 horas", "Passar álcool na pele", "Cobrir com muitos lençóis"],
        correct: 1,
        feedback: "Mudar o decúbito (posição) é como fazer um rodízio no time: todo mundo descansa um pouco!"
      },
      {
        q: "A campainha deve ficar onde?",
        options: ["Na porta do quarto", "Sempre ao alcance da mão do paciente", "Com a enfermeira no posto", "No bolso do acompanhante"],
        correct: 1,
        feedback: "A campainha é o apito do jogador. Ele precisa dela para chamar o juiz (você)!"
      },
      {
        q: "O que indica que um paciente tem mais risco de cair?",
        options: ["Ele ser muito simpático", "Uso de pulseira amarela e placa de alerta no leito", "Ele ter muitos visitantes", "Ele estar usando pijama azul"],
        correct: 1,
        feedback: "A cor amarela avisa o time: 'Atenção redobrada com esse jogador!'"
      },
      {
        q: "Em quais áreas do corpo as feridas por pressão aparecem mais?",
        options: ["Nas mãos e braços", "Nas partes onde o osso encosta com força na cama (calcanhares, quadril, costas)", "No rosto", "No peito"],
        correct: 1,
        feedback: "Onde o osso 'aperta' a pele contra o colchão é onde o perigo mora."
      },
      {
        q: "Pacientes idosos ou confusos precisam de mais atenção?",
        options: ["Sim, eles têm um risco maior de queda", "Não, eles sabem se cuidar", "Apenas se eles pedirem", "Só se for à noite"],
        correct: 0,
        feedback: "Cuidado redobrado com nossos veteranos. Eles precisam de uma zaga mais atenta."
      },
      {
        q: "Se você vir o chão molhado no corredor, o que faz?",
        options: ["Passa por cima rápido", "Limpa ou sinaliza imediatamente para evitar que alguém caia", "Espera a limpeza passar", "Ignora e segue o jogo"],
        correct: 1,
        feedback: "Segurança é dever de todos. Um aviso rápido evita um grande tombo!"
      },
      {
        q: "Trazer objetos de casa (chinelos largos, tapetes) para o hospital é bom?",
        options: ["Sim, o paciente se sente em casa", "Não, podem causar tropeços e quedas", "Tanto faz", "Só se forem coloridos"],
        correct: 1,
        feedback: "Mantenha o campo livre de obstáculos. Menos tralha, menos queda!"
      }
    ];

    const questions = React.useMemo(() => prepareQuizQuestions(rawQuestions, 5), []);

    const handleAnswer = (idx: number) => {
      setSelectedOpt(idx);
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
          setSelectedOpt(null);
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
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-500">
            <Trophy className="w-12 h-12 text-rose-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Desempenho na Zaga</p>
            <div className="text-5xl font-black text-rose-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "Zaga de Ferro! Ninguém caiu e a pele está intacta." : 
               score >= 50 ? "Bom jogo, mas atenção redobrada com a pressão nos calcanhares!" : 
               "Muitas falhas na defesa. Revise as escalas de Morse e Braden!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-rose-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-rose-100 px-2 py-0.5 rounded-full font-bold text-rose-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-rose-500 animate-pulse" : "bg-slate-200")} />
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
                selectedOpt === idx && feedback === 'correct' ? "border-emerald-500 bg-emerald-50 text-emerald-900" :
                selectedOpt === idx && feedback === 'wrong' ? "border-red-500 bg-red-50 text-red-900 animate-shake" :
                "border-slate-100 hover:border-rose-200 hover:bg-slate-50",
                feedback && selectedOpt !== idx && "opacity-50"
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
              🛡️ <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "DEFESA VAZADA!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={6}
      title="Prevenção de Quedas"
      description="Reduzir riscos de quedas e lesões por pressão."
      color="bg-rose-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-100">
            <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ficha Técnica: Meta 6
            </h3>
            <div className="space-y-4">
              <p className="text-rose-900 font-bold text-lg">Prevenção de Quedas e Lesão por Pressão</p>
              <p className="text-rose-800/80 text-sm leading-relaxed">
                Esta meta foca na redução de incidentes que causam danos por quedas e na prevenção de lesões na pele causadas por pressão prolongada. O objetivo é avaliar o risco de cada paciente e implementar medidas preventivas personalizadas.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl border border-rose-200">
                  <span className="text-[10px] font-black text-rose-500 uppercase">Prevenção 1</span>
                  <p className="text-rose-900 font-black">Escala de Morse</p>
                  <p className="text-[9px] text-rose-700">Avaliação de risco de queda.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-rose-200">
                  <span className="text-[10px] font-black text-rose-500 uppercase">Prevenção 2</span>
                  <p className="text-rose-900 font-black">Mudar de Posição</p>
                  <p className="text-[9px] text-rose-700">Prevenção de lesão (decúbito).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <img 
               src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800" 
               alt="Segurança do Paciente" 
               className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-4 left-4 z-20 bg-rose-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                Zaga de Ferro (Prevenção)
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-rose-900">Zaga de Ferro: Risco Zero</h3>
          <p className="text-slate-600">
            Um bom zagueiro não deixa ninguém cair na área. Nossa missão é proteger o paciente de quedas que podem custar o campeonato da recuperação.
          </p>
          <div className="bg-rose-50 p-6 rounded-2xl border-l-4 border-rose-500">
            <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" /> Esquema Tático
            </h4>
            <p className="text-xs text-rose-700">Avaliação de risco constante e adaptação do 'gramado' (quarto) para evitar acidentes.</p>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-6">
          <p className="text-sm text-slate-500">Elimine os riscos no quarto do paciente clicando neles:</p>
          <div className="grid grid-cols-1 gap-3">
            {risks.map((risk) => (
              <button
                key={risk.id}
                onClick={() => fixRisk(risk.id)}
                className={cn(
                  "p-4 rounded-xl border-2 flex items-center justify-between transition-all text-left",
                  solved.includes(risk.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  {solved.includes(risk.id) ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                  <span className={cn("font-bold text-sm", solved.includes(risk.id) ? "text-emerald-900" : "text-slate-700")}>{risk.title}</span>
                </div>
                {solved.includes(risk.id) && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded">RESOLVIDO</span>}
              </button>
            ))}
          </div>
          <button 
            disabled={!practiceDone}
            className={cn(
              "w-full py-4 rounded-xl font-bold transition-all",
              practiceDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
            )}
          >
            {practiceDone ? "Ambiente Seguro! Vá para o Quiz." : `Riscos Restantes: ${risks.length - solved.length}`}
          </button>
        </div>
      }
      quizComponent={<Quiz />}
    />
  );
}
