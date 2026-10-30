/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bookmark, MapPin, Zap, Trash2, ChevronRight, Navigation } from 'lucide-react';
import { Station } from '../types/ev';
import { StationService } from '../services/mapService';

interface SavedStationsScreenProps {
  savedStations: Station[];
  onSelectStation: (station: Station) => void;
  onRemoveBookmark: (stationId: string) => void;
  onExploreStations: () => void;
}

export const SavedStationsScreen: React.FC<SavedStationsScreenProps> = ({
  savedStations,
  onSelectStation,
  onRemoveBookmark,
  onExploreStations,
}) => {
  if (savedStations.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Saved Stations Yet</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Bookmark charging hubs across Bhubaneswar and Odisha that you frequently visit or plan to stop at during your journeys.
        </p>
        <button
          onClick={onExploreStations}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
        >
          <MapPin className="w-4 h-4" />
          <span>Explore Stations in Bhubaneswar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Charging Hubs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {savedStations.length} {savedStations.length === 1 ? 'station' : 'stations'} bookmarked for quick navigation in Bhubaneswar
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {savedStations.map((station) => (
          <div
            key={station.id}
            onClick={() => onSelectStation(station)}
            className="p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-800">{station.network}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{station.distanceKm} km away</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">{station.status}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[10px] text-amber-700 font-medium">Demo Data</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {station.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {station.address}, {station.area}, {station.city}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  {station.maxPowerKw} kW Max
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="tabular-nums">{station.availablePlugsCount}/{station.totalPlugsCount} stalls free</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = StationService.getDirectionsUrl(station);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors"
                title="Directions"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(station.id);
                }}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Remove Bookmark"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
