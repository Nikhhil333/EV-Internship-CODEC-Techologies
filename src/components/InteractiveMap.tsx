/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Polyline,
  useMap,
  useApiIsLoaded,
} from '@vis.gl/react-google-maps';
import {
  Zap,
  Navigation,
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  LocateFixed,
  Route,
} from 'lucide-react';
import { Station, RoutePlan, Coordinates } from '../types/ev';
import { StationService } from '../services/mapService';

interface InteractiveMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onOpenDetails?: (station: Station) => void;
  activeRoute?: RoutePlan | null;
  userCoordinates?: Coordinates | null;
  onLocateUser?: () => void;
  isLocating?: boolean;
}

const BHUBANESWAR_CENTER = { lat: 20.2961, lng: 85.8245 };

/**
 * Controller component that accesses the google.maps.Map instance
 * to smoothly control camera panning, zoom, and bounds fit.
 */
function MapCameraController({
  stations,
  selectedStation,
  userCoordinates,
  activeRoute,
}: {
  stations: Station[];
  selectedStation: Station | null;
  userCoordinates?: Coordinates | null;
  activeRoute?: RoutePlan | null;
}) {
  const map = useMap();

  // Adjust camera bounds to fit filtered stations whenever search/locality filters change
  useEffect(() => {
    if (!map || stations.length === 0 || activeRoute) return;
    try {
      if (stations.length === 1) {
        map.panTo({
          lat: stations[0].coordinates.lat,
          lng: stations[0].coordinates.lng,
        });
        map.setZoom(15);
      } else {
        const bounds = new google.maps.LatLngBounds();
        stations.forEach((s) => {
          bounds.extend({ lat: s.coordinates.lat, lng: s.coordinates.lng });
        });
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    } catch (e) {
      console.warn('Could not fit station bounds:', e);
    }
  }, [map, stations, activeRoute]);

  // Pan to selected station when clicked from list or search
  useEffect(() => {
    if (!map || !selectedStation) return;
    map.panTo({
      lat: selectedStation.coordinates.lat,
      lng: selectedStation.coordinates.lng,
    });
    const currentZoom = map.getZoom() || 13;
    if (currentZoom < 14) {
      map.setZoom(15);
    }
  }, [map, selectedStation]);

  // Pan to user location when GPS geolocation triggers
  useEffect(() => {
    if (!map || !userCoordinates) return;
    map.panTo({
      lat: userCoordinates.lat,
      lng: userCoordinates.lng,
    });
    map.setZoom(14);
  }, [map, userCoordinates]);

  // Fit bounds to active route path if in Route Planner mode
  useEffect(() => {
    if (!map || !activeRoute) return;
    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({
        lat: activeRoute.originCoords.lat,
        lng: activeRoute.originCoords.lng,
      });
      bounds.extend({
        lat: activeRoute.destCoords.lat,
        lng: activeRoute.destCoords.lng,
      });
      activeRoute.stops.forEach((stop) => {
        bounds.extend({
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng,
        });
      });
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    } catch (e) {
      console.warn('Could not fit route bounds:', e);
    }
  }, [map, activeRoute]);

  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenDetails,
  activeRoute,
  userCoordinates,
  onLocateUser,
  isLocating,
}) => {
  const apiIsLoaded = useApiIsLoaded();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId | 'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Synchronize InfoWindow with selected station
  useEffect(() => {
    if (selectedStation) {
      setOpenInfoWindowId(selectedStation.id);
    }
  }, [selectedStation]);

  // Build route polyline path points
  const routePolylinePath = useMemo(() => {
    if (!activeRoute) return [];
    const points: Coordinates[] = [
      activeRoute.originCoords,
      ...activeRoute.stops.map((s) => s.coordinates),
      activeRoute.destCoords,
    ];
    return points;
  }, [activeRoute]);

  const activeInfoWindowStation = useMemo(() => {
    return stations.find((s) => s.id === openInfoWindowId) || null;
  }, [stations, openInfoWindowId]);

  return (
    <div className="relative w-full h-[520px] md:h-[640px] bg-slate-100 overflow-hidden border border-slate-200 rounded-2xl shadow-xs">
      {/* Real Google Map Component */}
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={BHUBANESWAR_CENTER}
        defaultZoom={13}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeId={mapTypeId}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <MapCameraController
          stations={stations}
          selectedStation={selectedStation}
          userCoordinates={userCoordinates}
          activeRoute={activeRoute}
        />

        {/* EV Station Markers */}
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isAvailable = station.status === 'Available' && station.availablePlugsCount > 0;
          const isOccupied = station.status === 'Occupied' || station.availablePlugsCount === 0;

          return (
            <AdvancedMarker
              key={station.id}
              position={{
                lat: station.coordinates.lat,
                lng: station.coordinates.lng,
              }}
              onClick={() => {
                onSelectStation(station);
                setOpenInfoWindowId(station.id);
              }}
              zIndex={isSelected ? 1000 : 30}
              title={`${station.name} (${station.maxPowerKw} kW)`}
            >
              <div
                className={`group flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                  isSelected ? 'scale-125 z-50' : 'hover:scale-105'
                }`}
              >
                {/* Marker Pill with Network Color and Power */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'ring-4 ring-emerald-500/90 ring-offset-2 bg-slate-900 text-white border-slate-900 shadow-xl'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAvailable
                        ? 'bg-emerald-500 shadow-xs'
                        : isOccupied
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-emerald-400 fill-emerald-400' : 'text-emerald-600'
                    }`}
                  />
                  <span className="tabular-nums font-bold">{station.maxPowerKw} kW</span>
                </div>

                {/* Needle point */}
                <div
                  className={`w-2.5 h-2.5 rotate-45 -mt-1.5 border-r border-b ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900'
                      : 'bg-white border-slate-300'
                  }`}
                />

                {/* Quick Availability Sub-label */}
                <span className="text-[10px] font-medium text-slate-700 bg-white/95 px-1.5 py-0.5 rounded shadow-xs mt-0.5 whitespace-nowrap border border-slate-200/80">
                  {station.availablePlugsCount}/{station.totalPlugsCount} free
                </span>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Selected Station Popover / InfoWindow */}
        {activeInfoWindowStation && (
          <InfoWindow
            position={{
              lat: activeInfoWindowStation.coordinates.lat,
              lng: activeInfoWindowStation.coordinates.lng,
            }}
            onCloseClick={() => setOpenInfoWindowId(null)}
            pixelOffset={[0, -42]}
          >
            <div className="p-1 max-w-[270px] text-slate-800 font-sans">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  {activeInfoWindowStation.network}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    activeInfoWindowStation.isRealOcmData
                      ? 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                      : 'text-amber-800 bg-amber-100 border border-amber-200'
                  }`}
                >
                  {activeInfoWindowStation.isRealOcmData ? 'OCM Verified' : 'Simulated Data'}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 leading-tight mb-0.5">
                {activeInfoWindowStation.name}
              </h4>

              <p className="text-[11px] text-slate-500 leading-snug mb-2">
                {activeInfoWindowStation.address}, {activeInfoWindowStation.area}
              </p>

              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-[11px] space-y-1.5 mb-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Max Speed:</span>
                  <span className="font-bold text-emerald-700">
                    {activeInfoWindowStation.maxPowerKw} kW Fast
                  </span>
                </div>
                <div className="flex items-start justify-between gap-1">
                  <span className="text-slate-500 shrink-0">Plugs:</span>
                  <span className="font-semibold text-slate-800 text-right font-mono text-[10px]">
                    {Array.from(new Set(activeInfoWindowStation.connectors.map((c) => c.type))).join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Availability:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeInfoWindowStation.status === 'Available'
                          ? 'bg-emerald-500'
                          : activeInfoWindowStation.status === 'Occupied'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {activeInfoWindowStation.status === 'Available'
                      ? `${activeInfoWindowStation.availablePlugsCount}/${activeInfoWindowStation.totalPlugsCount} Stalls Operational`
                      : 'Status Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tariff:</span>
                  <span className="font-semibold text-slate-800 text-right text-[10px] max-w-[150px] truncate">
                    {activeInfoWindowStation.pricingSummary.split('(')[0]}
                  </span>
                </div>
                <div
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    activeInfoWindowStation.isRealOcmData
                      ? 'text-emerald-900 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800/80 bg-amber-50/80 border-amber-200/50'
                  }`}
                >
                  {activeInfoWindowStation.isRealOcmData
                    ? `OCM POI #${activeInfoWindowStation.ocmId || ''} · Verified Open Charge Map Registry`
                    : 'Unverified live CPO telemetry · Demonstration only'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onSelectStation(activeInfoWindowStation);
                    if (onOpenDetails) {
                      onOpenDetails(activeInfoWindowStation);
                    }
                  }}
                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg text-center transition-colors shadow-2xs"
                >
                  View Full Specs
                </button>
                <button
                  onClick={() => {
                    const url = StationService.getDirectionsUrl(activeInfoWindowStation);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* User Geolocation Marker (Near Me) */}
        {userCoordinates && (
          <AdvancedMarker
            position={{ lat: userCoordinates.lat, lng: userCoordinates.lng }}
            zIndex={250}
            title="Your Current Location (Near Me)"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/25 animate-ping absolute" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Route Polyline when Route Planner is Active */}
        {routePolylinePath.length > 1 && (
          <>
            <Polyline
              path={routePolylinePath}
              strokeColor="#059669"
              strokeWeight={6}
              strokeOpacity={0.9}
            />

            {/* Departure Marker (A) */}
            <AdvancedMarker
              position={activeRoute!.originCoords}
              zIndex={90}
              title={`Departure: ${activeRoute!.origin}`}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white">
                A
              </div>
            </AdvancedMarker>

            {/* Destination Marker (B) */}
            <AdvancedMarker
              position={activeRoute!.destCoords}
              zIndex={90}
              title={`Destination: ${activeRoute!.destination}`}
            >
              <div className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white">
                B
              </div>
            </AdvancedMarker>
          </>
        )}
      </Map>

      {/* Floating Overlay Controls on Top Left: Location & Active Mode */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-auto max-w-[280px]">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-slate-800 truncate">
              Bhubaneswar, Odisha
            </span>
            <span className="text-[10px] text-slate-500">
              {stations.some((s) => s.isRealOcmData)
                ? 'Open Charge Map API (Live POIs)'
                : 'Interactive Google Maps (Demo Key)'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto tabular-nums font-semibold">
            {stations.length} {stations.length === 1 ? 'hub' : 'hubs'}
          </span>
        </div>

        {activeRoute && (
          <div className="bg-emerald-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Route Active: {activeRoute.totalDistanceKm} km</span>
          </div>
        )}
      </div>

      {/* Floating Overlay Controls on Top Right: Map Layers & GPS Locate Button */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 pointer-events-auto">
        {onLocateUser && (
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            className={`h-9 px-2.5 bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition-colors ${
              userCoordinates ? 'text-blue-600 border-blue-300 bg-blue-50/50' : ''
            }`}
            title="Near Me (Browser Geolocation)"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Near Me</span>
          </button>
        )}

        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1">
          <button
            onClick={() => setMapTypeId('roadmap')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              mapTypeId === 'roadmap'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setMapTypeId('satellite')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              mapTypeId === 'satellite'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTypeId('terrain')}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              mapTypeId === 'terrain'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {!apiIsLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center z-0">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-700">
            Initializing Google Maps Platform for Bhubaneswar...
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Loading vector tiles & AdvancedMarker library
          </span>
        </div>
      )}

      {/* Bottom Left: Notice Badge */}
      <div className="absolute bottom-2 left-3 z-10 text-[10px] text-slate-600 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs pointer-events-none">
        Google Maps JavaScript API · Bhubaneswar, Odisha (Demo Key)
      </div>
    </div>
  );
};
