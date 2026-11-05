import React, { useState } from 'react';
import { ChessBot } from '../types/chess';
import { X, Sliders, Check } from 'lucide-react';

interface BotCustomizerModalProps {
  bot: ChessBot;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBot: ChessBot) => void;
}

export const BotCustomizerModal: React.FC<BotCustomizerModalProps> = ({
  bot,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(bot.name);
  const [elo, setElo] = useState(bot.elo);
  const [style, setStyle] = useState(bot.style);
  const [contempt, setContempt] = useState(bot.contempt);
  const [moveTimeMs, setMoveTimeMs] = useState(bot.moveTimeMs);
  const [multiPV, setMultiPV] = useState(bot.multiPV);
  const [personality, setPersonality] = useState(bot.personality);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...bot,
      name,
      elo,
      style,
      contempt,
      moveTimeMs,
      multiPV,
      personality
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Configure Engine Bot Parameters
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Bot Name & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Bot Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Play Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* ELO Rating Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">UCI_Elo Rating</span>
              <span className="font-mono font-bold text-amber-400">{elo} ELO</span>
            </div>
            <input
              type="range"
              min={800}
              max={3200}
              step={25}
              value={elo}
              onChange={(e) => setElo(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>800 (Beginner)</span>
              <span>1500 (Club)</span>
              <span>2400 (Master)</span>
              <span>3200 (Engine Peak)</span>
            </div>
          </div>

          {/* Contempt Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">
                Contempt (Draw avoidance / Sharpness bias)
              </span>
              <span className="font-mono font-bold text-amber-400">{contempt}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              step={5}
              value={contempt}
              onChange={(e) => setContempt(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>-100 (Willing to draw)</span>
              <span>0 (Neutral / Positional)</span>
              <span>+100 (Fierce attacking)</span>
            </div>
          </div>

          {/* Search Time (Move Time Ms) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">UCI Move Time (go movetime)</span>
              <span className="font-mono font-bold text-amber-400">{moveTimeMs} ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={moveTimeMs}
              onChange={(e) => setMoveTimeMs(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>100ms (Rapid blitz)</span>
              <span>500ms (Standard)</span>
              <span>3000ms (Deep search)</span>
            </div>
          </div>

          {/* MultiPV */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">MultiPV (Candidate lines evaluated)</span>
              <span className="font-mono font-bold text-amber-400">{multiPV} lines</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={multiPV}
              onChange={(e) => setMultiPV(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              MultiPV 1 searches the single best move. MultiPV 3-5 assesses multiple lines to introduce personality variance and tactical surprises.
            </p>
          </div>

          {/* Personality preset */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Behavior Core Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'aggressive', label: 'Tactical Attacker' },
                { id: 'solid', label: 'Solid Prophylaxis' },
                { id: 'chaos', label: 'Unpredictable' },
                { id: 'grandmaster', label: 'Pure Minimax' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersonality(p.id as any)}
                  className={`p-2 rounded-lg border text-center font-medium transition ${
                    personality === p.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Apply Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
