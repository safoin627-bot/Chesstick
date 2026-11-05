import React from 'react';
import { User, RotateCcw, Volume2, VolumeX, Flag, Handshake, ArrowUpDown } from 'lucide-react';

interface PlayerHeaderProps {
  isPlayerTurn: boolean;
  playerColor: 'w' | 'b';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTakeback: () => void;
  onFlipBoard: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  capturedPieces: { [key: string]: number };
  canTakeback: boolean;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  isPlayerTurn,
  playerColor,
  soundEnabled,
  onToggleSound,
  onTakeback,
  onFlipBoard,
  onResign,
  onOfferDraw,
  capturedPieces,
  canTakeback
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shrink-0">
          <User className="w-5 h-5 text-emerald-400" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-100 text-sm">
              You ({playerColor === 'w' ? 'White' : 'Black'})
            </h4>
            {isPlayerTurn && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Your Turn
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-mono mt-0.5">
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
      </div>

      {/* Quick Action controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onTakeback}
          disabled={!canTakeback}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 transition border border-slate-700/70"
          title="Takeback Move (Undo)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onFlipBoard}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/70"
          title="Flip Board Orientation"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/70"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          type="button"
          onClick={onOfferDraw}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700/70"
          title="Offer Draw"
        >
          <Handshake className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onResign}
          className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 transition border border-slate-700/70"
          title="Resign Game"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
