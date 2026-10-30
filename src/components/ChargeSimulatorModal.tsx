/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  BatteryCharging,
  Clock,
  Play,
  Square,
  CheckCircle,
} from 'lucide-react';
import { Station, ConnectorSpec } from '../types/ev';

interface ChargeSimulatorModalProps {
  station: Station | null;
  connector: ConnectorSpec | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChargeSimulatorModal: React.FC<ChargeSimulatorModalProps> = ({
  station,
  connector,
  isOpen,
  onClose,
}) => {
  const [isCharging, setIsCharging] = useState(false);
  const [batteryPct, setBatteryPct] = useState(24);
  const [currentPowerKw, setCurrentPowerKw] = useState(connector?.powerKw || 60);
  const [kwhDelivered, setKwhDelivered] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen) {
      setIsCharging(true);
      setBatteryPct(22);
      setCurrentPowerKw(connector?.powerKw || 60);
      setKwhDelivered(0);
      setElapsedSeconds(0);
      setIsFinished(false);
    } else {
      setIsCharging(false);
    }
  }, [isOpen, connector]);

  // Simulation timer tick (accelerated time)
  useEffect(() => {
    if (!isCharging || isFinished) return;

    const interval = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);

      setBatteryPct((prevSoc) => {
        if (prevSoc >= 85) {
          setIsFinished(true);
          setIsCharging(false);
          return 85;
        }

        // Taper charging curve as battery fills up
        const maxKw = connector?.powerKw || 60;
        let actualKw = maxKw;
        if (prevSoc > 65) {
          actualKw = Math.max(25, maxKw * (1 - (prevSoc - 65) / 35));
        }
        setCurrentPowerKw(Math.round(actualKw));

        const increment = (actualKw / 3600) * 1.5; // virtual energy
        setKwhDelivered((prevKwh) => +(prevKwh + increment).toFixed(2));

        return prevSoc + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isCharging, isFinished, connector]);

  if (!isOpen || !station || !connector) return null;

  const cost = (kwhDelivered * connector.pricePerKwh).toFixed(2);
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4 fill-emerald-400 stroke-none" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Charge Simulator</h3>
              <p className="text-[11px] text-slate-400">
                {station.network} · Stall {connector.stallNumber} ({connector.type})
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

        {/* Battery State Gauge */}
        <div className="p-6 text-center bg-radial from-emerald-50/50 to-white">
          <div className="relative inline-flex items-center justify-center mb-3">
            {/* Circular Progress Gauge */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#059669"
                strokeWidth="10"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * batteryPct) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <BatteryCharging
                className={`w-7 h-7 mb-0.5 ${
                  isCharging ? 'text-emerald-600 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {batteryPct}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                State of Charge
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mb-4">
            {isFinished ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Charging Target Reached (85% optimal fast charge)
              </span>
            ) : isCharging ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Fast Charging Session
              </span>
            ) : (
              <span className="text-slate-600">Charging Paused</span>
            )}
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-left mb-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Power</span>
              <span className="text-base font-bold text-slate-900 tabular-nums flex items-baseline gap-0.5">
                {isCharging ? currentPowerKw : 0}
                <span className="text-[10px] text-slate-400 font-normal">kW</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Delivered</span>
              <span className="text-base font-bold text-slate-900 tabular-nums flex items-baseline gap-0.5">
                {kwhDelivered}
                <span className="text-[10px] text-slate-400 font-normal">kWh</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Est. Cost</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                ₹{cost}
              </span>
            </div>
          </div>

          {/* Elapsed Time & Session Details */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Duration: <strong className="text-slate-800 tabular-nums">{formatTime(elapsedSeconds)}</strong>
            </span>
            <span>
              Rate: <strong className="text-slate-800">₹{connector.pricePerKwh.toFixed(2)}/kWh</strong>
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {isCharging ? (
              <button
                onClick={() => setIsCharging(false)}
                className="w-full min-h-[46px] bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Charging</span>
              </button>
            ) : isFinished ? (
              <button
                onClick={onClose}
                className="w-full min-h-[46px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Done & Disconnect Plug</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCharging(true)}
                className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Charge</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 text-[10px] text-slate-500 text-center">
          Demonstration Mode: Simulating accelerated charging curve with ₹ rates for Indian EV testing.
        </div>
      </div>
    </div>
  );
};
