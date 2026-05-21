import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
  
import { 
  UserCheck, 
  MessageSquareText, 
  Pill, 
  Stethoscope, 
  Waves, 
  ShieldAlert,
  Trophy,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Hospital,
  Info,
  Menu,
  X,
  Target,
  Flag,
  Award,
  Settings,
  Lock,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { GOALS, Goal, GoalId, UserProgress } from './types';
import { preloadSounds, playSound, getMuteState, toggleMuteState } from './lib/sound';

// Mission Components
import { Goal1Mission } from './components/Missions/Goal1';
import { Goal2Mission } from './components/Missions/Goal2';
import { Goal3Mission } from './components/Missions/Goal3';
import { Goal4Mission } from './components/Missions/Goal4';
import { Goal5Mission } from './components/Missions/Goal5';
import { Goal6Mission } from './components/Missions/Goal6';
import { Certificate } from './components/Certificate';
import { StickerAlbum } from './components/StickerAlbum';
import { StickerPackAnimation } from './components/StickerPackAnimation';

import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import { auth, db } from './services/firebase';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { SoccerCelebration } from './components/SoccerCelebration';
import { MascotHelper } from './components/MascotHelper';
import { TransparentImage } from './components/TransparentImage';
import mascotUrl from './assets/images/husf_mascote_updated_1779362707243.png';

const GOAL_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>({
    completedGoals: [],
    scores: {} as Record<GoalId, number>,
    stickers: [],
    userName: '',
    unit: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [stickerToReveal, setStickerToReveal] = useState<GoalId | null>(null);
  const [isLastCelebrationGoal, setIsLastCelebrationGoal] = useState(true);
  const [unlockedGoals, setUnlockedGoals] = useState<(string | number)[]>([]);
  const [stickersConfig, setStickersConfig] = useState<Record<string, { img: string, title: string }>>({});
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [isNewAccess, setIsNewAccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const [showGoalIntro, setShowGoalIntro] = useState(true);
  const [muted, setMuted] = useState(getMuteState());

  useEffect(() => {
    preloadSounds();
    const saved = localStorage.getItem('paciente_seguro_progress');
    const savedId = localStorage.getItem('paciente_seguro_player_id');
    let loadedProgress: any = null;
    if (saved && savedId) {
      const parsed = JSON.parse(saved);
      loadedProgress = {
        ...parsed,
        scores: parsed.scores || {},
        stickers: parsed.stickers || [],
        history: parsed.history || []
      };
      setProgress(loadedProgress);
      setPlayerId(savedId);
      if (parsed.unit) {
        setHasSavedSession(true);
      }
    }

    const mergeHistory = (localHistory: any[], dbHistory: any[]): any[] => {
      const mergedMap = new Map<string, any>();
      (dbHistory || []).forEach(item => {
        if (item && item.goalId) {
          mergedMap.set(`${item.goalId}`, item);
        }
      });
      (localHistory || []).forEach(item => {
        if (item && item.goalId) {
          const existing = mergedMap.get(`${item.goalId}`);
          if (!existing || item.score > existing.score) {
            mergedMap.set(`${item.goalId}`, item);
          }
        }
      });
      return Array.from(mergedMap.values());
    };

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (localStorage.getItem('paciente_seguro_is_logged_out') === 'true') {
          setIsAdmin(false);
          setIsLoggedIn(false);
          return;
        }
        setIsAdmin(user.email === 'diretoriaensino@husf.org.br');
        setPlayerId(user.uid);
        setIsLoggedIn(true);
        
        try {
          // Fetch existing progress from Firestore
          const playerDocRef = doc(db, 'players', user.uid);
          const playerDoc = await getDoc(playerDocRef);
          
          let dbProgress: any = null;
          if (playerDoc.exists()) {
            const data = playerDoc.data();
            if (data) {
              dbProgress = {
                completedGoals: data.completedGoals || [],
                scores: data.scores || {},
                stickers: data.stickers || [],
                userName: data.userName || data.name || user.displayName || 'Jogador',
                unit: data.unit || '',
                history: data.history || []
              };
            }
          }
          
          // Merge local storage state and database state
          setProgress(prev => {
            const currentLocal = localStorage.getItem('paciente_seguro_progress');
            const latestData = currentLocal ? JSON.parse(currentLocal) : (loadedProgress || prev);
            
            const mergedProgress = {
              completedGoals: Array.from(new Set([
                ...(latestData?.completedGoals || []), 
                ...(dbProgress?.completedGoals || [])
              ])) as GoalId[],
              scores: { ...(dbProgress?.scores || {}), ...(latestData?.scores || {}) },
              stickers: Array.from(new Set([
                ...(latestData?.stickers || []), 
                ...(dbProgress?.stickers || [])
              ])) as GoalId[],
              userName: latestData?.userName || dbProgress?.userName || user.displayName || prev.userName || 'Jogador',
              unit: latestData?.unit || dbProgress?.unit || prev.unit || '',
              history: mergeHistory(latestData?.history || [], dbProgress?.history || [])
            };
            
            // Re-evaluate maximum score per goal to protect achievements
            const mergedScores = { ...mergedProgress.scores };
            const allGoalIds = [1, 2, 3, 4, 5, 6] as GoalId[];
            allGoalIds.forEach(id => {
              const localS = latestData?.scores?.[id] || 0;
              const dbS = dbProgress?.scores?.[id] || 0;
              mergedScores[id] = Math.max(localS, dbS);
            });
            mergedProgress.scores = mergedScores;
            
            localStorage.setItem('paciente_seguro_progress', JSON.stringify(mergedProgress));
            localStorage.setItem('paciente_seguro_player_id', user.uid);
            saveToFirebase(mergedProgress, user.uid, user.email || '');
            
            if (mergedProgress.unit) {
              setHasSavedSession(true);
            }
            return mergedProgress;
          });
        } catch (err) {
          console.error("Erro ao sincronizar progresso com FireStore:", err);
          // Fallback to local storage state only if database fails
          setProgress(prev => {
            const currentLocal = localStorage.getItem('paciente_seguro_progress');
            const latestData = currentLocal ? JSON.parse(currentLocal) : (loadedProgress || prev);
            
            const mergedProgress = {
              ...latestData,
              userName: user.displayName || latestData.userName || prev.userName || 'Jogador'
            };
            
            localStorage.setItem('paciente_seguro_progress', JSON.stringify(mergedProgress));
            localStorage.setItem('paciente_seguro_player_id', user.uid);
            saveToFirebase(mergedProgress, user.uid, user.email || '');
            
            if (mergedProgress.unit) {
              setHasSavedSession(true);
            }
            return mergedProgress;
          });
        }

        const hideWelcome = localStorage.getItem('paciente_seguro_hide_welcome') === 'true';
        if (!hideWelcome) {
          setShowWelcome(true);
        }
      } else {
        setIsAdmin(false);
      }
    });

    // Handle Redirect Result
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setAuthError(null);
      }
    }).catch((error) => {
      console.error("Error with redirect sign-in:", error);
      let translatedErr = "Erro ao fazer login.";
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        translatedErr = `O domínio "${domain}" não está autorizado no Console do Firebase de vocês. Acesse seu Console Firebase -> Authentication -> Configurações -> Domínios Autorizados e adicione "${domain}" à lista para liberar o acesso.`;
      } else if (error.code === 'auth/popup-blocked') {
        translatedErr = "O navegador bloqueou a janela pop-up do Google. Por favor, libere pop-ups para esta página.";
      } else {
        translatedErr = `Erro de Autenticação (${error.code || error.message}): ${error.message}. Por favor, limpe os cookies ou tente de outro dispositivo/navegador.`;
      }
      setAuthError(translatedErr);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'globals'), (doc) => {
      if (doc.exists()) {
        setUnlockedGoals(doc.data().unlockedGoals || []);
      } else {
        setUnlockedGoals([1, 2, 3, 4, 5, 6]); // Fallback using numbers
      }
    });

    const unsubStickers = onSnapshot(doc(db, 'config', 'stickers'), (doc) => {
      if (doc.exists()) {
        setStickersConfig(doc.data() as Record<string, { img: string, title: string }>);
      }
    });

    return () => {
      unsubAuth();
      unsubConfig();
      unsubStickers();
    };
  }, []);

  const saveToFirebase = async (newProgress: UserProgress, pId: string, email?: string) => {
    try {
      const totalScore = Object.values(newProgress.scores || {}).reduce((acc, curr) => acc + curr, 0);
      const averageScore = Math.round(totalScore / 6); // Baseado nas 6 metas totais para incentivar participação

      const dataToSave: any = {
        name: newProgress.userName,
        userName: newProgress.userName,
        unit: newProgress.unit,
        completedGoals: newProgress.completedGoals || [],
        scores: newProgress.scores || {},
        stickers: newProgress.stickers || [],
        goalsCompleted: newProgress.completedGoals.length,
        stickersEarned: newProgress.stickers?.length || 0,
        totalScore: totalScore,
        averageScore: averageScore,
        history: newProgress.history || [],
        lastUpdated: serverTimestamp()
      };

      if (email) {
        dataToSave.email = email;
      }

      await setDoc(doc(db, 'players', pId), dataToSave, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `players/${pId}`);
    }
  };

  const playGoalSound = () => {
    playSound('victory');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    localStorage.removeItem('paciente_seguro_is_logged_out');
    if (progress.unit) {
      const provider = new GoogleAuthProvider();
      // Forçar seleção de conta para evitar login automático errado em ambientes compartilhados
      provider.setCustomParameters({ prompt: 'select_account' });
      
      try {
        await signInWithPopup(auth, provider);
        // O onAuthStateChanged tratará todo o carregamento, mesclagem e sincronização do progresso de forma robusta.
        playGoalSound();
      } catch (error: any) {
        console.error("Error signing in with Google:", error);
        
        // Se for erro de domínio não autorizado, reporta diretamente ao usuário
        if (error.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname;
          setAuthError(`O domínio "${domain}" não está autorizado no Console do Firebase. Acesse seu Console Firebase -> Authentication -> Configurações -> Domínios Autorizados e adicione "${domain}" à lista para liberar o acesso.`);
          return;
        }

        // Se falhar por bloqueio de popup ou erro interno (comum em iframes), tenta redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/internal-error' || error.code === 'auth/web-storage-unsupported') {
          try {
            await signInWithRedirect(auth, provider);
          } catch (redirectError: any) {
            console.error("Error with fallback redirect:", redirectError);
            if (redirectError.code === 'auth/unauthorized-domain') {
              const domain = window.location.hostname;
              setAuthError(`O domínio "${domain}" não está autorizado no Console do Firebase. Acesse seu Console Firebase -> Authentication -> Configurações -> Domínios Autorizados e adicione "${domain}" à lista.`);
            } else {
              setAuthError(`Erro com login de redirecionamento: ${redirectError.message}. Verifique se cookies de terceiros estão permitidos.`);
            }
          }
        } else {
          setAuthError(`Erro de Autenticação (${error.code || error.message}): ${error.message}`);
        }
      }
    }
  };

  const completeGoal = async (goalId: GoalId, score: number) => {
    const isFirstTime = !progress.completedGoals.includes(goalId);
    const existingScore = (progress.scores?.[goalId]) || 0;
    const earnsSticker = score >= 70 && !progress.stickers?.includes(goalId);
    
    if (isFirstTime || score > existingScore || earnsSticker) {
      const newCompleted = isFirstTime ? [...progress.completedGoals, goalId] : progress.completedGoals;
      const newScores = { ...(progress.scores || {}), [goalId]: score };
      const newStickers = earnsSticker ? [...(progress.stickers || []), goalId] : (progress.stickers || []);
      
      const formattedDate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const historyEntry = {
        goalId,
        score,
        completedAt: formattedDate
      };
      
      const existingHistory = progress.history || [];
      const filteredHistory = existingHistory.filter(item => item.goalId !== goalId);
      const newHistory = [...filteredHistory, historyEntry];

      const newProgress = { 
        ...progress, 
        completedGoals: newCompleted, 
        scores: newScores,
        stickers: newStickers,
        history: newHistory
      };
      
      setProgress(newProgress);
      localStorage.setItem('paciente_seguro_progress', JSON.stringify(newProgress));
      
      if (playerId) {
        await saveToFirebase(newProgress, playerId);
      }
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#ffffff']
      });

      if (newCompleted.length === GOALS.length) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.4 }
          });
        }, 500);
      }
    }

    // Determine if it was a goal (>= 60%) or near miss
    setIsLastCelebrationGoal(score >= 60);

    // If earned a sticker, show the sticker pack animation first
    if (earnsSticker) {
      setStickerToReveal(goalId);
    } else {
      // Always show celebration when finishing a mission if no sticker was earned
      setShowCelebration(true);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setActiveGoal(null);
    setShowGoalIntro(true);
  };

  const handleGoalSelect = (goal: Goal) => {
    if (progress.completedGoals.includes(goal.id)) return;
    setActiveGoal(goal);
    setShowGoalIntro(true);
    setShowHistory(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-600 overflow-hidden relative">
        {/* Animated Background Icons */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
              animate={{ 
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                rotate: 360 
              }}
              transition={{ duration: 20 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
              className="absolute text-white text-4xl"
            >
              {i % 2 === 0 ? '⚽' : '🚩'}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 flex flex-col items-center select-none">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-36 h-36"
              >
                <TransparentImage 
                  src={mascotUrl} 
                  alt="Apitinho Mascote" 
                  className="w-full h-full object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [5, 10, 5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-2 bottom-0 bg-yellow-400 text-slate-950 font-black text-[9px] tracking-wider py-1 px-2.5 rounded-full border-2 border-slate-950 shadow-md uppercase"
              >
                Mascote Apitinho! 🌟
              </motion.div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 text-center">Copa da Segurança</h1>
            <p className="text-slate-500 text-center mt-2">Em busca do Hexa da Segurança do Paciente!</p>
          </div>

          {authError && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-xs font-semibold leading-relaxed text-left flex gap-3 shadow-inner"
            >
              <span className="text-xl shrink-0 animate-bounce">⚠️</span>
              <div>
                <strong className="block mb-1 text-red-800 uppercase tracking-tight">Problema de Acesso ao Campo</strong>
                {authError}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {hasSavedSession && !isNewAccess ? (
              <motion.div 
                key="saved-session"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-center">
                  <p className="text-emerald-700 font-bold mb-1">Bem-vindo de volta!</p>
                  <p className="text-slate-500 text-sm mb-4">Você está escalado na seleção:</p>
                  <div className="bg-white py-3 px-4 rounded-xl border border-emerald-200 font-black text-emerald-600 text-lg shadow-sm">
                    {progress.unit}
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    localStorage.removeItem('paciente_seguro_is_logged_out');
                    if (auth.currentUser) {
                      window.location.reload();
                    } else {
                      await handleLogin();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95 animate-pulse hover:animate-none"
                >
                  <span className="text-xl">⚽</span>
                  Voltar para as Missões
                </button>

                <button 
                  onClick={() => setIsNewAccess(true)}
                  className="w-full text-slate-400 font-bold py-2 hover:text-blue-600 transition-colors text-sm"
                >
                  Não é seu setor? Iniciar Novo Acesso
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleLogin} 
                className="space-y-6"
              >
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Sua 'Seleção' (Setor)</label>
                   <select 
                     required
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white font-medium"
                     value={progress.unit}
                     onChange={e => setProgress({...progress, unit: e.target.value})}
                   >
                     <option value="">Selecione seu Setor...</option>
                   <option value="ALA DE INTERNAÇÃO I">ALA DE INTERNAÇÃO I</option>
<option value="ALA DE INTERNAÇÃO II">ALA DE INTERNAÇÃO II</option>
<option value="ALA DE INTERNAÇÃO III">ALA DE INTERNAÇÃO III</option>
<option value="ALA DE INTERNAÇÃO IV">ALA DE INTERNAÇÃO IV</option>
<option value="ALMOXARIFADO">ALMOXARIFADO</option>
<option value="ALOJAMENTO CONJUNTO">ALOJAMENTO CONJUNTO</option>
<option value="AMBULATORIO HUSF">AMBULATORIO HUSF</option>
<option value="CAF">CAF</option>
<option value="CCIRAS">CCIRAS</option>
<option value="CENTRAL DE GUIAS">CENTRAL DE GUIAS</option>
<option value="CENTRO CIRURGICO">CENTRO CIRURGICO</option>
<option value="CME">CME</option>
<option value="COMERCIAL">COMERCIAL</option>
<option value="COMPRAS">COMPRAS</option>
<option value="COMUNICAÇÃO ORGANIZACIONAL">COMUNICAÇÃO ORGANIZACIONAL</option>
<option value="CONTABILIDADE">CONTABILIDADE</option>
<option value="CONTROLADORIA">CONTROLADORIA</option>
<option value="COWORKING">COWORKING</option>
<option value="DIRETORIA ADMINISTRATIVA">DIRETORIA ADMINISTRATIVA</option>
<option value="DIRETORIA DE ENFERMAGEM">DIRETORIA DE ENFERMAGEM</option>
<option value="DIRETORIA DE ENSINO E PESQUISA">DIRETORIA DE ENSINO E PESQUISA</option>
<option value="DIRETORIA TECNICA">DIRETORIA TECNICA</option>
<option value="EDUCAÇÃO CONTINUADA">EDUCAÇÃO CONTINUADA</option>
<option value="ENGENHARIA CLINICA">ENGENHARIA CLINICA</option>
<option value="ENGENHARIA HOSPITALAR">ENGENHARIA HOSPITALAR</option>
<option value="EXCELENCIA OPERACIONAL">EXCELENCIA OPERACIONAL</option>
<option value="FARMACIA HOSPITALAR">FARMACIA HOSPITALAR</option>
<option value="FATURAMENTO">FATURAMENTO</option>
<option value="FINANCEIRO">FINANCEIRO</option>
<option value="FISIOTERAPIA">FISIOTERAPIA</option>
<option value="HEMODINAMICA">HEMODINAMICA</option>
<option value="HOSPITAL DIA">HOSPITAL DIA</option>
<option value="IMAGINOLOGIA">IMAGINOLOGIA</option>
<option value="LACTARIO">LACTARIO</option>
<option value="LIMPEZA E HIGIENIZAÇÃO">LIMPEZA E HIGIENIZAÇÃO</option>
<option value="MULTIDISCIPLINAR">MULTIDISCIPLINAR</option>
<option value="NIR">NIR</option>
<option value="NSP-QUALIDADE">NSP-QUALIDADE</option>
<option value="ODONTOLOGIA">ODONTOLOGIA</option>
<option value="OPME">OPME</option>
<option value="PATRIMONIO">PATRIMONIO</option>
<option value="PEDIATRIA">PEDIATRIA</option>
<option value="PORTA REGULADA">PORTA REGULADA</option>
<option value="PRONTO ATENDIMENTO">PRONTO ATENDIMENTO</option>
<option value="QUARTO PPP">QUARTO PPP</option>
<option value="RADIOLOGIA">RADIOLOGIA</option>
<option value="RECEPÇÃO">RECEPÇÃO</option>
<option value="RECRUTAMENTO E SELEÇÃO">RECRUTAMENTO E SELEÇÃO</option>
<option value="RH">RH</option>
<option value="ROUPARIA">ROUPARIA</option>
<option value="SADT ENFERMAGEM">SADT ENFERMAGEM</option>
<option value="SADT LABORATORIO">SADT LABORATORIO</option>
<option value="SAME">SAME</option>
<option value="SEGURANÇA DO TRABALHO">SEGURANÇA DO TRABALHO</option>
<option value="SERVIÇO SOCIAL">SERVIÇO SOCIAL</option>
<option value="TI">TI</option>
<option value="TRANSPORTE">TRANSPORTE</option>
<option value="UNIDADE DE ALIMENTAÇÃO E NUTRIÇÃO">UNIDADE DE ALIMENTAÇÃO E NUTRIÇÃO</option>
<option value="UTI ADULTO">UTI ADULTO</option>
<option value="UTI NEONATOLOGICA">UTI NEONATOLOGICA</option>
<option value="UTI PEDIATRICA">UTI PEDIATRICA</option>
                   </select>
                </div>

                <button 
                  type="submit"
                  className={cn(
                    "w-full flex items-center justify-center gap-3 bg-white border-2 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95",
                    progress.unit ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50" : "border-slate-200 text-slate-300 cursor-not-allowed"
                  )}
                  disabled={!progress.unit}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Entrar em Campo com Google
                </button>

                {hasSavedSession && (
                  <button 
                    onClick={() => setIsNewAccess(false)}
                    className="w-full text-slate-400 font-bold py-2 hover:text-blue-600 transition-colors text-sm"
                  >
                    Voltar para Acesso Rápido
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-700/90 text-white overflow-y-auto relative p-4 md:p-6 select-none leading-normal">
        {/* Animated Background Icons */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
              animate={{ 
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                rotate: 360 
              }}
              transition={{ duration: 25 + Math.random() * 15, repeat: Infinity, ease: "linear" }}
              className="absolute text-white text-4xl"
            >
              {i % 2 === 0 ? '⚽' : '🚩'}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          className="bg-slate-900/95 border-4 border-emerald-500 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-6"
        >
          {/* Header with Trophy */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.8, repeat: 2, delay: 0.2 }}
              className="mb-4"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-400">
                <Trophy className="w-12 h-12 text-slate-950" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Bem-vindo, <span className="text-yellow-300">{progress.userName?.split(' ')[0]}!</span>
            </h1>
            <p className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-4 py-1.5 rounded-full mt-2 text-sm flex items-center gap-1.5 self-center">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              Sua escalação no setor <strong className="text-white">{progress.unit}</strong> está confirmada!
            </p>
          </div>

          {/* Tutorial Section */}
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="text-yellow-300">📋</span> Como Jogar - Guia de Jogo
            </h2>
            
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs border border-emerald-500/30">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">📋 Estude a Preleção</h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Antes de entrar em campo, estude o conteúdo teórico de cada Meta Internacional de Segurança do Paciente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs border border-emerald-500/30">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">⚡ Jogo Real Direto</h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Não há fase de simulador! Ao aceitar o desafio, você vai direto para o <strong>Jogo Real</strong> para responder as perguntas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs border border-emerald-500/30">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">⏱️ Tempo Limite Corre Rápido!</h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Você tem apenas <strong className="text-rose-400 font-bold">20 segundos</strong> por pergunta para dar a resposta correta e pontuar. Seja ágil!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs border border-emerald-500/30">
                  4
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">🏆 Marque Gols e Colecione</h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Alcance mais de 70% de acerto nas missões para marcar um Golaço, desbloquear figurinhas raras e completar seu Álbum!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={() => {
                localStorage.removeItem('paciente_seguro_hide_welcome');
                setShowWelcome(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-lg py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 tracking-tight uppercase"
            >
              Seguir para as Missões (Sempre Exibir) ⚽
            </motion.button>
            <motion.button
              onClick={() => {
                localStorage.setItem('paciente_seguro_hide_welcome', 'true');
                setShowWelcome(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-800 hover:bg-slate-700/80 text-emerald-400 border-2 border-emerald-500/40 font-extrabold text-sm py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 tracking-tight uppercase"
            >
              Iniciar Jogo & Não Exibir Novamente 🚫
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SoccerCelebration 
        isVisible={showCelebration} 
        onComplete={handleCelebrationComplete} 
        isGoal={isLastCelebrationGoal}
      />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg relative overflow-hidden group">
              <Trophy className="w-6 h-6 text-white relative z-10" />
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -right-1 -bottom-1 text-xs z-10"
              >
                ⚽
              </motion.div>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Copa da Segurança 2026</h2>
              <p className="text-xs text-slate-500 font-medium">Craque: {progress.userName} ({progress.unit})</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                const isMutedNow = toggleMuteState();
                setMuted(isMutedNow);
                if (!isMutedNow) {
                  playSound('correct');
                }
              }}
              className="p-2 text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1.5 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50"
              title={muted ? "Ativar Áudio (Sons)" : "Mutar Áudio (Sons)"}
            >
              {muted ? (
                <>
                  <VolumeX className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider hidden sm:inline">Sem Som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider hidden sm:inline">Sons Ativos</span>
                </>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.completedGoals.length / GOALS.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700">
                {progress.completedGoals.length}/{GOALS.length} Gols
              </span>
            </div>

            <button 
              onClick={async () => {
                if (window.confirm("Deseja realmente sair para a tela de login? Seus dados continuam totalmente salvos na seleção e no banco de dados.")) {
                  try {
                    localStorage.setItem('paciente_seguro_is_logged_out', 'true');
                    await auth.signOut();
                    setIsLoggedIn(false);
                  } catch (err) {
                    console.error("Erro ao sair:", err);
                  }
                }
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 w-auto rounded-xl border border-slate-100 hover:border-red-100 hover:bg-rose-50/50"
              title="Sair do Jogo"
            >
              <LogOut className="w-5 h-5 text-slate-500 hover:text-red-600" />
              <span className="text-[10px] font-black text-slate-500 hover:text-red-600 uppercase tracking-wider hidden sm:inline">Sair</span>
            </button>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Soccer field subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 border-4 border-emerald-900 m-8 rounded-lg" />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-900" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-emerald-900 rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {stickerToReveal && (
            <StickerPackAnimation 
              goalId={stickerToReveal} 
              config={stickersConfig[stickerToReveal]}
              earnedStickers={progress.stickers || []}
              stickersConfig={stickersConfig}
              onComplete={() => {
                setStickerToReveal(null);
                setActiveGoal(null);
                setShowGoalIntro(true);
              }} 
            />
          )}

          {showCertificate ? (
            <Certificate progress={progress} onClose={() => setShowCertificate(false)} />
          ) : showAlbum ? (
            <StickerAlbum 
              earnedStickers={progress.stickers || []} 
              stickersConfig={stickersConfig}
              onClose={() => setShowAlbum(false)} 
            />
          ) : activeGoal ? (
            <motion.div 
              key={`mission-${activeGoal.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setActiveGoal(null)}
                className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar para o Vestiário
              </button>

              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-emerald-100">
                <div className={cn("p-8 text-white flex items-center justify-between shadow-lg", activeGoal.color)}>
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                    {{
                      1: <Flag className="w-8 h-8" />,
                      2: <MessageSquareText className="w-8 h-8" />,
                      3: <Pill className="w-8 h-8" />,
                      4: <Award className="w-8 h-8" />,
                      5: <Waves className="w-8 h-8" />,
                      6: <ShieldAlert className="w-8 h-8" />,
                    }[activeGoal.id as GoalId]}
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70">Rodada {activeGoal.id}</span>
                      <h2 className="text-3xl font-extrabold tracking-tight">{activeGoal.title}</h2>
                    </div>
                  </div>
                </div>

                  <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
                    {showGoalIntro ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest">
                            <Info className="w-5 h-5" /> Instruções Pré-Jogo
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            Objetivo da Meta {activeGoal.id}
                          </h3>
                          <p className="text-lg text-slate-600 leading-relaxed">
                            {activeGoal.description}
                          </p>
                          <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 flex gap-4">
                            <div className="bg-amber-500 p-2 rounded-xl h-fit">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-amber-900 mb-1">Regras do Treino</h4>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Você responderá a 10 questões críticas. Fique atento ao cronômetro: <strong>cada questão tem tempo limite</strong>. O simulador virá após uma breve prática. Boa sorte!
                              </p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowGoalIntro(false)}
                          className={cn(
                            "w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 text-white",
                            activeGoal.color
                          )}
                        >
                          Entrar em Campo
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        {activeGoal.id === 1 && <Goal1Mission onComplete={(score) => completeGoal(1, score)} />}
                        {activeGoal.id === 2 && <Goal2Mission onComplete={(score) => completeGoal(2, score)} />}
                        {activeGoal.id === 3 && <Goal3Mission onComplete={(score) => completeGoal(3, score)} />}
                        {activeGoal.id === 4 && <Goal4Mission onComplete={(score) => completeGoal(4, score)} />}
                        {activeGoal.id === 5 && <Goal5Mission onComplete={(score) => completeGoal(5, score)} />}
                        {activeGoal.id === 6 && <Goal6Mission onComplete={(score) => completeGoal(6, score)} />}
                      </>
                    )}
                  </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Dashboard Content */}
              <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                    Pra cima deles, {progress.userName.split(' ')[0]}!
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Placar Geral: Você já marcou {progress.completedGoals.length} gols de segurança.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => {
                      setShowRanking(!showRanking);
                      setShowHistory(false);
                      setShowAdminPanel(false);
                    }}
                    className={cn(
                      "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm border-2",
                      showRanking ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <Trophy className={cn("w-5 h-5", showRanking ? "text-yellow-300" : "text-yellow-500")} /> 
                    {showRanking ? "Ver Missões" : "Ranking Geral"}
                  </button>

                  <button 
                    onClick={() => {
                      setShowHistory(!showHistory);
                      setShowRanking(false);
                      setShowAdminPanel(false);
                    }}
                    className={cn(
                      "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm border-2",
                      showHistory ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-base select-none">📋</span>
                    {showHistory ? "Ver Missões" : "Histórico de Missões"}
                  </button>

                  <button 
                    onClick={() => setShowManual(true)}
                    className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Target className="w-5 h-5 text-emerald-500" /> Tabela do Campeonato
                  </button>

                  <button 
                    onClick={() => setShowAlbum(true)}
                    className="bg-emerald-50 border-2 border-emerald-200 px-6 py-3 rounded-2xl font-bold text-emerald-700 flex items-center gap-2 hover:bg-emerald-100 transition-all shadow-sm"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-500" /> Álbum de Figurinhas
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setShowAdminPanel(!showAdminPanel);
                        setShowRanking(false);
                        setShowHistory(false);
                      }}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm border-2",
                        showAdminPanel ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      )}
                    >
                      <Settings className="w-5 h-5" /> 
                      Vestiário Admin
                    </button>
                  )}
                </div>
              </div>

              {showRanking ? (
                <div className="max-w-2xl mx-auto">
                  <Ranking />
                </div>
              ) : showAdminPanel ? (
                <AdminPanel />
              ) : showHistory ? (
                <div className="max-w-3xl mx-auto animate-fade-in">
                  <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Histórico de Partidas</h2>
                        <p className="text-slate-500 text-xs font-semibold">Seus placares e relatórios de segurança coletados em campo.</p>
                      </div>
                    </div>

                    {!progress.history || progress.history.length === 0 ? (
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 space-y-4">
                        <span className="text-5xl block animate-bounce">🏟️</span>
                        <p className="font-extrabold text-slate-700">Nenhuma missão concluída ainda!</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Entre em campo selecionando um dos objetivos disponíveis na página inicial e conclua as rodadas para ver o seu histórico aqui!
                        </p>
                        <button
                          onClick={() => setShowHistory(false)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-tight transition-all active:scale-95 shadow-sm"
                        >
                          Começar Primeira Partida 🚀
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {progress.history.map((item) => {
                          const goal = GOALS.find(g => g.id === item.goalId);
                          if (!goal) return null;
                          const IconComponent = {
                            UserCheck, MessageSquareText, Pill, Stethoscope, Waves, ShieldAlert
                          }[goal.icon as any] as any;

                          const isExcellent = item.score >= 90;
                          const isPass = item.score >= 70;

                          return (
                            <div 
                              key={item.goalId}
                              className="bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm", goal.color)}>
                                  {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                                </div>
                                <div className="text-left">
                                  <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                    Meta {goal.id}
                                  </span>
                                  <h4 className="font-black text-slate-950 mt-1 text-sm md:text-base leading-tight">{goal.title}</h4>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span>Concluído em: <strong className="text-slate-600 font-semibold">{item.completedAt}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                                <div className="text-left sm:text-right">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Desempenho</span>
                                  <span className={cn(
                                    "text-sm md:text-base font-black tracking-tight flex items-center gap-1",
                                    isExcellent ? "text-emerald-600" : isPass ? "text-blue-600" : "text-amber-500"
                                  )}>
                                    <span>{item.score}%</span> 
                                    <span className="text-xs font-bold font-mono">
                                      {isExcellent ? "🏆 Golaço!" : isPass ? "⚽ Passe Certo" : "⚠️ Treino Concluído"}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mt-6">
                          <span className="text-2xl shrink-0">💡</span>
                          <p className="text-emerald-800 text-xs font-semibold leading-relaxed text-left">
                            <strong>Dica do Apitinho:</strong> Acertando <strong>70% ou mais</strong> nas metas do HUSF, você conquista pacotes de figurinhas para colar no seu <button onClick={() => { setShowHistory(false); setShowAlbum(true); }} className="text-emerald-600 text-xs hover:text-emerald-700 underline font-black inline">Álbum Oficial</button>!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mission-grid">
                    {GOALS.map((goal) => {
                    const isCompleted = progress.completedGoals.includes(goal.id);
                    const isUnlocked = unlockedGoals.some(id => String(id) === String(goal.id));
                    const Icon = {
                      UserCheck, MessageSquareText, Pill, Stethoscope, Waves, ShieldAlert
                    }[goal.icon as any] as any;

                    return (
                      <motion.button
                        key={goal.id}
                        whileHover={isUnlocked && !isCompleted ? { scale: 1.02 } : {}}
                        whileTap={isUnlocked && !isCompleted ? { scale: 0.98 } : {}}
                        onClick={() => isUnlocked && !isCompleted && handleGoalSelect(goal)}
                        className={cn(
                          "text-left group relative",
                          (!isUnlocked || isCompleted) && "cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all overflow-hidden h-full flex flex-col",
                          isUnlocked && !isCompleted ? "group-hover:shadow-xl group-hover:border-blue-200" : "opacity-60 bg-slate-50 grayscale",
                          isCompleted && "border-emerald-300 bg-emerald-50/20 opacity-90 shadow-sm"
                        )}>
                          <div className="flex items-start justify-between mb-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform",
                              isUnlocked && !isCompleted && "group-hover:scale-110",
                              goal.color
                            )}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            {isCompleted ? (
                              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                <Trophy className="w-3 h-3" /> CONCLUÍDO ({(progress.scores?.[goal.id]) || 0}%)
                              </div>
                            ) : !isUnlocked ? (
                              <div className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider">
                                <Lock className="w-3 h-3" /> BLOQUEADO
                              </div>
                            ) : (
                              <div className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                DISPONÍVEL
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-900 mb-2 transition-colors group-hover:text-blue-600">
                            {goal.id}. {goal.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            {isUnlocked ? goal.shortDescription : "Treinamento ainda não liberado pela diretoria."}
                          </p>
                          
                          <div className={cn(
                            "flex items-center font-bold text-sm pt-4 border-t border-slate-100",
                            isUnlocked && !isCompleted ? "text-blue-600" : "text-slate-400"
                          )}>
                            {isCompleted ? (
                              <span className="text-emerald-700 flex items-center gap-1.5 font-bold">✓ Missão Concluída</span>
                            ) : isUnlocked ? "Iniciar Agora" : "Aguarde Liberação"}
                            {isUnlocked && !isCompleted ? (
                              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            ) : !isUnlocked ? (
                              <Lock className="w-4 h-4 ml-1" />
                            ) : null}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                  </div>

                  {progress.completedGoals.length === GOALS.length && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white text-center shadow-2xl relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-400 animate-bounce" />
                        <h2 className="text-4xl font-black mb-4">É CAMPEÃO!</h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto">
                          {progress.userName.split(' ')[0]}, você deu um show em campo e garantiu a taça da Segurança do Paciente.
                        </p>
                        <button 
                          onClick={() => setShowCertificate(true)}
                          className="bg-white text-emerald-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
                        >
                          Levar a Taça para Casa (Certificado)
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full -mr-20 -mt-20" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 opacity-20 rounded-full -ml-10 -mb-10" />
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Manual Overlay */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-xl h-full bg-white shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Estratégia da Seleção</h2>
                <button onClick={() => setShowManual(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <div className="space-y-10">
                {GOALS.map(g => (
                  <div key={g.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", g.color)}>
                        {g.id}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">{g.title}</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed">
                      {g.description}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 bg-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">Desenvolvido pelo</p>
          <p className="text-slate-600 font-bold text-lg mb-6">Setor de Inovação e Diretoria de Ensino e Pesquisa - HUSF</p>
          <div className="w-12 h-1 bg-slate-300 mx-auto rounded-full" />
        </div>
      </footer>

      {!activeGoal && <MascotHelper />}
    </div>
  );
}
