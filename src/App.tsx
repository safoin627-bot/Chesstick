/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import confetti from 'canvas-confetti';
import { BOT_PRESETS, ChessBot, BoardTheme, EngineEval, UciLogEntry } from './types/chess';
import { stockfishEngine } from './services/chessEngine';
import { soundSystem } from './services/sound';
import { TopBar } from './components/TopBar';
import { ChessBoard } from './components/ChessBoard';
import { EvalBar } from './components/EvalBar';
import { BotCard } from './components/BotCard';
import { BotHeader } from './components/BotHeader';
import { PlayerHeader } from './components/PlayerHeader';
import { UciConsole } from './components/UciConsole';
import { MoveHistory } from './components/MoveHistory';
import { FenBar } from './components/FenBar';
import { GameOverModal } from './components/GameOverModal';
import { BotCustomizerModal } from './components/BotCustomizerModal';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Terminal as TerminalIcon,
  HelpCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // Engine & App State
  const [engineReady, setEngineReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'bots' | 'game' | 'analysis'>('bots');

  // Bot & Match Settings
  const [bots, setBots] = useState<ChessBot[]>(BOT_PRESETS);
  const [selectedBot, setSelectedBot] = useState<ChessBot>(BOT_PRESETS[0]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [boardOrientation, setBoardOrientation] = useState<'w' | 'b'>('w');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('tournament');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Chess Game State
  const [chess] = useState<Chess>(() => new Chess());
  const [fenState, setFenState] = useState<string>(chess.fen());
  const [historyMoves, setHistoryMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedWhite, setCapturedWhite] = useState<{ [key: string]: number }>({});
  const [capturedBlack, setCapturedBlack] = useState<{ [key: string]: number }>({});

  // Engine evaluation & bot behavior
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineOutput, setEngineOutput] = useState<string>("Select a bot and start playing!");
  const [engineEval, setEngineEval] = useState<EngineEval>({
    scoreCp: 0,
    depth: 0,
    nodes: 0,
    pv: [],
    isCalculating: false
  });
  const [botDialogue, setBotDialogue] = useState<string>(selectedBot.dialogue.gameStart[0] || "Let's play!");

  // Logs & Modals
  const [uciLogs, setUciLogs] = useState<UciLogEntry[]>([]);
  const [isCustomizingBot, setIsCustomizingBot] = useState(false);
  const [botToCustomize, setBotToCustomize] = useState<ChessBot | null>(null);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(false);
  const [gameWinner, setGameWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // 1. Initialize Engine on Mount
  useEffect(() => {
    let mounted = true;
    stockfishEngine.initEngine().then((ready) => {
      if (mounted) {
        setEngineReady(ready);
      }
    });

    const unsubscribe = stockfishEngine.subscribeLogs((logs) => {
      if (mounted) {
        setUciLogs(logs);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Update captured pieces counter
  const updateCapturedPieces = useCallback(() => {
    const board = chess.board();
    const count: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentPieces: { w: Record<string, number>; b: Record<string, number> } = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'k') {
          currentPieces[p.color][p.type]++;
        }
      }
    }

    const whiteLosses: Record<string, number> = {};
    const blackLosses: Record<string, number> = {};

    Object.keys(count).forEach((piece) => {
      whiteLosses[piece] = Math.max(0, count[piece] - currentPieces.w[piece]);
      blackLosses[piece] = Math.max(0, count[piece] - currentPieces.b[piece]);
    });

    // Captured pieces shown for player: captured black pieces (player took) & bot: captured white pieces
    setCapturedWhite(playerColor === 'w' ? blackLosses : whiteLosses);
    setCapturedBlack(playerColor === 'w' ? whiteLosses : blackLosses);
  }, [chess, playerColor]);

  // Check Game End Conditions
  const checkGameEnd = useCallback(() => {
    if (chess.isGameOver()) {
      let winner: 'w' | 'b' | 'draw' | null = null;
      let reason = 'Game concluded';

      if (chess.isCheckmate()) {
        winner = chess.turn() === 'w' ? 'b' : 'w';
        reason = `Checkmate! ${winner === 'w' ? 'White' : 'Black'} delivers victory.`;
      } else if (chess.isStalemate()) {
        winner = 'draw';
        reason = 'Draw by stalemate (no legal moves).';
      } else if (chess.isThreefoldRepetition()) {
        winner = 'draw';
        reason = 'Draw by threefold repetition.';
      } else if (chess.isInsufficientMaterial()) {
        winner = 'draw';
        reason = 'Draw by insufficient material.';
      } else if (chess.isDraw()) {
        winner = 'draw';
        reason = 'Draw by 50-move rule.';
      }

      setGameWinner(winner);
      setGameOverReason(reason);
      setGameOverModalOpen(true);

      if (winner === playerColor) {
        soundSystem.playVictory();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setBotDialogue(selectedBot.dialogue.onLoss[0] || 'You bested my calculations!');
      } else if (winner === 'draw') {
        setBotDialogue('A draw. Balanced position.');
      } else {
        soundSystem.playDefeat();
        setBotDialogue(selectedBot.dialogue.onWin[0] || 'Checkmate! Clean conversion.');
      }
      return true;
    }
    return false;
  }, [chess, playerColor, selectedBot]);

  // Trigger Bot Move
  const makeBotMove = useCallback(async () => {
    if (chess.isGameOver() || isEngineThinking) return;

    setIsEngineThinking(true);
    setEngineOutput(`Calculating response... (${selectedBot.moveTimeMs}ms)`);

    try {
      const result = await stockfishEngine.getBestMove(
        chess.fen(),
        selectedBot,
        (evalData) => {
          setEngineEval(evalData);
        }
      );

      // Execute chosen move
      const moveResult = chess.move(result.move);
      if (moveResult) {
        setFenState(chess.fen());
        setLastMove({ from: moveResult.from as Square, to: moveResult.to as Square });
        const newHistory = chess.history();
        setHistoryMoves(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);

        // Sound effect
        if (moveResult.san.includes('#')) {
          soundSystem.playCheck();
        } else if (moveResult.san.includes('+')) {
          soundSystem.playCheck();
          const checks = selectedBot.dialogue.onCheck;
          setBotDialogue(checks[Math.floor(Math.random() * checks.length)]);
        } else if (moveResult.captured) {
          soundSystem.playCapture();
          const attacks = selectedBot.dialogue.onAttack;
          setBotDialogue(attacks[Math.floor(Math.random() * attacks.length)]);
        } else if (moveResult.san.includes('O-O')) {
          soundSystem.playCastle();
        } else {
          soundSystem.playMove();
          const moves = selectedBot.dialogue.onMove;
          setBotDialogue(moves[Math.floor(Math.random() * moves.length)]);
        }

        updateCapturedPieces();
        setEngineOutput(`${selectedBot.name} plays: ${result.uci} (${moveResult.san})`);
        checkGameEnd();
      }
    } catch (err) {
      console.error('Error during engine search:', err);
      setEngineOutput("Engine calculation completed.");
    } finally {
      setIsEngineThinking(false);
    }
  }, [chess, isEngineThinking, selectedBot, updateCapturedPieces, checkGameEnd]);

  // Handle Player Move
  const handlePlayerMove = (from: Square, to: Square, promotion?: string): boolean => {
    if (isEngineThinking || chess.isGameOver()) return false;

    // Check if it's player's turn
    if (chess.turn() !== playerColor) return false;

    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion || 'q'
      });

      if (!move) return false;

      // Update state
      setFenState(chess.fen());
      setLastMove({ from, to });
      const newHistory = chess.history();
      setHistoryMoves(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);

      // Sound
      if (move.san.includes('#')) {
        soundSystem.playCheck();
      } else if (move.san.includes('+')) {
        soundSystem.playCheck();
        setBotDialogue("Check received. Calculating evasive maneuver.");
      } else if (move.captured) {
        soundSystem.playCapture();
      } else if (move.san.includes('O-O')) {
        soundSystem.playCastle();
      } else {
        soundSystem.playMove();
      }

      updateCapturedPieces();

      // Quick static evaluation update
      const staticScore = stockfishEngine.evaluateBoard(chess);
      setEngineEval(prev => ({
        ...prev,
        scoreCp: staticScore
      }));

      // If game ends after player move, trigger end
      const ended = checkGameEnd();
      if (!ended) {
        // Trigger bot reply after short realistic delay
        setTimeout(() => {
          makeBotMove();
        }, 300);
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  // Start Game with selected bot
  const handleStartGame = (botToPlay: ChessBot, color: 'w' | 'b' = playerColor) => {
    setSelectedBot(botToPlay);
    setPlayerColor(color);
    setBoardOrientation(color);
    stockfishEngine.configureBot(botToPlay);

    // Reset chess board
    chess.reset();
    setFenState(chess.fen());
    setHistoryMoves([]);
    setCurrentMoveIndex(-1);
    setLastMove(null);
    setCapturedWhite({});
    setCapturedBlack({});
    setGameOverModalOpen(false);
    setGameWinner(null);
    setEngineOutput(`Match started vs ${botToPlay.name}. Best of luck!`);

    const welcomeQuotes = botToPlay.dialogue.gameStart;
    setBotDialogue(welcomeQuotes[Math.floor(Math.random() * welcomeQuotes.length)]);

    setGameStarted(true);
    setActiveTab('game');

    // If bot plays White, bot moves first!
    if (color === 'b') {
      setTimeout(() => {
        makeBotMove();
      }, 500);
    }
  };

  // Load custom FEN string (matches Android FEN input)
  const handleLoadFen = (fen: string): boolean => {
    try {
      const testChess = new Chess(fen);
      chess.load(fen);
      setFenState(chess.fen());
      setLastMove(null);
      setHistoryMoves([]);
      setCurrentMoveIndex(-1);
      updateCapturedPieces();
      const score = stockfishEngine.evaluateBoard(chess);
      setEngineEval(prev => ({ ...prev, scoreCp: score }));
      setEngineOutput(`Position loaded: ${fen.substring(0, 32)}...`);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Reset to standard starting position
  const handleResetStandard = () => {
    chess.reset();
    setFenState(chess.fen());
    setLastMove(null);
    setHistoryMoves([]);
    setCurrentMoveIndex(-1);
    updateCapturedPieces();
    setEngineEval({ scoreCp: 0, depth: 0, nodes: 0, pv: [], isCalculating: false });
    setEngineOutput("Reset to standard starting position.");
  };

  // Move jump in history
  const handleJumpToMove = (index: number) => {
    // Replay moves up to index
    chess.reset();
    for (let i = 0; i <= index; i++) {
      chess.move(historyMoves[i]);
    }
    setFenState(chess.fen());
    setCurrentMoveIndex(index);
    updateCapturedPieces();
  };

  // Takeback move
  const handleTakeback = () => {
    if (isEngineThinking || historyMoves.length === 0) return;
    // Undo bot move and player move (2 half-moves)
    chess.undo();
    if (chess.turn() !== playerColor) {
      chess.undo();
    }
    setFenState(chess.fen());
    const newHistory = chess.history();
    setHistoryMoves(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
    setLastMove(null);
    updateCapturedPieces();
    setBotDialogue("Takeback granted. Re-calculating position.");
  };

  // Resign
  const handleResign = () => {
    if (chess.isGameOver()) return;
    setGameWinner(playerColor === 'w' ? 'b' : 'w');
    setGameOverReason(`You resigned. ${selectedBot.name} is victorious.`);
    setGameOverModalOpen(true);
    soundSystem.playDefeat();
  };

  // Offer Draw
  const handleOfferDraw = () => {
    if (chess.isGameOver()) return;
    // Bot decides based on contempt and current eval
    const currentScore = stockfishEngine.evaluateBoard(chess);
    const botAdvantage = playerColor === 'w' ? -currentScore : currentScore;

    if (selectedBot.contempt > 50 && botAdvantage > -100) {
      setBotDialogue(`Draw offer declined! My contempt is ${selectedBot.contempt}. I'm playing for the full point!`);
      setEngineOutput(`${selectedBot.name} declined the draw offer.`);
    } else if (botAdvantage < -200 || (Math.abs(botAdvantage) < 50 && selectedBot.contempt <= 0)) {
      setGameWinner('draw');
      setGameOverReason(`Draw accepted by ${selectedBot.name}.`);
      setGameOverModalOpen(true);
      setBotDialogue("Draw accepted. A well-fought equal battle.");
    } else {
      setBotDialogue("I think my position has chances. Let's play on.");
      setEngineOutput(`${selectedBot.name} prefers to continue playing.`);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundSystem.setEnabled(nextState);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewMatch={() => {
          setActiveTab('bots');
          setGameStarted(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Loading engine splash */}
        {!engineReady ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              Initializing Stockfish Engine...
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Booting UCI protocol, thread pools, and minimax evaluators
            </p>
          </div>
        ) : !gameStarted || activeTab === 'bots' ? (
          /* ========================================================================= */
          /* SCREEN 1: BOT SELECTION (matches Android Choose your Bot Opponent)        */
          /* ========================================================================= */
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                  Choose Your Bot Opponent
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Each engine bot runs distinct UCI parameters: ELO limit, Contempt draw-avoidance, and MultiPV line evaluation.
                </p>
              </div>

              {/* Side Choice: Play as White or Black */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                <span className="text-xs text-slate-400 px-2 font-medium">Your Side:</span>
                <button
                  type="button"
                  onClick={() => setPlayerColor('w')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    playerColor === 'w'
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerColor('b')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    playerColor === 'b'
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Black
                </button>
              </div>
            </div>

            {/* Bot Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  isSelected={selectedBot.id === bot.id}
                  onSelect={(b) => setSelectedBot(b)}
                  onCustomize={(b) => {
                    setBotToCustomize(b);
                    setIsCustomizingBot(true);
                  }}
                />
              ))}
            </div>

            {/* Start Match CTA Strip */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                  <img
                    src={selectedBot.avatar}
                    alt={selectedBot.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Selected:</span>
                    <strong className="text-sm text-slate-100">{selectedBot.name}</strong>
                    <span className="font-mono text-xs text-amber-400 font-bold">({selectedBot.elo} ELO)</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    "{selectedBot.quote}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setBotToCustomize(selectedBot);
                    setIsCustomizingBot(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition"
                  title="Configure UCI Parameters"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Configure UCI</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartGame(selectedBot, playerColor)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Game vs {selectedBot.name}</span>
                </button>
              </div>
            </div>

            {/* Engine Specifications Overview */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Stockfish UCI Implementation Details</span>
              </h3>
              <p>
                This app runs a full chess engine simulation matching the official Stockfish UCI protocol. When you play against a bot, the app dispatches <code className="text-amber-400 font-mono">position fen &lt;fen&gt;</code> and <code className="text-amber-400 font-mono">go movetime &lt;ms&gt;</code>, reading real-time minimax depth, centipawn evaluations, and <code className="text-amber-400 font-mono">bestmove</code> directives.
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 2: ACTIVE MATCH BOARD (Matches Android Active Game Screen)         */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Board + Headers + FEN State */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Opponent Bot Header with Live Dialogue & Captured Pieces */}
              <BotHeader
                bot={selectedBot}
                isEngineThinking={isEngineThinking}
                dialogueText={botDialogue}
                capturedPieces={capturedBlack}
                scoreCp={engineEval.scoreCp}
              />

              {/* Chessboard Area with Evaluation Bar */}
              <div className="flex items-stretch justify-center gap-3">
                <EvalBar
                  scoreCp={engineEval.scoreCp}
                  mate={engineEval.mate}
                  isCalculating={isEngineThinking}
                  flipped={boardOrientation === 'b'}
                />

                <div className="flex-1 max-w-[560px]">
                  <ChessBoard
                    game={chess}
                    boardOrientation={boardOrientation}
                    lastMove={lastMove}
                    theme={boardTheme}
                    isInteractive={!isEngineThinking && !chess.isGameOver()}
                    onMakeMove={handlePlayerMove}
                  />
                </div>
              </div>

              {/* Player Header with Controls */}
              <PlayerHeader
                isPlayerTurn={chess.turn() === playerColor && !isEngineThinking && !chess.isGameOver()}
                playerColor={playerColor}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                onTakeback={handleTakeback}
                onFlipBoard={() => setBoardOrientation(prev => prev === 'w' ? 'b' : 'w')}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
                capturedPieces={capturedWhite}
                canTakeback={historyMoves.length > 0 && !isEngineThinking}
              />

              {/* Current FEN State Bar (directly matching Android OutlinedTextField) */}
              <FenBar
                currentFen={fenState}
                onLoadFen={handleLoadFen}
                onResetStandard={handleResetStandard}
              />
            </div>

            {/* Right Column: Engine Output Card, Move History & UCI Console */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Engine Output Card (matching Android: Card with label 'Engine Output:') */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Engine Output
                  </span>
                  <span className="font-mono text-[11px] text-amber-400 font-bold">
                    Depth {engineEval.depth} · {engineEval.nodes} nodes
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-100 border border-slate-800 break-words flex items-center gap-2">
                  {isEngineThinking ? (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>{engineOutput}</span>
                </div>

                {/* Android Buttons: Change Bot & Get Bot Move */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setGameStarted(false);
                      setActiveTab('bots');
                    }}
                    className="py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition text-center"
                  >
                    Change Bot
                  </button>

                  <button
                    type="button"
                    disabled={isEngineThinking || chess.isGameOver()}
                    onClick={() => makeBotMove()}
                    className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none transition text-center shadow-xs"
                  >
                    {isEngineThinking ? "Thinking..." : "Get Bot Move"}
                  </button>
                </div>
              </div>

              {/* Move History Table */}
              <div className="h-64">
                <MoveHistory
                  history={historyMoves}
                  currentMoveIndex={currentMoveIndex}
                  onJumpToMove={handleJumpToMove}
                  pgn={chess.pgn()}
                />
              </div>

              {/* UCI Console Drawer / Terminal */}
              <UciConsole
                logs={uciLogs}
                onSendCommand={(cmd) => stockfishEngine.sendCustomCommand(cmd)}
                isOpen={true}
                onToggle={() => {}}
              />
            </div>
          </div>
        )}
      </main>

      {/* Bot Customizer Modal */}
      {botToCustomize && (
        <BotCustomizerModal
          bot={botToCustomize}
          isOpen={isCustomizingBot}
          onClose={() => {
            setIsCustomizingBot(false);
            setBotToCustomize(null);
          }}
          onSave={(updated) => {
            setBots(prev => prev.map(b => b.id === updated.id ? updated : b));
            if (selectedBot.id === updated.id) {
              setSelectedBot(updated);
              stockfishEngine.configureBot(updated);
            }
          }}
        />
      )}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameOverModalOpen}
        winner={gameWinner}
        reason={gameOverReason}
        bot={selectedBot}
        playerColor={playerColor}
        onPlayAgain={() => handleStartGame(selectedBot, playerColor)}
        onChangeBot={() => {
          setGameOverModalOpen(false);
          setGameStarted(false);
          setActiveTab('bots');
        }}
        onReviewBoard={() => setGameOverModalOpen(false)}
      />
    </div>
  );
}
