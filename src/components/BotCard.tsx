import React from 'react';
import { ChessBot } from '../types/chess';
import { Zap, Shield, Sparkles, Cpu, Sliders } from 'lucide-react';

interface BotCardProps {
  bot: ChessBot;
  isSelected: boolean;
  onSelect: (bot: ChessBot) => void;
  onCustomize?: (bot: ChessBot) => void;
}

export const BotCard: React.FC<BotCardProps> = ({
  bot,
  isSelected,
  onSelect,
  onCustomize
}) => {
  const getBotIcon = () => {
    switch (bot.personality) {
      case 'aggressive':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'solid':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'chaos':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'grandmaster':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      default:
        return <Sliders className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(bot)}
      className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 text-left ${
        isSelected
          ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with fallback container */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700/80 bg-slate-800 shadow-inner">
          <img
            src={bot.avatar}
            alt={bot.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback styling if image cannot load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-400 -z-10">
            {getBotIcon()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-100 text-base truncate">
              {bot.name}
            </h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 whitespace-nowrap">
              {bot.elo} ELO
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
            {getBotIcon()}
            <span className="truncate">{bot.style}</span>
          </div>

          <p className="text-xs text-slate-400 italic line-clamp-1 mt-1.5">
            "{bot.quote}"
          </p>

          {/* UCI Parameters breakdown */}
          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span title="Contempt (Engine Draw Avoidance Bias)">Contempt: <strong className="text-slate-300 font-semibold">{bot.contempt}</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span title="UCI Search Time per Move">Time: <strong className="text-slate-300 font-semibold">{bot.moveTimeMs}ms</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span title="MultiPV Candidate Lines Evaluated">MultiPV: <strong className="text-slate-300 font-semibold">{bot.multiPV}</strong></span>
          </div>
        </div>
      </div>

      {onCustomize && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCustomize(bot);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition"
          title="Customize Bot Parameters"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
