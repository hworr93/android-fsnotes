import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ArrowLeft,
  Search,
  X,
  ArrowDownUp,
  MoreVertical,
  Check,
  FolderPlus,
  Download,
  Settings as SettingsIcon,
  Smartphone,
  Tablet,
  Maximize2
} from 'lucide-react';
import { SortBy, ViewDevice } from '../types';
import { ThemeColors } from '../utils/theme';

interface Props {
  title: string;
  count: number;
  isEditorOpen: boolean;
  onBackFromEditor: () => void;
  onOpenDrawer: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  deviceFrame: ViewDevice;
  onDeviceFrameChange: (mode: ViewDevice) => void;
  onOpenSettings: () => void;
  onOpenNewFolder: () => void;
  onExportBackup: () => void;
  theme: ThemeColors;
}

export function TopAppBar({
  title,
  count,
  isEditorOpen,
  onBackFromEditor,
  onOpenDrawer,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  deviceFrame,
  onDeviceFrameChange,
  onOpenSettings,
  onOpenNewFolder,
  onExportBackup,
  theme,
}: Props) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const deviceMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false);
      }
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target as Node)) {
        setIsDeviceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      searchInputRef.current?.focus();
    }
  }, [isSearchActive]);

  return (
    <header
      id="android-top-app-bar"
      className={`w-full h-14 px-3 flex items-center justify-between transition-colors duration-200 border-b select-none z-20 shrink-0 ${theme.surface} ${theme.border}`}
    >
      {/* Search Input Bar (Material 3 Search Overlay) */}
      {isSearchActive ? (
        <div className="w-full flex items-center gap-2 px-1">
          <button
            onClick={() => {
              setIsSearchActive(false);
              onSearchChange('');
            }}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textPrimary}`}
            aria-label="Close search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, text, or #tag..."
              className={`w-full h-10 px-3 pr-8 rounded-full text-sm bg-black/20 border ${theme.border} focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${theme.textPrimary}`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Left: Navigation Icon */}
          <div className="flex items-center gap-2">
            {isEditorOpen ? (
              <button
                onClick={onBackFromEditor}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 ${theme.textPrimary}`}
                aria-label="Back to notes list"
                title="Back to notes list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onOpenDrawer}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textPrimary}`}
                aria-label="Open Navigation Drawer"
                title="Open Navigation Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Title & Count */}
            <div className="flex items-center gap-2 truncate">
              <h1 className={`font-semibold text-base md:text-lg tracking-tight truncate ${theme.textPrimary}`}>
                {title}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme.surfaceVariant} ${theme.textSecondary}`}
              >
                {count}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchActive(true)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textSecondary}`}
              title="Search notes"
              aria-label="Search notes"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Sort Menu */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textSecondary}`}
                title="Sort notes"
                aria-label="Sort notes"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>

              {isSortMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1.5 border z-50 animate-in fade-in zoom-in-95 duration-100 ${theme.surfaceContainer} ${theme.border}`}
                >
                  <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    Sort by
                  </div>
                  <button
                    onClick={() => {
                      onSortChange('updated');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <span>Date Modified</span>
                    {sortBy === 'updated' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onSortChange('created');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <span>Date Created</span>
                    {sortBy === 'created' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onSortChange('title');
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center justify-between hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <span>Title (A-Z)</span>
                    {sortBy === 'title' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Device Mode Switcher */}
            <div className="relative" ref={deviceMenuRef}>
              <button
                onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textSecondary}`}
                title="Switch Android Device Preview"
                aria-label="Device View"
              >
                {deviceFrame === 'phone' ? (
                  <Smartphone className="w-5 h-5" />
                ) : deviceFrame === 'tablet' ? (
                  <Tablet className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              {isDeviceMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1.5 border z-50 animate-in fade-in zoom-in-95 duration-100 ${theme.surfaceContainer} ${theme.border}`}
                >
                  <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    Layout View
                  </div>
                  <button
                    onClick={() => {
                      onDeviceFrameChange('phone');
                      setIsDeviceMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>Android Phone</span>
                    {deviceFrame === 'phone' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onDeviceFrameChange('tablet');
                      setIsDeviceMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <Tablet className="w-4 h-4 text-emerald-400" />
                    <span>Android Tablet</span>
                    {deviceFrame === 'tablet' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                  </button>
                  <button
                    onClick={() => {
                      onDeviceFrameChange('fullscreen');
                      setIsDeviceMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <Maximize2 className="w-4 h-4 text-purple-400" />
                    <span>Fullscreen</span>
                    {deviceFrame === 'fullscreen' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Overflow 3-dots Menu */}
            <div className="relative" ref={overflowMenuRef}>
              <button
                onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${theme.textSecondary}`}
                title="More options"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isOverflowOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl py-1.5 border z-50 animate-in fade-in zoom-in-95 duration-100 ${theme.surfaceContainer} ${theme.border}`}
                >
                  <button
                    onClick={() => {
                      onOpenNewFolder();
                      setIsOverflowOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-sm flex items-center gap-2.5 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <FolderPlus className="w-4 h-4 text-sky-400" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportBackup();
                      setIsOverflowOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-sm flex items-center gap-2.5 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export All Notes</span>
                  </button>
                  <div className={`my-1 border-t ${theme.border}`} />
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setIsOverflowOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-sm flex items-center gap-2.5 hover:bg-white/10 text-left ${theme.textPrimary}`}
                  >
                    <SettingsIcon className="w-4 h-4 text-neutral-400" />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
