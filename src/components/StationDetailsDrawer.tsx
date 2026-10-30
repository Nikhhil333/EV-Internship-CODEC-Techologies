/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Zap,
  Navigation,
  Bookmark,
  Star,
  Clock,
  CircleDot,
  Coffee,
  Wifi,
  ShoppingBag,
  Utensils,
  Moon,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Car,
} from 'lucide-react';
import { Station, ConnectorSpec, Amenity } from '../types/ev';
import { StationService } from '../services/mapService';

interface StationDetailsDrawerProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onStartSimulation: (station: Station, connector: ConnectorSpec) => void;
  onPlanRouteTo: (station: Station) => void;
}

export const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({
  station,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onStartSimulation,
  onPlanRouteTo,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !station) return null;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(
      `${station.name}, ${station.address}, ${station.area}, ${station.city}, ${station.state} ${station.pincode}, India`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDirections = () => {
    const url = StationService.getDirectionsUrl(station);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getAmenityIcon = (amenity: Amenity) => {
    switch (amenity) {
      case 'Cafe':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'WiFi':
        return <Wifi className="w-3.5 h-3.5" />;
      case 'Shopping':
      case 'Grocery':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Dining':
        return <Utensils className="w-3.5 h-3.5" />;
      case '24/7 Access':
        return <Moon className="w-3.5 h-3.5" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header Visual Hero with Gradient & Network Badge */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 pb-5">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium tracking-wide uppercase text-emerald-400">
                {station.network}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  station.isRealOcmData
                    ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                    : 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                }`}
              >
                {station.isRealOcmData ? `OCM POI #${station.ocmId || 'Verified'}` : 'Demonstration Hub'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleBookmark}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title={isBookmarked ? 'Remove saved' : 'Save station'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-400 text-emerald-400' : 'text-white'}`} />
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            {station.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>{station.address}, {station.area}, {station.city}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium text-emerald-400">
              {station.distanceKm} km away
            </span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-400 block">Max Speed</span>
              <span className="text-base font-bold text-white tabular-nums flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                {station.maxPowerKw} kW
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-400 block">Stalls Available</span>
              <span className="text-base font-bold text-white tabular-nums">
                {station.availablePlugsCount} / {station.totalPlugsCount}
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[11px] text-slate-400 block">Rating</span>
              <span className="text-base font-bold text-white tabular-nums flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                {station.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Demonstration Notice Box / OCM Verification Box */}
        <div
          className={`border-y px-6 py-2.5 flex items-start gap-2.5 text-xs ${
            station.isRealOcmData
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200/80 text-amber-900'
          }`}
        >
          <ShieldCheck
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              station.isRealOcmData ? 'text-emerald-600' : 'text-amber-600'
            }`}
          />
          <span>
            {station.isRealOcmData ? (
              <>
                <strong>Open Charge Map Registry Record (Bhubaneswar, Odisha):</strong> Hardware specifications, connector standards, and GPS coordinates are verified via the global Open Charge Map community registry. Live real-time plug occupancy is unverified (requires direct CPO telemetry via OCPP/OCPI).
              </>
            ) : (
              <>
                <strong>Simulated Telemetry & Tariffs (Bhubaneswar, Odisha):</strong> All stall availability, charging speeds in kW, and tariffs in Indian Rupees (₹) are simulated prototype data. This station is not verified as operational in real time; live occupancy requires direct CPO telemetry via OCPP/OCPI protocols.
              </>
            )}
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenDirections}
              className="min-h-[46px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>

            <button
              onClick={() => onPlanRouteTo(station)}
              className="min-h-[46px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Zap className="w-4 h-4" />
              <span>Plan Route Here</span>
            </button>
          </div>

          {/* Pricing & Hours Card in ₹ */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pricing in ₹ & Operating Hours
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Charging Rate</span>
                <span className="font-semibold text-slate-900 text-right">
                  {station.pricingSummary}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500">Idle Fee</span>
                <span className="font-medium text-slate-800 text-right">
                  {station.idleFee}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500">Parking Access</span>
                <span className="font-medium text-slate-800 text-right">
                  {station.parkingFee}
                </span>
              </div>

              <div className="flex items-start justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Hours
                </span>
                <span className="font-semibold text-emerald-700">
                  {station.operatingHours}
                </span>
              </div>
            </div>
          </div>

          {/* Individual Plugs & Connectors Specifications (CCS2, Type 2, GB/T, Bharat DC-001) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Connector Specifications ({station.connectors.length} Stalls)
              </h3>
              <span className="text-xs text-slate-500">Tap stall to simulate charge</span>
            </div>

            <div className="space-y-2.5">
              {station.connectors.map((c) => {
                const isPlugAvailable = c.status === 'Available';
                return (
                  <div
                    key={c.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {c.stallNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {c.type}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-emerald-600 tabular-nums">
                            {c.powerKw} kW
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {c.currentType}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ₹{c.pricePerKwh.toFixed(2)}/kWh · {c.voltage}V architecture
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          isPlugAvailable ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        <CircleDot className="w-3 h-3" />
                        {c.status}
                      </span>

                      {isPlugAvailable && (
                        <button
                          onClick={() => onStartSimulation(station, c)}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                          title="Simulate EV Charging Session"
                        >
                          Simulate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">
              Nearby Amenities & Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {station.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700"
                >
                  <span className="text-emerald-600">{getAmenityIcon(amenity)}</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Access Notes */}
          {station.accessNotes && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Access & Parking Notes</span>
              <p>{station.accessNotes}</p>
            </div>
          )}

          {/* Location & Copy Address */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Coordinates: {station.coordinates.lat.toFixed(4)}° N, {station.coordinates.lng.toFixed(4)}° E</span>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
