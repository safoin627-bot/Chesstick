import React, { useState } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { ChessPieceIcon } from './ChessPieces';
import { BoardTheme } from '../types/chess';

interface ChessBoardProps {
  game: Chess;
  boardOrientation: 'w' | 'b';
  lastMove: { from: Square; to: Square } | null;
  theme: BoardTheme;
  isInteractive: boolean;
  onMakeMove: (from: Square, to: Square, promotion?: string) => boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  boardOrientation,
  lastMove,
  theme,
  isInteractive,
  onMakeMove
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const isWhiteOrientation = boardOrientation === 'w';
  const ranks = isWhiteOrientation ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = isWhiteOrientation ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  // Check if current side king is in check
  let checkSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const fileLetter = String.fromCharCode(97 + c);
          const rankNum = 8 - r;
          checkSquare = `${fileLetter}${rankNum}` as Square;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  // Calculate legal moves for selected square
  const legalDestinationSquares: Square[] = [];
  if (selectedSquare && isInteractive) {
    const moves = game.moves({ square: selectedSquare, verbose: true });
    moves.forEach(m => legalDestinationSquares.push(m.to as Square));
  }

  const handleSquareClick = (square: Square) => {
    if (!isInteractive) return;

    // If already selected, check if clicked destination is a legal move
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (legalDestinationSquares.includes(square)) {
        // Check for promotion requirement
        const piece = game.get(selectedSquare);
        const isPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        const success = onMakeMove(selectedSquare, square);
        if (success) {
          setSelectedSquare(null);
          return;
        }
      }
    }

    // Select piece if it belongs to current player's turn
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!isInteractive) return;
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setDraggedSquare(square);
      e.dataTransfer.setData('text/plain', square);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const sourceSquare = (e.dataTransfer.getData('text/plain') as Square) || draggedSquare;
    setDraggedSquare(null);

    if (!sourceSquare || sourceSquare === targetSquare) return;

    const moves = game.moves({ square: sourceSquare, verbose: true });
    const isLegal = moves.some(m => m.to === targetSquare);

    if (isLegal) {
      const piece = game.get(sourceSquare);
      const isPromotion =
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && targetSquare[1] === '8') || (piece.color === 'b' && targetSquare[1] === '1'));

      if (isPromotion) {
        setPendingPromotion({ from: sourceSquare, to: targetSquare });
        return;
      }

      onMakeMove(sourceSquare, targetSquare);
      setSelectedSquare(null);
    }
  };

  const handlePromotionSelect = (promotionPiece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      onMakeMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  // Theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'tournament':
        return {
          light: 'bg-[#EEEED2] text-[#769656]',
          dark: 'bg-[#769656] text-[#EEEED2]',
          selected: 'bg-[#F7F769]/80',
          lastMove: 'bg-[#BACA44]/70'
        };
      case 'midnight':
        return {
          light: 'bg-[#334155] text-[#94A3B8]',
          dark: 'bg-[#0F172A] text-[#64748B]',
          selected: 'bg-[#38BDF8]/40',
          lastMove: 'bg-[#0284C7]/30'
        };
      case 'emerald':
        return {
          light: 'bg-[#E8EDF9] text-[#2D6A4F]',
          dark: 'bg-[#1B4332] text-[#D8F3DC]',
          selected: 'bg-[#52B788]/60',
          lastMove: 'bg-[#40916C]/50'
        };
      case 'walnut':
      default:
        return {
          light: 'bg-[#F0D9B5] text-[#B58863]',
          dark: 'bg-[#B58863] text-[#F0D9B5]',
          selected: 'bg-[#CE9B5E]/80',
          lastMove: 'bg-[#CDA869]/70'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="relative select-none rounded-xl p-2.5 bg-slate-900 border border-slate-800 shadow-2xl">
      {/* 8x8 Board Container */}
      <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-[560px] mx-auto rounded-lg overflow-hidden border border-slate-800/80 shadow-inner">
        {ranks.map((rank) =>
          files.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const isDark = (file.charCodeAt(0) - 97 + rank) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLegalDest = legalDestinationSquares.includes(square);
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
            const isInCheckSquare = checkSquare === square;

            // Determine active background color
            let squareBg = isDark ? themeColors.dark : themeColors.light;
            if (isSelected) {
              squareBg = themeColors.selected;
            } else if (isLastMoveSquare) {
              squareBg = themeColors.lastMove;
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${squareBg} ${
                  isInCheckSquare ? 'ring-4 ring-inset ring-red-500/80 animate-pulse' : ''
                }`}
              >
                {/* Board edge coordinates */}
                {file === (isWhiteOrientation ? 'a' : 'h') && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-mono font-bold leading-none select-none opacity-80 ${
                      isDark ? 'text-white/70' : 'text-slate-800/70'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rank === (isWhiteOrientation ? 1 : 8) && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-mono font-bold leading-none select-none opacity-80 ${
                      isDark ? 'text-white/70' : 'text-slate-800/70'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Legal move indicator */}
                {isLegalDest && !piece && (
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-900/35 ring-2 ring-slate-900/15 pointer-events-none" />
                )}
                {isLegalDest && piece && (
                  <div className="absolute inset-1 rounded-full border-4 border-slate-900/40 pointer-events-none" />
                )}

                {/* Chess Piece */}
                {piece && (
                  <div
                    draggable={isInteractive && piece.color === game.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`w-[84%] h-[84%] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                      isSelected ? 'scale-110 drop-shadow-md z-10' : ''
                    } ${isInteractive && piece.color === game.turn() ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                  >
                    <ChessPieceIcon type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 rounded-xl p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center shadow-2xl max-w-xs w-full animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Promote Pawn
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'q', label: 'Queen' },
                { type: 'r', label: 'Rook' },
                { type: 'b', label: 'Bishop' },
                { type: 'n', label: 'Knight' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handlePromotionSelect(type as 'q' | 'r' | 'b' | 'n')}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition hover:border-amber-400 group"
                  title={label}
                >
                  <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                    <ChessPieceIcon type={type as any} color={game.turn()} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
