# ChargeFinder EV — Indian EV Charging Station Locator & Route Planner

A modern, responsive, mobile-first Electric Vehicle (EV) Charging Station Locator and route planner tailored for the Indian EV ecosystem, centered around **Bhubaneswar, Odisha, India**.

ChargeFinder EV combines an interactive Google Map, a server-side proxy integration with the Open Charge Map API, and resilient prototype fallbacks to help EV drivers find nearby charging plugs, filter by Indian connector standards (CCS2, Type 2, GB/T, Bharat DC-001), inspect connector power ratings in kW, estimate charging costs in Indian Rupees (₹), and plan regional highway journeys across Odisha.

---

## 1. Project Overview

The electric vehicle transition in India is accelerating rapidly, yet EV drivers frequently face fragmented charging networks, conflicting connector standards, and range anxiety during intercity travel. ChargeFinder EV addresses these challenges by offering a unified, mobile-first interface designed to:

- Locate nearby electric vehicle charging stations with clear geospatial context.
- Support India's predominant charging standards across 2-wheelers, 3-wheelers, 4-wheelers, and commercial fleet vehicles.
- Plan road trips across key Odisha corridors (such as Bhubaneswar to Puri, Konark, Cuttack, and Rourkela) with suggested charging stops and state-of-charge (SoC) estimations.
- Bridge live third-party public registries (Open Charge Map) with clean client-side caching and fallback mock datasets to guarantee application stability under all network conditions.

---

## 2. Key Features

### 🗺️ Interactive Explore Screen
- **Google Maps Integration**: Smooth, touch-friendly interactive map centered on Bhubaneswar (`20.2961° N, 85.8245° E`) with standard, satellite, and terrain layers.
- **Advanced Markers**: Custom color-coded marker pins reflecting charger status and maximum power output (kW).
- **Camera Auto-Framing**: Dynamically adjusts zoom and viewport bounds when filtering by search keyword or locality.
- **Marker InfoWindows**: Quick tap on any marker reveals station address, power rating, connector count, and one-tap external Google Maps navigation.

### 🔍 Search & Multi-Criteria Filtering
- **Keyword Search**: Filter stations by name, network operator, locality, or landmark.
- **Locality Quick Chips**: One-tap filtering for prominent Bhubaneswar hubs (Patia, Jayadev Vihar, Saheed Nagar, Khandagiri, Nayapalli, Rasulgarh, Airport, etc.).
- **Connector Type Filter**: Select specific plugs including CCS2, Type 2, GB/T, Bharat DC-001, or 15A Socket.
- **Power Category Filter**: Filter by charging speed:
  - *Standard AC* (< 30 kW)
  - *Fast DC* (30 kW – 99 kW)
  - *Ultra-Fast DC* (≥ 100 kW)
- **Availability Toggle**: Quickly show only chargers marked as available.

### 📋 Station Details Drawer
- Comprehensive sheet presenting:
  - Full street address, landmark notes, and GPS coordinates.
  - Connector specifications (plug type, maximum kW rating, voltage, current type AC/DC, and per-plug status).
  - Operating hours and network operator details (with direct links to operator websites/helplines when available).
  - Clear data provenance badges distinguishing verified Open Charge Map records from prototype demonstrations.
  - On-site amenities (restrooms, dining, cafes, covered parking, illuminated stalls).

### 🛣️ Odisha Route Planner
- Pre-configured itineraries and custom point-to-point trip calculation:
  - **Bhubaneswar → Puri (Golden Beach / Jagannath Temple)** via NH-316 (~68 km)
  - **Bhubaneswar → Konark (Sun Temple & Marine Drive)** via Pipili & Gop (~76 km)
  - **Bhubaneswar → Cuttack (Millennium City)** via NH-16 (~32 km)
  - **Bhubaneswar → Rourkela (Steel City via Sambalpur / NH-55)** (~338 km with multiple recommended charging stops)
- Interactive battery state-of-charge (SoC) tracking from departure to destination.
- Recommended highway charging midway stops with estimated charging duration and power ratings.
- Route overview polyline rendered directly on the map.

### ⚡ Interactive Charge Session Simulator
- Educational simulation modal allowing users to test a virtual charging session.
- Real-time battery charge progression (from initial SoC% to target SoC%).
- Dynamic calculation of energy delivered (kWh), elapsed time, and total cost in Indian Rupees (₹) based on station tariff rates.

### 📍 Near Me (Geolocation)
- Native browser Geolocation API integration with permission handling.
- Instant distance recalculation using the Haversine formula relative to the user's real-time position.

### 🔖 Saved Stations
- Persistent bookmarking of frequently visited stations stored in browser `localStorage`.
- Dedicated "Saved" tab with quick navigation and status summaries.

---

## 3. India-Specific Adaptations

ChargeFinder EV is customized specifically for the technical, economic, and geographic realities of the Indian EV landscape:

### Demonstration Focal Point: Bhubaneswar, Odisha
The default geographic focus is centered on Bhubaneswar, Odisha (`20.2961° N, 85.8245° E`), featuring realistic locations:
- **Patia / Infocity IT Corridor**: Silicon & KIIT University hub (high concentration of 4W tech commuters).
- **Jayadev Vihar**: Commercial center near Fortune Tower and Pal Heights Mall.
- **Saheed Nagar / Janpath**: Downtown shopping strip near Forum Esplanade Mall.
- **Khandagiri / Baramunda**: Major western transit hub on NH-16 heading towards Khordha.
- **Chandrasekharpur (CSP)**: High-density residential zone near Nalco Square.
- **Nayapalli / IRC Village**: Administrative and hotel district.
- **Rasulgarh**: Major traffic interchange connecting Cuttack-Puri Bypass.
- **Biju Patnaik International Airport (BBI)**: Airport terminal transit parking.

### Standard Indian EV Connector Categories
The application recognizes and categorizes standard plugs specified by Indian Automotive Industry Standards (AIS) and the Bureau of Indian Standards (BIS):
- **CCS2 (Combined Charging System 2)**: The primary DC fast charging standard for Indian electric passenger cars (e.g., Tata Nexon EV, Punch EV, Curvv EV, MG ZS EV, Mahindra XUV400, Hyundai Ioniq 5, BYD Atto 3).
- **Type 2 (AC)**: Standard European/Indian AC connector used for 7.4 kW home wallboxes, 11 kW commercial chargers, and 22 kW public AC pillars.
- **GB/T (DC)**: DC fast charging standard commonly found on commercial fleet sedans and legacy fleet EVs (e.g., Tata Tigor Xpres-T fleet variants).
- **Bharat DC-001 (GB/T 15 kW / 48V–72V)**: Government-standardized low-voltage DC charging protocol for early-generation fleet cabs and delivery vehicles.
- **15A Indian 3-Pin Socket**: Universal emergency AC charging socket (230V single-phase) used widely by electric 2-wheelers and 3-wheelers.

### Indian Rupee (₹) Pricing & Metric Units
- **Pricing**: All tariffs are calculated and displayed in Indian Rupees per kilowatt-hour (e.g., `₹18.50 / kWh`, `₹21.00 / kWh`), with idle parking fees displayed in `₹/min`.
- **Distance**: Measured and sorted strictly in **kilometres (km)**.
- **Power**: Rated in **kilowatts (kW)**.

---

## 4. Technology Stack

All technologies listed below are directly verified from the repository's configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `server.ts`):

### Frontend Framework & Libraries
- **React 19** (`react` ^19.0.1, `react-dom` ^19.0.1): Component-driven UI architecture with modern hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **TypeScript 7** (`typescript` ^7.0.2): Strict static typing across models, services, and components.
- **Tailwind CSS v4** (`tailwindcss` ^4.3.3, `@tailwindcss/vite` ^4.3.3): Utility-first CSS styling using modern CSS variables and zero-runtime overhead.
- **Motion** (`motion` ^12.23.24): Smooth layout transitions for drawers, modals, and screen switches.
- **Lucide React** (`lucide-react` ^0.546.0): Crisp, accessible iconography.

### Mapping & Geolocation
- **@vis.gl/react-google-maps** (`^1.10.1`): Official React wrapper for the Google Maps JavaScript API.
- **Google Maps JavaScript API**: Powers interactive tile rendering, camera animations, `AdvancedMarker`, `InfoWindow`, and polyline paths.
- **HTML5 Geolocation API**: Browser-native device positioning.

### Backend & Proxy Server
- **Node.js**: Server runtime environment.
- **Express 4** (`express` ^4.21.2): Backend HTTP server providing:
  - `/api/health`: Server and secret configuration status endpoint.
  - `/api/stations`: Secure server-side proxy route querying the Open Charge Map API without exposing credentials to the client.
- **tsx** (`^4.21.0`): TypeScript execute engine for zero-compile development server execution.
- **dotenv** (`^17.2.3`): Server-side environment variable loader.

### Build Tools & Tooling
- **Vite 8** (`vite` ^8.3.0, `@vitejs/plugin-react` ^6.1.1): Fast development server and production static asset bundler.
- **esbuild** (`^0.25.0`): High-speed JavaScript/TypeScript bundler powering Vite.
- **@google/genai** (`^2.4.0`): Google Gen AI SDK for AI Studio server-side capabilities.

---

## 5. Map Integration

ChargeFinder EV integrates Google Maps via `@vis.gl/react-google-maps`:

```
┌─────────────────────────────────────────────────────────────┐
│                       InteractiveMap                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                      <APIProvider>                      │ │
│ │   ┌─────────────────────────────────────────────────┐   │ │
│ │   │                     <Map>                       │ │ │
│ │   │  • MapCameraController (fitBounds & panTo)      │ │ │
│ │   │  • <AdvancedMarker> (Status & kW badge pills)   │ │ │
│ │   │  • <InfoWindow> (Station summary & navigation)  │ │ │
│ │   │  • <Polyline> (Odisha route planner path)       │ │ │
│ │   └─────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Mapping Behaviors
1. **Dynamic Camera Control**: The `MapCameraController` listens to filtered station updates; when a locality chip or search term is selected, the camera automatically pans and scales bounds to fit visible markers.
2. **Marker Highlighting**: Selecting a station card from the list elevates the corresponding `AdvancedMarker` with a glowing ring and high z-index, automatically opening its `InfoWindow`.
3. **Turn-by-Turn Directions**: Tapping "Get Directions" constructs an external Google Maps Universal Direction URL (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`), launching navigation in the user's native Google Maps app or browser tab.
4. **Quota & Demo Key Resilience**: The map component implements defensive event listeners for Google Maps quota events (`gmp-quota-exceeded`), rendering informative feedback if API usage thresholds are encountered.

---

## 6. Charging Station Data Sources

ChargeFinder EV maintains an honest and resilient multi-tier data pipeline:

```
                      ┌──────────────────────────────────────────────┐
                      │              ChargeFinder EV UI              │
                      └──────────────────────┬───────────────────────┘
                                             │
                                     GET /api/stations
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │          Express Backend (server.ts)         │
                      └──────┬────────────────────────────────┬──────┘
                             │                                │
                  If API Key Configured                If Key Missing / Error
                             │                                │
                             ▼                                ▼
       ┌──────────────────────────────────────────┐    ┌─────────────────────────────┐
       │     Open Charge Map API (v3)             │    │  Bhubaneswar Prototype Data │
       │     https://api.openchargemap.io/v3/poi  │    │  (src/data/mockStations.ts) │
       │     • Real POI coordinates & names       │    │  • 8 modeled stations       │
       │     • Connector types & quantities       │    │  • Realistic Indian tariffs │
       │     • Operator metadata                  │    │  • Clearly labeled fallback │
       └──────────────────────────────────────────┘    └─────────────────────────────┘
```

### 1. Open Charge Map API (v3) — Live Public Registry
- **Endpoint**: `https://api.openchargemap.io/v3/poi/`
- **Proxy Implementation**: Called strictly server-to-server via Express (`server.ts`).
- **Parameters**: `latitude=20.2961`, `longitude=85.8245`, `distance=45`, `distanceunit=KM`, `countrycode=IN`, `maxresults=50`.
- **Data Retrieved**: Verified real-world station names, coordinates, operator names, address lines, and connector hardware configurations.
- **Identification**: Displayed in the UI with a green **"Open Charge Map API"** badge.

### 2. Google Maps Platform
- Provides the cartographic basemap, satellite imagery, tile rendering, camera movement engine, and external navigation intents.
- Does **not** supply proprietary EV charger occupancy or live kilowatt metering.

### 3. Demonstration & Fallback Records (`src/data/mockStations.ts`)
- **Role**: If no Open Charge Map API key is supplied, or if the external API is unreachable, the application gracefully activates an internal dataset of 8 realistic stations across Bhubaneswar.
- **Identification**: Explicitly badged with an amber **"Demonstration Prototype"** label on station cards and detail drawers.

---

## 7. Data Accuracy and Limitations

In accordance with professional software standards and academic/internship evaluation criteria, the limitations of the data sources are explicitly disclosed:

| Data Attribute | Source / Reality | Accuracy Level |
| :--- | :--- | :--- |
| **Station Coordinates & Names** | Open Charge Map API | **Verified** real-world points of interest when API key is active. |
| **Connector Types & Ratings** | Open Charge Map / Hardware Specs | **Hardware specs verified**; actual power output depends on grid supply and vehicle acceptance rate. |
| **Real-Time Stall Availability** | Algorithmic Simulation | **Simulated**. Open Charge Map is a static POI registry and does *not* provide live telemetry on whether a plug is currently in-use or available. |
| **Tariffs & Pricing (₹/kWh)** | Market Benchmark Estimates | **Estimated**. Actual charging tariffs in India fluctuate based on network operator agreements, time-of-day tariffs, and GST rates. |
| **Route Planner Battery Consumption** | Mathematical Heuristic | **Estimated**. Calculations use distance-based battery drain formulas and do not account for real-time CAN-bus telemetry, elevation gradients, AC usage, or headwind. |

---

## 8. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Execution

```bash
# 1. Clone the repository
git clone <repository-url>
cd chargefinder-ev

# 2. Install all dependencies defined in package.json
npm install

# 3. Launch the full-stack development server (Express + Vite on port 3000)
npm run dev

# 4. Open in your browser
# http://localhost:3000
```

### Available Scripts in `package.json`

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs `tsx server.ts` — launches Express backend on port 3000 with Vite middleware in development mode. |
| `npm run build` | Runs `vite build` — compiles TypeScript and bundles frontend assets into `dist/`. |
| `npm run start` | Runs `node server.ts` — runs the production Express server serving compiled static assets. |
| `npm run lint` | Runs `tsc --noEmit` — validates all TypeScript types across the codebase. |
| `npm run clean` | Removes `dist/` and build artifacts. |

---

## 9. Environment Configuration

Copy the provided `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

### Documented Variables

| Variable | Target Scope | Description |
| :--- | :--- | :--- |
| `OPENCHARGEMAP_API_KEY` | **Server-side only** (Node.js) | Free API key obtained from [openchargemap.org](https://openchargemap.org/site/develop/api). Used by `server.ts` to query real EV charging stations. **Never exposed to the browser**. |
| `VITE_GOOGLE_MAPS_API_KEY` | **Client-side** (Browser bundle) | Google Maps JavaScript API key. **Note:** Variables prefixed with `VITE_` are compiled directly into the client-side JavaScript bundle and are visible to end users. Restrict this key via Google Cloud Console using HTTP referrer restrictions. |
| `GEMINI_API_KEY` | **Server-side only** (Node.js) | Reserved for server-side Google Gen AI features. In AI Studio, this is managed via the Secrets panel. |
| `APP_URL` | **Server-side only** (Node.js) | Fully qualified domain URL where the app is hosted (e.g. Cloud Run instance URL). |

> ⚠️ **Security Notice**: Never commit `.env` containing actual API keys to version control. Always keep API keys private.

---

## 10. Production and Deployment Considerations

- **Single-Process Full-Stack Serving**: `server.ts` handles both API proxying and static production asset delivery from `dist/`, avoiding CORS issues and eliminating the need for a separate API gateway.
- **Client Bundle Safety**: Upstream third-party API credentials (`OPENCHARGEMAP_API_KEY`) remain strictly on the backend.
- **HTTPS Enforcement for Geolocation**: Browsers block the HTML5 Geolocation API on insecure (`http://`) origins outside `localhost`. When deploying to production (e.g., Cloud Run, Render, Railway, AWS), ensure SSL/TLS termination is enabled.
- **Google Maps API Key Restrictions**: In the Google Cloud Console, restrict `VITE_GOOGLE_MAPS_API_KEY` to specific authorized HTTP referrers (e.g., `https://your-domain.com/*`) to prevent unauthorized quota consumption.

---

## 11. Future Improvements

Planned enhancements for future iterations of ChargeFinder EV:

1. **OCPP (Open Charge Point Protocol) Integration**: Connect with CPO backends via OCPP 1.6J/2.0.1 WebSockets to display verified, real-time live plug occupancy and fault alerts.
2. **Indian CPO API Partnerships**: Integrate direct APIs from major Indian charge point operators (Tata Power EZ Charge, Jio-bp pulse, Statiq, Kazam, Ather Grid).
3. **Google Routes & Elevation API**: Upgrade the route planner to compute real-time road elevations, traffic-adjusted driving durations, and exact highway toll costs.
4. **Unified UPI / Bharat QR Payments**: In-app charging session pre-booking and automated billing via Indian Unified Payments Interface (UPI).
5. **Community Reviews & Plug Photos**: Allow EV drivers to submit community check-ins, report broken chargers, and post photos of station access points.

---

## 12. Acknowledgements

- **[Open Charge Map](https://openchargemap.org/)**: The global open registry of electric vehicle charging locations.
- **[Google Maps Platform](https://developers.google.com/maps)** & **[@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)**: High-performance mapping and geospatial components.
- **Bureau of Indian Standards (BIS)** & **NITI Aayog**: Indian EV charging infrastructure guidelines and standard specifications.
- **Lucide Icons**: Clean, open-source iconography for mobile interfaces.
