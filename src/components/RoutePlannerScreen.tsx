/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  ArrowRightLeft,
  Zap,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import { RoutePlan } from '../types/ev';
import { StationService } from '../services/mapService';
import { MOCK_ROUTES } from '../data/mockStations';

interface RoutePlannerScreenProps {
  onSelectStationToView: (stationName: string) => void;
  onOpenInfoModal: () => void;
  onViewRouteOnMap?: (plan: RoutePlan) => void;
}

export const RoutePlannerScreen: React.FC<RoutePlannerScreenProps> = ({
  onSelectStationToView,
  onOpenInfoModal,
  onViewRouteOnMap,
}) => {
  const [origin, setOrigin] = useState('Bhubaneswar (Jayadev Vihar)');
  const [destination] = useState('Puri (Golden Beach & Jagannath Temple)');
  const [originInput, setOriginInput] = useState(origin);
  const [destInput, setDestInput] = useState(destination);
  const [startSoc, setStartSoc] = useState(85);
  const [targetArrivalSoc, setTargetArrivalSoc] = useState(25);
  const [activePlan, setActivePlan] = useState<RoutePlan>(MOCK_ROUTES[0]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destInput);
    setDestInput(temp);
  };

  const handleCalculateRoute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) return;

    setIsCalculating(true);
    setTimeout(() => {
      const plan = StationService.calculateRoute(originInput, destInput, startSoc);
      setActivePlan(plan);
      setIsCalculating(false);
    }, 400);
  };

  const applyPreset = (preset: RoutePlan) => {
    setOriginInput(preset.origin);
    setDestInput(preset.destination);
    setActivePlan(preset);
  };

  const formatHoursMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins} mins`;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            EV Route Planner (Odisha & Eastern India)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Plan electric road trips across Odisha with simulated fast-charging stops and battery consumption in km.
          </p>
        </div>

        {/* Google Routes API Ready Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenInfoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Google Routes API Architecture</span>
          </button>
        </div>
      </div>

      {/* Popular Odisha Presets Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Popular Trips:</span>
        {MOCK_ROUTES.map((route) => (
          <button
            key={route.id}
            onClick={() => applyPreset(route)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-colors border ${
              activePlan.id === route.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            {route.origin.split('(')[0]} → {route.destination.split('(')[0]}
          </button>
        ))}
      </div>

      {/* Grid: Inputs & Trip Configuration on Left, Route Itinerary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Battery Config */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCalculateRoute}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Trip Parameters (Distance in km)</span>
            </h2>

            {/* Origin & Destination Inputs */}
            <div className="space-y-3 relative">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Origin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    placeholder="Enter city or departure address"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <input
                    type="text"
                    value={destInput}
                    onChange={(e) => setDestInput(e.target.value)}
                    placeholder="Enter destination (e.g. Puri, Konark, Cuttack)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Battery Level Sliders */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Departure Battery SoC</span>
                <span className="font-bold text-emerald-700 tabular-nums">{startSoc}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={startSoc}
                onChange={(e) => setStartSoc(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Min. Arrival Buffer</span>
                <span className="font-bold text-slate-800 tabular-nums">{targetArrivalSoc}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={targetArrivalSoc}
                onChange={(e) => setTargetArrivalSoc(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Optimal Charging Stops...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white stroke-none" />
                  <span>Calculate EV Route (in km)</span>
                </>
              )}
            </button>
          </form>

          {/* Demonstration Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Demonstration Route Data</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Distances in kilometres, charging costs in ₹, and battery consumption rates are simulated demonstration calculations. Ready for live Google Routes API integration.
            </p>
          </div>
        </div>

        {/* Right Column: Route Summary & Charging Stops */}
        <div className="lg:col-span-7 space-y-4">
          {/* Trip Summary KPI Cards */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Calculated Journey
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activePlan.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {activePlan.stops.length} Charging {activePlan.stops.length === 1 ? 'Stop' : 'Stops'}
                </span>
                {onViewRouteOnMap && (
                  <button
                    onClick={() => onViewRouteOnMap(activePlan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on Map</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4-Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Distance</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {activePlan.totalDistanceKm} <span className="text-xs font-normal text-slate-500">km</span>
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Drive Time</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatHoursMinutes(activePlan.estimatedDriveTimeMin)}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Charging Time</span>
                <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                  {activePlan.estimatedChargeTimeMin} <span className="text-xs font-normal text-slate-500">mins</span>
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Est. Energy</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  ₹{activePlan.estimatedTotalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {activePlan.elevationNotes && (
              <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                Corridor notes: {activePlan.elevationNotes}
              </p>
            )}
          </div>

          {/* Recommended Charging Stops Itinerary */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Recommended Charging Stops (CCS2 / Type 2)</span>
              <span className="text-xs font-normal text-slate-500">
                Optimized for Indian Highway Corridors
              </span>
            </h3>

            {/* Departure Point */}
            <div className="flex items-start gap-3.5 pb-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div className="w-0.5 h-10 bg-slate-200 mt-1" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Departure: {activePlan.origin}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                    {activePlan.startSocPercent}% Battery
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Begin route with preconditioned battery pack.
                </p>
              </div>
            </div>

            {/* Stop List */}
            {activePlan.stops.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-600">
                Direct EV drive possible. No intermediate charging stop required for this {activePlan.totalDistanceKm} km journey.
              </div>
            ) : (
              activePlan.stops.map((stop, index) => (
                <div key={stop.stationId} className="flex items-start gap-3.5 pb-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {index + 1}
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200 mt-1" />
                  </div>

                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {stop.stationName}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">
                        Charge for {stop.chargeTimeMinutes} mins
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 my-1.5">
                      <span className="font-semibold text-slate-800">{stop.network}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="tabular-nums">{stop.distanceFromStartKm} km into trip</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-bold text-emerald-600 tabular-nums">{stop.powerKw} kW {stop.connectorType}</span>
                    </div>

                    {/* Battery transition indicator */}
                    <div className="flex items-center gap-2 text-xs my-2">
                      <span className="text-slate-500">Arrive at:</span>
                      <span className="font-bold text-amber-700 tabular-nums">{stop.arrivalSocPercent}%</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-500">Charge to:</span>
                      <span className="font-bold text-emerald-700 tabular-nums">{stop.targetSocPercent}%</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">Est. ₹{stop.estimatedCost.toFixed(2)}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      {stop.notes}
                    </p>

                    {/* Amenities nearby */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600">
                      <span className="text-slate-400 font-medium">Amenities:</span>
                      <span>{stop.amenities.join(' · ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Destination Arrival */}
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                B
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Arrival: {activePlan.destination}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                    Est. {activePlan.arrivalSocPercent}% Battery Remaining
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Safe buffer preserved for local city travel and destination charging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
