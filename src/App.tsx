/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MOCK_STATIONS } from './data/mockStations';
import { Station, ConnectorSpec, RoutePlan } from './types/ev';
import { loadStationsFromApi } from './services/ocmService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ExploreScreen } from './components/ExploreScreen';
import { StationDetailsDrawer } from './components/StationDetailsDrawer';
import { RoutePlannerScreen } from './components/RoutePlannerScreen';
import { SavedStationsScreen } from './components/SavedStationsScreen';
import { ChargeSimulatorModal } from './components/ChargeSimulatorModal';
import { DemoInfoModal } from './components/DemoInfoModal';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'route' | 'saved'>('explore');
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(MOCK_STATIONS[0]);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Open Charge Map API Status States
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [dataSource, setDataSource] = useState<'Open Charge Map API' | 'Demonstration Prototype' | 'Fallback'>('Demonstration Prototype');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Fetch real stations from Open Charge Map API proxy
  const fetchStations = useCallback(async () => {
    setIsLoadingStations(true);
    try {
      const res = await loadStationsFromApi({ lat: 20.2961, lng: 85.8245 }, 45);
      if (res.success && res.stations.length > 0) {
        setStations(res.stations);
        setSelectedStation(res.stations[0]);
        setDataSource('Open Charge Map API');
        setHasApiKey(true);
        setApiMessage(null);
      } else {
        // Fallback to demonstration data so the app remains interactive
        setStations(MOCK_STATIONS);
        setSelectedStation(MOCK_STATIONS[0]);
        setDataSource('Demonstration Prototype');
        setHasApiKey(Boolean(res.hasApiKey));
        setApiMessage(res.message || null);
      }
    } catch (err: unknown) {
      console.warn('Could not load Open Charge Map data:', err);
      setStations(MOCK_STATIONS);
      setSelectedStation(MOCK_STATIONS[0]);
      setDataSource('Demonstration Prototype');
      setHasApiKey(false);
      setApiMessage(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  // Probe API on mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Quota Defense Listener for Google Maps Platform
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Simulator Modal state
  const [simulatorState, setSimulatorState] = useState<{
    isOpen: boolean;
    station: Station | null;
    connector: ConnectorSpec | null;
  }>({
    isOpen: false,
    station: null,
    connector: null,
  });

  // Bookmarks saved in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chargefinder_saved');
      return saved ? JSON.parse(saved) : ['sta-bbsr-patia-01', 'sta-bbsr-jayadev-02'];
    } catch {
      return ['sta-bbsr-patia-01', 'sta-bbsr-jayadev-02'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chargefinder_saved', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [bookmarkedIds]);

  const handleToggleBookmark = (stationId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId]
    );
  };

  const handleOpenDetails = (station: Station) => {
    setSelectedStation(station);
    setIsDetailsOpen(true);
  };

  const handleStartSimulation = (station: Station, connector: ConnectorSpec) => {
    setSimulatorState({
      isOpen: true,
      station,
      connector,
    });
  };

  const handlePlanRouteToStation = (station: Station) => {
    setIsDetailsOpen(false);
    const plan: RoutePlan = {
      id: `route-to-${station.id}`,
      title: `Bhubaneswar → ${station.name}`,
      origin: 'Bhubaneswar Central (Master Canteen)',
      destination: station.name,
      originCoords: { lat: 20.2600, lng: 85.8390 },
      destCoords: { lat: station.coordinates.lat, lng: station.coordinates.lng },
      totalDistanceKm: station.distanceKm,
      estimatedDriveTimeMin: Math.max(12, Math.round(station.distanceKm * 2.2)),
      estimatedChargeTimeMin: 0,
      startSocPercent: 85,
      arrivalSocPercent: Math.max(20, 85 - Math.round(station.distanceKm * 0.4)),
      stops: [],
      estimatedTotalCost: 0,
      waypoints: [
        { name: 'Bhubaneswar Departure', lat: 20.2600, lng: 85.8390 },
        { name: station.name, lat: station.coordinates.lat, lng: station.coordinates.lng },
      ],
    };
    setActiveRoute(plan);
    setActiveTab('explore');
  };

  const savedStationsList = stations.filter((s) => bookmarkedIds.includes(s.id));

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={['marker', 'routes']}
      region="IN"
      language="en"
    >
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        {/* Tier 2 Quota Exceeded Sticky Notice */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Bar */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenInfoModal={() => setIsInfoModalOpen(true)}
          savedCount={bookmarkedIds.length}
          isRealOcm={dataSource === 'Open Charge Map API' || stations.some((s) => s.isRealOcmData)}
        />

        {/* Main View Router */}
        <main className="flex-1 w-full">
          {activeTab === 'explore' && (
            <ExploreScreen
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(station) => setSelectedStation(station)}
              onOpenDetails={handleOpenDetails}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              activeRoute={activeRoute}
              onClearRoute={() => setActiveRoute(null)}
              isLoading={isLoadingStations}
              dataSource={dataSource}
              hasApiKey={hasApiKey}
              apiMessage={apiMessage}
              onRefreshStations={fetchStations}
            />
          )}

          {activeTab === 'route' && (
            <RoutePlannerScreen
              onSelectStationToView={(stationName) => {
                const matched = stations.find((s) =>
                  s.name.toLowerCase().includes(stationName.toLowerCase())
                );
                if (matched) {
                  setSelectedStation(matched);
                  setIsDetailsOpen(true);
                }
              }}
              onOpenInfoModal={() => setIsInfoModalOpen(true)}
              onViewRouteOnMap={(plan) => {
                setActiveRoute(plan);
                setActiveTab('explore');
              }}
            />
          )}

          {activeTab === 'saved' && (
            <SavedStationsScreen
              savedStations={savedStationsList}
              onSelectStation={(station) => {
                setSelectedStation(station);
                setIsDetailsOpen(true);
              }}
              onRemoveBookmark={(id) => handleToggleBookmark(id)}
              onExploreStations={() => setActiveTab('explore')}
            />
          )}
        </main>

        {/* Station Details Drawer */}
        <StationDetailsDrawer
          station={selectedStation}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          isBookmarked={Boolean(selectedStation && bookmarkedIds.includes(selectedStation.id))}
          onToggleBookmark={() => {
            if (selectedStation) handleToggleBookmark(selectedStation.id);
          }}
          onStartSimulation={handleStartSimulation}
          onPlanRouteTo={handlePlanRouteToStation}
        />

        {/* Live Charge Simulator Modal */}
        <ChargeSimulatorModal
          station={simulatorState.station}
          connector={simulatorState.connector}
          isOpen={simulatorState.isOpen}
          onClose={() =>
            setSimulatorState((prev) => ({ ...prev, isOpen: false }))
          }
        />

        {/* Prototype & Google Maps Integration Info Modal */}
        <DemoInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
        />

        {/* Mobile-first Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          savedCount={bookmarkedIds.length}
          onOpenSimulator={() => {
            const defaultStation = selectedStation || MOCK_STATIONS[0];
            handleStartSimulation(defaultStation, defaultStation.connectors[0]);
          }}
        />
      </div>
    </APIProvider>
  );
}
