import React, { useState } from 'react';
import { ArrowDown, DollarSign, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { FLR_USD_RATE } from '../constants';

interface ExchangeProps {
  balance: number;
  onExchange: (amount: number, usdValue: number) => void;
  onBack: () => void;
}

const Exchange: React.FC<ExchangeProps> = ({ balance, onExchange, onBack }) => {
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  const numAmount = parseFloat(amount || '0');
  const usdReceive = numAmount * FLR_USD_RATE;
  const canExchange = numAmount > 0 && numAmount <= balance;

  const handleSwap = () => {
    if (!canExchange) return;
    setStatus('PROCESSING');
    setTimeout(() => {
      onExchange(numAmount, usdReceive);
      setStatus('SUCCESS');
    }, 2000);
  };

  if (status === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Withdrawal Complete!</h3>
        <p className="text-gray-600">
          You successfully cashed out <span className="font-bold text-rose-600">{numAmount} FLR</span> for <span className="font-bold text-green-600">${usdReceive.toFixed(2)} USD</span>.
        </p>
        <button 
          onClick={onBack}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold shadow hover:bg-black transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mr-2">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">Cash Out FLR</h2>
      </div>

      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-rose-800">Available FLR</span>
          <span className="text-sm font-bold text-rose-900">{balance.toFixed(1)} FLR</span>
        </div>
        <p className="text-xs text-rose-600">
          Withdraw your Flare tokens to your connected bank account or external wallet.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {/* From Input */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Withdraw Amount</label>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-3xl font-bold text-gray-900 w-1/2 outline-none placeholder-gray-300"
            />
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold">F</div>
              <span className="font-bold text-gray-700">FLR</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-gray-100 p-2 rounded-full border border-white shadow-sm">
            <ArrowDown className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* To Input (Read Only) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">You Receive (USD)</label>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-gray-900">
              ${usdReceive > 0 ? usdReceive.toFixed(2) : '0.00'}
            </span>
            <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</div>
              <span className="font-bold text-gray-700">USD</span>
            </div>
          </div>
        </div>
      </div>
      
      {!canExchange && numAmount > balance && (
        <div className="flex items-center space-x-2 text-red-500 text-sm mt-4 mb-2">
           <AlertCircle className="w-4 h-4" />
           <span>Insufficient balance.</span>
        </div>
      )}

      <button
        disabled={!canExchange || status === 'PROCESSING'}
        onClick={handleSwap}
        className={`
          w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 mt-4
          ${!canExchange || status === 'PROCESSING' 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95 transition-all'}
        `}
      >
        {status === 'PROCESSING' ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <DollarSign className="w-5 h-5" />
            <span>Withdraw Funds</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center">
        <a 
            href="https://flare.network/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors"
        >
            <span>Learn about trading on Flare Network</span>
            <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default Exchange;