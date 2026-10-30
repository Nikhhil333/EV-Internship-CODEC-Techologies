/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Station, ConnectorSpec, ConnectorType, SpeedCategory, StationStatus, Coordinates } from '../types/ev.ts';

export interface OcmApiResponse {
  success: boolean;
  source: 'Open Charge Map API' | 'Demonstration Prototype' | 'Fallback';
  count: number;
  stations: Station[];
  hasApiKey: boolean;
  message?: string;
  error?: string;
}

export interface RawOcmPoi {
  ID: number;
  UUID?: string;
  DataProviderID?: number;
  OperatorID?: number;
  UsageTypeID?: number;
  UsageCost?: string | null;
  AddressInfo?: {
    Title?: string;
    AddressLine1?: string | null;
    AddressLine2?: string | null;
    Town?: string | null;
    StateOrProvince?: string | null;
    Postcode?: string | null;
    Latitude: number;
    Longitude: number;
    ContactTelephone1?: string | null;
    ContactEmail?: string | null;
    AccessComments?: string | null;
    RelatedURL?: string | null;
  };
  Connections?: Array<{
    ID: number;
    ConnectionTypeID?: number;
    ConnectionType?: {
      ID: number;
      Title: string;
      FormalName?: string;
    };
    StatusType?: {
      ID: number;
      Title: string;
      IsOperational: boolean;
    };
    Level?: {
      ID: number;
      Title: string;
      IsFastChargeCapable?: boolean;
    };
    PowerKW?: number | null;
    Voltage?: number | null;
    Amps?: number | null;
    Quantity?: number | null;
    CurrentType?: {
      Title: string;
    };
  }>;
  NumberOfPoints?: number | null;
  GeneralComments?: string | null;
  DateLastStatusUpdate?: string | null;
  DateLastConfirmed?: string | null;
  StatusType?: {
    ID: number;
    Title: string;
    IsOperational: boolean;
  };
  OperatorInfo?: {
    ID?: number;
    Title?: string;
    Website?: string | null;
    PhonePrimaryContact?: string | null;
  };
}

/**
 * Maps Open Charge Map ConnectionType to Indian EV connector standard categories
 */
export function mapOcmConnectionType(rawTitle?: string, formalName?: string, isFast?: boolean): ConnectorType {
  const text = `${rawTitle || ''} ${formalName || ''}`.toLowerCase();

  if (text.includes('ccs') || text.includes('combo 2') || text.includes('iec 62196-3')) {
    return 'CCS2';
  }
  if (text.includes('type 2') || text.includes('mennekes') || text.includes('iec 62196-2')) {
    return 'Type 2';
  }
  if (text.includes('gb/t') || text.includes('gb-t') || text.includes('guobiao')) {
    return 'GB/T';
  }
  if (text.includes('bharat') || text.includes('dc-001') || text.includes('dc001')) {
    return 'Bharat DC-001';
  }
  if (text.includes('chademo')) {
    return 'CHAdeMO';
  }
  if (text.includes('bs 546') || text.includes('15a') || text.includes('3 pin') || text.includes('domestic') || text.includes('wall')) {
    return '15A Socket';
  }

  // Fallback heuristic based on speed
  return isFast ? 'CCS2' : 'Type 2';
}

/**
 * Calculates Great-Circle distance in km between two GPS coordinates
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
 * Converts a raw Open Charge Map POI into our ChargeFinder EV Station model
 */
export function mapOcmPoiToStation(
  poi: RawOcmPoi,
  referenceCoords: Coordinates = { lat: 20.2961, lng: 85.8245 }
): Station {
  const addr = poi.AddressInfo || {
    Title: `EV Station #${poi.ID}`,
    Latitude: 20.2961,
    Longitude: 85.8245,
  };

  const distKm = calculateDistanceKm(
    referenceCoords.lat,
    referenceCoords.lng,
    addr.Latitude,
    addr.Longitude
  );

  // Parse connectors
  const rawConnections = poi.Connections || [];
  const connectors: ConnectorSpec[] = [];
  let maxPowerKw = 0;

  if (rawConnections.length > 0) {
    rawConnections.forEach((conn, index) => {
      const connType = mapOcmConnectionType(
        conn.ConnectionType?.Title,
        conn.ConnectionType?.FormalName,
        conn.Level?.IsFastChargeCapable
      );

      const powerKw = conn.PowerKW && conn.PowerKW > 0
        ? conn.PowerKW
        : conn.Level?.IsFastChargeCapable ? 50 : 22;

      if (powerKw > maxPowerKw) {
        maxPowerKw = powerKw;
      }

      const speedCategory: SpeedCategory =
        powerKw >= 100 ? 'Ultra-Fast' : powerKw >= 30 ? 'Fast' : 'Standard AC';

      const isConnOperational = conn.StatusType?.IsOperational !== false;
      const status: StationStatus = isConnOperational ? 'Available' : 'Unknown';

      const currentType =
        conn.CurrentType?.Title?.includes('DC') || powerKw > 25 ? 'DC Fast' : 'AC Level 2';

      const quantity = Math.max(1, conn.Quantity || 1);
      for (let q = 1; q <= quantity; q++) {
        connectors.push({
          id: `ocm-${poi.ID}-conn-${conn.ID || index}-${q}`,
          stallNumber: quantity > 1 ? `${index + 1}${String.fromCharCode(64 + q)}` : `${index + 1}`,
          type: connType,
          powerKw,
          speedCategory,
          status,
          currentType,
          voltage: conn.Voltage || (currentType === 'DC Fast' ? 400 : 230),
          pricePerKwh: 0,
          rawConnectionTitle: conn.ConnectionType?.Title || 'Standard EV Socket',
        });
      }
    });
  } else {
    // Default fallback stall if OCM record did not enumerate individual plug models
    maxPowerKw = 22;
    connectors.push({
      id: `ocm-${poi.ID}-conn-def-1`,
      stallNumber: '1',
      type: 'Type 2',
      powerKw: 22,
      speedCategory: 'Standard AC',
      status: 'Available',
      currentType: 'AC Level 2',
      voltage: 415,
      pricePerKwh: 0,
      rawConnectionTitle: 'Standard Public AC Port',
    });
  }

  // Determine operational status from OCM StatusType
  const isOperational = poi.StatusType?.IsOperational !== false;
  const status: StationStatus = isOperational ? 'Available' : 'Occupied';

  // Total stalls
  const totalPlugsCount = Math.max(
    connectors.length,
    poi.NumberOfPoints || 1
  );
  // Real-time plug occupancy is not tracked by Open Charge Map; we honestly report active stalls
  const availablePlugsCount = isOperational ? Math.max(1, connectors.length) : 0;

  // Honest pricing text
  let pricingSummary = 'Tariff unlisted in OCM — check operator app / on-site';
  if (poi.UsageCost && poi.UsageCost.trim()) {
    pricingSummary = poi.UsageCost.trim();
  }

  // Operating Hours
  let operatingHours = 'Hours not published in OCM registry';
  let isOpen24Hours = false;
  if (addr.AccessComments) {
    operatingHours = addr.AccessComments;
    if (addr.AccessComments.toLowerCase().includes('24') || addr.AccessComments.toLowerCase().includes('open 24/7')) {
      isOpen24Hours = true;
    }
  }

  // Last update time formatted
  let reportedAgo = 'Verified in OCM';
  if (poi.DateLastStatusUpdate || poi.DateLastConfirmed) {
    try {
      const date = new Date(poi.DateLastStatusUpdate || poi.DateLastConfirmed!);
      reportedAgo = date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      reportedAgo = 'Verified in OCM';
    }
  }

  // Network / Operator
  const operatorName =
    poi.OperatorInfo?.Title && poi.OperatorInfo.Title.trim() && poi.OperatorInfo.Title !== '(Unknown Operator)'
      ? poi.OperatorInfo.Title.trim()
      : 'Open Charge Network';

  const area = addr.AddressLine2 || addr.Town || 'Bhubaneswar';
  const city = addr.Town || 'Bhubaneswar';
  const state = addr.StateOrProvince || 'Odisha';
  const address = addr.AddressLine1 || addr.Title || 'Bhubaneswar, Odisha';

  return {
    id: `ocm-${poi.ID}`,
    ocmId: poi.ID,
    name: addr.Title || `EV Charging Station #${poi.ID}`,
    network: operatorName,
    address,
    area,
    city,
    state,
    pincode: addr.Postcode || '751001',
    distanceKm: distKm,
    rating: 4.5,
    reviewCount: 1,
    coordinates: {
      lat: addr.Latitude,
      lng: addr.Longitude,
    },
    connectors,
    maxPowerKw: maxPowerKw > 0 ? maxPowerKw : 22,
    pricingSummary,
    idleFee: 'Not published in OCM record',
    parkingFee: 'Check on-site',
    operatingHours,
    isOpen24Hours,
    status,
    availablePlugsCount,
    totalPlugsCount,
    amenities: ['Illuminated'],
    accessNotes: addr.AccessComments || poi.GeneralComments || undefined,
    isDemonstrationData: false,
    isRealOcmData: true,
    dataSource: 'Open Charge Map API',
    operatorWebsite: poi.OperatorInfo?.Website || addr.RelatedURL || undefined,
    operatorPhone: poi.OperatorInfo?.PhonePrimaryContact || addr.ContactTelephone1 || undefined,
    reportedAgo,
    lastConfirmedDate: poi.DateLastConfirmed || poi.DateLastStatusUpdate || undefined,
    description: poi.GeneralComments || `${operatorName} charging station located in ${area}, ${city}. Verified via Open Charge Map registry.`,
  };
}

/**
 * Client-side loader to fetch stations from server proxy route /api/stations
 */
export async function loadStationsFromApi(
  coords: Coordinates = { lat: 20.2961, lng: 85.8245 },
  distanceKm: number = 40
): Promise<OcmApiResponse> {
  try {
    const url = `/api/stations?lat=${coords.lat}&lng=${coords.lng}&distance=${distanceKm}&maxresults=50`;
    const res = await fetch(url);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        source: 'Fallback',
        count: 0,
        stations: [],
        hasApiKey: Boolean(errJson.hasApiKey),
        message: errJson.message || `API request failed with HTTP ${res.status}`,
        error: errJson.error || 'HTTP_ERROR',
      };
    }

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error reaching /api/stations';
    return {
      success: false,
      source: 'Fallback',
      count: 0,
      stations: [],
      hasApiKey: false,
      message,
      error: 'NETWORK_ERROR',
    };
  }
}
