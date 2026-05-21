import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Settings, Lock, Unlock, CheckCircle2, AlertCircle, BarChart3, Users, Target, LayoutDashboard, Sparkles, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { GOALS, GoalId } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

interface PlayerData {
  id: string;
  name: string;
  unit: string;
  goalsCompleted: number;
  totalScore: number;
  averageScore?: number;
}

interface StickerRowProps {
  goal: typeof GOALS[0];
  config: { img: string; title: string };
  onSave: (goalId: string, img: string, title: string) => void;
  onFileUpload: (goalId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  key?: string | number;
}

function StickerRow({ goal, config, onSave, onFileUpload, saving }: StickerRowProps) {
  const [localTitle, setLocalTitle] = useState(config.title);
  const [localImg, setLocalImg] = useState(config.img);

  useEffect(() => {
    setLocalTitle(config.title);
    setLocalImg(config.img);
  }, [config]);

  const hasChanges = localTitle !== config.title || localImg !== config.img;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
      <div className={cn("w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg", goal.color)}>
        {goal.id}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título da Figurinha</label>
          <input 
            type="text" 
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Ex: Craque da Identificação"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagem Local (Upload)</label>
          <div className="flex gap-2">
            <label className={cn(
              "flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-2 text-sm font-bold cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-center gap-2",
              saving && "opacity-50 cursor-not-allowed"
            )}>
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 truncate">{localImg?.startsWith('data:') ? 'Imagem Carregada' : 'Escolher Arquivo'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => onFileUpload(String(goal.id), e)}
                disabled={saving}
              />
            </label>
            {localImg && (
              <button 
                onClick={() => onSave(String(goal.id), '', localTitle)}
                className="bg-rose-50 text-rose-600 px-3 rounded-xl hover:bg-rose-100 transition-colors"
                title="Remover Imagem"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ou URL da Imagem</label>
          <input 
            type="text" 
            value={localImg?.startsWith('data:') ? '' : localImg}
            onChange={(e) => setLocalImg(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <button
            onClick={() => onSave(String(goal.id), localImg, localTitle)}
            disabled={!hasChanges || saving}
            className={cn(
              "w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
              hasChanges 
                ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="shrink-0 w-24 aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
        {localImg ? (
          <img src={localImg} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold text-center p-2">Sem Imagem</div>
        )}
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [view, setView] = useState<'settings' | 'stats' | 'stickers'>('stats');
  const [unlockedGoals, setUnlockedGoals] = useState<(string | number)[]>([]);
  const [stickersConfig, setStickersConfig] = useState<Record<string, { img: string, title: string }>>({});
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Listen to Globals
    const unsubGlobals = onSnapshot(doc(db, 'config', 'globals'), (doc) => {
      if (doc.exists()) {
        setUnlockedGoals(doc.data().unlockedGoals || []);
      }
    });

    // Listen to Players for Stats
    const q = query(collection(db, 'players'));
    const unsubPlayers = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerData[];
      setPlayers(data);
      setLoading(false);
    });

    // Listen to Stickers Config
    const unsubStickers = onSnapshot(doc(db, 'config', 'stickers'), (doc) => {
      if (doc.exists()) {
        setStickersConfig(doc.data() as Record<string, { img: string, title: string }>);
      }
    });

    return () => {
      unsubGlobals();
      unsubPlayers();
      unsubStickers();
    };
  }, []);

  const toggleGoal = async (goalId: string | number) => {
    const newUnlocked = unlockedGoals.some(id => String(id) === String(goalId))
      ? unlockedGoals.filter(id => String(id) !== String(goalId))
      : [...unlockedGoals, goalId];
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'globals'), {
        unlockedGoals: newUnlocked,
        lastUpdatedBy: auth.currentUser?.email
      }, { merge: true });
      setMessage({ type: 'success', text: 'Configuração atualizada com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Erro ao salvar. Verifique suas permissões.' });
    }
    setSaving(false);
  };

  const saveStickerConfig = async (goalId: string, img: string, title: string) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'stickers'), {
        [goalId]: { img, title }
      }, { merge: true });
      setMessage({ type: 'success', text: `Figurinha da Meta ${goalId} atualizada!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving sticker:", error);
      setMessage({ type: 'error', text: 'Erro ao salvar figurinha.' });
    }
    setSaving(false);
  };

  const handleFileUpload = (goalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 700KB for Base64 storage in Firestore (Firestore doc limit is 1MB)
    if (file.size > 700 * 1024) {
      setMessage({ type: 'error', text: 'Imagem muito pesada (marx 700KB).' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setSaving(true);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      saveStickerConfig(goalId, base64String, stickersConfig[goalId]?.title || '');
    };
    reader.readAsDataURL(file);
  };

  // Calculations
  const totalPlayers = players.length;
  const activePlayers = players.filter(p => p.goalsCompleted > 0).length;
  
  const unitData = Object.entries(
    players.reduce((acc, p) => {
      acc[p.unit] = (acc[p.unit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: value as number }))
   .sort((a, b) => b.value - a.value);

  const goalDistribution = [0, 1, 2, 3, 4, 5, 6].map(num => ({
    name: `${num} Metas`,
    players: players.filter(p => p.goalsCompleted === num).length
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Painel de Controle</h2>
            <p className="text-slate-500 text-sm italic">Gestão e Indicadores da Seleção.</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
          <button 
            onClick={() => setView('stats')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
              view === 'stats' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Estatísticas
          </button>
          <button 
            onClick={() => setView('settings')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
              view === 'settings' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Settings className="w-4 h-4" /> Configurações
          </button>
          <button 
            onClick={() => setView('stickers')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
              view === 'stickers' ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Sparkles className="w-4 h-4 text-yellow-500" /> Figurinhas
          </button>
        </div>
      </div>

      {view === 'stats' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-1">Total de Inscritos</p>
                <h3 className="text-4xl font-black text-emerald-900">{totalPlayers}</h3>
                <p className="text-emerald-700/60 text-xs mt-1">Colaboradores com conta</p>
              </div>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1">Participantes Ativos</p>
                <h3 className="text-4xl font-black text-blue-900">{activePlayers}</h3>
                <p className="text-blue-700/60 text-xs mt-1">Já completaram ao menos 1 meta</p>
              </div>
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Participação por Setor</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Progressão nas Metas</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="players"
                    >
                      {goalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'settings' ? (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-6">
            <h3 className="font-black text-indigo-900 mb-1">Liberação de Metas</h3>
            <p className="text-sm text-indigo-800/70">As missões desbloqueadas aqui ficarão visíveis para todos os jogadores imediatamente.</p>
          </div>

          {message && (
            <div className={cn(
              "mb-6 p-4 rounded-2xl flex items-center gap-3 animate-bounce",
              message.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GOALS.map((goal) => {
              const isUnlocked = unlockedGoals.some(id => String(id) === String(goal.id));
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  disabled={saving}
                  className={cn(
                    "flex flex-col p-6 rounded-[2rem] border-2 transition-all active:scale-[0.98] text-left relative overflow-hidden group",
                    isUnlocked 
                      ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100" 
                      : "border-slate-100 bg-slate-50 opacity-60 grayscale"
                  )}
                >
                  <div className="flex items-center justify-between mb-4 w-full">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg",
                      goal.color
                    )}>
                      {goal.id}
                    </div>
                    <div className={cn(
                      "w-12 h-7 rounded-full relative transition-colors",
                      isUnlocked ? "bg-emerald-500" : "bg-slate-300"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all flex items-center justify-center shadow-sm",
                        isUnlocked ? "left-[1.375rem]" : "left-0.5"
                      )}>
                        {isUnlocked ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">{goal.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                    {isUnlocked ? "Desbloqueada" : "Bloqueada"}
                  </p>

                  <div className={cn(
                    "absolute -right-4 -bottom-4 w-16 h-16 opacity-5 transition-transform group-hover:scale-125 rotate-12",
                    goal.color.replace('bg-', 'text-')
                  )}>
                    <Target className="w-full h-full" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
            <h3 className="font-black text-yellow-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Gestão de Figurinhas
            </h3>
            <p className="text-sm text-yellow-800/70">Defina o título e a imagem que os jogadores ganharão ao atingir +70% em cada meta.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {GOALS.map((goal) => (
              <StickerRow 
                key={goal.id}
                goal={goal}
                config={stickersConfig[goal.id] || { img: '', title: '' }}
                onSave={saveStickerConfig}
                onFileUpload={handleFileUpload}
                saving={saving}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
