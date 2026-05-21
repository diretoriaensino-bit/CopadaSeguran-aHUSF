import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Download, Share2, Hospital, ShieldCheck, Award } from 'lucide-react';
import { UserProgress } from '../types';

interface Props {
  progress: UserProgress;
  onClose: () => void;
}

export function Certificate({ progress, onClose }: Props) {
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl p-4 md:p-12 relative overflow-hidden"
      >
        {/* Certificate Frame */}
        <div className="border-[12px] border-double border-blue-900 p-8 md:p-16 relative">
          {/* Decorative Corners */}
          <Award className="absolute top-4 left-4 w-12 h-12 text-blue-900/20" />
          <Award className="absolute top-4 right-4 w-12 h-12 text-blue-900/20" />
          <Award className="absolute bottom-4 left-4 w-12 h-12 text-blue-900/20" />
          <Award className="absolute bottom-4 right-4 w-12 h-12 text-blue-900/20" />

          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <Hospital className="w-16 h-16 text-blue-900" />
            </div>
            
            <div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-emerald-900 tracking-tight uppercase">
                Título de Craque da Segurança
              </h1>
              <div className="h-1 w-32 bg-yellow-400 mx-auto mt-4" />
            </div>

            <p className="text-xl md:text-2xl text-slate-600 font-medium">
              Condecoramos oficialmente o jogador(a):
            </p>

            <h2 className="text-4xl md:text-6xl font-black text-slate-900 underline decoration-yellow-400 decoration-8 underline-offset-8">
              {progress.userName}
            </h2>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              por sua performance brilhante na <strong>"COPA DA SEGURANÇA DO PACIENTE"</strong>. 
              Demonstrou técnica apurada, visão de jogo e compromisso inabalável com o protocolo de segurança na unidade <strong>{progress.unit}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-12 pt-12">
              <div className="text-center space-y-2">
                <div className="h-0.5 w-full bg-slate-300 mb-4" />
                <p className="font-bold text-slate-800">Comissão Técnica</p>
                <p className="text-sm text-slate-500">HUSF - Qualidade</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-0.5 w-full bg-slate-300 mb-4" />
                <p className="font-bold text-slate-800">Convocação</p>
                <p className="text-sm text-slate-500">{today}</p>
              </div>
            </div>

            <div className="pt-12 flex justify-center">
              <div className="bg-yellow-100 p-6 rounded-full border-4 border-yellow-400 shadow-xl animate-bounce">
                <Trophy className="w-16 h-16 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 no-print">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" /> Imprimir / Salvar PDF
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Fechar Certificado
          </button>
        </div>
      </motion.div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .fixed { position: relative !important; inset: 0 !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}
