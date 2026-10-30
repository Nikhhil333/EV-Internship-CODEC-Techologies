# ChargeFinder EV — Indian EV Charging Station Locator & Route Planner

A modern, responsive, mobile-first EV Charging Station Locator and road trip planner built for the Indian EV ecosystem, demonstrated with mock data centered around **Bhubaneswar, Odisha, India**.

---

## 🇮🇳 India-Specific Adaptations

1. **Demonstration Center: Bhubaneswar, Odisha**
   - Centered around Bhubaneswar (`20.2961° N, 85.8245° E`) featuring realistic key localities:
     - **Patia / Infocity IT Corridor** (Near KIIT / Infocity Gate)
     - **Jayadev Vihar** (Near Fortune Tower & Pal Heights)
     - **Saheed Nagar** (Janpath commercial strip & Forum Esplanade)
     - **Khandagiri** (NH-16 transit hub near Baramunda)
     - **Chandrasekharpur** (CSP near Nalco Square)
     - **Nayapalli** (IRC Village)
     - **Rasulgarh** (Cuttack-Puri Bypass interchange)
     - **Biju Patnaik Airport** (Terminal Plaza)

2. **Indian Rupee (₹) Pricing & Distance in Kilometres (km)**
   - All charging rates presented in Indian Rupees (e.g. `₹18.50 / kWh`, `₹19.00 / kWh`, `₹14.00 / kWh`).
   - All distances explicitly rendered in kilometres (`km`).
   - Charging speeds in kilowatts (`kW`).
   - Idle fees in `₹/min`.

3. **Standard Indian EV Connector Categories**
   - **CCS2**: Dominant DC fast charging standard for Indian 4-wheelers (Tata Nexon EV, Punch EV, MG ZS EV, Mahindra XUV400, Hyundai Ioniq 5, BYD Atto 3, etc.).
   - **Type 2 (AC)**: Standard AC charging (7.4 kW / 11 kW / 22 kW).
   - **GB/T**: DC fast standard used by fleet electric vehicles (e.g., Tata Tigor Xpres-T).
   - **Bharat DC-001**: Standard low-voltage DC protocol.
   - **15A Socket**: Standard 3-pin AC emergency/slow charging.

4. **Odisha Road Trips & EV Route Planner**
   - **Bhubaneswar → Puri (Golden Beach / Jagannath Temple)** via NH-316 (~68 km)
   - **Bhubaneswar → Konark (Sun Temple & Marine Drive)** via Pipili & Gop (~76 km)
   - **Bhubaneswar → Cuttack (Millennium City)** via NH-16 (~32 km)
   - **Bhubaneswar → Rourkela (via Sambalpur / NH-55)** (~338 km with multi-stop planning)

5. **Demonstration Data Notice**
   - All stations, stall availability, rates in ₹, and distances are clearly labeled as demonstration mock data for prototype evaluation and testing. None of this data represents verified real-world operational stations.

---

## Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Compile and build
npm run build
```

---

## Upgrading to Live Google Maps Platform

1. Set `VITE_GOOGLE_MAPS_API_KEY=your_key` in `.env`.
2. Enable **Maps JavaScript API** and **Routes API** in Google Cloud Console.
3. The service layer in `/src/services/mapService.ts` seamlessly passes requests to live APIs.
