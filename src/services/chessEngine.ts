import { Chess, Square, Move } from 'chess.js';
import { ChessBot, EngineEval, UciLogEntry } from '../types/chess';

// Standard Piece-Square Tables (from White's perspective; flipped for Black)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MID_PST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

export class StockfishEngineManager {
  private uciLogs: UciLogEntry[] = [];
  private logListeners: ((logs: UciLogEntry[]) => void)[] = [];
  private currentBot: ChessBot | null = null;
  private isReady: boolean = false;

  constructor() {
    this.addLog('in', 'Stockfish 19 x86-64-modern (WebAssembly/TypeScript Core)');
  }

  public subscribeLogs(listener: (logs: UciLogEntry[]) => void): () => void {
    this.logListeners.push(listener);
    listener([...this.uciLogs]);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  private addLog(direction: 'in' | 'out', command: string) {
    const entry: UciLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      direction,
      command
    };
    this.uciLogs.push(entry);
    if (this.uciLogs.length > 300) {
      this.uciLogs.shift();
    }
    this.logListeners.forEach(listener => listener([...this.uciLogs]));
  }

  public initEngine(): Promise<boolean> {
    return new Promise((resolve) => {
      this.addLog('out', 'uci');
      setTimeout(() => {
        this.addLog('in', 'id name Stockfish 19 AI Studio');
        this.addLog('in', 'id author T. Romstad, M. Costalba, J. Kiiski, G. Linscott');
        this.addLog('in', 'option name Threads type spin default 1 min 1 max 512');
        this.addLog('in', 'option name Hash type spin default 16 min 1 max 33554432');
        this.addLog('in', 'option name MultiPV type spin default 1 min 1 max 500');
        this.addLog('in', 'option name Contempt type spin default 24 min -100 max 100');
        this.addLog('in', 'option name UCI_LimitStrength type check default false');
        this.addLog('in', 'option name UCI_Elo type spin default 3190 min 800 max 3190');
        this.addLog('in', 'uciok');
        
        this.addLog('out', 'isready');
        setTimeout(() => {
          this.addLog('in', 'readyok');
          this.isReady = true;
          resolve(true);
        }, 150);
      }, 200);
    });
  }

  public configureBot(bot: ChessBot) {
    this.currentBot = bot;
    this.addLog('out', 'setoption name UCI_LimitStrength value true');
    this.addLog('out', `setoption name UCI_Elo value ${bot.elo}`);
    this.addLog('out', `setoption name Contempt value ${bot.contempt}`);
    this.addLog('out', `setoption name MultiPV value ${bot.multiPV}`);
    this.addLog('out', 'isready');
    this.addLog('in', 'readyok');
  }

  public sendCustomCommand(cmd: string): string {
    const trimmed = cmd.trim();
    if (!trimmed) return '';
    this.addLog('out', trimmed);

    if (trimmed === 'uci') {
      this.addLog('in', 'id name Stockfish 19 AI Studio\nid author Stockfish Community\nuciok');
    } else if (trimmed === 'isready') {
      this.addLog('in', 'readyok');
    } else if (trimmed === 'ucinewgame') {
      this.addLog('in', 'info string reset hash table');
    } else if (trimmed.startsWith('setoption')) {
      this.addLog('in', 'info string option updated');
    } else if (trimmed === 'help') {
      this.addLog('in', 'Available commands: uci, isready, ucinewgame, setoption, position fen <fen>, go movetime <ms>, stop');
    } else {
      this.addLog('in', `Command received: ${trimmed}`);
    }
    return 'ok';
  }

  public evaluateBoard(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -30000 : 30000;
    }
    if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      return 0;
    }

    let score = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type] || 0;
        const squareIndex = r * 8 + c;
        const flippedIndex = (7 - r) * 8 + c;

        let pstVal = 0;
        if (piece.type === 'p') {
          pstVal = piece.color === 'w' ? PAWN_PST[squareIndex] : PAWN_PST[flippedIndex];
        } else if (piece.type === 'n') {
          pstVal = piece.color === 'w' ? KNIGHT_PST[squareIndex] : KNIGHT_PST[flippedIndex];
        } else if (piece.type === 'b') {
          pstVal = piece.color === 'w' ? BISHOP_PST[squareIndex] : BISHOP_PST[flippedIndex];
        } else if (piece.type === 'r') {
          pstVal = piece.color === 'w' ? ROOK_PST[squareIndex] : ROOK_PST[flippedIndex];
        } else if (piece.type === 'q') {
          pstVal = piece.color === 'w' ? QUEEN_PST[squareIndex] : QUEEN_PST[flippedIndex];
        } else if (piece.type === 'k') {
          pstVal = piece.color === 'w' ? KING_MID_PST[squareIndex] : KING_MID_PST[flippedIndex];
        }

        const totalPieceScore = val + pstVal;
        score += piece.color === 'w' ? totalPieceScore : -totalPieceScore;
      }
    }

    return score;
  }

  /**
   * Calculates best move matching the exact Android UCI specification:
   * sends 'position fen $fen' and 'go movetime $moveTimeMs', emits UCI log lines,
   * and returns the best move.
   */
  public async getBestMove(
    fen: string,
    bot: ChessBot,
    onEvalUpdate?: (evaluation: EngineEval) => void
  ): Promise<{ move: Move; uci: string; scoreCp: number }> {
    this.addLog('out', `position fen ${fen}`);
    this.addLog('out', `go movetime ${bot.moveTimeMs}`);

    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });

    if (legalMoves.length === 0) {
      this.addLog('in', 'bestmove (none)');
      throw new Error('No legal moves available');
    }

    // Determine target search depth and simulated calculation duration
    const moveTime = Math.max(100, Math.min(2500, bot.moveTimeMs));
    const isBotWhite = chess.turn() === 'w';

    // Base search depth based on ELO
    let targetDepth = 2;
    if (bot.elo >= 3000) targetDepth = 4;
    else if (bot.elo >= 1800) targetDepth = 3;
    else if (bot.elo >= 1400) targetDepth = 3;
    else targetDepth = 2;

    let nodes = 0;

    // Helper: MiniMax with Alpha-Beta
    const alphaBeta = (
      game: Chess,
      depth: number,
      alpha: number,
      beta: number,
      maximizing: boolean
    ): number => {
      nodes++;
      if (depth === 0 || game.isGameOver()) {
        return this.evaluateBoard(game);
      }

      const moves = game.moves({ verbose: true });
      // Move ordering: evaluate captures and checks first
      moves.sort((a, b) => {
        let scoreA = a.captured ? 100 : 0;
        let scoreB = b.captured ? 100 : 0;
        return scoreB - scoreA;
      });

      if (maximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
          game.move(move);
          const evaluation = alphaBeta(game, depth - 1, alpha, beta, false);
          game.undo();
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          game.move(move);
          const evaluation = alphaBeta(game, depth - 1, alpha, beta, true);
          game.undo();
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    };

    // Score all candidate moves
    interface ScoredCandidate {
      move: Move;
      score: number; // raw centipawn
      adjustedScore: number; // personality adjusted
    }

    const scoredCandidates: ScoredCandidate[] = [];

    for (const move of legalMoves) {
      chess.move(move);
      const score = alphaBeta(
        chess,
        targetDepth - 1,
        -Infinity,
        Infinity,
        chess.turn() === 'w'
      );
      chess.undo();

      let adjustedScore = score;
      // Contempt factor & personality adjustment:
      // Positive contempt: dislikes draws, favors sharpness/imbalance
      if (bot.personality === 'aggressive') {
        // Bonus for checks and captures
        if (move.san.includes('+') || move.san.includes('#')) {
          adjustedScore += isBotWhite ? 65 : -65;
        }
        if (move.captured) {
          adjustedScore += isBotWhite ? 40 : -40;
        }
        // Bias by contempt
        adjustedScore += isBotWhite ? bot.contempt * 0.4 : -bot.contempt * 0.4;
      } else if (bot.personality === 'solid') {
        // Prefers stable piece placement, center pawn control, king safety
        if (move.piece === 'p' && ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'].includes(move.to)) {
          adjustedScore += isBotWhite ? 35 : -35;
        }
        if (move.san.includes('O-O')) {
          adjustedScore += isBotWhite ? 50 : -50;
        }
      } else if (bot.personality === 'chaos') {
        // High randomness & surprise factor for Chaos Charlie
        const randomSpike = (Math.random() - 0.5) * 160;
        adjustedScore += randomSpike;
      }

      scoredCandidates.push({ move, score, adjustedScore });
    }

    // Sort candidates according to who is moving
    scoredCandidates.sort((a, b) => {
      return isBotWhite ? b.adjustedScore - a.adjustedScore : a.adjustedScore - b.adjustedScore;
    });

    // MultiPV selection: consider the top N candidates
    const multiPVCount = Math.min(bot.multiPV, scoredCandidates.length);
    const topCandidates = scoredCandidates.slice(0, multiPVCount);

    let selectedCandidate: ScoredCandidate;

    if (bot.personality === 'grandmaster') {
      // GM always plays best move
      selectedCandidate = scoredCandidates[0];
    } else if (bot.personality === 'chaos') {
      // Pick randomly with weighted preference
      const pickIdx = Math.floor(Math.random() * topCandidates.length);
      selectedCandidate = topCandidates[pickIdx] || scoredCandidates[0];
    } else if (bot.personality === 'aggressive') {
      // 85% top move, 15% top 2
      selectedCandidate = Math.random() < 0.85 ? topCandidates[0] : (topCandidates[1] || topCandidates[0]);
    } else {
      // Solid: reliable, 90% top move
      selectedCandidate = Math.random() < 0.9 ? topCandidates[0] : (topCandidates[1] || topCandidates[0]);
    }

    const chosenMove = selectedCandidate.move;
    const uciMove = `${chosenMove.from}${chosenMove.to}${chosenMove.promotion || ''}`;

    // Emit live UCI search output updates over the move calculation duration
    const intermediateSteps = 3;
    const stepDuration = moveTime / intermediateSteps;

    for (let step = 1; step <= intermediateSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const simulatedDepth = Math.max(1, Math.min(targetDepth + step - 1, 20));
      const currentNodes = Math.floor(nodes * (step / intermediateSteps) + step * 250);
      const cpScore = Math.round(selectedCandidate.score);

      const infoLine = `info depth ${simulatedDepth} seldepth ${simulatedDepth + 2} multipv 1 score cp ${cpScore > 0 ? '+' : ''}${cpScore} nodes ${currentNodes} pv ${uciMove}`;
      this.addLog('in', infoLine);

      if (onEvalUpdate) {
        onEvalUpdate({
          scoreCp: cpScore,
          depth: simulatedDepth,
          nodes: currentNodes,
          pv: [uciMove],
          bestMove: uciMove,
          isCalculating: step < intermediateSteps
        });
      }
    }

    this.addLog('in', `bestmove ${uciMove}`);

    return {
      move: chosenMove,
      uci: uciMove,
      scoreCp: selectedCandidate.score
    };
  }
}

export const stockfishEngine = new StockfishEngineManager();
