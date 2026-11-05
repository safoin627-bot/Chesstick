import React from 'react';
import { ChessBot } from '../types/chess';
import { Trophy, RefreshCw, Users, AlertCircle } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  reason: string;
  bot: ChessBot;
  playerColor: 'w' | 'b';
  onPlayAgain: () => void;
  onChangeBot: () => void;
  onReviewBoard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  reason,
  bot,
  playerColor,
  onPlayAgain,
  onChangeBot,
  onReviewBoard
}) => {
  if (!isOpen) return null;

  const isPlayerWinner = winner === playerColor;
  const isBotWinner = winner !== null && winner !== 'draw' && !isPlayerWinner;
  const isDraw = winner === 'draw';

  let title = 'Game Drawn';
  let subtitle = reason;
  let quote = bot.dialogue.onLoss[0] || 'Well played!';

  if (isPlayerWinner) {
    title = 'Victory!';
    quote = bot.dialogue.onLoss[0] || 'Outstanding game!';
  } else if (isBotWinner) {
    title = `${bot.name} Wins!`;
    quote = bot.dialogue.onWin[0] || 'Good game!';
  }

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-slate-800 border border-slate-700">
          {isPlayerWinner ? (
            <Trophy className="w-7 h-7 text-amber-400" />
          ) : isDraw ? (
            <AlertCircle className="w-7 h-7 text-slate-400" />
          ) : (
            <Trophy className="w-7 h-7 text-blue-400" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-400 mb-4">{subtitle}</p>

        {/* Bot commentary quote */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs italic text-slate-300 mb-6">
          <span className="font-semibold text-amber-400 not-italic mr-1">{bot.name}:</span>
          "{quote}"
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again vs {bot.name}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onChangeBot}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Change Bot</span>
            </button>
            <button
              type="button"
              onClick={onReviewBoard}
              className="py-2 px-3 rounded-xl font-medium text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition border border-slate-700/60"
            >
              Review Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
