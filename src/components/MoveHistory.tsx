import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Check } from 'lucide-react';

interface MoveHistoryProps {
  history: string[]; // List of SAN moves, e.g. ['e4', 'c5', 'Nf3', 'd6']
  currentMoveIndex: number;
  onJumpToMove: (index: number) => void;
  pgn: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onJumpToMove,
  pgn
}) => {
  const [copied, setCopied] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group into pairs: [ [1, 'e4', 'c5'], [2, 'Nf3', 'd6'], ... ]
  const movePairs: { moveNumber: number; white: string; whiteIndex: number; black?: string; blackIndex?: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIndex: i,
      black: history[i + 1],
      blackIndex: i + 1 < history.length ? i + 1 : undefined
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-200">Move History</span>
        <button
          onClick={handleCopyPgn}
          disabled={history.length === 0}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition"
          title="Copy PGN"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>PGN</span>
        </button>
      </div>

      {/* Move list table */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[160px] max-h-[260px] overflow-y-auto p-2 text-xs font-mono select-none scrollbar-thin scrollbar-thumb-slate-800"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-xs font-sans">
            Moves will appear here
          </div>
        ) : (
          <div className="space-y-0.5">
            {movePairs.map((pair) => {
              const isWhiteActive = currentMoveIndex === pair.whiteIndex;
              const isBlackActive = currentMoveIndex === pair.blackIndex;

              return (
                <div
                  key={pair.moveNumber}
                  className="grid grid-cols-[38px_1fr_1fr] items-center py-1 px-1.5 rounded hover:bg-slate-800/40 text-slate-300 transition"
                >
                  <span className="text-slate-500 font-semibold text-[11px]">
                    {pair.moveNumber}.
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToMove(pair.whiteIndex)}
                    className={`text-left px-2 py-0.5 rounded transition ${
                      isWhiteActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    {pair.white}
                  </button>
                  {pair.black ? (
                    <button
                      type="button"
                      onClick={() => onJumpToMove(pair.blackIndex!)}
                      className={`text-left px-2 py-0.5 rounded transition ${
                        isBlackActive
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'hover:text-slate-100 hover:bg-slate-800'
                      }`}
                    >
                      {pair.black}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step navigation buttons */}
      <div className="flex items-center justify-center gap-1 p-2 bg-slate-850 border-t border-slate-800">
        <button
          onClick={() => onJumpToMove(-1)}
          disabled={currentMoveIndex < 0}
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-slate-200 transition"
          title="Start Position"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onJumpToMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex < 0}
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-slate-200 transition"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onJumpToMove(Math.min(history.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= history.length - 1}
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-slate-200 transition"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onJumpToMove(history.length - 1)}
          disabled={currentMoveIndex >= history.length - 1}
          className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-400 hover:text-slate-200 transition"
          title="Current Move"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
