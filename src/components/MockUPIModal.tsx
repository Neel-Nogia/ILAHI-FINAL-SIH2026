import React, { useState } from 'react';
import { X, QrCode, ShieldCheck, ArrowRight, CheckCircle2, Lock, Smartphone } from 'lucide-react';

interface MockUPIModalProps {
  amount: number;
  guideName: string;
  destinationName: string;
  onConfirmPayment: (upiId: string) => void;
  onCancel: () => void;
}

export const MockUPIModal: React.FC<MockUPIModalProps> = ({
  amount,
  guideName,
  destinationName,
  onConfirmPayment,
  onCancel
}) => {
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi_id'>('upi_id');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(upiId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              UPI
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                ILAHI Escrow Vault
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Safe Payment Protection System
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            aria-label="Cancel payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Amount Display */}
          <div className="text-center p-4 rounded-2xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Computed Escrow Hold
            </span>
            <div className="font-display text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
              For guided experience at <span className="font-medium text-stone-800 dark:text-stone-200">{destinationName}</span> with <span className="font-medium text-stone-800 dark:text-stone-200">{guideName}</span>
            </p>
          </div>

          {/* Prototype Notice */}
          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>SIH Prototype Sandbox: Simulated UPI authorization. No actual bank charge.</span>
          </div>

          {/* Method Selector */}
          <div className="flex rounded-xl bg-stone-200/70 dark:bg-stone-800 p-1 text-xs font-medium">
            <button
              onClick={() => setPaymentMethod('upi_id')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                paymentMethod === 'upi_id'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI ID</span>
            </button>
            <button
              onClick={() => setPaymentMethod('qr')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
                paymentMethod === 'qr'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          </div>

          {/* UPI ID Input Form */}
          {paymentMethod === 'upi_id' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Enter your Virtual Payment Address (VPA / UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@okbank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 min-h-[44px]"
              />
              <div className="flex gap-2 text-[11px] text-stone-500">
                <span className="cursor-pointer hover:underline" onClick={() => setUpiId('user@okaxis')}>@okaxis</span>
                <span className="cursor-pointer hover:underline" onClick={() => setUpiId('traveler@paytm')}>@paytm</span>
                <span className="cursor-pointer hover:underline" onClick={() => setUpiId('host@ybl')}>@ybl</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="w-40 h-40 bg-stone-100 dark:bg-stone-900 border-2 border-dashed border-amber-600 rounded-xl flex flex-col items-center justify-center p-2">
                <QrCode className="w-24 h-24 text-stone-800 dark:text-stone-200" />
                <span className="text-[10px] font-mono mt-1 text-stone-500">UPI://ILAHI-ESCROW-0026</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">Scan with BHIM, GPay, PhonePe, or Paytm</p>
            </div>
          )}

          {/* Escrow Guarantee Disclaimer */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Escrow Protection Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your ₹{amount.toLocaleString('en-IN')} is locked in escrow status <strong className="text-amber-800 dark:text-amber-300">HELD</strong>. It is only released to the local guide after your confirmed trip completion.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-all min-h-[44px] shadow-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Securing in Escrow...</span>
              </span>
            ) : (
              <>
                <span>Authorize Escrow Hold (₹{amount.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
