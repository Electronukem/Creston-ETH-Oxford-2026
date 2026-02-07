import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, RotateCcw, Loader2 } from 'lucide-react';
import { BOARD_SIZE, getBonusType, INITIAL_LETTER_BAG, LETTER_VALUES } from '../constants';
import { CellData, TileData } from '../types';
import { validateWordWithAI } from '../services/geminiService';

interface GameBoardProps {
  score: number;
  opponentScore: number;
  onWinGame: () => void;
  onScoreUpdate: (newScore: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialBoard = (): CellData[][] => {
  const board: CellData[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push({
        row: r,
        col: c,
        bonus: getBonusType(r, c),
        tile: null,
        isTemp: false
      });
    }
    board.push(row);
  }
  
  // Pre-fill a few tiles to simulate an ongoing game state
  // "CRESTON" horizontally
  const startR = 7, startC = 4;
  const word = "CRESTON";
  for(let i=0; i<word.length; i++) {
    board[startR][startC+i].tile = { 
        id: `init-${i}`, 
        letter: word[i], 
        value: LETTER_VALUES[word[i]] 
    };
  }
  
  return board;
};

const GameBoard: React.FC<GameBoardProps> = ({ score, opponentScore, onWinGame, onScoreUpdate }) => {
  const [board, setBoard] = useState<CellData[][]>(createInitialBoard());
  const [bag, setBag] = useState<string[]>(INITIAL_LETTER_BAG);
  const [rack, setRack] = useState<TileData[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize rack
  useEffect(() => {
    fillRack();
  }, []);

  const fillRack = () => {
    setRack(prev => {
      const needed = 7 - prev.length;
      if (needed <= 0) return prev;
      
      const newTiles: TileData[] = [];
      const currentBag = [...bag];
      
      for (let i = 0; i < needed; i++) {
        if (currentBag.length === 0) break;
        const randomIndex = Math.floor(Math.random() * currentBag.length);
        const letter = currentBag.splice(randomIndex, 1)[0];
        newTiles.push({
          id: generateId(),
          letter,
          value: LETTER_VALUES[letter]
        });
      }
      
      setBag(currentBag);
      return [...prev, ...newTiles];
    });
  };

  const handleTileClick = (tileId: string) => {
    setSelectedTileId(prev => prev === tileId ? null : tileId);
  };

  const handleCellClick = (r: number, c: number) => {
    const cell = board[r][c];

    // Case 1: Placing a tile from rack
    if (!cell.tile && selectedTileId) {
      const tileToPlace = rack.find(t => t.id === selectedTileId);
      if (!tileToPlace) return;

      // Update board
      const newBoard = [...board];
      newBoard[r][c] = { ...cell, tile: tileToPlace, isTemp: true };
      setBoard(newBoard);

      // Remove from rack
      setRack(prev => prev.filter(t => t.id !== selectedTileId));
      setSelectedTileId(null);
    }
    // Case 2: Recalling a temp tile from board back to rack
    else if (cell.tile && cell.isTemp) {
      const tileToReturn = cell.tile;
      
      // Update board
      const newBoard = [...board];
      newBoard[r][c] = { ...cell, tile: null, isTemp: false };
      setBoard(newBoard);

      // Return to rack
      setRack(prev => [...prev, tileToReturn]);
      if (selectedTileId === tileToReturn.id) setSelectedTileId(null);
    }
  };

  const handleRecallAll = () => {
    const newBoard = [...board];
    const returnedTiles: TileData[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c].isTemp && newBoard[r][c].tile) {
          returnedTiles.push(newBoard[r][c].tile!);
          newBoard[r][c].tile = null;
          newBoard[r][c].isTemp = false;
        }
      }
    }

    setBoard(newBoard);
    setRack(prev => [...prev, ...returnedTiles]);
    setSelectedTileId(null);
  };

  const handleShuffle = () => {
    setRack(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handlePlay = async () => {
    setIsProcessing(true);
    setMessage(null);

    // 1. Identify placed tiles
    const placedCells: CellData[] = [];
    board.forEach(row => row.forEach(cell => {
      if (cell.isTemp) placedCells.push(cell);
    }));

    if (placedCells.length === 0) {
      setMessage("Place some tiles first!");
      setIsProcessing(false);
      return;
    }

    // 2. Validate Alignment (all in same row or col)
    const rows = new Set(placedCells.map(c => c.row));
    const cols = new Set(placedCells.map(c => c.col));
    const isRow = rows.size === 1;
    const isCol = cols.size === 1;

    if (!isRow && !isCol) {
      setMessage("Tiles must be in a straight line.");
      setIsProcessing(false);
      return;
    }

    // 3. Construct the main word
    let word = "";
    let scoreForMove = 0;
    let wordMultiplier = 1;

    // Simple scoring simulation for the demo
    // In a real engine we traverse the board to find the full connected word
    // Here we just concat the placed tiles for simplicity in the demo
    placedCells.sort((a, b) => isRow ? a.col - b.col : a.row - b.row);
    
    // Check gaps and connectivity (Simplified)
    for (const cell of placedCells) {
      if (cell.tile) {
        word += cell.tile.letter;
        let letterScore = cell.tile.value;
        
        if (cell.bonus === 'DL') letterScore *= 2;
        if (cell.bonus === 'TL') letterScore *= 3;
        if (cell.bonus === 'DW') wordMultiplier *= 2;
        if (cell.bonus === 'TW') wordMultiplier *= 3;
        
        scoreForMove += letterScore;
      }
    }
    scoreForMove *= wordMultiplier;

    // 4. AI Validation
    const isValid = await validateWordWithAI(word);
    if (!isValid) {
      setMessage(`"${word}" is not a valid word.`);
      setIsProcessing(false);
      return;
    }

    // 5. Commit Move
    const committedBoard = board.map(row => row.map(cell => ({
      ...cell,
      isTemp: false
    })));
    setBoard(committedBoard);
    onScoreUpdate(score + scoreForMove);
    
    // 6. Refill Rack
    fillRack();
    
    setIsProcessing(false);
    setMessage(`Played ${word} for ${scoreForMove} pts!`);

    // 7. Check Win Condition (Mock)
    if (score + scoreForMove > 100) { // Win threshold for demo
      setTimeout(onWinGame, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-200 lg:rounded-xl overflow-hidden shadow-2xl border-x-0 border-y-0 lg:border border-slate-300">
      {/* Header */}
      <div className="bg-white p-2 md:p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px]">
          <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">You</span>
          <span className="text-lg md:text-2xl font-bold text-slate-800">{score}</span>
        </div>
        
        <div className="flex flex-col items-center">
            <div className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider mb-1">
               YOUR TURN
            </div>
            {message && <span className="text-xs text-orange-600 animate-pulse font-medium text-center truncate max-w-[150px]">{message}</span>}
        </div>

        <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px]">
          <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Friend</span>
          <span className="text-lg md:text-2xl font-bold text-slate-400">{opponentScore}</span>
        </div>
      </div>

      {/* Board Scroll Area */}
      <div className="flex-1 overflow-auto bg-slate-200 relative flex items-center justify-center p-2 md:p-4 touch-pan-x touch-pan-y">
        <div 
           className="grid gap-[1px] md:gap-[2px] bg-slate-300 border-[2px] md:border-[4px] border-slate-300 rounded shadow-lg select-none"
           style={{ 
             // Adjusted minmax for mobile to fit ~22px tiles (22*15 = 330px fits in 360px phones)
             gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(21px, 1fr))`,
             width: 'fit-content'
           }}
        >
          {board.map((row, r) => (
            row.map((cell, c) => {
              const bonusColor = 
                cell.bonus === 'TW' ? 'bg-orange-400' :
                cell.bonus === 'DW' ? 'bg-rose-400' :
                cell.bonus === 'TL' ? 'bg-green-500' :
                cell.bonus === 'DL' ? 'bg-sky-400' :
                cell.bonus === 'START' ? 'bg-yellow-400' :
                'bg-slate-100'; 

              const bonusText = cell.bonus === 'START' ? '★' : cell.bonus;

              return (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    w-5 h-5 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center relative cursor-pointer
                    ${bonusColor}
                    ${selectedTileId && !cell.tile ? 'hover:opacity-80 ring-1 md:ring-2 ring-inset ring-orange-300' : ''}
                  `}
                >
                  {!cell.tile && cell.bonus && (
                    <span className="text-[6px] md:text-[9px] font-bold text-white/90 tracking-tighter leading-none text-center">
                      {bonusText}
                    </span>
                  )}

                  {cell.tile && (
                    <div className={`
                      w-[95%] h-[95%] rounded-[2px] md:rounded bg-[#fdf6e3] shadow-sm md:shadow-md border-b-[1px] md:border-b-2 border-[#e6dcc5]
                      flex items-center justify-center relative
                      ${cell.isTemp ? 'animate-in zoom-in duration-200 ring-1 md:ring-2 ring-green-400' : ''}
                    `}>
                      <span className="font-bold text-slate-800 text-[10px] sm:text-sm md:text-base leading-none mt-[-1px]">{cell.tile.letter}</span>
                      <span className="absolute bottom-[1px] right-[1px] text-[5px] md:text-[8px] font-bold text-slate-500 leading-none">
                        {cell.tile.value}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Rack & Controls */}
      <div className="bg-white border-t border-slate-200 p-2 md:p-4 pb-2 md:pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0 z-20">
        
        {/* Tiles */}
        <div className="flex justify-center space-x-1 md:space-x-3 mb-2 md:mb-6 min-h-[40px] md:min-h-[50px]">
          {rack.map((tile) => (
            <div 
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`
                w-9 h-9 sm:w-11 sm:h-11 md:w-11 md:h-11 bg-[#fdf6e3] rounded-md md:rounded-lg shadow-md border-b-2 md:border-b-4 border-[#e6dcc5]
                flex items-center justify-center relative cursor-pointer transition-all transform
                ${selectedTileId === tile.id ? 'mt-[-6px] ring-2 ring-orange-400' : 'active:scale-95'}
              `}
            >
              <span className="font-bold text-slate-800 text-lg md:text-xl leading-none">{tile.letter}</span>
              <span className="absolute bottom-0.5 right-1 text-[8px] md:text-[10px] font-bold text-slate-500 leading-none">
                {tile.value}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center px-1">
          <div className="flex space-x-1 md:space-x-2">
             <button 
               onClick={handleShuffle}
               className="p-2 md:p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
               title="Shuffle"
             >
               <Shuffle className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <button 
               onClick={handleRecallAll}
               className="p-2 md:p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
               title="Recall All"
             >
               <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
             </button>
          </div>
          
          <div className="flex space-x-2 md:space-x-3">
             <button className="px-3 md:px-6 py-2 rounded-full border-2 border-slate-200 text-slate-500 font-bold text-xs md:text-base hover:bg-slate-50 active:bg-slate-200 transition-colors">
               Pass
             </button>
             <button 
               onClick={handlePlay}
               disabled={isProcessing}
               className={`
                 px-5 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-base shadow-lg flex items-center space-x-2 transition-all
                 ${isProcessing ? 'bg-orange-300 cursor-wait' : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white'}
               `}
             >
                {isProcessing ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <span>Play</span>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;