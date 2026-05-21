import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Waves, CheckCircle2, Circle, AlertCircle, BookOpen, Trophy } from 'lucide-react';
import { cn, shuffleArray, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal5Mission({ onComplete }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [practiceDone, setPracticeDone] = useState(false);
  const [showRefAlert, setShowRefAlert] = useState(false);

  const moments = React.useMemo(() => shuffleArray([
    { id: 1, text: 'Antes de tocar o paciente' },
    { id: 2, text: 'Após tocar o paciente' },
    { id: 3, text: 'Antes de realizar procedimento limpo/asséptico' },
    { id: 4, text: 'Após tocar superfícies próximas ao paciente' },
    { id: 5, text: 'Após risco de exposição a fluidos corporais' },
    { id: 6, text: 'Apenas quando as mãos estiverem visivelmente sujas', wrong: true },
  ]), []);

  const handleSelect = (id: number) => {
    if (practiceDone) return;
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleVerify = () => {
    const correctIds = moments.filter(m => !m.wrong).map(m => m.id);
    const hasAllCorrect = correctIds.every(id => selected.includes(id));
    const hasNoWrong = selected.every(id => !moments.find(m => m.id === id)?.wrong);

    if (hasAllCorrect && hasNoWrong && selected.length === correctIds.length) {
      setPracticeDone(true);
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
        q: "Qual a medida mais importante para evitar que o paciente pegue uma infecção?",
        options: ["Deixar as janelas abertas", "Lavar e higienizar as mãos corretamente", "Usar perfume forte", "Falar baixo"],
        correct: 1,
        feedback: "Mãos limpas são a nossa melhor chuteira para ganhar das bactérias!"
      },
      {
        q: "Quantos momentos o time deve higienizar as mãos (segundo a OMS)?",
        options: ["1 momento", "2 momentos", "5 momentos", "Sempre que lembrar"],
        correct: 2,
        feedback: "São 5 momentos sagrados! Como os 5 dedos da mão."
      },
      {
        q: "O álcool em gel substitui a lavagem com água e sabão quando as mãos estão visivelmente sujas?",
        options: ["Sim, o álcool limpa tudo", "Não, se houver sujeira visível, deve-se usar água e sabão", "Só se for álcool 70%", "Tanto faz"],
        correct: 1,
        feedback: "Sujeira que a gente vê exige sabão. O álcool é para quando as mãos parecem limpas."
      },
      {
        q: "Devemos higienizar as mãos ANTES de tocar o paciente?",
        options: ["Não, só depois", "Sim, para não levar germes para ele", "Apenas se ele pedir", "Só se estivermos gripados"],
        correct: 1,
        feedback: "Proteja o paciente logo na entrada. Mão limpa antes do toque!"
      },
      {
        q: "E DEPOIS de tocar o paciente, precisa higienizar?",
        options: ["Não, ele já está limpo", "Sim, para não levar germes para outros pacientes ou para você", "Só se o paciente estiver sujo", "Apenas no final do dia"],
        correct: 1,
        feedback: "Não leve o adversário para outro campo. Higienize logo após o contato."
      },
      {
        q: "Usar luvas dispensa a necessidade de lavar as mãos?",
        options: ["Sim, a luva é um escudo total", "Não, deve-se higienizar as mãos antes de colocar e depois de retirar as luvas", "Sim, mas só luva cirúrgica", "Apenas se a luva for grossa"],
        correct: 1,
        feedback: "A luva ajuda, mas não é perfeita. Lavar as mãos é a base de tudo!"
      },
      {
        q: "Por quanto tempo devemos esfregar as mãos com álcool ou sabão?",
        options: ["2 segundos", "Cerca de 20 a 30 segundos (o tempo de cantar Parabéns)", "Pelo menos 5 minutos", "Até cansar"],
        correct: 1,
        feedback: "Dê tempo para a limpeza agir! 20 segundinhos garantem o gol."
      },
      {
        q: "Usar anéis e pulseiras durante o trabalho na saúde é recomendado?",
        options: ["Sim, são bonitos", "Não, eles escondem sujeira e bactérias", "Só se forem de ouro", "Apenas um por mão"],
        correct: 1,
        feedback: "Adornos são esconderijos para os germes. Jogue 'limpo', tire os anéis!"
      },
      {
        q: "Higiene das mãos também protege a família do colaborador?",
        options: ["Sim, evita levar germes do hospital para casa", "Não, não tem relação", "Apenas se morarem perto", "Só se tiverem imunidade baixa"],
        correct: 0,
        feedback: "Sua segurança no trabalho é a segurança da sua família em casa."
      },
      {
        q: "Quem deve cobrar a higiene das mãos no hospital?",
        options: ["Apenas os chefes", "Apenas os pacientes", "Todo mundo pode e deve cobrar um ao outro", "Ninguém deve se meter"],
        correct: 2,
        feedback: "Time unido joga limpo. Se alguém esquecer, dê um toque amigável!"
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
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-500">
            <Trophy className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Defesa Contra Infecções</p>
            <div className="text-5xl font-black text-indigo-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "Campo Limpo! Sua higiene das mãos é nível profissional." : 
               score >= 50 ? "Bom jogo, mas não ignore os 5 momentos de proteção!" : 
               "Muitos gols sofridos por infecção. Pratique mais os momentos da OMS!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-indigo-100 px-2 py-0.5 rounded-full font-bold text-indigo-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-indigo-500 animate-pulse" : "bg-slate-200")} />
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
                "border-slate-100 hover:border-indigo-200 hover:bg-slate-50",
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
              🧼 <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "FALTA DE HIGIENE!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={5}
      title="Higiene das Mãos"
      description="Prevenir infecções associadas aos cuidados de saúde."
      color="bg-indigo-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ficha Técnica: Meta 5
            </h3>
            <div className="space-y-4">
              <p className="text-indigo-900 font-bold text-lg">Higiene das Mãos: A Barreira Principal</p>
              <p className="text-indigo-800/80 text-sm leading-relaxed">
                A higiene das mãos é a medida mais simples e eficaz para prevenir a transmissão de microrganismos e reduzir as Infecções Relacionadas à Assistência à Saúde (IRAS). A técnica correta e o momento certo salvam vidas e reduzem custos hospitalares.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl border border-indigo-200">
                  <span className="text-[10px] font-black text-indigo-500 uppercase">Padrão Ouro</span>
                  <p className="text-indigo-900 font-black">Os 5 Momentos da OMS</p>
                  <p className="text-[10px] text-indigo-700 mt-1">Conhecer e praticar os 5 momentos garante segurança para o paciente e para o profissional.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <img 
               src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
               alt="Higiene das Mãos" 
               className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-4 left-4 z-20 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg">
                Campo de Jogo Limpo
             </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-indigo-900">Higiene: Campo Limpo, Jogo Limpo</h3>
          <p className="text-slate-600">
            Manter o campo (o hospital) livre de bactérias exige mãos limpas. É a defesa principal contra os 'gols contra' causados pelas infecções.
          </p>
          <div className="bg-indigo-50 p-6 rounded-2xl border-l-4 border-indigo-500">
            <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Os 5 Momentos do Craque
            </h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Diretrizes da OMS para não deixar o adversário (gérmen) entrar na área do paciente.
            </p>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-6">
          <p className="text-sm text-slate-500">Selecione os <strong>5 momentos</strong> corretos para a higiene:</p>
          <div className="space-y-2">
            {moments.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-sm",
                  selected.includes(m.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-100"
                )}
              >
                {selected.includes(m.id) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {m.text}
              </button>
            ))}
          </div>
          <button 
            onClick={handleVerify}
            className={cn(
              "w-full py-4 rounded-xl font-bold transition-all",
              practiceDone ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            {practiceDone ? "Momentos Corretos! Vá para o Quiz." : "Verificar 5 Momentos"}
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
                    <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Falta de Higiene
                  </div>
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-tight">Decisão do Árbitro: <br/><span className="text-amber-500">Cartão Amarelo!</span></h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                    Escolhas incorretas detectadas! Lembre-se, existem exatamente 5 momentos estabelecidos para proteger o paciente e a você. <br/>
                    <span className="text-[10px] text-slate-500 font-medium block mt-2">DICA: Exemplo: higienização ANTES e APÓS tocar o paciente e ambientes próximos. A opção de limpar 'apenas se as mãos estiverem visivelmente sujas' invalida as regras de ouro pois a higienização com álcool ou sabão também deve ser feita preventivamente mesmo com as mãos parecendo limpas!</span>
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
