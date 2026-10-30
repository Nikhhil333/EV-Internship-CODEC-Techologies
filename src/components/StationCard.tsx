/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Zap,
  Navigation,
  Bookmark,
  Star,
  CircleDot,
  ChevronRight,
} from 'lucide-react';
import { Station } from '../types/ev';
import { StationService } from '../services/mapService';

interface StationCardProps {
  station: Station;
  isSelected: boolean;
  isBookmarked: boolean;
  onSelect: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onOpenDetails: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  onOpenDetails,
}) => {
  const isAvailable = station.status === 'Available' && station.availablePlugsCount > 0;
  const isOccupied = station.status === 'Occupied' || station.availablePlugsCount === 0;

  // Extract unique connector types (CCS2, Type 2, GB/T, etc.)
  const uniqueConnectors = Array.from(new Set(station.connectors.map((c) => c.type)));

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = StationService.getDirectionsUrl(station);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-2xl transition-all cursor-pointer border ${
        isSelected
          ? 'bg-emerald-50/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Row: Network & Rating & Bookmark */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="font-semibold text-slate-800">{station.network}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
            <span className="font-semibold tabular-nums">{station.rating}</span>
            <span className="text-slate-400">({station.reviewCount})</span>
          </span>
          <span aria-hidden="true">·</span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
              station.isRealOcmData
                ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}
          >
            {station.isRealOcmData ? 'OCM Verified' : 'Simulated'}
          </span>
        </div>

        <button
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark station'}
          className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors ${
            isBookmarked
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Main Title & Address */}
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
        {station.name}
      </h3>
      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
        {station.address}, {station.area}, {station.city}
      </p>

      {/* Key EV Specs Bar: Clean Unboxed Metadata in km & kW */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 my-3 pt-2.5 border-t border-slate-100">
        <span className="flex items-center gap-1 font-semibold text-slate-900">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="tabular-nums">{station.maxPowerKw} kW</span>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="tabular-nums font-medium text-slate-700">
          {station.distanceKm} km away
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="font-mono text-slate-700 truncate max-w-[180px]">
          {uniqueConnectors.join(', ')}
        </span>
      </div>

      {/* Bottom Status & Price & Quick Actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Availability Status */}
        <div className="flex items-center gap-1.5">
          <CircleDot
            className={`w-3.5 h-3.5 ${
              isAvailable
                ? 'text-emerald-600'
                : isOccupied
                ? 'text-amber-500'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`font-semibold ${
              isAvailable
                ? 'text-emerald-700'
                : isOccupied
                ? 'text-amber-700'
                : 'text-slate-600'
            }`}
          >
            {isAvailable ? 'Operational' : isOccupied ? 'Occupied' : 'Unknown'}
          </span>
          <span className="text-slate-400 tabular-nums text-[11px]">
            {station.isRealOcmData
              ? `(${station.connectors.length} ${station.connectors.length === 1 ? 'stall' : 'stalls'} · OCM)`
              : `(${station.availablePlugsCount}/${station.totalPlugsCount} free · sim)`}
          </span>
        </div>

        {/* Pricing in ₹ or OCM status */}
        <span className="font-medium text-slate-700 text-[11px] truncate max-w-[150px]">
          <span className="text-slate-400">Tariff: </span>
          {station.pricingSummary.includes('unlisted') ? 'Unlisted' : station.pricingSummary.split('(')[0]}
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <span>View Specs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDirections}
          className="min-h-[40px] px-3.5 py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Open in Maps"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>
      </div>
    </div>
  );
};
