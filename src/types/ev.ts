export type ConnectorType =
  | 'CCS2'
  | 'Type 2'
  | 'GB/T'
  | 'Bharat DC-001'
  | '15A Socket'
  | 'CHAdeMO';

export type StationStatus = 'Available' | 'Occupied' | 'Unknown';

export type SpeedCategory = 'Ultra-Fast' | 'Fast' | 'Standard AC';

export type NetworkProvider =
  | 'Tata Power EZ Charge'
  | 'Jio-bp pulse'
  | 'Statiq'
  | 'Ather Grid'
  | 'Kazam'
  | 'ChargeZone'
  | 'Zeon Charging'
  | 'IndianOil EV'
  | (string & {});

export type Amenity =
  | 'Restrooms'
  | 'Cafe'
  | 'WiFi'
  | 'Dining'
  | 'Grocery'
  | 'Shopping'
  | '24/7 Access'
  | 'Illuminated'
  | 'Covered Canopy'
  | (string & {});

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ConnectorSpec {
  id: string;
  stallNumber: string;
  type: ConnectorType;
  powerKw: number;
  speedCategory: SpeedCategory;
  status: StationStatus;
  currentType: 'DC Fast' | 'AC Level 2' | 'AC Slow';
  voltage: number;
  pricePerKwh: number; // in Indian Rupees (₹)
  rawConnectionTitle?: string;
}

export interface Station {
  id: string;
  name: string;
  network: NetworkProvider;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  coordinates: Coordinates;
  connectors: ConnectorSpec[];
  maxPowerKw: number;
  pricingSummary: string; // in ₹/kWh or honest OCM note
  idleFee: string;
  parkingFee: string;
  operatingHours: string;
  isOpen24Hours: boolean;
  status: StationStatus;
  availablePlugsCount: number;
  totalPlugsCount: number;
  amenities: Amenity[];
  accessNotes?: string;
  isDemonstrationData: boolean;
  isRealOcmData?: boolean;
  ocmId?: number;
  dataSource?: 'Open Charge Map API' | 'Demonstration Prototype';
  operatorWebsite?: string;
  operatorPhone?: string;
  dataProvider?: string;
  lastConfirmedDate?: string;
  reportedAgo: string;
  description: string;
}

export interface FilterState {
  searchQuery: string;
  connectorTypes: ConnectorType[];
  minPowerKw: number | null;
  availabilityOnly: boolean;
  network: string;
  freeOnly: boolean;
  sortBy: 'distance' | 'power' | 'availability' | 'price';
}

export interface RouteStop {
  stationId: string;
  stationName: string;
  network: NetworkProvider;
  distanceFromStartKm: number;
  coordinates: Coordinates;
  arrivalSocPercent: number;
  targetSocPercent: number;
  chargeTimeMinutes: number;
  powerKw: number;
  connectorType: ConnectorType;
  estimatedCost: number; // in ₹
  notes: string;
  amenities: Amenity[];
}

export interface RoutePlan {
  id: string;
  title: string;
  origin: string;
  destination: string;
  originCoords: Coordinates;
  destCoords: Coordinates;
  totalDistanceKm: number;
  estimatedDriveTimeMin: number;
  estimatedChargeTimeMin: number;
  startSocPercent: number;
  arrivalSocPercent: number;
  stops: RouteStop[];
  estimatedTotalCost: number; // in ₹
  waypoints: { name: string; lat: number; lng: number }[];
  elevationNotes?: string;
}
