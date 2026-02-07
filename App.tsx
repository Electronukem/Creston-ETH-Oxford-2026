import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import Dashboard from './components/Dashboard';
import { WalletState } from './types';
import { generateCongratulatoryMessage } from './services/geminiService';
import { Sparkles, X, Gamepad2, Wallet, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_WALLET: WalletState = {
  isConnected: false,
  address: null,
  balanceFLR: 0,
  balanceUSD: 0,
};

type Tab = 'GAME' | 'WALLET';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [gameScore, setGameScore] = useState(65);
  const [opponentScore, setOpponentScore] = useState(58);
  const [earnedCoins, setEarnedCoins] = useState(0);
  
  // Mobile specific state
  const [activeTab, setActiveTab] = useState<Tab>('GAME');
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  const handleWinGame = async () => {
    const coinsWon = 10; // Reward 10 FLR
    setEarnedCoins(coinsWon);
    
    setShowCelebration(true);
    
    const msg = await generateCongratulatoryMessage(gameScore, coinsWon);
    setCelebrationMessage(msg);

    if (wallet.isConnected) {
      setWallet(prev => ({
        ...prev,
        balanceFLR: prev.balanceFLR + coinsWon
      }));
    }
  };

  const handleScoreUpdate = (newScore: number) => {
     setGameScore(newScore);
     setTimeout(() => {
        setOpponentScore(prev => prev + Math.floor(Math.random() * 20) + 10);
     }, 2000);
  };

  const handleConnectWallet = (address: string) => {
    setWallet({
      isConnected: true,
      address,
      balanceFLR: 10.0, // Initial sign-up bonus or existing balance
      balanceUSD: 0,
    });
  };

  const handleClaimReward = () => {
    if (!wallet.isConnected) {
       // Switch to wallet tab if on mobile to prompt connection
       setActiveTab('WALLET');
       setShowCelebration(false);
       // Small delay to allow tab switch then alert
       setTimeout(() => alert("Please connect your secure wallet to claim!"), 300);
    } else {
       setShowCelebration(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:p-6 h-full">
          
          {/* Left: Game Area */}
          {/* On mobile: Hidden if tab is not GAME. On Desktop: Always visible (col-span-8) */}
          <div className={`
             lg:col-span-8 h-full relative flex flex-col
             ${activeTab !== 'GAME' ? 'hidden lg:flex' : 'flex'}
             lg:flex
          `}>
             <GameBoard 
              score={gameScore} 
              opponentScore={opponentScore} 
              onWinGame={handleWinGame} 
              onScoreUpdate={handleScoreUpdate}
            />
            
            {/* Extension Trigger / Info Overlay */}
            <div className={`
                absolute top-2 left-2 lg:top-16 lg:left-4 z-30
                bg-white/95 backdrop-blur rounded-xl shadow-xl border-l-4 border-indigo-600 
                transition-all duration-300 ease-in-out
                ${isInfoExpanded ? 'max-w-xs p-3 md:p-4' : 'max-w-[40px] p-2 overflow-hidden bg-indigo-50 border-0'}
            `}>
              {isInfoExpanded ? (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-indigo-900 uppercase">Creston Active</p>
                    <button onClick={() => setIsInfoExpanded(false)} className="lg:hidden text-gray-400">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-600 mb-3 leading-tight">
                    Play words. Win logic triggers at 100 points.
                  </p>
                  <button 
                      onClick={handleWinGame}
                      className="w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
                  >
                      Skip to End (Demo)
                  </button>
                </>
              ) : (
                <button onClick={() => setIsInfoExpanded(true)} className="w-full h-full flex items-center justify-center text-indigo-600">
                   <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Dashboard Area */}
          {/* On mobile: Hidden if tab is not WALLET. On Desktop: Always visible (col-span-4) */}
          <div className={`
            lg:col-span-4 h-full bg-white lg:rounded-2xl lg:shadow-xl overflow-hidden lg:ring-1 lg:ring-slate-200
            ${activeTab !== 'WALLET' ? 'hidden lg:block' : 'block'}
            w-full
          `}>
            <Dashboard 
              wallet={wallet}
              onConnectWallet={handleConnectWallet}
              onUpdateWallet={(updates) => setWallet(prev => ({ ...prev, ...updates }))}
              onDisconnect={() => setWallet(INITIAL_WALLET)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white border-t border-gray-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 shrink-0">
         <div className="flex justify-around items-center h-14">
            <button 
              onClick={() => setActiveTab('GAME')}
              className={`flex flex-col items-center space-y-1 w-16 transition-colors ${activeTab === 'GAME' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
               <Gamepad2 className={`w-6 h-6 ${activeTab === 'GAME' ? 'fill-current' : ''}`} />
               <span className="text-[10px] font-bold">Game</span>
            </button>
            
            {/* Center Floating Action Button Style for Reward */}
            <div className="relative -top-5">
               <button 
                 onClick={handleWinGame}
                 className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg text-white border-4 border-slate-100 active:scale-95 transition-transform"
                 title="Quick Win Demo"
               >
                 <Sparkles className="w-6 h-6" />
               </button>
            </div>

            <button 
              onClick={() => setActiveTab('WALLET')}
              className={`flex flex-col items-center space-y-1 w-16 transition-colors ${activeTab === 'WALLET' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
               <Wallet className={`w-6 h-6 ${activeTab === 'WALLET' ? 'fill-current' : ''}`} />
               <span className="text-[10px] font-bold">Rewards</span>
               {wallet.isConnected && wallet.balanceFLR > 0 && (
                 <span className="absolute top-3 right-[15%] w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
               )}
            </button>
         </div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden border-4 border-yellow-400">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
            
            <button 
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Sparkles className="w-10 h-10 text-yellow-600 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">You Won!</h2>
            <div className="text-4xl font-bold text-indigo-600 mb-3 tracking-tighter">
              +{earnedCoins} FLR
            </div>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed italic">
              "{celebrationMessage || 'Calculating...'}"
            </p>

            <button
              onClick={handleClaimReward}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              {wallet.isConnected ? 'Collect Rewards' : 'Connect to Claim'}
            </button>
            
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 text-gray-400 text-sm font-semibold mt-2 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;