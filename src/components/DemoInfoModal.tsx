/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Route,
  Zap,
  Code2,
  Terminal,
} from 'lucide-react';

interface DemoInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoInfoModal: React.FC<DemoInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400 stroke-none" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                ChargeFinder EV — Indian EV Charging Prototype
              </h2>
              <p className="text-xs text-slate-400">
                Bhubaneswar, Odisha context & Google Maps integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Open Charge Map API Integration Details */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-emerald-950">
              <h3 className="font-bold text-emerald-900 text-sm">
                Open Charge Map API (v3) Integration
              </h3>
              <p>
                ChargeFinder EV is integrated with the official Open Charge Map API (<code>https://api.openchargemap.io/v3/poi/</code>) to retrieve verified EV charging stations around Bhubaneswar and Odisha.
              </p>
              <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 space-y-1 text-[11px] font-sans">
                <div className="font-semibold text-emerald-900">How to configure your API key in Google AI Studio:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>Obtain a free API key at <a href="https://openchargemap.org/site/develop/api" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-emerald-700">openchargemap.org/site/develop/api</a>.</li>
                  <li>In Google AI Studio, open the <strong>Secrets</strong> panel (Settings &rarr; Secrets / Environment Variables).</li>
                  <li>Add a new secret named <code>OPENCHARGEMAP_API_KEY</code> with your key.</li>
                  <li>Click <strong>Check API / Refresh</strong> on the Explore screen to load real Bhubaneswar stations!</li>
                </ol>
              </div>
              <p className="text-[11px] text-emerald-800">
                <strong>Security:</strong> The API key is securely handled by our server-side Express proxy (<code>/api/stations</code>) and is never sent or exposed to frontend code.
              </p>
            </div>
          </div>

          {/* Data Honesty & Real-time Telemetry Disclosure */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900">
                Data Boundary & Live Telemetry Disclosures
              </h3>
              <p className="text-amber-800 text-xs">
                Open Charge Map provides verified physical coordinates, operator names, and connector types (CCS2, Type 2, GB/T, etc.). However, Open Charge Map does not track real-time vehicle plug occupancy. For live socket availability, Charge Point Operator (CPO) direct OCPP/OCPI telemetry is required. Where tariffs or hours are unlisted in OCM, they are clearly marked.
              </p>
            </div>
          </div>

          {/* Indian EV Standards Supported */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Indian EV Charging Standards & Networks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-1">
                  Connectors (CCS2 & Type 2)
                </span>
                <p className="text-slate-600 text-[11px]">
                  Modeled after Indian EV 4-wheeler standards (Tata Nexon EV, MG ZS EV, Mahindra XUV400) alongside GB/T and Bharat DC-001 fleet connectors.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-1">
                  Indian Rupee (₹) Tariffs
                </span>
                <p className="text-slate-600 text-[11px]">
                  Demonstration pricing between ₹14.00 and ₹19.50 per kWh, matching common public charging tariffs across Indian highway and city networks.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Google Maps Platform Integration Architecture</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Google Maps JavaScript API
                </span>
                <p className="text-[11px] text-slate-600">
                  Default center configured to Bhubaneswar, Odisha (<code>20.2961° N, 85.8245° E</code>). Simply supply <code>VITE_GOOGLE_MAPS_API_KEY</code> to mount live Google vector tiles.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                  <Route className="w-3.5 h-3.5 text-emerald-600" />
                  Google Routes API (v2)
                </span>
                <p className="text-[11px] text-slate-600">
                  Ready to compute live EV routes with waypoint stops for major Odisha corridors (Bhubaneswar to Puri, Konark, Cuttack, and Rourkela).
                </p>
              </div>
            </div>
          </div>

          {/* Running the Project */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Project Execution Commands</span>
            </h3>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-xl space-y-1">
              <div className="text-slate-400"># Start local development server</div>
              <div className="text-emerald-400">npm run dev</div>
              <div className="text-slate-400 mt-2"># Production build verification</div>
              <div className="text-emerald-400">npm run build</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
