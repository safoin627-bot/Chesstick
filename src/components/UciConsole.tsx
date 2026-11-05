import React, { useState, useEffect, useRef } from 'react';
import { UciLogEntry } from '../types/chess';
import { Terminal, Send, Trash2, Copy, Check } from 'lucide-react';

interface UciConsoleProps {
  logs: UciLogEntry[];
  onSendCommand: (cmd: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const UciConsole: React.FC<UciConsoleProps> = ({
  logs,
  onSendCommand,
  isOpen,
  onToggle
}) => {
  const [inputVal, setInputVal] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendCommand(inputVal);
    setInputVal('');
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.direction === 'out' ? '>>>' : '<<<'} ${l.command}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    return l.direction === filter;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">UCI Engine Console</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Stockfish 19
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-800 rounded-md text-[10px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded transition ${filter === 'all' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-2 py-0.5 rounded transition ${filter === 'out' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('in')}
              className={`px-2 py-0.5 rounded transition ${filter === 'in' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Output
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Copy UCI Transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="h-44 overflow-y-auto p-3 font-mono text-xs bg-slate-950/95 space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 italic font-sans text-xs">
            No UCI events yet. Commands and engine search packets appear here.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isOut = log.direction === 'out';
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 leading-relaxed ${
                  isOut ? 'text-cyan-400' : log.command.startsWith('bestmove') ? 'text-amber-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 shrink-0 text-[10px] select-none">
                  {log.timestamp}
                </span>
                <span className="text-slate-500 shrink-0 select-none font-bold">
                  {isOut ? '>>>' : '<<<'}
                </span>
                <span className="break-all whitespace-pre-wrap">{log.command}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Command prompt input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-slate-900 border-t border-slate-800">
        <span className="font-mono text-xs text-emerald-400 pl-1 select-none font-bold">&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type UCI command (e.g. uci, isready, ucinewgame)..."
          className="flex-1 bg-transparent border-none text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-medium transition flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
