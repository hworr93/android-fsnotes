import { ThemeMode } from '../types';

export interface ThemeColors {
  appBg: string;
  surface: string;
  surfaceContainer: string;
  surfaceVariant: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  border: string;
  statusBar: string;
  cardActive: string;
  fabBg: string;
  fabText: string;
}

export const THEME_CONFIG: Record<ThemeMode, ThemeColors> = {
  'material-you': {
    appBg: 'bg-[#121316]',
    surface: 'bg-[#1b1b1f]',
    surfaceContainer: 'bg-[#202226]',
    surfaceVariant: 'bg-[#2b2d33]',
    textPrimary: 'text-[#e2e2e6]',
    textSecondary: 'text-[#c4c6cf]',
    textMuted: 'text-[#8e9099]',
    accent: 'text-[#a8c7fa]',
    accentBg: 'bg-[#a8c7fa]',
    border: 'border-[#33353b]',
    statusBar: 'bg-[#121316]',
    cardActive: 'bg-[#282a30]',
    fabBg: 'bg-[#a8c7fa]',
    fabText: 'text-[#042e54]',
  },
  amoled: {
    appBg: 'bg-[#000000]',
    surface: 'bg-[#0d0d0d]',
    surfaceContainer: 'bg-[#141414]',
    surfaceVariant: 'bg-[#1f1f1f]',
    textPrimary: 'text-[#f5f5f5]',
    textSecondary: 'text-[#b0b0b0]',
    textMuted: 'text-[#707070]',
    accent: 'text-[#38bdf8]',
    accentBg: 'bg-[#38bdf8]',
    border: 'border-[#262626]',
    statusBar: 'bg-[#000000]',
    cardActive: 'bg-[#1c1c1c]',
    fabBg: 'bg-[#38bdf8]',
    fabText: 'text-[#082f49]',
  },
  solarized: {
    appBg: 'bg-[#002b36]',
    surface: 'bg-[#073642]',
    surfaceContainer: 'bg-[#094251]',
    surfaceVariant: 'bg-[#0f4d5e]',
    textPrimary: 'text-[#839496]',
    textSecondary: 'text-[#93a1a1]',
    textMuted: 'text-[#586e75]',
    accent: 'text-[#268bd2]',
    accentBg: 'bg-[#268bd2]',
    border: 'border-[#0a4857]',
    statusBar: 'bg-[#002b36]',
    cardActive: 'bg-[#0a4857]',
    fabBg: 'bg-[#2aa198]',
    fabText: 'text-[#002b36]',
  },
  sepia: {
    appBg: 'bg-[#f4ecd8]',
    surface: 'bg-[#ebd5b3]',
    surfaceContainer: 'bg-[#fbf0d9]',
    surfaceVariant: 'bg-[#e5cfac]',
    textPrimary: 'text-[#433422]',
    textSecondary: 'text-[#5c4731]',
    textMuted: 'text-[#8c7355]',
    accent: 'text-[#9f5822]',
    accentBg: 'bg-[#9f5822]',
    border: 'border-[#dfc6a0]',
    statusBar: 'bg-[#f4ecd8]',
    cardActive: 'bg-[#ebd3ae]',
    fabBg: 'bg-[#9f5822]',
    fabText: 'text-[#fff8f0]',
  },
  light: {
    appBg: 'bg-[#f8f9fa]',
    surface: 'bg-[#ffffff]',
    surfaceContainer: 'bg-[#f1f3f5]',
    surfaceVariant: 'bg-[#e9ecef]',
    textPrimary: 'text-[#1a1c1e]',
    textSecondary: 'text-[#444746]',
    textMuted: 'text-[#747775]',
    accent: 'text-[#0b57d0]',
    accentBg: 'bg-[#0b57d0]',
    border: 'border-[#d3d6da]',
    statusBar: 'bg-[#f8f9fa]',
    cardActive: 'bg-[#e7edf8]',
    fabBg: 'bg-[#0b57d0]',
    fabText: 'text-[#ffffff]',
  },
};
