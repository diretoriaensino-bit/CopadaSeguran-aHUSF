import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { GripVertical, Send, CheckCircle2, MessageSquareText, AlertCircle, ChevronRight, BookOpen, Trophy } from 'lucide-react';
import { cn, shuffleArray, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal2Mission({ onComplete }: Props) {
  const correctOrder = [
    { id: 'S', title: 'Situação', text: 'Olá Dr., aqui é a Enf. Maria. O Sr. José no leito 402 está com dispneia súbita e saturação de 88%.' },
    { id: 'B', title: 'Background', text: 'Ele é um paciente pós-op de fêmur, sem histórico prévio de doença pulmonar, admitido há 2 dias.' },
    { id: 'A', title: 'Avaliação', text: 'Eu acredito que ele possa estar tendo uma embolia pulmonar ou edema agudo.' },
    { id: 'R', title: 'Recomendação', text: 'Pode vir avaliá-lo agora ou quer que eu solicite um ECG e gasometria imediatamente?' },
  ];

  const [items, setItems] = useState(() => shuffleArray([...correctOrder]));

  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const checkOrder = () => {
    const isCorrect = items.every((item, index) => item.id === correctOrder[index].id);
    if (isCorrect) {
      setIsFinished(true);
      setShowFeedback(false);
    } else {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

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
        q: "O que o time busca ao usar uma comunicação padronizada?",
        options: ["Fazer fofoca", "Garantir que a informação correta chegue sem confusão", "Aumentar o tempo de trabalho", "Confundir o paciente"],
        correct: 1,
        feedback: "Falar a mesma língua evita que informações importantes se percam no caminho!"
      },
      {
        q: "Se você recebe uma instrução por telefone e não entende bem, o que faz?",
        options: ["Desliga e faz o que acha melhor", "Pede para repetir e anota para confirmar (Repetir e Confirmar)", "Ignora a instrução", "Pergunta para o estagiário"],
        correct: 1,
        feedback: "Repetir o que ouviu garante que você entendeu o 'chute' certo!"
      },
      {
        q: "Por que a passagem de plantão é um momento crítico?",
        options: ["Because it is time to go away", "Porque é quando as informações sobre o estado do paciente são transmitidas", "Porque o café está pronto", "Porque é hora de bater o ponto"],
        correct: 1,
        feedback: "No plantão, passamos a bola para o próximo. O passe tem que ser perfeito!"
      },
      {
        q: "Qual a melhor forma de passar informações urgentes sobre um paciente?",
        options: ["Gritando no corredor", "Usando um método organizado (como o SBAR)", "Mandando um bilhete", "Esperando o médico passar amanhã"],
        correct: 1,
        feedback: "Organização é tudo! O SBAR ajuda a ser rápido e direto ao ponto."
      },
      {
        q: "O que fazer se você notar algo de errado com o paciente e ninguém te ouve?",
        options: ["Ficar quieto para não incomodar", "Usar sua voz e insistir na segurança do paciente", "Ir chorar no banheiro", "Esperar o turno acabar"],
        correct: 1,
        feedback: "Pela segurança do paciente, levante a mão! Sua voz salva vidas."
      },
      {
        q: "Gírias e apelidos devem ser usados na comunicação entre a equipe?",
        options: ["Sim, fica mais amigável", "Não, termos técnicos claros evitam erros de entendimento", "Só se o paciente permitir", "Apenas no aplicativo de mensagens"],
        correct: 1,
        feedback: "Clareza é o gol. Evite confusões com termos vagos ou gírias."
      },
      {
        q: "O que significa 'Read-back' (Repetir e Confirmar)?",
        options: ["Ler o prontuário de trás para frente", "Ouvir a instrução, escrever e ler de volta para quem mandou confirmar", "Voltar para o quarto do paciente", "Não olhar para trás"],
        correct: 1,
        feedback: "Ouvir, escrever e ler de volta é o VAR da comunicação segura!"
      },
      {
        q: "Se um colega te passa uma informação incompleta, o que você faz?",
        options: ["Ignora e segue o jogo", "Faz perguntas para esclarecer os detalhes", "Reclama com a chefia", "Assume o que está faltando"],
        correct: 1,
        feedback: "Não aceite passes ruins. Peça clareza para manter a segurança do time."
      },
      {
        q: "A comunicação deve ser feita de forma...",
        options: ["Lenta e demorada", "Clara, objetiva e oportuna (na hora certa)", "Apenas por escrito", "Apenas uma vez por dia"],
        correct: 1,
        feedback: "Na hora certa e com clareza: esse é o segredo de uma equipe campeã."
      },
      {
        q: "O paciente também faz parte do time na comunicação?",
        options: ["Não, ele só recebe o cuidado", "Sim, ele deve ser ouvido e informado sobre seu tratamento", "Sim, mas só se ele for da área da saúde", "Apenas se ele perguntar muito"],
        correct: 1,
        feedback: "O paciente é o dono do campo. Ouça o que ele tem a dizer sobre seu corpo!"
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
          <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-cyan-500">
            <Trophy className="w-12 h-12 text-cyan-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Desempenho no Passe</p>
            <div className="text-5xl font-black text-cyan-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "Comunicação de Craque! Passes precisos e seguros." : 
               score >= 50 ? "Bom jogo, mas cuidado para não errar o passe em momentos críticos!" : 
               "Comunicação truncada. Treine mais o SBAR para evitar erros!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-cyan-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-cyan-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-cyan-100 px-2 py-0.5 rounded-full font-bold text-cyan-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-cyan-500 animate-pulse" : "bg-slate-200")} />
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
                "border-slate-100 hover:border-cyan-200 hover:bg-slate-50",
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
              🛑 <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "IMPEDIMENTO!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={2}
      title="Comunicação Eficaz"
      description="Melhorar a clareza nas transferências de cuidado."
      color="bg-cyan-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-cyan-50 p-6 rounded-[2rem] border-2 border-cyan-100">
            <h3 className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ficha Técnica: Meta 2
            </h3>
            <div className="space-y-4">
              <p className="text-cyan-900 font-bold text-lg">O que é a Comunicação Efetiva?</p>
              <p className="text-cyan-800/80 text-sm leading-relaxed">
                É o processo de troca de informações entre profissionais de saúde que deve ser oportuno, preciso, completo, inequívoco e compreendido pelo receptor. O objetivo é reduzir erros causados por falhas de comunicação em momentos críticos como transferências de pacientes e comunicação de resultados críticos.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-cyan-400 uppercase">Técnica Principal</span>
                  <p className="text-cyan-900 font-black">SBAR</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-cyan-400 uppercase">Foco</span>
                  <p className="text-cyan-900 font-black">Transferência de Cuidado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <img 
               src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" 
               alt="Comunicação em Saúde" 
               className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-4 left-4 z-20 bg-cyan-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                Passe de Informação
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-cyan-900">O Passe Perfeito</h3>
          <p className="text-slate-600">
            No futebol, um passe errado pode gerar um contra-ataque fatal. No hospital, falhas na comunicação são a causa raiz de mais de 70% dos eventos adversos. 
            A técnica SBAR garante que o 'passe' da informação seja preciso.
          </p>
          <div className="bg-cyan-50 p-6 rounded-2xl border-l-4 border-cyan-500">
            <h4 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5" /> Tática SBAR
            </h4>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li><strong>S</strong>ituation (Situação): O lance atual.</li>
              <li><strong>B</strong>ackground (Histórico): O que aconteceu antes.</li>
              <li><strong>A</strong>ssessment (Avaliação): Sua leitura do jogo.</li>
              <li><strong>R</strong>ecommendation (Recomendação): A jogada necessária.</li>
            </ul>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
            <p className="text-amber-800 text-xs font-medium leading-relaxed italic">
              🚨 <span className="font-black">CENÁRIO:</span> Você está passando o plantão de um paciente que começou a apresentar falta de ar súbita. Organize as informações abaixo no formato <span className="font-black">SBAR</span> para que o médico entenda a urgência.
            </p>
          </div>

          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">Arraste os blocos para ordenar:</p>
          
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
            {items.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item}
                className={cn(
                  "bg-white border-2 rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm transition-colors",
                  isFinished ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-cyan-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm",
                  isFinished ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {isFinished ? <CheckCircle2 className="w-5 h-5" /> : <GripVertical className="w-5 h-5 opacity-30" />}
                </div>
                <div>
                  <p className="text-slate-700 font-bold text-sm leading-snug">{item.text}</p>
                  {isFinished && <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-widest">{item.title}</p>}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {showFeedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-rose-700 text-xs font-bold leading-tight">
                A ordem tática ainda não está correta! Lembre-se: <br/>
                <span className="text-[10px] uppercase font-black tracking-widest">Situação → Histórico → Avaliação → Recomendação</span>
              </p>
            </motion.div>
          )}

          <button 
            onClick={checkOrder}
            disabled={isFinished}
            className={cn(
              "w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-lg transition-all shadow-lg active:scale-95",
              isFinished 
                ? "bg-emerald-500 text-white shadow-emerald-200" 
                : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200"
            )}
          >
            {isFinished ? (
              <>💪 Tática Perfeita! <ChevronRight className="w-5 h-5" /></>
            ) : (
              <>Validar Passe <Send className="w-5 h-5" /></>
            )}
          </button>
        </div>
      }
      quizComponent={<Quiz />}
    />
  );
}
