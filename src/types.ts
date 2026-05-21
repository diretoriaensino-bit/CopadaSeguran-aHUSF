export type GoalId = 1 | 2 | 3 | 4 | 5 | 6;

export interface Goal {
  id: GoalId;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
}

export interface UserProgress {
  completedGoals: GoalId[];
  scores: Record<GoalId, number>;
  stickers: GoalId[];
  userName: string;
  unit: string;
  history?: {
    goalId: GoalId;
    score: number;
    completedAt: string;
  }[];
}

export const GOALS: Goal[] = [
  {
    id: 1,
    title: "Identificação Correta (Escalação)",
    shortDescription: "Garantir que o 'jogador' certo receba o cuidado certo.",
    description: "Verificar a identidade do paciente é como conferir a escalação antes do apito inicial. Use pelo menos dois identificadores.",
    icon: "UserCheck",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Comunicação (Passe de Bola)",
    shortDescription: "Passe a informação com precisão para não perder a posse.",
    description: "Garantir que a comunicação entre a equipe seja completa e clara, como um passe perfeito no meio campo.",
    icon: "MessageSquareText",
    color: "bg-cyan-500",
  },
  {
    id: 3,
    title: "Segurança de Medicamentos (Doping Zero)",
    shortDescription: "Cuidado redobrado com substâncias de alta vigilância.",
    description: "Identificar e administrar medicamentos de alto risco com o rigor de um exame antidoping.",
    icon: "Pill",
    color: "bg-amber-500",
  },
  {
    id: 4,
    title: "Cirurgia Segura (VAR da Segurança)",
    shortDescription: "Paciente certo, local certo, conferência total.",
    description: "O Time-out é o nosso VAR: uma pausa para garantir que tudo está correto antes de seguir com o jogo.",
    icon: "Stethoscope",
    color: "bg-emerald-500",
  },
  {
    id: 5,
    title: "Higiene das Mãos (Campo Limpo)",
    shortDescription: "Mãos limpas evitam 'gols contra' da infecção.",
    description: "A higienização das mãos é a nossa melhor defesa contra o ataque das bactérias hospitalares.",
    icon: "Waves",
    color: "bg-indigo-500",
  },
  {
    id: 6,
    title: "Prevenção de Quedas (Zaga de Ferro)",
    shortDescription: "Ninguém cai na nossa área. Segurança total.",
    description: "Identificar pacientes em risco e 'marcar em cima' para evitar quedas e lesões.",
    icon: "ShieldAlert",
    color: "bg-rose-500",
  },
];
