import React, { useState } from 'react';
import { Copy, Check, Edit2, Play, RefreshCw } from 'lucide-react';

interface FenBarProps {
  currentFen: string;
  onLoadFen: (fen: string) => boolean;
  onResetStandard: () => void;
}

const PRESET_POSITIONS = [
  {
    name: 'Starting Position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  {
    name: 'Sicilian Defense: Najdorf',
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6'
  },
  {
    name: "Queen's Gambit Accepted",
    fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3'
  },
  {
    name: 'Tactical Puzzle: Fork & Win',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP1B1PPP/R2QKB1R w KQkq - 0 9'
  },
  {
    name: 'Endgame: Lucena Bridge',
    fen: '1K6/1P1k4/8/8/8/8/2R5/1r6 w - - 0 1'
  }
];

export const FenBar: React.FC<FenBarProps> = ({
  currentFen,
  onLoadFen,
  onResetStandard
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputFen, setInputFen] = useState(currentFen);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFen);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (fenToApply: string) => {
    setErrorMsg(null);
    const success = onLoadFen(fenToApply.trim());
    if (success) {
      setIsEditing(false);
    } else {
      setErrorMsg('Invalid FEN position string. Please verify chess piece notation.');
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Current FEN State</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Forsyth–Edwards Notation
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setInputFen(currentFen);
              setIsEditing(!isEditing);
              setErrorMsg(null);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel' : 'Load / Presets'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            title="Copy FEN to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Readonly FEN display when not editing */}
      {!isEditing ? (
        <div className="p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-400 break-all select-all border border-slate-800/80">
          {currentFen}
        </div>
      ) : (
        /* Editable FEN Form & Presets */
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div>
            <textarea
              rows={2}
              value={inputFen}
              onChange={(e) => setInputFen(e.target.value)}
              placeholder="Paste FEN position string here..."
              className="w-full p-2 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 focus:outline-hidden focus:border-amber-500"
            />
            {errorMsg && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Quick preset selector buttons */}
          <div>
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_POSITIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setInputFen(preset.fen);
                    handleApply(preset.fen);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition border border-slate-700/60"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={onResetStandard}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Standard Start</span>
            </button>
            <button
              type="button"
              onClick={() => handleApply(inputFen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Load Position</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
