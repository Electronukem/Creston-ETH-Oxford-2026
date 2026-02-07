import React, { useEffect, useState } from 'react';
import { Coins, User, LogOut, ArrowRightLeft, History, Trophy } from 'lucide-react';
import { WalletState } from '../types';
import WalletConnect from './WalletConnect';
import Exchange from './Exchange';
import { generateGameTip } from '../services/geminiService';

interface DashboardProps {
  wallet: WalletState;
  onConnectWallet: (address: string) => void;
  onUpdateWallet: (newState: Partial<WalletState>) => void;
  onDisconnect: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ wallet, onConnectWallet, onUpdateWallet, onDisconnect }) => {
  const [view, setView] = useState<'HOME' | 'EXCHANGE'>('HOME');
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    // Load a helpful AI tip on mount
    generateGameTip().then(setTip);
  }, []);

  if (!wallet.isConnected) {
    return <WalletConnect onConnect={onConnectWallet} />;
  }

  if (view === 'EXCHANGE') {
    return (
      <Exchange
        balance={wallet.balanceFLR}
        onBack={() => setView('HOME')}
        onExchange={(amount, usdValue) => {
          onUpdateWallet({
            balanceFLR: wallet.balanceFLR - amount,
            balanceUSD: wallet.balanceUSD + usdValue
          });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-rose-700 to-pink-900 text-white rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <User className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <p className="text-xs text-rose-200 opacity-80">Connected Wallet</p>
              <p className="text-sm font-mono font-medium truncate w-24">{wallet.address}</p>
            </div>
          </div>
          <button 
            onClick={onDisconnect}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4 text-rose-200" />
          </button>
        </div>

        <div className="text-center pb-4">
          <p className="text-rose-200 text-sm mb-1 uppercase tracking-wider font-semibold">Total Rewards</p>
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-8 h-8 text-yellow-400 fill-current" />
            <span className="text-4xl font-bold">{wallet.balanceFLR.toFixed(1)}</span>
            <span className="text-lg font-medium text-rose-200 mt-2">FLR</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6 space-y-4 flex-1 overflow-y-auto">
        
        {/* USD Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
             </div>
             <div>
               <p className="text-sm text-gray-500">Cashed Out (USD)</p>
               <p className="font-bold text-gray-900">${wallet.balanceUSD.toFixed(2)}</p>
             </div>
           </div>
        </div>

        <button 
          onClick={() => setView('EXCHANGE')}
          className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 p-4 rounded-xl flex items-center justify-between group transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 rounded-lg text-white group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Cash Out</p>
              <p className="text-xs text-gray-500">Withdraw FLR to USD</p>
            </div>
          </div>
          <div className="text-rose-400">→</div>
        </button>
        
        <div className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between opacity-70">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-gray-400 rounded-lg text-white">
               <History className="w-5 h-5" />
             </div>
             <div className="text-left">
               <p className="font-bold text-gray-900">History</p>
               <p className="text-xs text-gray-500">View past games</p>
             </div>
           </div>
        </div>

        {/* AI Tip */}
        <div className="mt-6 bg-amber-50 border border-amber-100 p-4 rounded-xl relative">
          <div className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
             <Trophy className="w-3 h-3" />
             <span>Pro Tip</span>
          </div>
          <p className="text-sm text-amber-900 mt-1 italic">"{tip}"</p>
        </div>
        
      </div>

      <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
        Creston Coin Extension v1.1
      </div>
    </div>
  );
};

export default Dashboard;