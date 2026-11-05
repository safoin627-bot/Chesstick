import React from 'react';
import { ChessBot } from '../types/chess';
import { Bot, MessageSquare } from 'lucide-react';

interface BotHeaderProps {
  bot: ChessBot;
  isEngineThinking: boolean;
  dialogueText: string;
  capturedPieces: { [key: string]: number };
  scoreCp: number;
}

export const BotHeader: React.FC<BotHeaderProps> = ({
  bot,
  isEngineThinking,
  dialogueText,
  capturedPieces,
  scoreCp
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-800 shrink-0">
          <img
            src={bot.avatar}
            alt={bot.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-400 -z-10">
            <Bot className="w-5 h-5 text-amber-400" />
          </div>
          {isEngineThinking && (
            <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 text-sm truncate">
              {bot.name}
            </h3>
            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              {bot.elo}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {isEngineThinking ? (
              <span className="text-blue-400 font-mono animate-pulse">Calculating optimal move...</span>
            ) : (
              <span>{bot.style}</span>
            )}
          </p>
        </div>
      </div>

      {/* Reactive Dialogue speech bubble */}
      <div className="hidden sm:flex items-center gap-2 max-w-sm px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="italic truncate">"{dialogueText}"</span>
      </div>

      {/* Captured Pieces list */}
      <div className="flex items-center gap-1 text-slate-400 text-xs font-mono shrink-0">
        {Object.entries(capturedPieces).map(([piece, count]) => {
          if (count <= 0) return null;
          return (
            <span key={piece} className="px-1 py-0.5 rounded bg-slate-800/70 border border-slate-700/50">
              {piece.toUpperCase()}{count > 1 ? `x${count}` : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
