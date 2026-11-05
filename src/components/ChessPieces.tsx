import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPieceIcon: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#1E293B';
  const stroke = isWhite ? '#0F172A' : '#0F172A';
  const detailStroke = isWhite ? '#334155' : '#94A3B8';

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="m 14.5,39.5 c 0,-6.5 4,-10 8,-10 4,0 8,3.5 8,10 z"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 l -23,0 c 0,-9 10,-6.5 8,-21"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.042,-0.94 1.41,-3.04 0,-3 -1,0 0.19,1.23 -1,2 -1,0 -4.003,1 -4,-4 0,-2 6,-12 6,-12 0,0 1.89,-1.9 2,-3.5 -0.73,-0.994 -0.5,-2 -0.5,-3 1,-1 3,2.5 3,2.5 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="14.5" r="1.5" fill={isWhite ? '#0F172A' : '#F8FAFC'} />
          <path
            d="m 24.55,10.4 c 0,0 2.2,-0.5 4.5,0.7"
            fill="none"
            stroke={detailStroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,1 -3.39,-0.21 -10.11,0.98 -13.5,-1 -3.39,1.98 -10.11,0.79 -13.5,1 -1.35,-0.01 -2.32,-0.03 -3,-1 1.35,-1.46 3,-2 3,-2 z"
              fill={fill}
            />
            <path
              d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z"
              fill={fill}
            />
            <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" fill={fill} />
            <path d="m 17.5,26 c 2,1 8,1 10,0" stroke={detailStroke} />
            <path d="m 20,10 5,0" stroke={detailStroke} />
            <path d="m 22.5,7.5 0,5" stroke={detailStroke} />
            <path d="m 22.5,17 0,8" stroke={detailStroke} />
            <path d="m 19,21 7,0" stroke={detailStroke} />
          </g>
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m 9,39 27,0 c 0,-3 -2,-4 -2,-4 l -23,0 c 0,0 -2,1 -2,4 z" />
            <path d="m 12,35 21,0 0,-3 -21,0 z" />
            <path d="m 12,32 0,-18 21,0 0,18 z" />
            <path d="m 11,14 23,0 0,-3 -23,0 z" />
            <path d="m 11,11 3,0 0,-3 3,0 0,3 4,0 0,-3 3,0 0,3 4,0 0,-3 3,0 0,3 3,0 0,3 -23,0 z" />
            <path d="m 14,32 0,-18" stroke={detailStroke} strokeWidth="1.2" />
            <path d="m 31,32 0,-18" stroke={detailStroke} strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4,-15 -4.5,15 -4.5,-15 -4,15 -7,-11 2,12 z" />
            <path d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 1.5,3.5 0.5,2.5 1,2.5 1.5,2.5 0.5,0 1,0 1.5,-2.5 0.5,-2.5 0.5,-2 1.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z" />
            <path d="m 11.5,30 c 3.5,-1 18.5,-1 22,0 m -21.5,3.5 c 3.5,-1 17.5,-1 21,0 m -20.5,3 c 3.5,-1 16.5,-1 20,0" stroke={detailStroke} />
            <path d="m 9,39 27,0 c 0,-2 -2,-3 -2,-3 l -23,0 c 0,0 -2,1 -2,3 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m 22.5,11.63 0,-6" stroke={stroke} />
            <path d="m 19.5,8.63 6,0" stroke={stroke} />
            <path
              d="m 22.5,25 c 0,0 4.5,-7.5 3,-10.5 -1.5,-3 -6,-3 -7.5,0 -1.5,3 3,10.5 3,10.5"
              fill={fill}
            />
            <path
              d="m 11.5,37 c 5.5,3.5 16.5,3.5 22,0 0,0 2.5,-6.5 -2,-8.5 -4.5,-2 -15.5,-2 -20,0 -4.5,2 -2,8.5 -2,8.5"
              fill={fill}
            />
            <path d="m 11.5,30 c 5.5,-2 16.5,-2 22,0" stroke={detailStroke} />
            <path d="m 11.5,33.5 c 5.5,-2 16.5,-2 22,0" stroke={detailStroke} />
            <path d="m 11.5,37 c 5.5,-2 16.5,-2 22,0" stroke={detailStroke} />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
