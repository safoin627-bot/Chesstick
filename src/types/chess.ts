export interface ChessBot {
  id: string;
  name: string;
  elo: number;
  style: string;
  contempt: number;
  moveTimeMs: number;
  multiPV: number;
  avatar: string;
  quote: string;
  personality: 'aggressive' | 'solid' | 'chaos' | 'grandmaster' | 'custom';
  colorTheme: string;
  dialogue: {
    gameStart: string[];
    onMove: string[];
    onAttack: string[];
    onCheck: string[];
    onBlunder: string[];
    onWin: string[];
    onLoss: string[];
  };
}

export type BoardTheme = 'tournament' | 'walnut' | 'midnight' | 'emerald';

export interface UciLogEntry {
  id: string;
  timestamp: string;
  direction: 'in' | 'out';
  command: string;
}

export interface EngineEval {
  scoreCp: number; // Centipawns from White's perspective
  mate?: number;   // Moves to mate if detected
  depth: number;
  nodes: number;
  pv: string[];
  bestMove?: string;
  isCalculating: boolean;
}

export const BOT_PRESETS: ChessBot[] = [
  {
    id: 'aggressive_alex',
    name: 'Aggressive Alex',
    elo: 1500,
    style: 'Attacking & Tactical',
    contempt: 100,
    moveTimeMs: 300,
    multiPV: 3,
    avatar: '/src/assets/images/bot_alex_1793905596680.jpg',
    quote: 'Offense is the best defense. Let\'s open up the board!',
    personality: 'aggressive',
    colorTheme: 'from-amber-600 to-red-600',
    dialogue: {
      gameStart: [
        "Brace yourself, I don't play for draws!",
        "Every piece I have is aimed at your king.",
        "Let's see if your defenses can withstand a full onslaught."
      ],
      onMove: [
        "Pawn storm incoming!",
        "Clearing lines for the tactical blow.",
        "Forward momentum is everything."
      ],
      onAttack: [
        "A sacrifice? Or sheer devastation!",
        "Your king is running out of squares.",
        "Direct hit on your flank!"
      ],
      onCheck: [
        "Check! Watch your monarch scramble.",
        "Nowhere to hide now!",
        "Feel the pressure!"
      ],
      onBlunder: [
        "Did you leave that hanging on purpose?!",
        "Free tactical buffet!",
        "I will gladly take that piece."
      ],
      onWin: [
        "Checkmate! Aggression pays off every single time.",
        "Total tactical domination!"
      ],
      onLoss: [
        "Impressive counter-punch... I respect the defense.",
        "You held the line like a fortress."
      ]
    }
  },
  {
    id: 'solid_sophia',
    name: 'Solid Sophia',
    elo: 1800,
    style: 'Positional & Defensive',
    contempt: 0,
    moveTimeMs: 500,
    multiPV: 1,
    avatar: '/src/assets/images/bot_sophia_1793905597748.jpg',
    quote: 'Patience and prophylaxis. The quietest moves cut the deepest.',
    personality: 'solid',
    colorTheme: 'from-emerald-600 to-teal-700',
    dialogue: {
      gameStart: [
        "A well-structured position never collapses.",
        "Precision in every placement. Good luck.",
        "Control the center, control the destiny of the board."
      ],
      onMove: [
        "Restricting your candidate squares.",
        "Strengthening the pawn chain.",
        "Prophylaxis: preventing your plans before you conceive them."
      ],
      onAttack: [
        "Your weakness has been methodically targeted.",
        "A positional clamp tightens.",
        "Step by step, the endgame approaches."
      ],
      onCheck: [
        "A calculated check to improve my coordination.",
        "Check. Your king must step aside."
      ],
      onBlunder: [
        "Positional inaccuracy noted. Capitalizing.",
        "An unforced error is rarely forgiven at master level."
      ],
      onWin: [
        "The position was logically won ten moves ago. Well played.",
        "Flawless structural conversion."
      ],
      onLoss: [
        "A masterclass in technique. My congratulations.",
        "You outplayed my defensive matrix."
      ]
    }
  },
  {
    id: 'chaos_charlie',
    name: 'Chaos Charlie',
    elo: 1200,
    style: 'Unpredictable / Wild',
    contempt: 50,
    moveTimeMs: 150,
    multiPV: 5,
    avatar: '/src/assets/images/bot_charlie_1793905597772.jpg',
    quote: 'Why play the main line when you can invent a brand new blunder or brilliance?',
    personality: 'chaos',
    colorTheme: 'from-purple-600 to-pink-600',
    dialogue: {
      gameStart: [
        "Who needs opening theory? Let's dance on the edge!",
        "Bet you haven't seen this gambit in any book!",
        "Chaos reigns! Fast moves, wild tactics!"
      ],
      onMove: [
        "Wait, is that legal? Yes it is!",
        "Throwing a wrench in your plans!",
        "Wild piece acrobatics incoming!"
      ],
      onAttack: [
        "YOLO! Into the enemy camp we go!",
        "Surprise! Did you calculate that one?",
        "Pieces fly everywhere!"
      ],
      onCheck: [
        "Check from outta nowhere! Boom!",
        "Surprise check! How you gonna deal with that?"
      ],
      onBlunder: [
        "Ooh, shiny free pawn? Don't mind if I do!",
        "Was that a trap or a gift? Taking it anyway!"
      ],
      onWin: [
        "Chaos triumphs over order! Haha, what a wild ride!",
        "Unpredictability for the win!"
      ],
      onLoss: [
        "Ah well! Too much spice in the stew. Rematch?",
        "Order restored... for now!"
      ]
    }
  },
  {
    id: 'grandmaster_stockfish',
    name: 'Grandmaster Stockfish',
    elo: 3190,
    style: 'Maximum Engine Power',
    contempt: 24,
    moveTimeMs: 1000,
    multiPV: 1,
    avatar: '/src/assets/images/bot_stockfish_1793905597070.jpg',
    quote: 'Calculation to 20 plies. Evaluation +2.84. Inevitability confirmed.',
    personality: 'grandmaster',
    colorTheme: 'from-blue-600 to-indigo-800',
    dialogue: {
      gameStart: [
        "UCI engine initialized. Deep search parameters active.",
        "Alpha-beta pruning online. Zero tactical illusions.",
        "Evaluation baseline set. Ready to compute optimal trajectory."
      ],
      onMove: [
        "Depth 18 verified. Principal variation confirmed.",
        "Nodes calculated: 148,000. Best move selected.",
        "Minimax optimum locked in."
      ],
      onAttack: [
        "Forced mating sequence or decisive material conversion initialized.",
        "Evaluation skewing severely in engine favor (+4.50).",
        "Refutation sequence active."
      ],
      onCheck: [
        "Check. Tree search narrowed to only 2 legal replies.",
        "Direct king threat with minimal response branches."
      ],
      onBlunder: [
        "Tactical error registered. Centipawn deviation > 300.",
        "Immediate engine punishment deployed."
      ],
      onWin: [
        "Checkmate. Position solved in accordance with engine evaluation.",
        "Terminal node reached. Game over."
      ],
      onLoss: [
        "Phenomenal play. You found the exact moves to defeat 3190 ELO.",
        "Evaluation overturned. Exemplary human mastery."
      ]
    }
  }
];
