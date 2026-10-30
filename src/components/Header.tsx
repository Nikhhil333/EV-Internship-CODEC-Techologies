/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, MapPin, Navigation, Bookmark, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: 'explore' | 'route' | 'saved';
  onSelectTab: (tab: 'explore' | 'route' | 'saved') => void;
  onOpenInfoModal: () => void;
  savedCount: number;
  isRealOcm?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenInfoModal,
  savedCount,
  isRealOcm,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('explore')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:bg-emerald-700 transition-colors">
            <Zap className="w-5 h-5 fill-white stroke-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              ChargeFinder<span className="text-emerald-600">EV</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('explore')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'explore'
                ? 'text-emerald-600 border-emerald-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Explore Stations</span>
          </button>

          <button
            onClick={() => onSelectTab('route')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'route'
                ? 'text-emerald-600 border-emerald-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Route Planner</span>
          </button>

          <button
            onClick={() => onSelectTab('saved')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'saved'
                ? 'text-emerald-600 border-emerald-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedCount})</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Prototype Notice */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenInfoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200"
            title="Data sources & Open Charge Map details"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Data Info</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                isRealOcm
                  ? 'text-emerald-800 bg-emerald-100 border border-emerald-300'
                  : 'text-amber-800 bg-amber-100 border border-amber-300'
              }`}
            >
              {isRealOcm ? 'OCM Live' : 'Demo Data'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
