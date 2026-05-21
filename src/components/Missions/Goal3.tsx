import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Pill, Activity, BookOpen, Trophy } from 'lucide-react';
import { cn, shuffleArray, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal3Mission({ onComplete }: Props) {
  const meds = React.useMemo(() => shuffleArray([
    { name: 'Potássio Cloreto 19,1%', highAlert: true },
    { name: 'Soro Fisiológico 0,9%', highAlert: false },
    { name: 'Insulina Regular', highAlert: true },
    { name: 'Dipirona Sódica', highAlert: false },
    { name: 'Heparina Sódica', highAlert: true },
    { name: 'Varfarina Sódica', highAlert: true },
    { name: 'Água Destilada', highAlert: false },
    { name: 'Fentanil (Opioide)', highAlert: true },
  ]), []);

  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showRefAlert, setShowRefAlert] = useState(false);

  const toggleMed = (name: string) => {
    if (showResult) return;
    setSelected(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleVerify = () => {
    const highAlertMeds = meds.filter(m => m.highAlert).map(m => m.name);
    const correctCount = selected.filter(name => highAlertMeds.includes(name)).length;
    const wrongCount = selected.filter(name => !highAlertMeds.includes(name)).length;

    if (correctCount === highAlertMeds.length && wrongCount === 0) {
      setShowResult(true);
      playSound('correct');
    } else {
      playSound('wrong');
      playSound('whistle');
      setShowRefAlert(true);
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
        q: "Antes de administrar um medicamento, qual o primeiro passo de segurança?",
        options: ["Dar o remédio o mais rápido possível", "Conferir o nome do paciente e o nome do remédio", "Perguntar se o paciente está com fome", "Escolher qualquer caixa na prateleira"],
        correct: 1,
        feedback: "Verificar o nome do 'jogador' e o 'uniforme' (remédio) evita erros fatais!"
      },
      {
        q: "Se o paciente disser 'esse remédio é diferente do que eu tomo', o que fazer?",
        options: ["Dizer que a cor mudou e mandar ele tomar", "Parar, não administrar e conferir a prescrição novamente", "Ignorar e seguir o horário", "Jogar o remédio no lixo comum"],
        correct: 1,
        feedback: "Sempre ouça o paciente! A dúvida dele é um alerta de segurança importante."
      },
      {
        q: "Por que as vezes dois profissionais conferem o mesmo remédio (Dupla Checagem)?",
        options: ["Porque eles têm tempo sobrando", "Para dobrar a atenção e evitar que um erro passe despercebido", "Para conversar sobre o jogo", "Porque um não confia no outro"],
        correct: 1,
        feedback: "Dois pares de olhos veem melhor que um. É o VAR da medicação!"
      },
      {
        q: "O que são Medicamentos de Alta Vigilância (os 'VIPs' do risco)?",
        options: ["Remédios que custam muito barato", "Remédios que exigem cuidado total pois um erro pode ser grave", "Remédios que todo mundo pode tomar", "Remédios que não precisam de receita"],
        correct: 1,
        feedback: "Sono os 'craques' perigosos. Qualquer descuido pode custar o campeonato (a vida)."
      },
      {
        q: "Onde devem ser descartadas as agulhas usadas?",
        options: ["No lixo do banheiro", "Na caixa amarela de perfurocortantes (Descarpack)", "No bolso do jaleco", "Na pia da cozinha"],
        correct: 1,
        feedback: "Segurança para você e para o time de limpeza. Use sempre o coletor correto!"
      },
      {
        q: "Como o profissional identifica o paciente antes do remédio?",
        options: ["Chando pelo apelido", "Conferindo o nome completo na pulseira e na prescrição", "Olhando se ele parece simpático", "Pelo número da sorte"],
        correct: 1,
        feedback: "A pulseira é o 'RG' do jogador em campo. Não jogue sem conferir!"
      },
      {
        q: "Por que não podemos deixar remédios soltos em cima da mesa ou bancada?",
        options: ["Para a mesa não ficar bagunçada", "Para evitar que sejam trocados ou tomados por engano", "Porque o remédio estraga com a luz", "Para economizar espaço"],
        correct: 1,
        feedback: "Cada coisa em seu lugar. Organização é a base de uma defesa sólida!"
      },
      {
        q: "Lavar as mãos antes de preparar o medicamento é necessário?",
        options: ["Apenas se as mãos estiverem visivelmente sujas", "Sim, evita contaminar o remédio com germes e bactérias", "Não, o remédio já mata os germes", "Só se o médico estiver olhando"],
        correct: 1,
        feedback: "Higiene é fundamental! Comece a jogada com as mãos limpas."
      },
      {
        q: "O que significa 'Medicamento Vencido'?",
        options: ["Que ele ficou mais forte", "Que ele não deve ser usado pois perdeu a validade e segurança", "Que ele mudou de sabor", "Que ele ganhou o campeonato"],
        correct: 1,
        feedback: "Fora da validade, o remédio está fora de jogo. Descarte conforme a regra!"
      },
      {
        q: "Se você encontrar um remédio sem etiqueta (identificação), o que faz?",
        options: ["Tenta adivinhar qual é pelo cheiro", "Não utiliza e descarta de forma segura conforme protocolo", "Dá para o paciente de qualquer jeito", "Guarda de volta na gaveta"],
        correct: 1,
        feedback: "Na dúvida, não jogue! Remédio sem nome é um perigo oculto."
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
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-500">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Conhecimento Farmacêutico</p>
            <div className="text-5xl font-black text-amber-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "Doping Zero! Você é mestre na segurança de medicamentos." : 
               score >= 50 ? "Bom jogo, mas reforce a atenção com os medicamentos de alta vigilância!" : 
               "Muitas falhas na medicação. Revise os 9 Certos e a dupla checagem!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-amber-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full font-bold text-amber-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-amber-500 animate-pulse" : "bg-slate-200")} />
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
                "border-slate-100 hover:border-amber-200 hover:bg-slate-50",
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
              ⚠️ <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "CARTÃO AMARELO!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={3}
      title="Segurança de Medicamentos"
      description="Reduzir erros com medicamentos de alta vigilância."
      color="bg-amber-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-100">
            <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Instruções da Partida: Meta 3
            </h3>
            <div className="space-y-4">
              <p className="text-amber-900 font-bold text-lg">Segurança na Hora do Remédio</p>
              <p className="text-amber-800/80 text-sm leading-relaxed">
                Dar o remédio certo para a pessoa certa é a nossa missão principal. Alguns medicamentos são mais "fortes" e precisam de atenção redobrada do time para garantir que o paciente siga firme no jogo.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-black text-amber-500 uppercase">Regra de Ouro</span>
                  <p className="text-amber-900 font-black">Conferir Sempre (Dupla Checagem)</p>
                  <p className="text-[10px] text-amber-700 mt-1">Sempre que possível, peça para um colega conferir o remédio com você antes de entregar ao paciente.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <img 
               src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" 
               alt="Medicamentos de Alta Vigilância" 
               className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute bottom-4 right-4 z-20 bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                Fair Play (Segurança)
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-amber-900">Atenção no Campo</h3>
          <p className="text-slate-600">
            Tratar o paciente com o remédio errado é como marcar um gol contra. Para evitar isso, seguimos as regras do jogo: conferimos o nome, o horário e a dose com calma.
          </p>
          <div className="bg-amber-50 p-6 rounded-2xl border-l-4 border-amber-500">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Trabalho em Equipe
            </h4>
            <p className="text-xs text-amber-700">Se você tiver dúvida sobre qualquer medicação, pare e pergunte! O time está aqui para se ajudar e proteger o paciente.</p>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-6">
          <p className="text-sm text-slate-500">Selecione todos os medicamentos de <strong>Alta Vigilância</strong> no estoque:</p>
          <div className="grid grid-cols-2 gap-3">
            {meds.map((med) => (
              <button
                key={med.name}
                onClick={() => toggleMed(med.name)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left text-xs font-bold transition-all",
                  selected.includes(med.name) ? "border-amber-500 bg-amber-50" : "border-slate-100 hover:border-amber-100"
                )}
              >
                {med.name}
              </button>
            ))}
          </div>
          <button 
            onClick={handleVerify}
            className={cn(
              "w-full py-4 rounded-xl font-bold transition-all",
              showResult ? "bg-emerald-500 text-white" : "bg-amber-600 text-white hover:bg-amber-700"
            )}
          >
            {showResult ? "Identificados! Prossiga para o Quiz." : "Verificar Estoque"}
          </button>

          {showRefAlert && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-28 bg-amber-400 flex items-center justify-center">
                  <span className="text-5xl select-none">🟨</span>
                </div>
                <div className="mt-20 space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-amber-800 text-xs font-black uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Falta de Segurança
                  </div>
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-tight">Decisão do Árbitro: <br/><span className="text-amber-500">Cartão Amarelo!</span></h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                    Identificação incompleta! Nem todos os medicamentos de alta vigilância do estoque foram selecionados corretamente, ou foram incluídos medicamentos comuns. <br/>
                    <span className="text-[10px] text-slate-500 font-medium block mt-2">DICA: Lembre-se, Potássio Cloreto, Insulina, Heparina, Varfarina e Fentanil são críticos e exigem dupla checagem!</span>
                  </p>
                  <button
                    onClick={() => setShowRefAlert(false)}
                    className="w-full mt-2 bg-slate-900 text-white font-black py-3 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-tight text-sm shadow-md"
                  >
                    Voltar ao Campo 💪
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      }
      quizComponent={<Quiz />}
    />
  );
}
