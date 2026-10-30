/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Coordinates, RoutePlan, Station, FilterState } from '../types/ev';
import { MOCK_STATIONS, MOCK_ROUTES } from '../data/mockStations';

/**
 * Service Abstraction for Google Maps Platform and EV Routing.
 * Demonstrating the Indian EV ecosystem centered around Bhubaneswar, Odisha.
 * Designed for immediate plug-and-play integration with:
 * - Google Maps JavaScript API (Place Autocomplete, Advanced Markers)
 * - Google Routes API (computeRoutes with EV routing and connector specs)
 */

export interface MapServiceConfig {
  apiKey?: string;
  useLiveGoogleMaps: boolean;
  defaultCenter: Coordinates;
  defaultZoom: number;
}

export const MAP_CONFIG: MapServiceConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  useLiveGoogleMaps: Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
  defaultCenter: { lat: 20.2961, lng: 85.8245 }, // Bhubaneswar, Odisha, India
  defaultZoom: 13,
};

export class StationService {
  /**
   * Haversine formula to compute great-circle distance between two points in km
   */
  static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  }

  /**
   * Filter and sort stations according to user preferences
   */
  static filterStations(stations: Station[], filter: FilterState): Station[] {
    return stations
      .filter((station) => {
        // Search query matching
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const matchName = station.name.toLowerCase().includes(query);
          const matchCity = station.city.toLowerCase().includes(query);
          const matchArea = station.area.toLowerCase().includes(query);
          const matchAddress = station.address.toLowerCase().includes(query);
          const matchNetwork = station.network.toLowerCase().includes(query);
          if (!matchName && !matchCity && !matchArea && !matchAddress && !matchNetwork) {
            return false;
          }
        }

        // Connector type filter (CCS2, Type 2, GB/T, Bharat DC-001, 15A Socket, CHAdeMO)
        if (filter.connectorTypes.length > 0) {
          const hasMatchingConnector = station.connectors.some((c) =>
            filter.connectorTypes.includes(c.type)
          );
          if (!hasMatchingConnector) return false;
        }

        // Minimum power filter
        if (filter.minPowerKw !== null && filter.minPowerKw > 0) {
          if (station.maxPowerKw < filter.minPowerKw) return false;
        }

        // Availability only filter
        if (filter.availabilityOnly) {
          if (station.status !== 'Available' || station.availablePlugsCount === 0) {
            return false;
          }
        }

        // Network filter
        if (filter.network && filter.network !== 'all') {
          if (station.network !== filter.network) return false;
        }

        // Free only filter
        if (filter.freeOnly) {
          const isFree =
            station.pricingSummary.toLowerCase().includes('free') ||
            station.connectors.some((c) => c.pricePerKwh === 0);
          if (!isFree) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filter.sortBy) {
          case 'power':
            return b.maxPowerKw - a.maxPowerKw;
          case 'availability':
            return b.availablePlugsCount - a.availablePlugsCount;
          case 'price': {
            const minPriceA = Math.min(...a.connectors.map((c) => c.pricePerKwh));
            const minPriceB = Math.min(...b.connectors.map((c) => c.pricePerKwh));
            return minPriceA - minPriceB;
          }
          case 'distance':
          default:
            return a.distanceKm - b.distanceKm;
        }
      });
  }

  /**
   * Generates native Google Maps directions URL using station's exact coordinates as destination
   */
  static getDirectionsUrl(station: Station): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
  }

  /**
   * Mock Route Planner calculation for Indian routes
   */
  static calculateRoute(
    origin: string,
    destination: string,
    initialBatteryPct: number = 85
  ): RoutePlan {
    const originLower = origin.toLowerCase();
    const destLower = destination.toLowerCase();

    // Check presets first
    const matchedPreset = MOCK_ROUTES.find(
      (r) =>
        (destLower.includes('puri') && (originLower.includes('bhubaneswar') || originLower.includes('bbsr'))) ||
        (destLower.includes('konark') && (originLower.includes('bhubaneswar') || originLower.includes('bbsr'))) ||
        (destLower.includes('cuttack') && (originLower.includes('bhubaneswar') || originLower.includes('bbsr'))) ||
        (destLower.includes('rourkela') && (originLower.includes('bhubaneswar') || originLower.includes('bbsr')))
    );

    if (matchedPreset) {
      return {
        ...matchedPreset,
        startSocPercent: initialBatteryPct,
      };
    }

    // Dynamic calculated plan for custom origin & destination in km & ₹
    const estDistanceKm = Math.floor(Math.random() * 80) + 70; // 70-150 km
    const estDriveMinutes = Math.round(estDistanceKm * 1.2);
    const requiresStop = estDistanceKm > 90;

    return {
      id: `route-custom-${Date.now()}`,
      title: `${origin} → ${destination}`,
      origin,
      destination,
      originCoords: { lat: 20.2961, lng: 85.8245 },
      destCoords: { lat: 20.4625, lng: 85.8828 },
      totalDistanceKm: estDistanceKm,
      estimatedDriveTimeMin: estDriveMinutes,
      estimatedChargeTimeMin: requiresStop ? 20 : 0,
      startSocPercent: initialBatteryPct,
      arrivalSocPercent: Math.max(22, initialBatteryPct - Math.round(estDistanceKm * 0.4)),
      estimatedTotalCost: requiresStop ? 340 : 0, // ₹340
      waypoints: [
        { name: `${origin} (Start)`, lat: 20.2961, lng: 85.8245 },
        { name: `${destination} (Destination)`, lat: 20.4625, lng: 85.8828 },
      ],
      stops: requiresStop
        ? [
            {
              stationId: 'stop-custom-1',
              stationName: 'Tata Power EZ Charge — Highway Midway Oasis [Demo]',
              network: 'Tata Power EZ Charge',
              distanceFromStartKm: Math.round(estDistanceKm * 0.55),
              coordinates: { lat: 20.3240, lng: 85.8450 },
              arrivalSocPercent: 35,
              targetSocPercent: 80,
              chargeTimeMinutes: 20,
              powerKw: 60,
              connectorType: 'CCS2',
              estimatedCost: 340,
              notes: 'Optimal fast charging stop along corridor before final destination.',
              amenities: ['Dining', 'Restrooms', 'Cafe', 'Covered Canopy'],
            },
          ]
        : [],
    };
  }
}
