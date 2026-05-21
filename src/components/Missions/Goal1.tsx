import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, User, Calendar, IdCard, BookOpen, AlertCircle, UserCheck, Trophy } from 'lucide-react';
import { cn, prepareQuizQuestions } from '../../lib/utils';
import { MissionContainer } from '../MissionContainer';
import { playSound } from '../../lib/sound';
import patientWristbandUrl from '../../assets/images/patient_id_wristband_1779191847002.png';

interface Props {
  onComplete: (score: number) => void;
}

export function Goal1Mission({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [practiceDone, setPracticeDone] = useState(false);

  // Practice Logic
  const scenario = {
    patient: { name: "RICARDO OLIVEIRA SANTOS", dob: "12/05/1985" },
    wristband: { name: "RICARDO OLIVEIRA SANTOS", dob: "12/05/1985" },
    wrongWristband: { name: "RICARDO O. SANTOS", dob: "12/05/1986" }
  };

  const handleChoice = (isCorrect: boolean) => {
    if (isCorrect) {
      setFeedback('success');
      setTimeout(() => {
        if (step === 2) setPracticeDone(true);
        else {
          setStep(2);
          setFeedback(null);
        }
      }, 1500);
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1500);
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
        q: "Qual a melhor forma de identificar um paciente corretamente?",
        options: ["Pelo número do quarto", "Pelo nome completo, data de nascimento na pulseira e o nome da mãe", "Pelo apelido que ele gosta", "Pela cor da roupa"],
        correct: 1,
        feedback: "Pulseira é o RG do paciente no hospital. Nome e data não falham!"
      },
      {
        q: "Quando devemos conferir a identificação do paciente?",
        options: ["Apenas na hora da internação", "Antes de qualquer cuidado, exame ou remédio", "Só se o paciente for novo", "Quando o chefe estiver olhando"],
        correct: 1,
        feedback: "Segurança em cada etapa. Conferir antes de agir evita o erro!"
      },
      {
        q: "O que fazer se o paciente estiver sem pulseira de identificação?",
        options: ["Continuar o atendimento normalmente", "Providenciar a pulseira imediatamente antes de qualquer ação", "Chamar pelo nome e confiar na resposta", "Esperar o próximo turno"],
        correct: 1,
        feedback: "Paciente sem pulseira é um jogador sem uniforme. Identifique antes de jogar!"
      },
      {
        q: "Se um paciente estiver confuso e disser o nome errado, o que você faz?",
        options: ["Acredita nele", "Confere os dados na pulseira e no prontuário", "Ri da situação", "Pergunta para o vizinho de quarto"],
        correct: 1,
        feedback: "A pulseira é a fonte da verdade. Dados batendo é gol certo!"
      },
      {
        q: "A pulseira branca geralmente serve para quê?",
        options: ["Identificação padrão do paciente", "Indicar que ele tem alergia", "Indicar risco de queda", "Decorar o braço"],
        correct: 0,
        feedback: "Branca é a base. Outras cores (como vermelho) avisam sobre riscos específicos como alergias."
      },
      {
        q: "Por que não usamos o número do leito como identificação?",
        options: ["Porque os números são feios", "Porque o paciente pode mudar de leito e causar confusão", "Porque o leito não tem nome", "Porque o médico não gosta"],
        correct: 1,
        feedback: "Leitos mudam, pessoas não. Use sempre os dados do paciente!"
      },
      {
        q: "O que deve ser feito se os dados na pulseira estiverem ilegíveis (apagados)?",
        options: ["Tentar adivinhar o que está escrito", "Trocar a pulseira por uma nova e legível", "Deixar como está", "Pedir para o paciente escrever com caneta"],
        correct: 1,
        feedback: "Se não dá para ler, não dá para conferir. Troque a pulseira!"
      },
      {
        q: "Um visitante pode confirmar a identidade do paciente?",
        options: ["Sim, mas os dados devem ser conferidos com a pulseira também", "Não, acompanhantes nunca sabem nada", "Sim, pode confiar cegamente", "Só se for parente de primeiro grau"],
        correct: 0,
        feedback: "Acompanhantes ajudam, mas o protocolo exige conferir a pulseira oficial."
      },
      {
        q: "Qual o risco de não identificar corretamente um paciente?",
        options: ["Nenhum, é só burocracia", "Realizar procedimentos ou dar remédios para a pessoa errada", "O hospital ganhar uma multa", "O café esfriar"],
        correct: 1,
        feedback: "Erro de identificação é gol contra grave. Identificar bem é a melhor defesa!"
      },
      {
        q: "Ao chamar o paciente, o que é mais seguro?",
        options: ["Falar 'O senhor da cirurgia?'", "Perguntar 'Qual o seu nome completo?'", "Falar 'Pode vir o próximo'", "Assobiar"],
        correct: 1,
        feedback: "Deixe o paciente dizer o nome. Isso confirma que ele é quem diz ser!"
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
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-500">
            <Trophy className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Fim de Jogo!</h2>
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Seu Desempenho</p>
            <div className="text-5xl font-black text-blue-600 mb-1">{score}%</div>
            <p className="text-slate-600 font-medium italic">
              {score >= 80 ? "Craque da Seleção! Identificação impecável." : 
               score >= 50 ? "Bom jogo, mas atenção aos detalhes da escalação!" : 
               "Treine mais a tática para não cometer erros na identificação!"}
            </p>
          </div>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all uppercase tracking-tight"
          >
            Finalizar Missão
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Rodada {qIndex + 1} de {questions.length}</span>
              <span className="text-[9px] bg-blue-100 px-2 py-0.5 rounded-full font-bold text-blue-800 self-start">Dificuldade: 40% (Médio)</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full shrink-0", i < qIndex ? "bg-emerald-500" : i === qIndex ? "bg-blue-500 animate-pulse" : "bg-slate-200")} />
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
                "border-slate-100 hover:border-blue-200 hover:bg-slate-50",
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
              ⚽ <span className="font-black">{timeLeft === 0 ? "FIM DO TEMPO!" : "BOLA NA TRAVE!"}</span> {questions[qIndex].feedback}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <MissionContainer
      goalId={1}
      title="Identificação Correta"
      description="Certifique-se de que o paciente certo receba o cuidado certo."
      color="bg-blue-600"
      onComplete={onComplete}
      briefingContent={
        <div className="space-y-8">
          <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Ficha Técnica: Meta 1
            </h3>
            <div className="space-y-4">
              <p className="text-blue-900 font-bold text-lg">O que é a Identificação do Paciente?</p>
              <p className="text-blue-800/80 text-sm leading-relaxed">
                É o processo que garante que o paciente receba o cuidado ou tratamento para o qual foi destinado. O objetivo é prevenir erros como administração de medicamentos errados, procedimentos em pacientes trocados ou entrega de bebês à família errada.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-blue-400 uppercase">Identificador 1</span>
                  <p className="text-blue-900 font-black">Nome Completo</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-blue-400 uppercase">Identificador 2</span>
                  <p className="text-blue-900 font-black">Data de Nascimento</p>
                </div>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-200">
             <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                <UserCheck className="w-20 h-20 opacity-20" />
             </div>
             <img 
               src="/src/assets/images/patient_id_wristband_1779191847002.png" 
               alt="Identificação de Paciente" 
               className="w-full h-full object-cover relative z-10 opacity-90 transition-transform group-hover:scale-105"
               referrerPolicy="no-referrer"
             />
             <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                Conferência de Pulseira
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-blue-900">Escalação Confirmada?</h3>
          <p className="text-slate-600 leading-relaxed">
            Ninguém entra em campo sem conferir a escalação. Na saúde, a identificação correta é o apito inicial para um atendimento seguro. 
          </p>
          <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Regra de Ouro
            </h4>
            <p className="text-blue-700 text-sm">
              Confira sempre Nome e Data de Nascimento. O número do leito é como o número da camisa: pode mudar, mas o craque (paciente) continua o mesmo!
            </p>
          </div>
        </div></div>
      }
      practiceComponent={
        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Simulador de Conferência</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prontuário</span>
                <p className="text-lg font-bold text-slate-700">{scenario.patient.name}</p>
                <p className="text-slate-500 text-sm">{scenario.patient.dob}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pulseira</span>
                <p className="text-lg font-bold text-slate-700">
                  {step === 1 ? scenario.wristband.name : scenario.wrongWristband.name}
                </p>
                <p className="text-slate-500 text-sm">
                  {step === 1 ? scenario.wristband.dob : scenario.wrongWristband.dob}
                </p>
                {feedback && (
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center backdrop-blur-sm",
                    feedback === 'success' ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"
                  )}>
                    {feedback === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => handleChoice(step === 2)} className="flex-1 py-4 rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-100 transition-all">ESTÁ INCORRETO</button>
              <button onClick={() => handleChoice(step === 1)} className="flex-1 py-4 rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-100 transition-all">ESTÁ CORRETO</button>
            </div>
          </div>
        </div>
      }
      quizComponent={<Quiz />}
    />
  );
}
