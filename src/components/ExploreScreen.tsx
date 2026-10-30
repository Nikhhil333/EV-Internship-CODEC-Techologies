/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Zap,
  RotateCcw,
  Map as MapIcon,
  List as ListIcon,
  ShieldCheck,
  LocateFixed,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Database,
} from 'lucide-react';
import { Station, FilterState, ConnectorType, Coordinates, RoutePlan } from '../types/ev';
import { StationCard } from './StationCard';
import { InteractiveMap } from './InteractiveMap';
import { StationService } from '../services/mapService';

interface ExploreScreenProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onOpenDetails: (station: Station) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (stationId: string) => void;
  activeRoute?: RoutePlan | null;
  onClearRoute?: () => void;
  isLoading?: boolean;
  dataSource?: 'Open Charge Map API' | 'Demonstration Prototype' | 'Fallback';
  hasApiKey?: boolean;
  apiMessage?: string | null;
  onRefreshStations?: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  connectorTypes: [],
  minPowerKw: null,
  availabilityOnly: false,
  network: 'all',
  freeOnly: false,
  sortBy: 'distance',
};

const AREA_PRESETS = [
  'All Areas',
  'Patia',
  'Jayadev Vihar',
  'Saheed Nagar',
  'Khandagiri',
  'Chandrasekharpur',
  'Nayapalli',
  'Rasulgarh',
];

const CONNECTOR_OPTIONS: { type: ConnectorType; label: string }[] = [
  { type: 'CCS2', label: 'CCS2 (DC Fast)' },
  { type: 'Type 2', label: 'Type 2 (AC)' },
  { type: 'GB/T', label: 'GB/T' },
  { type: 'Bharat DC-001', label: 'Bharat DC-001' },
  { type: '15A Socket', label: '15A Socket' },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenDetails,
  bookmarkedIds,
  onToggleBookmark,
  activeRoute,
  onClearRoute,
  isLoading = false,
  dataSource = 'Demonstration Prototype',
  hasApiKey = false,
  apiMessage,
  onRefreshStations,
}) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [mobileView, setMobileView] = useState<'split' | 'map' | 'list'>('split');
  const [isLocating, setIsLocating] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);

  // Dynamic locality areas extracted from both real OCM stations and default Bhubaneswar areas
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    stations.forEach((s) => {
      if (s.area && s.area.trim()) areas.add(s.area.trim());
    });
    AREA_PRESETS.slice(1).forEach((a) => areas.add(a));
    return ['All Areas', ...Array.from(areas).slice(0, 10)];
  }, [stations]);
  const [locationFeedback, setLocationFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Compute stations with dynamic user distance if GPS coordinates are available
  const computedStations = useMemo(() => {
    if (!userCoordinates) return stations;
    return stations.map((s) => ({
      ...s,
      distanceKm: StationService.calculateDistanceKm(
        userCoordinates.lat,
        userCoordinates.lng,
        s.coordinates.lat,
        s.coordinates.lng
      ),
    }));
  }, [stations, userCoordinates]);

  // Filtered and sorted stations
  const filteredStations = useMemo(() => {
    return StationService.filterStations(computedStations, filters);
  }, [computedStations, filters]);

  // Synchronize selected station with filtered results so map and list stay aligned
  React.useEffect(() => {
    if (filteredStations.length > 0) {
      if (!selectedStation || !filteredStations.some((s) => s.id === selectedStation.id)) {
        onSelectStation(filteredStations[0]);
      }
    }
  }, [filteredStations, selectedStation, onSelectStation]);

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.connectorTypes.length > 0) count += filters.connectorTypes.length;
    if (filters.minPowerKw !== null) count++;
    if (filters.availabilityOnly) count++;
    if (filters.network !== 'all') count++;
    if (filters.freeOnly) count++;
    return count;
  }, [filters]);

  const toggleConnectorType = (type: ConnectorType) => {
    setFilters((prev) => {
      const exists = prev.connectorTypes.includes(type);
      return {
        ...prev,
        connectorTypes: exists
          ? prev.connectorTypes.filter((t) => t !== type)
          : [...prev.connectorTypes, type],
      };
    });
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Real Browser Geolocation ("Near Me")
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationFeedback({
        type: 'error',
        message: 'Browser geolocation is not supported on this device.',
      });
      return;
    }

    setIsLocating(true);
    setLocationFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoordinates(coords);
        setIsLocating(false);
        setLocationFeedback({
          type: 'success',
          message: `Location detected (${coords.lat.toFixed(3)}° N, ${coords.lng.toFixed(3)}° E). Distances updated!`,
        });
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to access your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Defaulting to Central Bhubaneswar.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocationFeedback({
          type: 'info',
          message: msg,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-8 flex flex-col gap-4">
      {/* Dynamic Data Source Status Banner */}
      {isLoading ? (
        <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <span>
              <strong>Connecting to Open Charge Map API:</strong> Querying real EV charging station records around Bhubaneswar, Odisha...
            </span>
          </div>
          <span className="font-mono text-[11px] text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded font-medium">
            Loading POIs
          </span>
        </div>
      ) : dataSource === 'Open Charge Map API' || stations.some((s) => s.isRealOcmData) ? (
        <div className="bg-emerald-50/95 border border-emerald-200/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span>
                <strong>Open Charge Map API Active:</strong> Loaded {stations.length} real EV charging stations around Bhubaneswar, Odisha.
              </span>{' '}
              <span className="text-emerald-800 text-[11px] block sm:inline">
                Locations & connectors verified via Open Charge Map registry. Dynamic socket occupancy is unverified (requires direct CPO telemetry).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onRefreshStations && (
              <button
                onClick={onRefreshStations}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300/60"
                title="Refresh latest Open Charge Map data"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh API</span>
              </button>
            )}
            <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded font-bold">
              Live OCM Data
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/95 border border-amber-200/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span>
                <strong>Open Charge Map API Key Not Configured:</strong> Add the secret <code>OPENCHARGEMAP_API_KEY</code> in Google AI Studio Secrets to retrieve real EV stations around Bhubaneswar.
              </span>{' '}
              <span className="text-amber-800 text-[11px] block sm:inline">
                Currently displaying demonstration stations.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onRefreshStations && (
              <button
                onClick={onRefreshStations}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300/80"
                title="Check if OPENCHARGEMAP_API_KEY has been added"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Check API</span>
              </button>
            )}
            <span className="font-mono text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-medium">
              Demo Fallback Active
            </span>
          </div>
        </div>
      )}

      {/* Geolocation Feedback Toast / Notice */}
      {locationFeedback && (
        <div
          className={`rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs border animate-in fade-in duration-150 ${
            locationFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : locationFeedback.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {locationFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{locationFeedback.message}</span>
          </div>
          <button
            onClick={() => setLocationFeedback(null)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search station, area (Patia, Jayadev Vihar, Khandagiri), or network..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Locate & Filter Toggle Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLocateUser}
              disabled={isLocating}
              className={`min-h-[42px] px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                userCoordinates
                  ? 'bg-blue-50 border-blue-400 text-blue-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Request Browser Geolocation"
            >
              <LocateFixed className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Near Me</span>
            </button>

            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                activeFiltersCount > 0
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Mobile View Switcher (Map vs List) */}
            <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setMobileView('list')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mobileView === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mobileView === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Area Presets Carousel for Bhubaneswar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          <span className="text-slate-400 font-medium text-[11px] shrink-0 mr-1">Locality:</span>
          {availableAreas.map((area) => {
            const isSelected =
              area === 'All Areas' ? !filters.searchQuery : filters.searchQuery === area;
            return (
              <button
                key={area}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    searchQuery: area === 'All Areas' ? '' : area,
                  }))
                }
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors text-xs ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>

        {/* Expandable Filter Drawer */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-150">
            {/* Filter Section: Connector Types for India */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                EV Connector Plugs (Indian Standards)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CONNECTOR_OPTIONS.map(({ type, label }) => {
                  const isActive = filters.connectorTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleConnectorType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Charging Speed & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Charging Power (kW)
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'Any', value: null },
                    { label: '25+ kW', value: 25 },
                    { label: '60+ kW', value: 60 },
                    { label: '120+ kW', value: 120 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, minPowerKw: p.value }))
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                        filters.minPowerKw === p.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Availability & Access
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        availabilityOnly: !prev.availabilityOnly,
                      }))
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      filters.availabilityOnly
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Available Plugs Only
                  </button>

                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        freeOnly: !prev.freeOnly,
                      }))
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      filters.freeOnly
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Free Charging
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Sort By
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as FilterState['sortBy'],
                    }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="distance">Distance (Closest in km)</option>
                  <option value="power">Charging Speed (Highest kW)</option>
                  <option value="availability">Availability (Most stalls free)</option>
                  <option value="price">Price (Lowest ₹/kWh)</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: Split View for Desktop, Responsive for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Station Cards List */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            mobileView === 'map' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Header count info */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-800">
              {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stations'} in Bhubaneswar
            </span>
            <span>Sorted by {filters.sortBy}</span>
          </div>

          {/* Empty State */}
          {filteredStations.length === 0 && (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Stations Match Filters</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try widening your power requirement in kW, checking other localities in Bhubaneswar (e.g., Patia, Jayadev Vihar, Khandagiri), or clearing connector filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Station Cards */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStation?.id === station.id}
                isBookmarked={bookmarkedIds.includes(station.id)}
                onSelect={() => onSelectStation(station)}
                onToggleBookmark={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(station.id);
                }}
                onOpenDetails={() => onOpenDetails(station)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Real Interactive Google Map */}
        <div
          className={`lg:col-span-7 sticky top-20 ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          {activeRoute && (
            <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <span className="font-semibold truncate">
                Active Route: {activeRoute.title} ({activeRoute.totalDistanceKm} km)
              </span>
              {onClearRoute && (
                <button
                  onClick={onClearRoute}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 ml-2"
                >
                  Clear Route
                </button>
              )}
            </div>
          )}

          <InteractiveMap
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={(station) => {
              onSelectStation(station);
            }}
            onOpenDetails={onOpenDetails}
            activeRoute={activeRoute}
            userCoordinates={userCoordinates}
            onLocateUser={handleLocateUser}
            isLocating={isLocating}
          />
        </div>
      </div>
    </div>
  );
};
