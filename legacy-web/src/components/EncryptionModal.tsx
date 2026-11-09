import { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import { triggerHaptic } from '../utils/noteUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  masterPin: string;
  title?: string;
  subtitle?: string;
  theme: ThemeColors;
}

export function EncryptionModal({
  isOpen,
  onClose,
  onUnlockSuccess,
  masterPin,
  title = 'Note Encrypted',
  subtitle = 'Enter your 4-digit Master PIN to unlock this note.',
  theme,
}: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    triggerHaptic(10);
    setError(false);
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic(10);
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === masterPin) {
      triggerHaptic(25);
      setPin('');
      setError(false);
      onUnlockSuccess();
    } else {
      triggerHaptic(40);
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl z-10 border text-center animate-in zoom-in-95 duration-150 ${theme.surface} ${theme.border}`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 ${theme.textSecondary}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className={`font-bold text-lg ${theme.textPrimary}`}>{title}</h3>
        <p className={`text-xs mt-1 mb-4 ${theme.textSecondary}`}>{subtitle}</p>

        {/* PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-red-500 scale-110'
                    : isFilled
                      ? 'bg-sky-400 scale-105'
                      : 'bg-neutral-600/50'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs mb-3 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN. (Default is 1234)</span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className={`h-12 rounded-2xl text-base font-semibold transition-all active:scale-90 hover:bg-white/10 ${theme.surfaceVariant} ${theme.textPrimary}`}
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className={`h-12 rounded-2xl text-base font-semibold transition-all active:scale-90 hover:bg-white/10 ${theme.surfaceVariant} ${theme.textPrimary}`}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className={`h-12 rounded-2xl text-xs font-semibold flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 ${theme.surfaceVariant} ${theme.textSecondary}`}
            title="Delete"
          >
            ⌫
          </button>
        </div>

        <div className="mt-4 text-[11px] text-neutral-400">
          Default test PIN: <span className="font-mono text-sky-400">1234</span>
        </div>
      </div>
    </div>
  );
}
