import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { Trophy, Medal, Users, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlayerRank {
  id: string;
  name: string;
  unit: string;
  goalsCompleted: number;
  totalScore: number;
  averageScore?: number;
  stickersEarned?: number;
  lastUpdated?: any;
}

interface UnitRank {
  name: string;
  playerCount: number;
  averageScore: number;
  totalGoals: number;
  totalStickers: number;
  oldestActivity: number;
}

export function Ranking() {
  const [individualRanks, setIndividualRanks] = useState<PlayerRank[]>([]);
  const [unitRanks, setUnitRanks] = useState<UnitRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'individual' | 'unit'>('unit');

  useEffect(() => {
    const q = query(
      collection(db, 'players'),
      orderBy('totalScore', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const players = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerRank[];

      const getTimestampMs = (ts: any): number => {
        if (!ts) return 0;
        if (typeof ts.toDate === 'function') {
          return ts.toDate().getTime();
        }
        if (ts.seconds) {
          return ts.seconds * 1000 + (ts.nanoseconds ? ts.nanoseconds / 1000000 : 0);
        }
        const parsed = Date.parse(ts);
        return isNaN(parsed) ? 0 : parsed;
      };

      const sortedPlayers = [...players].sort((a, b) => {
        // Tie-breaker individual:
        // 1. Pontuação Total de Gols (totalScore) DESC
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        // 2. Metas Completas (goalsCompleted) DESC
        if (b.goalsCompleted !== a.goalsCompleted) {
          return b.goalsCompleted - a.goalsCompleted;
        }
        // 3. Figurinhas no Álbum (stickersEarned) DESC
        const stickersA = a.stickersEarned || 0;
        const stickersB = b.stickersEarned || 0;
        if (stickersB !== stickersA) {
          return stickersB - stickersA;
        }
        // 4. Pioneirismo (quem atualizou/concluiu primeiro - Data mais antiga ASC)
        const timeA = getTimestampMs(a.lastUpdated);
        const timeB = getTimestampMs(b.lastUpdated);
        if (timeA !== timeB) {
          if (timeA === 0) return 1;
          if (timeB === 0) return -1;
          return timeA - timeB;
        }
        return 0;
      });
      
      setIndividualRanks(sortedPlayers.slice(0, 10));

      // Group by Unit
      const units: Record<string, { totalScore: number; count: number; totalGoals: number; totalStickers: number; oldestActivity: number }> = {};
      players.forEach(p => {
        if (!units[p.unit]) {
          units[p.unit] = { totalScore: 0, count: 0, totalGoals: 0, totalStickers: 0, oldestActivity: Infinity };
        }
        // User's contribution is their averageScore (points/6)
        units[p.unit].totalScore += p.averageScore || 0;
        units[p.unit].count += 1;
        units[p.unit].totalGoals += p.goalsCompleted;
        units[p.unit].totalStickers += p.stickersEarned || 0;

        const playerTime = getTimestampMs(p.lastUpdated);
        if (playerTime > 0 && playerTime < units[p.unit].oldestActivity) {
          units[p.unit].oldestActivity = playerTime;
        }
      });

      const aggregatedUnits: UnitRank[] = Object.entries(units).map(([name, data]) => ({
        name,
        playerCount: data.count,
        averageScore: Math.round(data.totalScore / data.count),
        totalGoals: data.totalGoals,
        totalStickers: data.totalStickers,
        oldestActivity: data.oldestActivity === Infinity ? 0 : data.oldestActivity
      })).sort((a, b) => {
        // Tie-breaker de setores:
        // 1. Média do setor DESC
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }
        // 2. Metas coletivas concluídas DESC
        if (b.totalGoals !== a.totalGoals) {
          return b.totalGoals - a.totalGoals;
        }
        // 3. Quantidade de participantes (Engajamento coletivo) DESC
        if (b.playerCount !== a.playerCount) {
          return b.playerCount - a.playerCount;
        }
        // 4. Pioneirismo de equipe (quem iniciou/concluíu primeiro ASC)
        if (a.oldestActivity !== b.oldestActivity) {
          if (a.oldestActivity === 0) return 1;
          if (b.oldestActivity === 0) return -1;
          return a.oldestActivity - b.oldestActivity;
        }
        return 0;
      });

      setUnitRanks(aggregatedUnits);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'players');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-emerald-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Painel de Vitórias</h2>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setTab('unit')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              tab === 'unit' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Users className="w-4 h-4" /> Setores
          </button>
          <button 
            onClick={() => setTab('individual')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              tab === 'individual' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <User className="w-4 h-4" /> Craques
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tab === 'unit' ? (
          <>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 mb-6 text-xs text-emerald-700 leading-relaxed font-medium space-y-1">
              <div>💡 <strong>Regra do Campeonato:</strong> A média do setor é calculada com base no desempenho de todos do time em todas as 6 metas. Para subir no ranking, incentive seus colegas a completarem todas as missões com 100%!</div>
              <div className="text-[11px] text-emerald-600 font-black border-t border-emerald-100/50 pt-1 mt-1">
                ⚖️ <strong>Critérios de Desempate:</strong> 1º Mais metas coletivas concluídas | 2º Mais participantes escalados | 3º Pioneirismo (quem pontuou primeiro).
              </div>
            </div>
            {unitRanks.length === 0 ? (
            <p className="text-slate-500 text-center py-8 italic text-sm">
              Nenhum setor escalado ainda.
            </p>
          ) : (
            unitRanks.map((unit, index) => (
              <motion.div
                key={unit.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl border transition-all",
                  index === 0 ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-lg shadow-sm">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{unit.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{unit.playerCount} Participantes</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600 leading-none mb-1">
                    {unit.averageScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                    Média do Setor
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </>
        ) : (
          <>
            <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 mb-6 text-xs text-amber-800 leading-relaxed font-medium space-y-1">
              <div>⚽ <strong>Artilharia Individual:</strong> A classificação geral dos craques em campo. Busque o acerto máximo para subir ao topo!</div>
              <div className="text-[11px] text-amber-700 font-black border-t border-yellow-100/50 pt-1 mt-1">
                ⚖️ <strong>Critérios de Desempate:</strong> 1º Mais metas concluídas | 2º Mais figurinhas no álbum | 3º Pioneirismo (quem alcançou a nota primeiro).
              </div>
            </div>
            {individualRanks.length === 0 ? (
            <p className="text-slate-500 text-center py-8 italic text-sm">
              Nenhum craque em campo ainda.
            </p>
          ) : (
            individualRanks.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  index === 0 ? "bg-yellow-50 border-yellow-200" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center font-black text-lg">
                    {index === 0 ? (
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-slate-400" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="text-slate-400 font-black">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">{player.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{player.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600 leading-none mb-1">
                    {player.averageScore || 0}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {player.goalsCompleted}/6 Metas
                  </div>
                </div>
              </motion.div>
            ))
          )}
          </>
        )}
      </div>
    </div>
  );
}
