import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowRight, Key, ExternalLink } from 'lucide-react';
import { connectWallet } from '../services/web3Service';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    const address = await connectWallet();
    setLoading(false);
    if (address) {
      onConnect(address);
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.length > 5) {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onConnect("0xKey" + accessKey.substring(0,4) + "...");
        }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 overflow-y-auto">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
        <Wallet className="w-8 h-8 text-indigo-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
        <p className="text-gray-600 text-sm">
          Connect your wallet to claim and withdraw your Creston Coin rewards.
        </p>
      </div>

      {/* Manual Key Entry */}
      <form onSubmit={handleKeySubmit} className="w-full space-y-3">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter Private Key / Access Code"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
        </div>
        <button
            type="submit"
            disabled={loading || accessKey.length < 5}
            className={`w-full py-3 rounded-xl font-semibold text-sm shadow-sm transition-all
                ${accessKey.length < 5 ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'}
            `}
        >
            {loading ? 'Accessing...' : 'Access via Key'}
        </button>
      </form>

      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or use MetaMask</span>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
      >
        <span>Connect MetaMask</span>
        {!loading && <ArrowRight className="w-4 h-4" />}
      </button>

      {/* Flare Education Link */}
      <div className="bg-blue-50 p-4 rounded-xl w-full text-left mt-4 border border-blue-100">
         <div className="flex items-start justify-between">
            <div>
                <h4 className="font-bold text-blue-900 text-sm">New to Flare Network?</h4>
                <p className="text-blue-700 text-xs mt-1">
                    Learn how to trade FLR and manage your crypto assets securely.
                </p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-500" />
         </div>
         <a 
            href="https://flare.network/learning-resources/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-3 block text-center text-xs font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
         >
            Visit Flare Knowledge Base &rarr;
         </a>
      </div>
      
    </div>
  );
};

export default WalletConnect;