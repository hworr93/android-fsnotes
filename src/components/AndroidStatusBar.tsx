import { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Edit3 } from 'lucide-react';
import { ThemeColors } from '../utils/theme';

interface Props {
  theme: ThemeColors;
}

export function AndroidStatusBar({ theme }: Props) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-status-bar"
      className={`w-full h-8 px-5 flex items-center justify-between text-xs select-none transition-colors duration-200 z-30 ${theme.statusBar} ${theme.textSecondary}`}
    >
      <div className="flex items-center gap-2 font-medium tracking-tight">
        <span>{timeStr || '12:00'}</span>
        <div className="flex items-center gap-1 opacity-75">
          <Edit3 className="w-3 h-3 text-sky-400" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-wider opacity-80">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium">94%</span>
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export function AndroidNavBar({ onBack, onHome }: { onBack?: () => void; onHome?: () => void }) {
  return (
    <div
      id="android-nav-bar"
      className="w-full h-6 flex items-center justify-center select-none shrink-0"
    >
      {/* Material 3 Gesture Navigation Pill */}
      <button
        onClick={() => {
          if (onBack) onBack();
          else if (onHome) onHome();
        }}
        className="w-32 h-1 bg-neutral-400/40 hover:bg-neutral-300/80 rounded-full transition-all duration-150 cursor-pointer"
        title="Android gesture bar (tap to navigate back)"
        aria-label="Navigation Gesture Bar"
      />
    </div>
  );
}
