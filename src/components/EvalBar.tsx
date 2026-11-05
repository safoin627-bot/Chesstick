import React from 'react';

interface EvalBarProps {
  scoreCp: number;
  mate?: number;
  isCalculating: boolean;
  flipped?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ scoreCp, mate, isCalculating, flipped = false }) => {
  // Convert centipawns or mate into percentage for white advantage
  let whitePercent = 50;

  if (mate !== undefined) {
    whitePercent = mate > 0 ? 100 : 0;
  } else {
    // Standard logistic curve for chess eval: 1 / (1 + 10^(-score / 400))
    // Or simplified centipawn mapping
    const cp = Math.max(-1500, Math.min(1500, scoreCp));
    // Smooth sigmoid
    whitePercent = 50 + (cp / 1500) * 46;
    whitePercent = Math.max(4, Math.min(96, whitePercent));
  }

  // If board is flipped (Black perspective at bottom), invert visual presentation
  const effectiveWhitePercent = flipped ? 100 - whitePercent : whitePercent;

  let displayScore = '0.0';
  if (mate !== undefined) {
    displayScore = `M${Math.abs(mate)}`;
  } else {
    const pawns = (scoreCp / 100).toFixed(1);
    displayScore = scoreCp > 0 ? `+${pawns}` : `${pawns}`;
    if (displayScore === '-0.0') displayScore = '0.0';
  }

  return (
    <div className="relative flex flex-col items-center w-7 h-full min-h-[300px] max-h-[560px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md">
      {/* Top half (Black / White depending on orientation) */}
      <div
        className="w-full bg-slate-950 transition-all duration-300 ease-out flex flex-col justify-start items-center pt-2"
        style={{ height: `${100 - effectiveWhitePercent}%` }}
      >
        {!flipped && scoreCp < -50 && (
          <span className="text-[10px] font-mono font-bold text-slate-300 transform -rotate-90 origin-center whitespace-nowrap">
            {displayScore}
          </span>
        )}
        {flipped && scoreCp > 50 && (
          <span className="text-[10px] font-mono font-bold text-slate-300 transform -rotate-90 origin-center whitespace-nowrap">
            {displayScore}
          </span>
        )}
      </div>

      {/* Middle midline indicator */}
      <div className="w-full h-px bg-slate-700/80 z-10 shrink-0" />

      {/* Bottom half (White / Black) */}
      <div
        className="w-full bg-slate-100 transition-all duration-300 ease-out flex flex-col justify-end items-center pb-2"
        style={{ height: `${effectiveWhitePercent}%` }}
      >
        {!flipped && scoreCp >= -50 && (
          <span className="text-[10px] font-mono font-bold text-slate-900 transform -rotate-90 origin-center whitespace-nowrap">
            {displayScore}
          </span>
        )}
        {flipped && scoreCp <= 50 && (
          <span className="text-[10px] font-mono font-bold text-slate-900 transform -rotate-90 origin-center whitespace-nowrap">
            {displayScore}
          </span>
        )}
      </div>

      {/* Calculation pulse */}
      {isCalculating && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
