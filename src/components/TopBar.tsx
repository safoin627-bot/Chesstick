import React from 'react';
import { Sword } from 'lucide-react';

interface TopBarProps {
  activeTab: 'bots' | 'game' | 'analysis';
  setActiveTab: (tab: 'bots' | 'game' | 'analysis') => void;
  onNewMatch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onNewMatch
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Sword className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-100 font-sans">
          Stockfish Bot Match
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('bots')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'bots' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Opponents
        </button>
        <button
          onClick={() => setActiveTab('game')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'game' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Match Board
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'analysis' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          UCI Terminal
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onNewMatch}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          New Match
        </button>
      </div>
    </header>
  );
};
