/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Navigation, Bookmark, Zap } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'explore' | 'route' | 'saved';
  onSelectTab: (tab: 'explore' | 'route' | 'saved') => void;
  savedCount: number;
  onOpenSimulator: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  onOpenSimulator,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 pb-safe">
      <div className="grid grid-cols-4 items-center h-16">
        <button
          onClick={() => onSelectTab('explore')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'explore' ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[11px] tracking-tight mt-1">Explore</span>
        </button>

        <button
          onClick={() => onSelectTab('route')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'route' ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[11px] tracking-tight mt-1">Routes</span>
        </button>

        <button
          onClick={() => onSelectTab('saved')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors ${
            activeTab === 'saved' ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">Saved</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 stroke-none" />
          </div>
          <span className="text-[11px] tracking-tight mt-1">Simulator</span>
        </button>
      </div>
    </nav>
  );
};
