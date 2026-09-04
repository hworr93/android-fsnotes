import { ReactNode } from 'react';
import { ViewDevice } from '../types';
import { ThemeColors } from '../utils/theme';
import { AndroidStatusBar, AndroidNavBar } from './AndroidStatusBar';

interface Props {
  deviceFrame: ViewDevice;
  theme: ThemeColors;
  children: ReactNode;
  onBackGesture?: () => void;
  onHomeGesture?: () => void;
}

export function AndroidFrame({
  deviceFrame,
  theme,
  children,
  onBackGesture,
  onHomeGesture,
}: Props) {
  // If fullscreen, render clean full edge-to-edge
  if (deviceFrame === 'fullscreen') {
    return (
      <div className={`w-screen h-screen flex flex-col overflow-hidden ${theme.appBg}`}>
        <AndroidStatusBar theme={theme} />
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </div>
        <AndroidNavBar onBack={onBackGesture} onHome={onHomeGesture} />
      </div>
    );
  }

  // If tablet mode
  if (deviceFrame === 'tablet') {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-2 sm:p-6 bg-slate-950 overflow-hidden select-none">
        <div
          className={`w-full max-w-6xl h-full max-h-[92vh] rounded-3xl border-4 border-neutral-700/80 shadow-2xl flex flex-col overflow-hidden relative ${theme.appBg}`}
        >
          {/* Subtle Tablet Front Camera Notch */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/50 z-40" />

          <AndroidStatusBar theme={theme} />
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {children}
          </div>
          <AndroidNavBar onBack={onBackGesture} onHome={onHomeGesture} />
        </div>
      </div>
    );
  }

  // Default: Phone Frame (Google Pixel 8/9 aesthetic)
  return (
    <div className="w-screen h-screen flex items-center justify-center p-0 sm:p-4 bg-slate-950 overflow-hidden select-none">
      {/* Phone chassis */}
      <div
        className={`w-full sm:w-[412px] h-full sm:h-[870px] sm:max-h-[96vh] sm:rounded-[44px] sm:border-[8px] sm:border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative ${theme.appBg}`}
      >
        {/* Pixel Punch Hole Camera */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 z-40" />

        {/* Status Bar */}
        <AndroidStatusBar theme={theme} />

        {/* App Main Body */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Navigation Bar / Gesture Bar */}
        <AndroidNavBar onBack={onBackGesture} onHome={onHomeGesture} />
      </div>
    </div>
  );
}
